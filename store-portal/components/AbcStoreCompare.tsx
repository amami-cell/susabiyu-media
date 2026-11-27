"use client";
import { useMemo, useState } from "react";
import { ABC_REAL, ABC_STORES } from "@/lib/abcReal";

// 全店横断 原価率比較（イニシエート）。各店の期間原価率(Σ原価/Σ売上, 税抜)を
// 降順ランキングの横棒で表示。dataviz準拠: 単一指標の大小比較=ソート済み横棒 /
// 1軸 / 平均参照線 / 選択店ハイライト / ホバー / 値は直接ラベル。

const CAT_KEYS = ["arakaruto", "lunch", "enkai", "tabehodai", "nomihodai"];
const BASE = "#b7bdc9";   // 既定バー（ミュート）
const SELECTED = "#6a4ce2"; // 選択店

export default function AbcStoreCompare({
  current,
  onSelectStore,
}: {
  current: string;
  onSelectStore?: (store: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const rows = useMemo(() => {
    const out = ABC_STORES.map((name) => {
      let sales = 0, cost = 0;
      const sy = ABC_REAL[name];
      if (sy) for (const k of CAT_KEYS) for (const r of sy[k] ?? []) {
        sales += r.uriage; cost += r.uriage * (r.genkaritsu / 100);
      }
      return { name, rate: sales > 0 ? Math.round((cost / sales) * 1000) / 10 : 0, sales };
    }).filter((r) => r.sales > 0);
    out.sort((a, b) => b.rate - a.rate); // 原価率 高い順
    return out;
  }, []);

  const avg = rows.length ? Math.round((rows.reduce((s, r) => s + r.rate, 0) / rows.length) * 10) / 10 : 0;
  const maxR = Math.max(10, ...rows.map((r) => r.rate));
  const niceMax = Math.ceil(maxR / 10) * 10;

  const rowH = 22, gap = 6;
  const W = 760, mL = 150, mR = 54, mT = 24;
  const plotW = W - mL - mR;
  const H = mT + rows.length * (rowH + gap) + 6;
  const xFor = (v: number) => mL + (v / niceMax) * plotW;

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="全店横断 原価率比較" style={{ display: "block", minWidth: 600 }}>
        {/* 上部スケール */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const v = niceMax * f, x = xFor(v);
          return (
            <g key={i}>
              <line x1={x} y1={mT - 6} x2={x} y2={H - 6} stroke="#eceef3" strokeWidth={1} />
              <text x={x} y={mT - 10} textAnchor="middle" fontSize={10.5} fill="#9aa0ac">{v.toFixed(0)}%</text>
            </g>
          );
        })}
        {/* 平均線 */}
        <line x1={xFor(avg)} y1={mT - 6} x2={xFor(avg)} y2={H - 6} stroke="#b9b1ea" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={xFor(avg)} y={H - 1} textAnchor="middle" fontSize={10.5} fill="#6a4ce2" fontWeight={600}>平均 {avg.toFixed(1)}%</text>

        {rows.map((r, i) => {
          const y = mT + i * (rowH + gap);
          const isCur = r.name === current;
          const on = isCur || hover === r.name;
          const w = Math.max(1, xFor(r.rate) - mL);
          return (
            <g key={r.name}
               onMouseEnter={() => setHover(r.name)} onMouseLeave={() => setHover(null)}
               onClick={() => onSelectStore?.(r.name)} style={{ cursor: onSelectStore ? "pointer" : "default" }}>
              <rect x={0} y={y - gap / 2} width={W} height={rowH + gap} fill={isCur ? "#f3f1fd" : "transparent"} />
              <text x={mL - 10} y={y + rowH / 2 + 4} textAnchor="end" fontSize={11.5}
                    fontWeight={isCur ? 700 : 400} fill={isCur ? "#191919" : "#444"}>
                {r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name}
              </text>
              <rect x={mL} y={y + 3} width={w} height={rowH - 6} rx={3}
                    fill={isCur ? SELECTED : BASE} opacity={on ? 1 : 0.9} />
              <text x={xFor(r.rate) + 6} y={y + rowH / 2 + 4} fontSize={11}
                    fontWeight={isCur ? 700 : 400} fill="#333">{r.rate.toFixed(1)}%</text>
            </g>
          );
        })}
      </svg>

      {hover && (() => {
        const r = rows.find((x) => x.name === hover)!;
        const i = rows.indexOf(r);
        return (
          <div style={{
            position: "absolute", left: 12, top: 0, pointerEvents: "none",
            background: "#fff", border: "1px solid #e2e4ea", borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,.12)", padding: "6px 10px", fontSize: 12, zIndex: 5, whiteSpace: "nowrap",
          }}>
            <b>{r.name}</b>｜原価率 <b style={{ color: SELECTED }}>{r.rate.toFixed(1)}%</b>
            <span style={{ color: "#888", marginLeft: 6 }}>{i + 1}位/{rows.length}・平均比 {(r.rate - avg >= 0 ? "+" : "") + (r.rate - avg).toFixed(1)}pt</span>
          </div>
        );
      })()}
    </div>
  );
}
