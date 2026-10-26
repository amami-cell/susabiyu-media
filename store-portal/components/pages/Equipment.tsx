"use client";
import { useStore } from "@/lib/store";

const ST: Record<string, string> = { 貸与中: "b", 在庫: "g", 修理: "a", 廃棄: "n" };

export default function Equipment() {
  const equipment = useStore((s) => s.collections.equipment) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>貸与備品管理</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 720 }}>
          <thead>
            <tr><th>備品</th><th>保管/設置</th><th>数量</th><th>状態</th><th>管理者</th></tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.id}>
                <td>{e.item}</td>
                <td>{e.store}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{e.qty}</td>
                <td><span className={`sp ${ST[e.status]}`}>{e.status}</span></td>
                <td className="muted">{e.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
