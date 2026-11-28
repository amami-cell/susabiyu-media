"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  TBA_PERIOD, TBA_BANDS, TBA_STORES, getBands, storeMonths, hasOtooshi, yen,
  type BandKey,
} from "@/lib/timebandAbc";

const BAND_COLOR: Record<BandKey, string> = { lunch: "#f47230", dinner: "#257de0", late: "#6b7482" };

function fmtMonth(m: string) { const [y, mm] = m.split("-"); return `${y}/${mm}`; }

export default function TimebandAbc() {
  const [store, setStore] = useState(TBA_STORES[0]);
  const months = useMemo(() => storeMonths(store), [store]);
  const [month, setMonth] = useState<string>("all");

  const otSrc = hasOtooshi(store);
  const bands = useMemo(() => getBands(store, month), [store, month]);

  // 月次推移（一人当たり出品数）
  const trend = useMemo(() => months.map((m) => ({ m, b: getBands(store, m) })).filter((x) => x.b), [store, months]);

  const onStore = (s: string) => { setStore(s); setMonth("all"); };

  return (
    <div className="pg">
      <div className="page-head">
        <h2>時間帯別ABC分析</h2>
        <span className="sp">{TBA_PERIOD} · ランチ10-17 / ディナー17-23 / 深夜23-10 · 一人当たり出品数・一点単価</span>
      </div>

      {/* ツールバー */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          店舗
          <select value={store} onChange={(e) => onStore(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 220 }}>
            {TBA_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          期間
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 140 }}>
            <option value="all">全期間</option>
            {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
        </label>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", paddingBottom: 6 }}>
          <Icon name="Info" size={13} /> 客数＝{otSrc ? "お通し数" : "時間帯別売上の客数(集客)"}
        </div>
      </div>

      {!bands ? (
        <div className="card" style={{ padding: 20 }}>この期間のデータがありません。</div>
      ) : (
        <>
          {/* 3バンドカード */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 14 }}>
            {TBA_BANDS.map((bd) => {
              const m = bands[bd.key];
              return (
                <div key={bd.key} className="card" style={{ padding: "14px 16px", borderTop: `4px solid ${BAND_COLOR[bd.key]}` }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{bd.label}</div>
                    <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>{bd.range}</div>
                    <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted,#8a93a0)" }}>売上比 {m.salesShare.toFixed(1)}%</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginTop: 12 }}>
                    <Metric label="一人当たり出品数" value={m.perCust.toFixed(2)} unit="点/人" big color={BAND_COLOR[bd.key]} />
                    <Metric label="一点単価" value={yen(m.unitPrice)} />
                    <Metric label="出品数" value={m.qty.toLocaleString()} unit="点" />
                    <Metric label={otSrc ? "客数(お通し)" : "客数(集客)"} value={m.cust.toLocaleString()} unit="人" />
                    <Metric label="売上(税抜)" value={yen(m.sales)} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 月次推移（一人当たり出品数） */}
          {trend.length > 1 && (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>月次推移 — 一人当たり出品数（点/人）</div>
              <div style={{ overflowX: "auto", maxHeight: "48vh" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                  <thead>
                    <tr style={{ background: "var(--surface2,#f5f7fa)", position: "sticky", top: 0 }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", whiteSpace: "nowrap" }}>月</th>
                      {TBA_BANDS.map((bd) => <th key={bd.key} style={{ textAlign: "right", padding: "8px 10px", whiteSpace: "nowrap" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: BAND_COLOR[bd.key] }} />{bd.label}</span></th>)}
                      <th style={{ textAlign: "right", padding: "8px 10px", whiteSpace: "nowrap" }}>客数計</th>
                      <th style={{ textAlign: "right", padding: "8px 10px", whiteSpace: "nowrap" }}>売上計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trend.map(({ m, b }) => {
                      const custTot = (["lunch", "dinner", "late"] as BandKey[]).reduce((s, k) => s + (b![k].cust || 0), 0);
                      const salesTot = (["lunch", "dinner", "late"] as BandKey[]).reduce((s, k) => s + (b![k].sales || 0), 0);
                      return (
                        <tr key={m} style={{ borderBottom: "1px solid var(--line,#eef1f5)", cursor: "pointer", background: month === m ? "var(--surface2,#f5f7fa)" : undefined }} onClick={() => setMonth(m)}>
                          <td style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600 }}>{fmtMonth(m)}</td>
                          {TBA_BANDS.map((bd) => <td key={bd.key} style={{ textAlign: "right", padding: "6px 10px", fontWeight: 600, color: BAND_COLOR[bd.key] }}>{b![bd.key].perCust.toFixed(2)}</td>)}
                          <td style={{ textAlign: "right", padding: "6px 10px", color: "var(--ink2,#5b6472)" }}>{custTot.toLocaleString()}</td>
                          <td style={{ textAlign: "right", padding: "6px 10px", color: "var(--muted,#8a93a0)" }}>{yen(salesTot)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", padding: "8px 12px", borderTop: "1px solid var(--line,#eef1f5)" }}>
                行クリックでその月の内訳を表示。一人当たり出品数＝出品数÷客数。客数＝{otSrc ? "お通し数" : "集客(時間帯別売上)"}。
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, unit, big, color }: { label: string; value: string; unit?: string; big?: boolean; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 15, fontWeight: 700, marginTop: 1, color: big ? color : "var(--ink,#1a2230)" }}>
        {value}{unit && <span style={{ fontSize: 11, fontWeight: 400, color: "var(--ink2,#5b6472)" }}> {unit}</span>}
      </div>
    </div>
  );
}
