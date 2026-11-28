"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  PROMO_PERIOD, PROMO_STORES, getAgg, storeMonths, monthlyTotals, storeRanking, yen,
  type PromoAgg,
} from "@/lib/promo";

const NEB = "#f47230"; // 値割引 orange
const SRV = "#257de0"; // サービス券 blue
function fmtMonth(m: string) { const [y, mm] = m.split("-"); return `${y}/${mm}`; }

export default function Promo() {
  const [store, setStore] = useState(PROMO_STORES[0]);
  const months = useMemo(() => storeMonths(store), [store]);
  const [month, setMonth] = useState("all");
  const [rankOpen, setRankOpen] = useState(false);

  const neb = useMemo(() => getAgg(store, month, "neb"), [store, month]);
  const srv = useMemo(() => getAgg(store, month, "srv"), [store, month]);
  const trend = useMemo(() => monthlyTotals(store), [store]);
  const ranking = useMemo(() => storeRanking(), []);
  const total = neb.amount + srv.amount;

  return (
    <div className="pg">
      <div className="page-head">
        <h2>販促ROI（値引・クーポン）</h2>
        <span className="sp">{PROMO_PERIOD} · 値割引明細＋サービス券明細 · 販促原資(値引・割引・クーポン)の利用実績</span>
      </div>

      {/* ツールバー */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          店舗
          <select value={store} onChange={(e) => { setStore(e.target.value); setMonth("all"); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 220 }}>
            {PROMO_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          期間
          <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 140 }}>
            <option value="all">全期間</option>
            {months.map((m) => <option key={m} value={m}>{fmtMonth(m)}</option>)}
          </select>
        </label>
      </div>

      {/* サマリ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ padding: "12px 14px", borderLeft: `4px solid ${NEB}` }}>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>値割引（値引・割引）</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{yen(neb.amount)}</div>
          <div style={{ fontSize: 11, color: "var(--ink2,#5b6472)" }}>{neb.count.toLocaleString()}件 · {neb.lines.length}種</div>
        </div>
        <div className="card" style={{ padding: "12px 14px", borderLeft: `4px solid ${SRV}` }}>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>サービス券（クーポン）</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{yen(srv.amount)}</div>
          <div style={{ fontSize: 11, color: "var(--ink2,#5b6472)" }}>{srv.count.toLocaleString()}枚 · {srv.lines.length}種</div>
        </div>
        <div className="card" style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>販促原資 合計</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{yen(total)}</div>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>値引＋クーポン</div>
        </div>
      </div>

      {/* 内訳 2カラム */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12, marginBottom: 14 }}>
        <Breakdown title="値割引の内訳" color={NEB} agg={neb} unit="件" />
        <Breakdown title="サービス券の内訳" color={SRV} agg={srv} unit="枚" />
      </div>

      {/* 月次推移 */}
      {trend.length > 1 && (
        <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>月次推移 — 販促原資（円）</div>
          <div style={{ overflowX: "auto", maxHeight: "44vh" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--surface2,#f5f7fa)", position: "sticky", top: 0 }}>
                  <th style={{ textAlign: "left", padding: "8px 10px" }}>月</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}><span style={{ color: NEB }}>値割引</span></th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}><span style={{ color: SRV }}>サービス券</span></th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>合計</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((t) => (
                  <tr key={t.m} style={{ borderBottom: "1px solid var(--line,#eef1f5)", cursor: "pointer", background: month === t.m ? "var(--surface2,#f5f7fa)" : undefined }} onClick={() => setMonth(t.m)}>
                    <td style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600 }}>{fmtMonth(t.m)}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", color: NEB }}>{yen(t.neb)}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", color: SRV }}>{yen(t.srv)}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", fontWeight: 600 }}>{yen(t.neb + t.srv)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 全店ランキング */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <button onClick={() => setRankOpen((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left", color: "var(--ink,#1a2230)" }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>全店ランキング — 販促原資（期間合計）</span>
          <span style={{ marginLeft: "auto" }}><Icon name={rankOpen ? "ChevronUp" : "ChevronDown"} size={16} /></span>
        </button>
        {rankOpen && (
          <div style={{ overflowX: "auto", maxHeight: "44vh" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "var(--surface2,#f5f7fa)" }}>
                  <th style={{ textAlign: "left", padding: "8px 10px" }}>店舗</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>値割引</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>サービス券</th>
                  <th style={{ textAlign: "right", padding: "8px 10px" }}>合計</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.store} style={{ borderBottom: "1px solid var(--line,#eef1f5)", cursor: "pointer", background: r.store === store ? "var(--surface2,#f5f7fa)" : undefined }} onClick={() => { setStore(r.store); setMonth("all"); }}>
                    <td style={{ textAlign: "left", padding: "6px 10px", fontWeight: 600 }}>{r.store}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", color: NEB }}>{yen(r.neb)}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", color: SRV }}>{yen(r.srv)}</td>
                    <td style={{ textAlign: "right", padding: "6px 10px", fontWeight: 700 }}>{yen(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Breakdown({ title, color, agg, unit }: { title: string; color: string; agg: PromoAgg; unit: string }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, borderTop: `3px solid ${color}` }}>{title}<span style={{ fontSize: 11, fontWeight: 400, color: "var(--muted,#8a93a0)", marginLeft: 8 }}>{yen(agg.amount)}</span></div>
      <div style={{ overflowX: "auto", maxHeight: "38vh" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: "var(--surface2,#f5f7fa)" }}>
              <th style={{ textAlign: "left", padding: "7px 10px" }}>名称</th>
              <th style={{ textAlign: "right", padding: "7px 10px" }}>{unit}</th>
              <th style={{ textAlign: "right", padding: "7px 10px" }}>金額</th>
              <th style={{ textAlign: "right", padding: "7px 10px" }}>構成比</th>
            </tr>
          </thead>
          <tbody>
            {agg.lines.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 16, textAlign: "center", color: "var(--muted,#8a93a0)" }}>利用なし</td></tr>
            ) : agg.lines.map((l, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--line,#eef1f5)" }}>
                <td style={{ textAlign: "left", padding: "6px 10px" }}>{l.name || "(名称なし)"}</td>
                <td style={{ textAlign: "right", padding: "6px 10px" }}>{l.count.toLocaleString()}</td>
                <td style={{ textAlign: "right", padding: "6px 10px", fontWeight: 600 }}>{yen(l.amount)}</td>
                <td style={{ textAlign: "right", padding: "6px 10px", color: "var(--muted,#8a93a0)" }}>{agg.amount ? ((l.amount / agg.amount) * 100).toFixed(1) : "0.0"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
