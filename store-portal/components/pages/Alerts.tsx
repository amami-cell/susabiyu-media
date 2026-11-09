"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";
import FilterChips from "../FilterChips";

export default function Alerts() {
  const alerts = useStore((s) => s.collections.alerts) ?? [];
  const [f, setF] = useState("all");
  const crit = alerts.filter((a) => a.level === "critical").length;
  const warn = alerts.filter((a) => a.level === "warn").length;

  const rows = f === "all" ? alerts : alerts.filter((a) => a.level === f);
  const opts = [
    { v: "all", label: "すべて", n: alerts.length },
    { v: "critical", label: "要対応", n: crit, cls: "c-red" },
    { v: "warn", label: "警告", n: warn, cls: "c-amber" },
  ];

  return (
    <div className="pg">
      <div className="page-head">
        <h2>許可・アラート</h2>
        <span className="sp r">要対応 {crit}</span>
      </div>
      <FilterChips options={opts} value={f} onChange={setF} />
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 ? (
          <div className="dt-empty">該当するアラートがありません</div>
        ) : (
          rows.map((a) => (
            <div className={`alert-row${a.level === "critical" ? " crit" : ""}`} key={a.id}>
              <span className="ab">
                <Icon name="TriangleAlert" size={18} style={{ color: a.level === "critical" ? "var(--crit)" : "var(--warn)" }} />
              </span>
              <span><span className="ak">{a.kind}</span><br /><span className="as">{a.store}</span></span>
              <span className="ad">{a.due}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
