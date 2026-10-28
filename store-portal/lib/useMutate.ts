"use client";
import { useCallback } from "react";
import { useStore } from "./store";
import { useToast } from "./toast";
import type { Collections } from "./types";

type ArrayCollections = Exclude<keyof Collections, "user" | "pageAccess">;

// 仕様書 5-3 ⑤: 楽観的更新 → POST → 失敗したらロールバック＋トースト
// ⑥: 成功時はサーバーが該当コレクションの version を更新 → ストアへ反映
export function useMutate() {
  const show = useToast((s) => s.show);

  return useCallback(
    async <K extends ArrayCollections>(collection: K, id: string, patch: Partial<Collections[K][number]>) => {
      const prev = useStore.getState().patchItem(collection, id, patch);
      if (!prev) return;
      try {
        const res = await fetch("/api/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ collection, id, patch }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const { v } = await res.json();
        if (v) useStore.getState().setVersions(v);
        show("保存しました", "ok");
      } catch {
        useStore.getState().restoreItem(collection, prev);
        show("保存に失敗しました。変更を元に戻しました。", "err");
      }
    },
    [show]
  );
}

// 楽観的追加: ストアへ先に追加 → POST(create) → 失敗ならロールバック＋トースト
export function useCreate() {
  const show = useToast((s) => s.show);

  return useCallback(
    async <K extends ArrayCollections>(collection: K, item: Collections[K][number]) => {
      const id = (item as { id: string }).id;
      useStore.getState().addItem(collection, item);
      try {
        const res = await fetch("/api/mutate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "create", collection, item }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const { v } = await res.json();
        if (v) useStore.getState().setVersions(v);
        show("追加しました", "ok");
        return true;
      } catch {
        useStore.getState().removeItem(collection, id);
        show("追加に失敗しました。元に戻しました。", "err");
        return false;
      }
    },
    [show]
  );
}
