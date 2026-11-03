"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Stars } from "../Stars";
import { Icon } from "../Icon";

export default function Reviews() {
  const reviews = useStore((s) => s.collections.reviews) ?? [];
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return reviews;
    return reviews.filter((r) => (r.store + r.source + r.author + r.text).toLowerCase().includes(kw));
  }, [reviews, q]);

  return (
    <div className="pg">
      <div className="page-head"><h2>口コミ</h2></div>
      <div className="dt-toolbar">
        <div className="search sm">
          <span className="si"><Icon name="Search" size={16} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="店舗・媒体・本文で検索" aria-label="口コミ検索" />
        </div>
        <span className="dt-count">{q.trim() ? `${filtered.length} 件 / 全 ${reviews.length} 件` : `全 ${reviews.length} 件`}</span>
      </div>
      <div className="card">
        {filtered.length === 0 ? (
          <div className="dt-empty">該当する口コミがありません</div>
        ) : (
          filtered.map((r) => (
            <div className="rev" key={r.id}>
              <div className="top">
                <span className="st">{r.store}</span>
                <span className="src">{r.source}</span>
                <Stars value={r.rating} />
                <span className="dt">{r.date}</span>
              </div>
              <div className="txt">{r.text}</div>
              <div className="au">{r.author}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
