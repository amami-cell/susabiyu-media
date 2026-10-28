"use client";
import { useStore } from "@/lib/store";
import type { ScheduleEvent } from "@/lib/types";

const KIND: Record<ScheduleEvent["kind"], string> = { MS: "a", 試食: "b", 会議: "p", 点検: "x", その他: "n" };

export default function Schedule() {
  const events = useStore((s) => s.collections.schedule) ?? [];
  const days = Array.from(new Set(events.map((e) => e.date)));
  return (
    <div className="pg">
      <div className="page-head">
        <h2>スケジュール</h2>
        <span className="sp b" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span className="gicon">G</span>Google カレンダー連携中
        </span>
      </div>
      <div className="card">
        <div className="agenda">
          {days.map((d) => (
            <div key={d}>
              <div className="day">2026/{d}（{["日", "月", "火", "水", "木", "金", "土"][new Date(2026, 9, Number(d.split("/")[1])).getDay()]}）</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {events.filter((e) => e.date === d).map((e) => (
                  <div className="ev" key={e.id}>
                    <span className="tm">{e.time}</span>
                    <span><span className="evt">{e.title}</span><br /><span className="evs">{e.store}</span></span>
                    <span className="kind"><span className={`sp ${KIND[e.kind]}`}>{e.kind}</span></span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
