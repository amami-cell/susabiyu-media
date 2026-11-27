"use client";
import { useMemo, useState } from "react";
import { ABC_REAL, ABC_STORES } from "@/lib/abcReal";

// 業態別 原価率ヒートマップ（行=店舗 / 列=5業態 / セル=原価率）。
// dataviz準拠: 大小=単一色シーケンシャル（赤・淡→濃＝低→高原価）、セルに実値ラベル、
// 行ホバー/選択強調、凡例あり、データ無セルはグレー「—」。外れ値でスケールが潰れないよう clamp。

const CATS: { key: string; label: string }[] = [
  { key: "arakaruto", label: "アラカルト" },
  { key: "lunch", label: "ランチ・定食" },
  { key: "enkai", label: "宴会・コース" },
  { key: "tabehodai", label: "食べ放題" },
  { key: "nomihodai", label: "飲み放題" },
];
const DOMAIN = [10, 40]; // 原価率の色域(%)。下限以下=最淡, 上限以上=最濃。

const fmtYen = (v: number) =>
  v >= 1_000_000 ? "¥" + (v / 1_000_000).toFixed(1) + "M" : "¥" + Math.round(v / 1000).toLocaleString() + "k";

// 単一色(赤)シーケンシャル: 淡 #fdecec → 濃 #a21d1d
function heat(rate: number): { bg: string; fg: string } {
  const t = Math.max(0, Math.min(1, (rate - DOMAIN[0]) / (DOMAIN[1] - DOMAIN[0])));
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const r = lerp(253, 162), g = lerp(236, 29), b = lerp(236, 29);
  return { bg: `rgb(${r},${g},${b})`, fg: t > 0.55 ? "#fff" : "#7a1414" };
}

export default function AbcHeatmap({
  current,
  onSelectStore,
}: {
  current: string;
  onSelectStore?: (store: string) => void;
}) {
  const [hover, setHover] = useState<{ s: string; c: string } | null>(null);

  const rows = useMemo(() =>
    ABC_STORES.map((name) => {
      const sy = ABC_REAL[name];
      let storeSales = 0;
      const cells = CATS.map((c) => {
        let sales = 0, cost = 0;
        for (const r of sy?.[c.key] ?? []) { sales += r.uriage; cost += r.uriage * (r.genkaritsu / 100); }
        storeSales += sales;
        return { key: c.key, label: c.label, sales, rate: sales > 0 ? Math.round((cost / sales) * 1000) / 10 : null };
      });
      return { name, cells, storeSales };
    }).filter((r) => r.storeSales > 0).sort((a, b) => b.storeSales - a.storeSales),
    []);

  const th: React.CSSProperties = { padding: "6px 8px", fontSize: 11.5, fontWeight: 600, color: "#555", textAlign: "center", borderBottom: "2px solid #e6e8ee", whiteSpace: "nowrap" };
  const nameTd: React.CSSProperties = { padding: "4px 10px 4px 2px", fontSize: 11.5, whiteSpace: "nowrap", textAlign: "right", position: "sticky", left: 0, background: "#fff" };

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      {/* 凡例 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 11.5, color: "#666" }}>
        <span>低</span>
        <span style={{ width: 160, height: 12, borderRadius: 3, background: `linear-gradient(90deg, ${heat(DOMAIN[0]).bg}, ${heat((DOMAIN[0]+DOMAIN[1])/2).bg}, ${heat(DOMAIN[1]).bg})`, border: "1px solid #e2e4ea" }} />
        <span>高</span>
        <span style={{ marginLeft: 4 }}>原価率 {DOMAIN[0]}% 〜 {DOMAIN[1]}%+（税抜）／ — ＝取扱なし</span>
      </div>

      <table style={{ borderCollapse: "separate", borderSpacing: 3, width: "100%", minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "right" }}>店舗＼業態</th>
            {CATS.map((c) => <th key={c.key} style={th}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const isCur = r.name === current;
            return (
              <tr key={r.name} onClick={() => onSelectStore?.(r.name)}
                  style={{ cursor: onSelectStore ? "pointer" : "default", background: isCur ? "#f3f1fd" : "transparent" }}>
                <td style={{ ...nameTd, fontWeight: isCur ? 700 : 400, color: isCur ? "#4b2fc7" : "#333", background: isCur ? "#f3f1fd" : "#fff" }}>
                  {r.name.length > 13 ? r.name.slice(0, 13) + "…" : r.name}
                </td>
                {r.cells.map((cell) => {
                  if (cell.rate == null) return <td key={cell.key} style={{ background: "#f3f4f6", color: "#bbb", textAlign: "center", fontSize: 11, borderRadius: 4, padding: "6px 4px" }}>—</td>;
                  const h = heat(cell.rate);
                  const on = hover?.s === r.name && hover?.c === cell.key;
                  return (
                    <td key={cell.key}
                        onMouseEnter={() => setHover({ s: r.name, c: cell.key })} onMouseLeave={() => setHover(null)}
                        style={{ background: h.bg, color: h.fg, textAlign: "center", fontSize: 11.5, fontWeight: 600, borderRadius: 4, padding: "6px 4px", outline: on || isCur ? "2px solid rgba(74,47,199,.55)" : "none", outlineOffset: -2 }}>
                      {cell.rate.toFixed(1)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {hover && (() => {
        const row = rows.find((r) => r.name === hover.s);
        const cell = row?.cells.find((c) => c.key === hover.c);
        if (!cell || cell.rate == null) return null;
        return (
          <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>
            <b>{hover.s}</b>｜{cell.label}：原価率 <b style={{ color: "#a21d1d" }}>{cell.rate.toFixed(1)}%</b>・売上 {fmtYen(cell.sales)}
          </div>
        );
      })()}
    </div>
  );
}
