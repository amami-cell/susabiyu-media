"use client";
import { useStore } from "@/lib/store";
import { Stars } from "../Stars";

export default function Reviews() {
  const reviews = useStore((s) => s.collections.reviews) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>口コミ</h2></div>
      <div className="card">
        {reviews.map((r) => (
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
        ))}
      </div>
    </div>
  );
}
