"use client";
import { useStore } from "@/lib/store";

// 車検・保険が60日以内に迫っていれば警告色（デモは年月まで）
function soon(ym: string) {
  const [y, m] = ym.split("/").map(Number);
  if (!y || !m) return false;
  const target = new Date(y, m - 1, 1);
  const now = new Date(2026, 9, 26);
  const diff = (target.getTime() - now.getTime()) / 86400000;
  return diff <= 45;
}

export default function Vehicles() {
  const vehicles = useStore((s) => s.collections.vehicles) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>社用車</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 720 }}>
          <thead>
            <tr><th>車両</th><th>ナンバー</th><th>配置</th><th>車検満了</th><th>任意保険満了</th></tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{v.plate}</td>
                <td>{v.store}</td>
                <td><span className={`sp ${soon(v.inspection) ? "a" : "n"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{v.inspection}</span></td>
                <td><span className={`sp ${soon(v.insurance) ? "a" : "n"}`} style={{ fontVariantNumeric: "tabular-nums" }}>{v.insurance}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
