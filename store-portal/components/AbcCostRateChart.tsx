"use client";
import { useState } from "react";
import type { StoreYear } from "@/lib/abcData";

// 月別 原価率の推移（店舗全体・売上加重）。単系列ライン。
// dataviz準拠: 単系列は凡例なし / 1軸 / 平均参照線 / 選択月マーカー強調 / ホバー / 欠測月は線を分断。

const LINE = "#6a4ce2"; // violet（他グラフのカテゴリ色と重複しない単系列色）

export default function AbcCostRateChart({
  year,
  catKeys,
  months,
  selected, // 0-based
  onSelect,
}: {
  year: StoreYear;
  catKeys: string[];
  months: string[];
  selected: number;
  onSelect?: (monthIndex: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  // 月次の店舗全体 原価率（= Σ原価 / Σ売上, 税抜）。売上0の月は null。
  const points = months.map((_, mi) => {
    let sales = 0, cost = 0;
    for (const k of catKeys) {
      const r = year[k]?.[mi];
      if (!r) continue;
      sales += r.uriage;
      cost += r.uriage * (r.genkaritsu / 100);
    }
    return sales > 0 ? Math.round((cost / sales) * 1000) / 10 : null;
  });
  const valid = points.filter((p): p is number => p != null);
  const avg = valid.length ? Math.round((valid.reduce((s, v) => s + v, 0) / valid.length) * 10) / 10 : 0;
  const maxV = Math.max(10, ...valid);
  const niceMax = Math.ceil(maxV / 10) * 10; // 10%刻み上限

  const W = 760, H = 260;
  const mL = 48, mR = 14, mT = 16, mB = 38;
  const plotW = W - mL - mR, plotH = H - mT - mB;
  const n = months.length;
  const band = plotW / n;
  const xFor = (mi: number) => mL + band * mi + band / 2;
  const yFor = (v: number) => mT + plotH * (1 - v / niceMax);
  const ticks = 4;

  // 連続セグメント（null で分断）
  const segs: { mi: number; v: number }[][] = [];
  let cur: { mi: number; v: number }[] = [];
  points.forEach((p, mi) => {
    if (p == null) { if (cur.length) { segs.push(cur); cur = []; } }
    else cur.push({ mi, v: p });
  });
  if (cur.length) segs.push(cur);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="月別原価率の推移" style={{ display: "block", maxWidth: "100%" }}>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (niceMax / ticks) * i;
          const y = yFor(v);
          return (
            <g key={i}>
              <line x1={mL} y1={y} x2={W - mR} y2={y} stroke="#e6e8ee" strokeWidth={1} />
              <text x={mL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#8a8f9a">{v.toFixed(0)}%</text>
            </g>
          );
        })}

        {/* 平均参照線 */}
        <line x1={mL} y1={yFor(avg)} x2={W - mR} y2={yFor(avg)} stroke="#b9b1ea" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={mL + 4} y={yFor(avg) - 5} textAnchor="start" fontSize={11} fill="#6a4ce2" fontWeight={600}>平均 {avg.toFixed(1)}%</text>

        {/* ライン */}
        {segs.map((seg, si) => (
          <polyline key={si} fill="none" stroke={LINE} strokeWidth={2}
                    points={seg.map((p) => `${xFor(p.mi)},${yFor(p.v)}`).join(" ")} />
        ))}

        {/* マーカー＋ラベル＋ヒット */}
        {points.map((p, mi) => {
          const cx = xFor(mi);
          const isSel = mi === selected;
          return (
            <g key={mi}
               onMouseEnter={() => setHover(mi)} onMouseMove={() => setHover(mi)} onMouseLeave={() => setHover(null)}
               onClick={() => onSelect?.(mi)} style={{ cursor: onSelect ? "pointer" : "default" }}>
              <rect x={mL + band * mi} y={mT} width={band} height={plotH} fill="transparent" />
              {p != null && (
                <>
                  <circle cx={cx} cy={yFor(p)} r={isSel || hover === mi ? 6 : 4} fill="#fff" stroke={LINE} strokeWidth={2} />
                  {isSel && <circle cx={cx} cy={yFor(p)} r={3} fill={LINE} />}
                  {(isSel || hover === mi) && (
                    <text x={cx} y={yFor(p) - 12} textAnchor="middle" fontSize={11} fontWeight={700} fill="#333">{p.toFixed(1)}%</text>
                  )}
                </>
              )}
              <text x={cx} y={H - mB + 20} textAnchor="middle" fontSize={11.5}
                    fontWeight={isSel ? 700 : 400} fill={isSel ? "#191919" : "#666"}>{months[mi]}</text>
            </g>
          );
        })}
        <line x1={mL} y1={yFor(0)} x2={W - mR} y2={yFor(0)} stroke="#c9ccd4" strokeWidth={1} />
      </svg>

      {hover != null && points[hover] != null && (
        <div style={{
          position: "absolute", left: `${(xFor(hover) / W) * 100}%`, top: 18, transform: "translateX(-50%)",
          pointerEvents: "none", background: "#fff", border: "1px solid #e2e4ea", borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,.12)", padding: "6px 10px", fontSize: 12, zIndex: 5, whiteSpace: "nowrap",
        }}>
          <b>{months[hover]}</b> 原価率 <b style={{ color: LINE }}>{points[hover]!.toFixed(1)}%</b>
          <span style={{ color: "#888", marginLeft: 6 }}>（平均比 {(points[hover]! - avg >= 0 ? "+" : "") + (points[hover]! - avg).toFixed(1)}pt）</span>
        </div>
      )}
    </div>
  );
}
