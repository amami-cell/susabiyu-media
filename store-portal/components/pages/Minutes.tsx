"use client";
import { useStore } from "@/lib/store";

export default function Minutes() {
  const minutes = useStore((s) => s.collections.minutes) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>議事録</h2></div>
      <div className="card">
        {minutes.map((m) => (
          <div className="rev" key={m.id}>
            <div className="top">
              <span className="st">{m.title}</span>
              <span className="dt">{m.date}</span>
            </div>
            <div className="au">出席: {m.attendees}</div>
            <div className="txt">{m.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
