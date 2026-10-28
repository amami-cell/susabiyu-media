"use client";
import { useEffect } from "react";
import { useStore } from "./store";
import { idbGet, idbSet } from "./idb";
import type { Collections, Versions } from "./types";

// 仕様書 5-3「改良版」データ同期:
// 1) IndexedDB キャッシュがあれば即描画 → 裏で全量取得
// 2) 30秒ごと + visibilitychange(visible) + focus で version を確認
// 3) 差分コレクションだけ /api/state?keys=... で部分取得
// 4) タブ非表示中はポーリング停止
export function useSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    const boot = async () => {
      // (1) キャッシュ即描画
      const cached = await idbGet<{ collections: Partial<Collections>; versions: Versions }>("state-cache");
      if (cached && !cancelled) {
        useStore.getState().setAll(cached.collections, cached.versions);
      }
      // 初回フル取得
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const { collections, v } = await res.json();
        if (!cancelled) {
          useStore.getState().setAll(collections, v);
          idbSet("state-cache", useStore.getState().snapshot());
        }
      } catch {
        /* オフライン時はキャッシュのまま */
      }
    };

    const check = async () => {
      if (document.hidden) return;
      try {
        const { v } = await fetch("/api/state/version", { cache: "no-store" }).then((r) => r.json());
        const local = useStore.getState().versions;
        const changed = Object.keys(v).filter((k) => v[k] !== local[k]);
        if (changed.length) {
          const data = await fetch(`/api/state?keys=${changed.join(",")}`, { cache: "no-store" }).then((r) => r.json());
          useStore.getState().merge(data.collections, v);
          idbSet("state-cache", useStore.getState().snapshot());
        }
      } catch {
        /* 次回に委ねる */
      }
    };

    boot();
    timer = setInterval(check, 30_000);
    const onVis = () => !document.hidden && check();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, []);
}
