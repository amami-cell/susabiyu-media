"use client";
import { useState } from "react";
import type { StoreYear } from "@/lib/abcData";

// 月別 売上推移（業態別スタックバー）。実データ(StoreYear)から当該店の月次売上を積み上げ表示。
// dataviz準拠: 固定順カテゴリ配色 / 凡例(直接ラベル) / 1軸 / 選択月ハイライト / ホバー内訳。

export interface TrendCat {
  key: string;
  label: string;
  color: string;
}

const fmtYen = (v: number) =>
  v >= 1_000_000 ? "¥" + (v / 1_000_000).toFixed(1) + "M" : "¥" + Math.round(v / 1000).toLocaleString() + "k";

export default function AbcTrendChart({
  year,
  cats,
  months,
  selected, // 0-based month index
  onSelect,
}: {
  year: StoreYear;
  cats: TrendCat[];
  months: string[];
  selected: number;
  onSelect?: (monthIndex: number) => void;
}) {
  const [hover, setHover] = useState<{ mi: number; x: number; y: number } | null>(null);

  const n = months.length;
  // 月次 × カテゴリ 売上
  const data = months.map((_, mi) =>
    cats.map((c) => ({ cat: c, v: year[c.key]?.[mi]?.uriage ?? 0 }))
  );
  const totals = data.map((segs) => segs.reduce((s, g) => s + g.v, 0));
  const maxY = Math.max(1, ...totals);
  // 見やすい上限（切り上げ）
  const niceMax = (() => {
    const pow = Math.pow(10, Math.floor(Math.log10(maxY)));
    const u = maxY / pow;
    const step = u <= 1 ? 1 : u <= 2 ? 2 : u <= 5 ? 5 : 10;
    return step * pow * Math.ceil(maxY / (step * pow));
  })();

  // SVG レイアウト
  const W = 760, H = 300;
  const mL = 54, mR = 12, mT = 16, mB = 40;
  const plotW = W - mL - mR, plotH = H - mT - mB;
  const band = plotW / n;
  const barW = Math.min(38, band * 0.6);
  const yFor = (v: number) => mT + plotH * (1 - v / niceMax);
  const ticks = 4;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* 凡例（直接ラベル） */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 10 }}>
        {cats.map((c) => (
          <span key={c.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary,#555)" }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: c.color, display: "inline-block" }} />
            {c.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="月別売上推移（業態別）" style={{ display: "block", maxWidth: "100%" }}>
        {/* Y グリッド＋目盛 */}
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (niceMax / ticks) * i;
          const y = yFor(v);
          return (
            <g key={i}>
              <line x1={mL} y1={y} x2={W - mR} y2={y} stroke="#e6e8ee" strokeWidth={1} />
              <text x={mL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#8a8f9a">{fmtYen(v)}</text>
            </g>
          );
        })}

        {/* バー（スタック） */}
        {data.map((segs, mi) => {
          const cx = mL + band * mi + band / 2;
          const x = cx - barW / 2;
          const isSel = mi === selected;
          let yCursor = yFor(0);
          const empty = totals[mi] <= 0;
          return (
            <g key={mi}
               onMouseEnter={() => setHover({ mi, x: cx, y: yFor(totals[mi]) })}
               onMouseMove={() => setHover({ mi, x: cx, y: yFor(totals[mi]) })}
               onMouseLeave={() => setHover(null)}
               onClick={() => onSelect?.(mi)}
               style={{ cursor: onSelect ? "pointer" : "default" }}>
              {/* ヒット領域 */}
              <rect x={mL + band * mi} y={mT} width={band} height={plotH} fill="transparent" />
              {segs.map((g, ci) => {
                if (g.v <= 0) return null;
                const h = (g.v / niceMax) * plotH;
                yCursor -= h;
                return (
                  <rect key={ci} x={x} y={yCursor + 1} width={barW} height={Math.max(0, h - 2)} rx={2}
                        fill={g.cat.color} opacity={isSel || hover?.mi === mi ? 1 : 0.82} />
                );
              })}
              {/* 選択月リング */}
              {isSel && !empty && (
                <rect x={x - 2} y={yFor(totals[mi]) - 2} width={barW + 4} height={yFor(0) - yFor(totals[mi]) + 4}
                      fill="none" stroke="#191919" strokeWidth={1.5} rx={3} />
              )}
              {/* 合計ラベル */}
              {!empty && (
                <text x={cx} y={yFor(totals[mi]) - 6} textAnchor="middle" fontSize={10.5}
                      fontWeight={isSel ? 700 : 400} fill="#333">{fmtYen(totals[mi])}</text>
              )}
              {/* 月ラベル */}
              <text x={cx} y={H - mB + 20} textAnchor="middle" fontSize={11.5}
                    fontWeight={isSel ? 700 : 400} fill={isSel ? "#191919" : "#666"}>{months[mi]}</text>
            </g>
          );
        })}
        {/* X軸 */}
        <line x1={mL} y1={yFor(0)} x2={W - mR} y2={yFor(0)} stroke="#c9ccd4" strokeWidth={1} />
      </svg>

      {/* ホバー内訳ツールチップ */}
      {hover && totals[hover.mi] > 0 && (
        <div style={{
          position: "absolute", left: `calc(${(hover.x / W) * 100}% )`, top: 24,
          transform: "translateX(-50%)", pointerEvents: "none",
          background: "#fff", border: "1px solid #e2e4ea", borderRadius: 8,
          boxShadow: "0 6px 20px rgba(0,0,0,.12)", padding: "8px 10px", fontSize: 12, zIndex: 5, minWidth: 150,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{months[hover.mi]} 売上 {fmtYen(totals[hover.mi])}</div>
          {data[hover.mi].filter((g) => g.v > 0).sort((a, b) => b.v - a.v).map((g) => (
            <div key={g.cat.key} style={{ display: "flex", alignItems: "center", gap: 6, lineHeight: 1.6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: g.cat.color }} />
              <span style={{ flex: 1 }}>{g.cat.label}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmtYen(g.v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
