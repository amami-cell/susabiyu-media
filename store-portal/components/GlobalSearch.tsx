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
// 販促ベースの横断検索対象（店舗・媒体・口コミ・議事録・予定）に限定。
const SRC: Src[] = [
  { col: "stores", page: "stores", label: (x) => S(x.name), sub: (x) => `店舗 · ${S(x.dept)}/${S(x.area)}` },
  { col: "media", page: "media", label: (x) => `${S(x.store)}（${S(x.source)}）`, sub: () => "媒体" },
  { col: "reviews", page: "reviews", label: (x) => S(x.store), sub: (x) => `口コミ · ${S(x.source)}` },
  { col: "minutes", page: "minutes", label: (x) => S(x.title), sub: () => "議事録" },
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
          placeholder="横断検索：店舗・媒体・口コミ・議事録・予定から探す"
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
