"use client";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";

export default function Alerts() {
  const alerts = useStore((s) => s.collections.alerts) ?? [];
  const crit = alerts.filter((a) => a.level === "critical").length;
  return (
    <div className="pg">
      <div className="page-head">
        <h2>許可・アラート</h2>
        <span className="sp r">要対応 {crit}</span>
      </div>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map((a) => (
          <div className={`alert-row${a.level === "critical" ? " crit" : ""}`} key={a.id}>
            <span className="ab">
              <Icon name="TriangleAlert" size={18} style={{ color: a.level === "critical" ? "var(--crit)" : "var(--warn)" }} />
            </span>
            <span><span className="ak">{a.kind}</span><br /><span className="as">{a.store}</span></span>
            <span className="ad">{a.due}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
