"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "./Icon";

type Item = Record<string, unknown>;
interface Src {
  col: string;
  page: string;
  label: (x: Item) => string;
  sub: (x: Item) => string;
}

const S = (v: unknown) => String(v ?? "");

// 横断検索の対象。pageAccess で遮断されたコレクションはクライアント state に無いので自動的に対象外。
const SRC: Src[] = [
  { col: "stores", page: "stores", label: (x) => S(x.name), sub: (x) => `店舗 · ${S(x.dept)}/${S(x.area)}` },
  { col: "vendors", page: "vendors", label: (x) => S(x.name), sub: (x) => `取引先 · ${S(x.category)}` },
  { col: "credentials", page: "idpw", label: (x) => S(x.service), sub: (x) => `ID・PW · ${S(x.store)}` },
  { col: "media", page: "media", label: (x) => `${S(x.store)}（${S(x.source)}）`, sub: () => "媒体" },
  { col: "reviews", page: "reviews", label: (x) => S(x.store), sub: (x) => `口コミ · ${S(x.source)}` },
  { col: "tasks", page: "tasks", label: (x) => S(x.title), sub: (x) => `タスク · ${S(x.status)}` },
  { col: "changes", page: "change", label: (x) => `${S(x.store)}：${S(x.field)}`, sub: (x) => `変更申請 · ${S(x.status)}` },
  { col: "properties", page: "properties", label: (x) => S(x.name), sub: (x) => `募集物件 · ${S(x.area)}` },
  { col: "vehicles", page: "vehicles", label: (x) => S(x.name), sub: (x) => `社用車 · ${S(x.plate)}` },
  { col: "equipment", page: "equipment", label: (x) => S(x.item), sub: (x) => `備品 · ${S(x.store)}` },
  { col: "drawings", page: "drawings", label: (x) => S(x.title), sub: (x) => `図面・見積 · ${S(x.store)}` },
  { col: "capex", page: "capex", label: (x) => S(x.title), sub: (x) => `CAPEX · ${S(x.store)}` },
  { col: "minutes", page: "minutes", label: (x) => S(x.title), sub: () => "議事録" },
  { col: "corp", page: "corp", label: (x) => S(x.name), sub: () => "法人マスタ" },
  { col: "alerts", page: "alerts", label: (x) => S(x.kind), sub: (x) => `アラート · ${S(x.store)}` },
  { col: "userreq", page: "userreq", label: (x) => S(x.name), sub: (x) => `ユーザー申請 · ${S(x.type)}` },
  { col: "feedback", page: "feedback", label: (x) => S(x.text), sub: () => "改善要望" },
  { col: "schedule", page: "schedule", label: (x) => S(x.title), sub: (x) => `予定 · ${S(x.date)}` },
];

export default function GlobalSearch() {
  const collections = useStore((s) => s.collections) as unknown as Record<string, Item[]>;
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return [];
    const out: { page: string; label: string; sub: string; id: string }[] = [];
    for (const src of SRC) {
      const list = collections[src.col];
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const hay = Object.values(item)
          .filter((v) => typeof v === "string" || typeof v === "number")
          .join(" ")
          .toLowerCase();
        if (hay.includes(kw)) out.push({ page: src.page, label: src.label(item), sub: src.sub(item), id: src.col + S(item.id) });
        if (out.length >= 40) break;
      }
      if (out.length >= 40) break;
    }
    return out;
  }, [collections, q]);

  const go = (page: string) => {
    try {
      location.hash = page;
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="card gsearch">
      <div className="search">
        <span className="si"><Icon name="Search" size={16} /></span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="横断検索：店舗・取引先・ID/PW・タスクなど、すべてから探す"
          aria-label="横断検索"
        />
      </div>
      {q.trim() && (
        <div className="gsearch-res">
          {results.length === 0 ? (
            <div className="dt-empty">該当する項目がありません</div>
          ) : (
            results.map((r) => (
              <button className="gsearch-item" key={r.id} onClick={() => go(r.page)}>
                <span className="gi-label">{r.label}</span>
                <span className="gi-sub">{r.sub}</span>
                <Icon name="ChevronsRight" size={14} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
