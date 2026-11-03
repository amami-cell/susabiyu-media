"use client";
import { useStore } from "@/lib/store";

// 販促ダッシュボードの可視化。外部ライブラリ不要のインラインSVG。
// 色: 食べログ=#1d4ed8 / Google=#b45309（CVD安全ペア・検証済み）、分布=プライマリ navy。
const FOOD = "#1d4ed8";
const GOOGLE = "#b45309";
const BAR = "#1e4b7a";

const MONTHS = ["6月", "7月", "8月", "9月", "10月", "11月"];
const SERIES = [
  { name: "食べログ", color: FOOD, data: [3.3, 3.4, 3.4, 3.5, 3.5, 3.6] },
  { name: "Google", color: GOOGLE, data: [4.0, 4.1, 4.1, 4.2, 4.2, 4.3] },
];

function RatingTrend() {
  const W = 360, H = 190, padL = 26, padR = 64, padT = 14, padB = 26;
  const n = MONTHS.length;
  const lo = 3, hi = 5;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (n - 1);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const grid = [3.5, 4, 4.5, 5];

  return (
    <div className="card">
      <h3><span className="emoji">📈</span>媒体評価の推移</h3>
      <div className="legend">
        {SERIES.map((s) => (
          <span className="lg" key={s.name}><span className="dot" style={{ background: s.color }} />{s.name}</span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ height: "auto", display: "block" }} role="img" aria-label="媒体評価の推移（食べログ・Google、6か月）">
        {grid.map((g) => (
          <g key={g}>
            <line x1={padL} x2={W - padR} y1={y(g)} y2={y(g)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={padL - 6} y={y(g) + 3} textAnchor="end" fontSize="9" fill="var(--faint)">{g.toFixed(1)}</text>
          </g>
        ))}
        {MONTHS.map((m, i) => (
          <text key={m} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--faint)">{m}</text>
        ))}
        {SERIES.map((s) => (
          <g key={s.name}>
            <polyline
              points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"
            />
            {s.data.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r="3" fill={s.color}>
                <title>{`${s.name} ${MONTHS[i]}: ${v.toFixed(1)}`}</title>
              </circle>
            ))}
            {/* 直線の右端に直接ラベル（色だけに頼らない識別） */}
            <text x={x(n - 1) + 7} y={y(s.data[n - 1]) + 3} fontSize="10" fontWeight="600" fill={s.color}>
              {s.data[n - 1].toFixed(1)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ReviewDistribution() {
  const reviews = useStore((s) => s.collections.reviews) ?? [];
  const counts = [5, 4, 3, 2, 1].map((star) => ({ star, n: reviews.filter((r) => r.rating === star).length }));
  const max = Math.max(1, ...counts.map((c) => c.n));
  const total = reviews.length;

  return (
    <div className="card">
      <h3><span className="emoji">⭐</span>口コミ評価の分布</h3>
      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>全 {total} 件</div>
      <div className="bars">
        {counts.map((c) => (
          <div className="bar-row" key={c.star} title={`★${c.star}: ${c.n} 件`}>
            <span className="bar-k">★{c.star}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(c.n / max) * 100}%`, background: BAR }} />
            </span>
            <span className="bar-v">{c.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PromoCharts() {
  return (
    <div className="grid2">
      <RatingTrend />
      <ReviewDistribution />
    </div>
  );
}
