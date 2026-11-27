"use client";
import { useState } from "react";
import { ABC_CORRECTED, CORRECTED_STORES, CORRECTED_CATS } from "@/lib/abcCorrected";

// 業態別 原価率【ドリンク補正版】。全ドリンク部門を「ドリンク(補正)」に統合して再計算。
// ドリンク原価率が高止まり（>40%）の店舗は ⚠ でフラグ（飲み放題売上の計上先が別部門の可能性）。

const DOMAIN = [10, 40];
const FLAG = 40; // ドリンク列の要確認しきい値(%)

const fmtYen = (v: number) =>
  v >= 1_000_000 ? "¥" + (v / 1_000_000).toFixed(1) + "M" : "¥" + Math.round(v / 1000).toLocaleString() + "k";

function heat(rate: number): { bg: string; fg: string } {
  const t = Math.max(0, Math.min(1, (rate - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])));
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  return { bg: `rgb(${lerp(253, 162)},${lerp(236, 29)},${lerp(236, 29)})`, fg: t > 0.55 ? "#fff" : "#7a1414" };
}

export default function AbcHeatmapCorrected({
  current,
  onSelectStore,
}: {
  current: string;
  onSelectStore?: (store: string) => void;
}) {
  const [hover, setHover] = useState<{ s: string; c: string } | null>(null);

  const th: React.CSSProperties = { padding: "6px 8px", fontSize: 11.5, fontWeight: 600, color: "#555", textAlign: "center", borderBottom: "2px solid #e6e8ee", whiteSpace: "nowrap" };
  const nameTd: React.CSSProperties = { padding: "4px 10px 4px 2px", fontSize: 11.5, whiteSpace: "nowrap", textAlign: "right", position: "sticky", left: 0 };

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11.5, color: "#666", flexWrap: "wrap" }}>
        <span>低</span>
        <span style={{ width: 150, height: 12, borderRadius: 3, background: `linear-gradient(90deg, ${heat(DOMAIN[0]).bg}, ${heat(25).bg}, ${heat(DOMAIN[1]).bg})`, border: "1px solid #e2e4ea" }} />
        <span>高</span>
        <span style={{ marginLeft: 4 }}>原価率 {DOMAIN[0]}〜{DOMAIN[1]}%+（税抜）／ ⚠＝飲み放題売上の計上先が別部門の可能性（要確認）／ —＝データなし</span>
      </div>

      <table style={{ borderCollapse: "separate", borderSpacing: 3, width: "100%", minWidth: 620 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "right" }}>店舗＼業態</th>
            {CORRECTED_CATS.map((c) => <th key={c.key} style={th}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {CORRECTED_STORES.map((name) => {
            const isCur = name === current;
            const row = ABC_CORRECTED[name];
            return (
              <tr key={name} onClick={() => onSelectStore?.(name)}
                  style={{ cursor: onSelectStore ? "pointer" : "default", background: isCur ? "#f3f1fd" : "transparent" }}>
                <td style={{ ...nameTd, fontWeight: isCur ? 700 : 400, color: isCur ? "#4b2fc7" : "#333", background: isCur ? "#f3f1fd" : "#fff" }}>
                  {name.length > 13 ? name.slice(0, 13) + "…" : name}
                </td>
                {CORRECTED_CATS.map((c) => {
                  const cell = row?.[c.key];
                  if (!cell || cell.rate == null) return <td key={c.key} style={{ background: "#f3f4f6", color: "#bbb", textAlign: "center", fontSize: 11, borderRadius: 4, padding: "6px 4px" }}>—</td>;
                  const h = heat(cell.rate);
                  const on = hover?.s === name && hover?.c === c.key;
                  const flagged = c.drink && cell.rate > FLAG;
                  return (
                    <td key={c.key}
                        onMouseEnter={() => setHover({ s: name, c: c.key })} onMouseLeave={() => setHover(null)}
                        style={{ background: h.bg, color: h.fg, textAlign: "center", fontSize: 11.5, fontWeight: 600, borderRadius: 4, padding: "6px 4px", outline: on || isCur ? "2px solid rgba(74,47,199,.55)" : "none", outlineOffset: -2 }}>
                      {cell.rate.toFixed(1)}{flagged ? " ⚠" : ""}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {hover && (() => {
        const cell = ABC_CORRECTED[hover.s]?.[hover.c];
        const cat = CORRECTED_CATS.find((c) => c.key === hover.c);
        if (!cell || cell.rate == null) return null;
        return (
          <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>
            <b>{hover.s}</b>｜{cat?.label}：原価率 <b style={{ color: "#a21d1d" }}>{cell.rate.toFixed(1)}%</b>・売上 {fmtYen(cell.sales)}
            {cat?.drink && cell.rate > FLAG && <span style={{ color: "#c0564f", marginLeft: 6 }}>⚠ 飲み放題売上が別部門計上の可能性</span>}
          </div>
        );
      })()}
    </div>
  );
}
