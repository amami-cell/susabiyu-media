"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { TB_STORES, TB_PERIOD, TB_NOTE, getTimeband, yen, hourLabel, type HourRow } from "@/lib/timeband";

type Metric = "sales" | "kyaku" | "kumi" | "tanka";
const METRICS: { key: Metric; label: string; fmt: (n: number) => string }[] = [
  { key: "sales", label: "売上", fmt: (n) => yen(n) },
  { key: "kyaku", label: "客数", fmt: (n) => n.toLocaleString() + "人" },
  { key: "kumi", label: "組数", fmt: (n) => n.toLocaleString() + "組" },
  { key: "tanka", label: "客単価", fmt: (n) => yen(n) },
];
const BAR = "#257de0";
const BARPEAK = "#f47230";

export default function Timeband() {
  const [store, setStore] = useState(TB_STORES[0]);
  const [metric, setMetric] = useState<Metric>("sales");

  const tb = useMemo(() => getTimeband(store), [store]);
  const m = METRICS.find((x) => x.key === metric)!;

  if (!tb) return <div className="pg"><div className="page-head"><h2>時間帯別分析</h2></div><div className="card" style={{ padding: 20 }}>データがありません。</div></div>;

  const rows = tb.rows;
  const vals = rows.map((r) => r[metric] as number);
  const max = Math.max(1, ...vals);
  const peakHour = rows.length ? rows[vals.indexOf(Math.max(...vals))].hour : "";
  const totalKyaku = rows.reduce((s, r) => s + r.kyaku, 0);
  const totalKumi = rows.reduce((s, r) => s + r.kumi, 0);
  const avgTanka = totalKyaku ? Math.round(tb.total / totalKyaku) : 0;

  // SVG bar chart
  const W = 820, H = 260, padL = 48, padB = 28, padT = 12, padR = 8;
  const cw = (W - padL - padR) / Math.max(1, rows.length);
  const bw = Math.min(cw * 0.66, 26);

  return (
    <div className="pg">
      <div className="page-head">
        <h2>時間帯別分析</h2>
        <span className="sp">{TB_PERIOD} · {TB_NOTE} · イニシエート{TB_STORES.length}店 · 1時間単位</span>
      </div>

      {/* ツールバー */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          店舗
          <select value={store} onChange={(e) => setStore(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 220 }}>
            {TB_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {METRICS.map((x) => (
            <button key={x.key} onClick={() => setMetric(x.key)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: metric === x.key ? 700 : 500,
              border: "1px solid " + (metric === x.key ? "transparent" : "var(--line,#e3e7ee)"),
              background: metric === x.key ? "var(--accent,#1f5fa6)" : "transparent",
              color: metric === x.key ? "#fff" : "var(--ink2,#5b6472)",
            }}>{x.label}</button>
          ))}
        </div>
      </div>

      {/* サマリ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ padding: "12px 14px" }}><div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>合計売上(税抜)</div><div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{yen(tb.total)}</div></div>
        <div className="card" style={{ padding: "12px 14px" }}><div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>客数 / 組数</div><div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{totalKyaku.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400 }}>人</span> / {totalKumi.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400 }}>組</span></div></div>
        <div className="card" style={{ padding: "12px 14px" }}><div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>平均客単価(税抜)</div><div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{yen(avgTanka)}</div></div>
        <div className="card" style={{ padding: "12px 14px", borderLeft: `4px solid ${BARPEAK}` }}><div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>ピーク時間帯（{m.label}）</div><div style={{ fontSize: 19, fontWeight: 700, marginTop: 2 }}>{hourLabel(peakHour)}</div></div>
      </div>

      {/* 時間帯バーチャート */}
      <div className="card" style={{ padding: "12px 14px 6px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>時間帯別 {m.label}</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label={`時間帯別${m.label}`}>
          {[0, 0.25, 0.5, 0.75, 1].map((g, i) => {
            const y = padT + (H - padT - padB) * (1 - g);
            return <g key={i}><line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--line,#eef1f5)" strokeWidth="1" /><text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--muted,#8a93a0)">{m.key === "sales" || m.key === "tanka" ? "¥" + Math.round(max * g).toLocaleString() : Math.round(max * g)}</text></g>;
          })}
          {rows.map((r, i) => {
            const v = r[metric] as number;
            const h = (H - padT - padB) * (v / max);
            const x = padL + i * cw + (cw - bw) / 2;
            const y = padT + (H - padT - padB) - h;
            const isPeak = r.hour === peakHour;
            return (
              <g key={r.hour}>
                <rect x={x} y={y} width={bw} height={Math.max(0, h)} rx="3" fill={isPeak ? BARPEAK : BAR}>
                  <title>{hourLabel(r.hour)}：{m.fmt(v)}（客{r.kyaku}・組{r.kumi}）</title>
                </rect>
                {i % 2 === 0 && <text x={x + bw / 2} y={H - padB + 12} textAnchor="middle" fontSize="9" fill="var(--muted,#8a93a0)">{r.hour}</text>}
              </g>
            );
          })}
        </svg>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", padding: "2px 2px 6px" }}>横軸＝時刻（{rows[0]?.hour}時〜{hourLabel(rows[rows.length - 1]?.hour || "")}）／オレンジ＝ピーク</div>
      </div>

      {/* 明細テーブル */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface2,#f5f7fa)" }}>
                {["時刻", "客数", "組数", "売上(税抜)", "客単価", "構成比", "回転率", "人時生産性", "販売数"].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 10px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hour} style={{ borderBottom: "1px solid var(--line,#eef1f5)", background: r.hour === peakHour ? "rgba(244,114,48,.06)" : undefined }}>
                  <td style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600 }}>{hourLabel(r.hour)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{r.kyaku.toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{r.kumi.toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{yen(r.sales)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{yen(r.tanka)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{r.kosei.toFixed(1)}%</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{r.kaiten.toFixed(2)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{yen(r.ninji)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px", color: "var(--muted,#8a93a0)" }}>{r.hanbai.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", padding: "8px 12px", borderTop: "1px solid var(--line,#eef1f5)" }}>
          FW「時間帯別売上」より（税抜）。人時生産性＝1人時あたり売上。
        </div>
      </div>
    </div>
  );
}
