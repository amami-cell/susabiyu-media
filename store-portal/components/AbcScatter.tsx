"use client";
import { useMemo, useState } from "react";
import { ABC_REAL, ABC_STORES } from "@/lib/abcReal";

// 売上規模 × 原価率 の散布図（イニシエート全店）。
// dataviz準拠: 2変数の関係=散布図 / 平均クロスヘアで4象限 / 選択店ハイライト /
// ホバー＆選択のみ直接ラベル（23点の全ラベルは混雑するため） / 1点1店。

const CAT_KEYS = ["arakaruto", "lunch", "enkai", "tabehodai", "nomihodai"];
const DOT = "#5b8def";
const SEL = "#6a4ce2";

const fmtYen = (v: number) =>
  v >= 1_000_000 ? "¥" + (v / 1_000_000).toFixed(1) + "M" : "¥" + Math.round(v / 1000).toLocaleString() + "k";

export default function AbcScatter({
  current,
  onSelectStore,
}: {
  current: string;
  onSelectStore?: (store: string) => void;
}) {
  const [hover, setHover] = useState<string | null>(null);

  const pts = useMemo(() =>
    ABC_STORES.map((name) => {
      let sales = 0, cost = 0;
      const sy = ABC_REAL[name];
      if (sy) for (const k of CAT_KEYS) for (const r of sy[k] ?? []) { sales += r.uriage; cost += r.uriage * (r.genkaritsu / 100); }
      return { name, sales, rate: sales > 0 ? Math.round((cost / sales) * 1000) / 10 : 0 };
    }).filter((p) => p.sales > 0), []);

  const maxS = Math.max(1, ...pts.map((p) => p.sales));
  const niceS = Math.ceil(maxS / 5_000_000) * 5_000_000;
  const rates = pts.map((p) => p.rate);
  const yMin = Math.floor(Math.min(...rates) / 5) * 5;
  const yMax = Math.ceil(Math.max(...rates) / 5) * 5;
  const avgS = pts.reduce((s, p) => s + p.sales, 0) / pts.length;
  const avgR = Math.round((pts.reduce((s, p) => s + p.rate, 0) / pts.length) * 10) / 10;

  const W = 760, H = 440, mL = 50, mR = 18, mT = 18, mB = 46;
  const plotW = W - mL - mR, plotH = H - mT - mB;
  const xFor = (v: number) => mL + (v / niceS) * plotW;
  const yFor = (v: number) => mT + plotH * (1 - (v - yMin) / (yMax - yMin));

  const hp = hover ? pts.find((p) => p.name === hover) : null;
  const xTicks = 5, yTicks = (yMax - yMin) / 5;

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="売上規模と原価率の散布図" style={{ display: "block", minWidth: 600 }}>
        {/* 象限背景（低売上×高原価＝要注意, 高売上×低原価＝優良） */}
        <rect x={mL} y={mT} width={xFor(avgS) - mL} height={yFor(avgR) - mT} fill="#fbeaea" opacity={0.5} />
        <rect x={xFor(avgS)} y={yFor(avgR)} width={W - mR - xFor(avgS)} height={mT + plotH - yFor(avgR)} fill="#e8f4ec" opacity={0.6} />

        {/* グリッド */}
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const v = (niceS / xTicks) * i, x = xFor(v);
          return <g key={"x" + i}>
            <line x1={x} y1={mT} x2={x} y2={mT + plotH} stroke="#edeff4" strokeWidth={1} />
            <text x={x} y={mT + plotH + 18} textAnchor="middle" fontSize={10.5} fill="#9aa0ac">{fmtYen(v)}</text>
          </g>;
        })}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = yMin + 5 * i, y = yFor(v);
          return <g key={"y" + i}>
            <line x1={mL} y1={y} x2={W - mR} y2={y} stroke="#edeff4" strokeWidth={1} />
            <text x={mL - 8} y={y + 4} textAnchor="end" fontSize={10.5} fill="#9aa0ac">{v}%</text>
          </g>;
        })}

        {/* 平均クロスヘア */}
        <line x1={xFor(avgS)} y1={mT} x2={xFor(avgS)} y2={mT + plotH} stroke="#b9b1ea" strokeWidth={1.5} strokeDasharray="5 4" />
        <line x1={mL} y1={yFor(avgR)} x2={W - mR} y2={yFor(avgR)} stroke="#b9b1ea" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={xFor(avgS) + 4} y={mT + 12} fontSize={10.5} fill="#6a4ce2" fontWeight={600}>平均売上 {fmtYen(avgS)}</text>
        <text x={mL + 4} y={yFor(avgR) - 5} fontSize={10.5} fill="#6a4ce2" fontWeight={600}>平均原価率 {avgR}%</text>

        {/* 象限ラベル */}
        <text x={mL + 6} y={mT + plotH - 6} fontSize={11} fill="#c0564f" fontWeight={600} opacity={0.8}>低売上・高原価</text>
        <text x={W - mR - 6} y={mT + plotH - 6} textAnchor="end" fontSize={11} fill="#3f9e63" fontWeight={600} opacity={0.85}>高売上・低原価 ★</text>

        {/* 点 */}
        {pts.map((p) => {
          const isCur = p.name === current, on = isCur || hover === p.name;
          return (
            <g key={p.name}
               onMouseEnter={() => setHover(p.name)} onMouseLeave={() => setHover(null)}
               onClick={() => onSelectStore?.(p.name)} style={{ cursor: onSelectStore ? "pointer" : "default" }}>
              <circle cx={xFor(p.sales)} cy={yFor(p.rate)} r={on ? 8 : 5.5}
                      fill={isCur ? SEL : DOT} fillOpacity={isCur ? 1 : 0.78} stroke="#fff" strokeWidth={1.5} />
              {isCur && (
                <text x={xFor(p.sales)} y={yFor(p.rate) - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#191919">{p.name}</text>
              )}
            </g>
          );
        })}

        <text x={mL + plotW / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="#777">期間売上（税抜）→</text>
      </svg>

      {hp && (
        <div style={{
          position: "absolute", left: `${(xFor(hp.sales) / W) * 100}%`, top: `${(yFor(hp.rate) / H) * 100}%`,
          transform: "translate(-50%, -130%)", pointerEvents: "none",
          background: "#fff", border: "1px solid #e2e4ea", borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,.12)", padding: "6px 10px", fontSize: 12, zIndex: 5, whiteSpace: "nowrap",
        }}>
          <b>{hp.name}</b><br />売上 <b>{fmtYen(hp.sales)}</b>｜原価率 <b style={{ color: SEL }}>{hp.rate.toFixed(1)}%</b>
        </div>
      )}
    </div>
  );
}
