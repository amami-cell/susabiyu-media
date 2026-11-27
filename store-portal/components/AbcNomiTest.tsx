"use client";
import { useState } from "react";
import { NOMI_TEST_ROWS } from "@/lib/abcNomiTest";

// 飲み放題パック料金の割り戻し試算。
// 推定パック売上 = お通し客数 × 飲み放題利用率 × 想定パック単価 を、ドリンク売上に加算して原価率を再計算。
// お通し客数が取れない店舗（計上なし）は試算不可として明示。

const fmtYen = (v: number) =>
  v >= 1_000_000 ? "¥" + (v / 1_000_000).toFixed(2) + "M" : "¥" + Math.round(v).toLocaleString();

export default function AbcNomiTest() {
  const [tanka, setTanka] = useState(1650); // 想定パック単価(円)
  const [riyo, setRiyo] = useState(50);     // 飲み放題利用率(%)

  const td: React.CSSProperties = { padding: "7px 8px", fontSize: 12, borderBottom: "1px solid #eef0f4", textAlign: "right", fontVariantNumeric: "tabular-nums" };
  const th: React.CSSProperties = { padding: "7px 8px", fontSize: 11.5, fontWeight: 600, color: "#555", textAlign: "right", borderBottom: "2px solid #e6e8ee", whiteSpace: "nowrap" };

  const slider: React.CSSProperties = { width: 180, verticalAlign: "middle" };

  return (
    <div>
      {/* パラメータ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px", alignItems: "center", marginBottom: 14, padding: "10px 12px", background: "#f7f6fd", borderRadius: 10 }}>
        <label style={{ fontSize: 12, color: "#444" }}>
          想定パック単価：<b style={{ color: "#4b2fc7", fontSize: 14 }}>¥{tanka.toLocaleString()}</b>
          <br /><input type="range" min={800} max={3000} step={50} value={tanka} onChange={(e) => setTanka(+e.target.value)} style={slider} />
        </label>
        <label style={{ fontSize: 12, color: "#444" }}>
          飲み放題 利用率：<b style={{ color: "#4b2fc7", fontSize: 14 }}>{riyo}%</b>
          <br /><input type="range" min={10} max={100} step={5} value={riyo} onChange={(e) => setRiyo(+e.target.value)} style={slider} />
        </label>
        <span style={{ fontSize: 11.5, color: "#888" }}>※ 推定パック売上＝お通し客数 × 利用率 × 単価。スライダーで条件を調整できます。</span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>店舗（⚠店）</th>
              <th style={th}>推定客数</th>
              <th style={th}>ドリンク原価</th>
              <th style={th}>現状ドリンク売上</th>
              <th style={th}>推定パック売上</th>
              <th style={th}>現状原価率</th>
              <th style={th}>試算原価率</th>
            </tr>
          </thead>
          <tbody>
            {NOMI_TEST_ROWS.map((r) => {
              const hasKyaku = r.kyaku > 0;
              const packRev = hasKyaku ? r.kyaku * (riyo / 100) * tanka : 0;
              const newRate = hasKyaku ? (r.drinkCost / (r.drinkSales + packRev)) * 100 : null;
              return (
                <tr key={r.name}>
                  <td style={{ ...td, textAlign: "left", fontWeight: 600 }}>{r.name}</td>
                  <td style={td}>{hasKyaku ? r.kyaku.toLocaleString() : "—"}</td>
                  <td style={td}>{fmtYen(r.drinkCost)}</td>
                  <td style={td}>{fmtYen(r.drinkSales)}</td>
                  <td style={td}>{hasKyaku ? fmtYen(packRev) : "—"}</td>
                  <td style={{ ...td, color: "#b01818", fontWeight: 600 }}>{r.drinkRate.toFixed(1)}%</td>
                  <td style={td}>
                    {newRate == null
                      ? <span style={{ color: "#999" }}>客数計上なし</span>
                      : <b style={{ color: newRate <= 25 ? "#1f9254" : newRate <= 35 ? "#c98a00" : "#b01818", fontSize: 13 }}>{newRate.toFixed(1)}%</b>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
