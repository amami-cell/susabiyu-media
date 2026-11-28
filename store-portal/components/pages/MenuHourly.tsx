"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  MH_PERIOD, MH_STORES, MH_CAT_ORDER, MH_CAT_LAB, MH_CAT_COLOR, MH_BANDS,
  HOUR_ORDER, getStore, peakHour, bandTotals, bandOfHour,
  type CatKey, type BandKey,
} from "@/lib/menuHourly";

const BAND_TINT: Record<BandKey, string> = {
  lunch: "rgba(244,114,48,0.06)",
  dinner: "rgba(37,125,224,0.06)",
  late: "rgba(107,116,130,0.08)",
};
const hh = (h: number) => String(h).padStart(2, "0");

export default function MenuHourly() {
  const [cd, setCd] = useState(MH_STORES[0].cd);
  const store = useMemo(() => getStore(cd), [cd]);
  const [cats, setCats] = useState<Set<CatKey>>(new Set(MH_CAT_ORDER));
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null); // 選択メニュー名
  const [hover, setHover] = useState<number | null>(null); // hover中の時間(0-23)

  const activeCats = useMemo(() => MH_CAT_ORDER.filter((c) => cats.has(c) && store?.catHourly[c]), [cats, store]);

  // 表示カテゴリ合計 × 時間(営業日順)
  const chart = useMemo(() => {
    if (!store) return null;
    const perHour = HOUR_ORDER.map((h) => {
      const parts = activeCats.map((c) => ({ cat: c, v: store.catHourly[c]?.[h] || 0 }));
      const tot = parts.reduce((s, p) => s + p.v, 0);
      return { h, parts, tot };
    });
    const max = Math.max(1, ...perHour.map((x) => x.tot));
    return { perHour, max };
  }, [store, activeCats]);

  // カテゴリ別サマリー（選択メニュー表の母集団でなく全体）
  const catSummary = useMemo(() => {
    if (!store) return [];
    return MH_CAT_ORDER.filter((c) => store.catHourly[c]).map((c) => {
      const arr = store.catHourly[c]!;
      const total = arr.reduce((s, v) => s + v, 0);
      const bt = bandTotals(arr);
      return { cat: c, total, bt };
    }).sort((a, b) => b.total - a.total);
  }, [store]);

  // メニュー明細（検索・カテゴリ絞り込み）
  const menus = useMemo(() => {
    if (!store) return [];
    const kw = q.trim();
    return store.menus
      .filter((m) => cats.has(m.cat))
      .filter((m) => !kw || m.name.includes(kw))
      .slice(0, 400);
  }, [store, cats, q]);

  const grandTotal = store ? store.hourlyTotal.reduce((s, v) => s + v, 0) : 0;
  const selMenu = useMemo(() => store?.menus.find((m) => m.name === sel) || null, [store, sel]);

  const toggleCat = (c: CatKey) => {
    const n = new Set(cats);
    if (n.has(c)) n.delete(c); else n.add(c);
    if (n.size === 0) return;
    setCats(n);
  };
  const onStore = (v: string) => { setCd(v); setSel(null); setCats(new Set(MH_CAT_ORDER)); };

  if (!store || !chart) return <div className="pg"><div className="card" style={{ padding: 20 }}>データがありません。</div></div>;

  // チャート寸法
  const W = 820, H = 230, PADL = 40, PADB = 26, PADT = 10;
  const plotW = W - PADL - 8, plotH = H - PADB - PADT;
  const bw = plotW / HOUR_ORDER.length;

  return (
    <div className="pg">
      <div className="page-head">
        <h2>時間帯別メニュー出数</h2>
        <span className="sp">{MH_PERIOD} · 1時間刻み(0-23時) × カテゴリ × 1品1杯明細</span>
      </div>

      {/* ツールバー */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          店舗
          <select value={cd} onChange={(e) => onStore(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 240 }}>
            {MH_STORES.map((s) => <option key={s.cd} value={s.cd}>{s.nm}</option>)}
          </select>
        </label>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", paddingBottom: 6 }}>
          <Icon name="Info" size={13} /> 集計期間 {store.period} ／ 総出数 {grandTotal.toLocaleString()}点
        </div>
      </div>

      {/* カテゴリ凡例（クリックで絞り込み） */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {MH_CAT_ORDER.filter((c) => store.catHourly[c]).map((c) => {
          const on = cats.has(c);
          return (
            <button key={c} onClick={() => toggleCat(c)} style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, padding: "5px 10px", borderRadius: 999,
              border: `1px solid ${on ? MH_CAT_COLOR[c] : "var(--line,#e3e7ee)"}`,
              background: on ? MH_CAT_COLOR[c] + "1a" : "var(--surface,#fff)",
              color: on ? "var(--ink,#1a2230)" : "var(--muted,#8a93a0)", cursor: "pointer",
            }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: MH_CAT_COLOR[c], opacity: on ? 1 : 0.4 }} />
              {MH_CAT_LAB[c]}
            </button>
          );
        })}
      </div>

      {/* 時間帯別 出数チャート（カテゴリ積み上げ） */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>時間帯別 出数（1時間ごと・カテゴリ積み上げ）</div>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", marginBottom: 8 }}>10時始まりの営業日順。帯の背景＝ランチ／ディナー／深夜。棒にカーソルで内訳表示。</div>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 640, display: "block" }} onMouseLeave={() => setHover(null)}>
            {/* バンド背景 */}
            {(() => {
              const rects: React.ReactNode[] = [];
              let i = 0;
              while (i < HOUR_ORDER.length) {
                const bk = bandOfHour(HOUR_ORDER[i]);
                let j = i; while (j < HOUR_ORDER.length && bandOfHour(HOUR_ORDER[j]) === bk) j++;
                rects.push(<rect key={`b${i}`} x={PADL + i * bw} y={PADT} width={(j - i) * bw} height={plotH} fill={BAND_TINT[bk]} />);
                i = j;
              }
              return rects;
            })()}
            {/* y軸グリッド */}
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = PADT + plotH * (1 - t);
              return <g key={t}>
                <line x1={PADL} y1={y} x2={W - 8} y2={y} stroke="var(--line,#e8ebf0)" strokeWidth={1} />
                <text x={PADL - 5} y={y + 3} textAnchor="end" fontSize={9} fill="var(--muted,#9aa3b0)">{Math.round(chart.max * t)}</text>
              </g>;
            })}
            {/* 棒（積み上げ） */}
            {chart.perHour.map((col, idx) => {
              const x = PADL + idx * bw + 1.5;
              const w = bw - 3;
              let yCur = PADT + plotH;
              const segs: React.ReactNode[] = [];
              col.parts.forEach((p) => {
                if (!p.v) return;
                const h = (p.v / chart.max) * plotH;
                yCur -= h;
                segs.push(<rect key={p.cat} x={x} y={yCur + 0.5} width={w} height={Math.max(0, h - 0.5)} fill={MH_CAT_COLOR[p.cat]} rx={1} />);
              });
              const isLate = bandOfHour(col.h) === "late" && col.h < 10;
              return (
                <g key={col.h} onMouseEnter={() => setHover(col.h)}>
                  {segs}
                  <rect x={PADL + idx * bw} y={PADT} width={bw} height={plotH} fill="transparent" />
                  <text x={x + w / 2} y={H - PADB + 11} textAnchor="middle" fontSize={8.5} fill={hover === col.h ? "var(--ink,#1a2230)" : "var(--muted,#9aa3b0)"} fontWeight={hover === col.h ? 700 : 400}>{hh(col.h)}</text>
                  {idx === 0 || idx === 13 ? null : null}
                </g>
              );
            })}
            {/* 選択メニューの折れ線オーバーレイ */}
            {selMenu && (() => {
              const mmax = Math.max(1, ...selMenu.hours);
              const pts = HOUR_ORDER.map((h, idx) => {
                const x = PADL + idx * bw + bw / 2;
                const y = PADT + plotH * (1 - (selMenu.hours[h] / mmax));
                return `${x},${y}`;
              }).join(" ");
              return <polyline points={pts} fill="none" stroke="#1a2230" strokeWidth={1.6} strokeDasharray="3 2" opacity={0.75} />;
            })()}
          </svg>
        </div>
        {/* hoverツールチップ */}
        {hover !== null && (() => {
          const col = chart.perHour.find((c) => c.h === hover);
          if (!col) return null;
          const top = [...col.parts].filter((p) => p.v).sort((a, b) => b.v - a.v);
          return (
            <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--surface2,#f5f7fa)", borderRadius: 8, fontSize: 12, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <b>{hh(hover)}時台</b> <span style={{ color: "var(--muted,#8a93a0)" }}>計 {col.tot.toLocaleString()}点</span>
              {top.map((p) => <span key={p.cat} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: MH_CAT_COLOR[p.cat] }} />{MH_CAT_LAB[p.cat]} {p.v}</span>)}
            </div>
          );
        })()}
      </div>

      {/* カテゴリ別サマリー（バンド内訳） */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginBottom: 14 }}>
        {catSummary.map((cs) => (
          <div key={cs.cat} className="card" style={{ padding: "12px 14px", borderTop: `4px solid ${MH_CAT_COLOR[cs.cat]}` }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{MH_CAT_LAB[cs.cat]}</div>
              <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted,#8a93a0)" }}>{grandTotal ? Math.round(cs.total / grandTotal * 100) : 0}%</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 6px" }}>{cs.total.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted,#8a93a0)" }}> 点</span></div>
            <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "var(--surface2,#f0f2f6)" }}>
              {MH_BANDS.map((b) => { const v = cs.bt[b.key]; const pct = cs.total ? v / cs.total * 100 : 0; return <div key={b.key} title={`${b.label} ${v}`} style={{ width: pct + "%", background: MH_CAT_COLOR[cs.cat], opacity: b.key === "lunch" ? 1 : b.key === "dinner" ? 0.62 : 0.32 }} />; })}
            </div>
            <div style={{ display: "flex", gap: 8, fontSize: 10.5, color: "var(--muted,#8a93a0)", marginTop: 4 }}>
              {MH_BANDS.map((b) => <span key={b.key}>{b.label} {cs.bt[b.key]}</span>)}
            </div>
          </div>
        ))}
      </div>

      {/* メニュー明細（1品1杯） */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>メニュー明細 — 1品1杯ごとの時間分布</div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="Search" size={14} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="メニュー名で検索" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", fontSize: 12, width: 180 }} />
          </div>
        </div>
        <div style={{ overflowX: "auto", maxHeight: "56vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface2,#f5f7fa)", position: "sticky", top: 0, zIndex: 1 }}>
                <th style={{ textAlign: "left", padding: "8px 10px" }}>メニュー</th>
                <th style={{ textAlign: "left", padding: "8px 10px", whiteSpace: "nowrap" }}>カテゴリ</th>
                <th style={{ textAlign: "right", padding: "8px 10px", whiteSpace: "nowrap" }}>出数</th>
                <th style={{ textAlign: "center", padding: "8px 10px", whiteSpace: "nowrap" }}>ピーク</th>
                <th style={{ textAlign: "left", padding: "8px 10px", whiteSpace: "nowrap" }}>時間分布(10→9時)</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((m, mi) => {
                const pk = peakHour(m.hours);
                const mmax = Math.max(1, ...m.hours);
                const on = sel === m.name;
                return (
                  <tr key={m.name + "_" + mi} onClick={() => setSel(on ? null : m.name)} style={{ borderTop: "1px solid var(--line,#eef1f5)", cursor: "pointer", background: on ? MH_CAT_COLOR[m.cat] + "14" : undefined }}>
                    <td style={{ padding: "6px 10px", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</td>
                    <td style={{ padding: "6px 10px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: MH_CAT_COLOR[m.cat] }} />{MH_CAT_LAB[m.cat]}</span></td>
                    <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: 700 }}>{m.total.toLocaleString()}</td>
                    <td style={{ padding: "6px 10px", textAlign: "center", whiteSpace: "nowrap" }}>{hh(pk)}時</td>
                    <td style={{ padding: "6px 10px" }}>
                      <svg width={168} height={22} style={{ display: "block" }}>
                        {HOUR_ORDER.map((h, idx) => {
                          const v = m.hours[h];
                          const bh = v ? Math.max(1.5, (v / mmax) * 20) : 0;
                          return <rect key={h} x={idx * 7} y={20 - bh} width={5.5} height={bh} rx={1} fill={MH_CAT_COLOR[m.cat]} opacity={v ? 1 : 0} />;
                        })}
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "8px 14px", fontSize: 11, color: "var(--muted,#8a93a0)" }}>
          {menus.length}件表示{store.menus.filter((m) => cats.has(m.cat)).length > menus.length ? "（上位400件）" : ""} · 行クリックで上のチャートにその商品の時間分布を重ね表示
        </div>
      </div>
    </div>
  );
}
