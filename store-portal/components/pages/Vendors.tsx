"use client";
import { useStore } from "@/lib/store";

export default function Vendors() {
  const vendors = useStore((s) => s.collections.vendors) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>取引先</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 720 }}>
          <thead>
            <tr><th>取引先名</th><th>区分</th><th>担当窓口</th><th>電話</th><th>取引店舗数</th></tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td><span className="sp n">{v.category}</span></td>
                <td className="muted">{v.contact}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{v.tel}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{v.stores} 店</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
