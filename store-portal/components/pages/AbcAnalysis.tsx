"use client";
import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  ABC_STORES, ABC_PERIOD, ABC_CATS, CAT_LABEL, getStoreDetail, yen,
  type AbcRow, type Rank, type CatKey,
} from "@/lib/abcDetail";

const RANK_COLOR: Record<Rank, string> = { A: "#257de0", B: "#f2a600", C: "#9aa4b2" };
const CAT_COLOR: Record<CatKey, string> = {
  nomi: "#ee7fac", tabe: "#f2a600", lunch: "#f47230", course: "#00b894", drink: "#257de0", ala: "#6b7482", none: "#c4cad3",
};
type SortKey = "sales" | "qty" | "cost" | "kosei";

export default function AbcAnalysis() {
  const [store, setStore] = useState(ABC_STORES[0]);
  const [rank, setRank] = useState<"all" | Rank>("all");
  const [cat, setCat] = useState<"all" | CatKey>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("sales");

  const detail = useMemo(() => getStoreDetail(store), [store]);

  const rows = useMemo(() => {
    if (!detail) return [];
    let r: AbcRow[] = detail.rows;
    if (rank !== "all") r = r.filter((x) => x.rank === rank);
    if (cat !== "all") r = r.filter((x) => x.cat === cat);
    const kw = q.trim().toLowerCase();
    if (kw) r = r.filter((x) => x.menu.toLowerCase().includes(kw));
    const key = sort;
    return [...r].sort((a, b) => (b[key] as number) - (a[key] as number));
  }, [detail, rank, cat, q, sort]);

  if (!detail) return <div className="pg"><div className="page-head"><h2>ABC分析</h2></div><div className="card" style={{ padding: 20 }}>データがありません。</div></div>;

  // 当店に存在するカテゴリのみ（売上降順）
  const presentCats = ABC_CATS.filter((c) => (detail.cats[c.key]?.count ?? 0) > 0)
    .sort((a, b) => detail.cats[b.key].sales - detail.cats[a.key].sales);

  const ranks: Rank[] = ["A", "B", "C"];
  const sortBtn = (k: SortKey, label: string) => (
    <th onClick={() => setSort(k)} style={{ cursor: "pointer", textAlign: "right", whiteSpace: "nowrap", userSelect: "none" }} title="クリックで並べ替え">
      {label}{sort === k ? " ▾" : ""}
    </th>
  );

  return (
    <div className="pg">
      <div className="page-head">
        <h2>ABC分析（メニュー別）</h2>
        <span className="sp">{ABC_PERIOD} · FW実データ(税抜) · イニシエート{ABC_STORES.length}店 · 商品単位のA/B/Cランク＋カテゴリ区分</span>
      </div>

      {/* ツールバー */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
          店舗
          <select value={store} onChange={(e) => { setStore(e.target.value); setCat("all"); setRank("all"); }} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--line,#e3e7ee)", background: "var(--surface,#fff)", color: "var(--ink,#1a2230)", minWidth: 220 }}>
            {ABC_STORES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
          {(["all", "A", "B", "C"] as const).map((r) => (
            <button key={r} onClick={() => setRank(r)} style={{
              padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: rank === r ? 700 : 500,
              border: "1px solid " + (rank === r ? "transparent" : "var(--line,#e3e7ee)"),
              background: rank === r ? (r === "all" ? "var(--accent,#1f5fa6)" : RANK_COLOR[r]) : "transparent",
              color: rank === r ? "#fff" : "var(--ink2,#5b6472)",
            }}>{r === "all" ? "全ランク" : r}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", border: "1px solid var(--line,#e3e7ee)", borderRadius: 8, padding: "5px 10px" }}>
          <Icon name="Search" size={15} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="メニュー名で絞り込み" style={{ border: 0, outline: 0, background: "transparent", fontSize: 13, color: "var(--ink,#1a2230)", width: 160 }} />
        </div>
      </div>

      {/* ランク別サマリ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <div className="card" style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>合計売上(税抜)</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{yen(detail.total)}</div>
          <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", marginTop: 2 }}>全{detail.count}品目</div>
        </div>
        {ranks.map((r) => {
          const share = detail.total ? (detail.abcSales[r] / detail.total) * 100 : 0;
          return (
            <div key={r} className="card" style={{ padding: "12px 14px", borderLeft: `4px solid ${RANK_COLOR[r]}` }}>
              <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>{r}ランク</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{detail.abc[r]}<span style={{ fontSize: 12, fontWeight: 400 }}>品</span></div>
              <div style={{ fontSize: 11, color: "var(--ink2,#5b6472)", marginTop: 2 }}>{yen(detail.abcSales[r])}・売上比{share.toFixed(1)}%</div>
            </div>
          );
        })}
      </div>

      {/* カテゴリ別内訳 */}
      <div className="card" style={{ padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>カテゴリ別内訳（出品数・売上・構成比・平均原価率）</div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted,#8a93a0)" }}>区分はFW部門名より自動分類</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(170px,1fr))", gap: 10 }}>
          <button
            onClick={() => setCat("all")}
            className="card"
            style={{ textAlign: "left", padding: "10px 12px", cursor: "pointer", border: cat === "all" ? "2px solid var(--accent,#1f5fa6)" : "1px solid var(--line,#e3e7ee)", background: "transparent" }}
          >
            <div style={{ fontSize: 12, fontWeight: 600 }}>全カテゴリ</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>{detail.count}<span style={{ fontSize: 11, fontWeight: 400 }}>品</span></div>
            <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", marginTop: 2 }}>{yen(detail.total)}</div>
          </button>
          {presentCats.map((c) => {
            const s = detail.cats[c.key];
            const share = detail.total ? (s.sales / detail.total) * 100 : 0;
            const active = cat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCat(active ? "all" : c.key)}
                className="card"
                style={{ textAlign: "left", padding: "10px 12px", cursor: "pointer", borderLeft: `4px solid ${CAT_COLOR[c.key]}`, border: active ? `2px solid ${CAT_COLOR[c.key]}` : undefined, borderLeftWidth: 4, borderLeftColor: CAT_COLOR[c.key], borderLeftStyle: "solid", background: active ? "var(--surface2,#f5f7fa)" : "transparent" }}
              >
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>{s.count}<span style={{ fontSize: 11, fontWeight: 400 }}>品</span></div>
                <div style={{ fontSize: 11, color: "var(--ink2,#5b6472)", marginTop: 2 }}>{yen(s.sales)}・{share.toFixed(1)}%</div>
                <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)" }}>平均原価率 {s.cost.toFixed(1)}%</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 明細テーブル */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto", maxHeight: "58vh" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface2,#f5f7fa)", position: "sticky", top: 0 }}>
                <th style={{ textAlign: "left", padding: "8px 10px", whiteSpace: "nowrap" }}>メニュー</th>
                <th style={{ textAlign: "left", whiteSpace: "nowrap" }}>カテゴリ</th>
                {sortBtn("qty", "販売数")}
                {sortBtn("sales", "売上(税抜)")}
                {sortBtn("cost", "原価率")}
                {sortBtn("kosei", "構成比")}
                <th style={{ textAlign: "right", whiteSpace: "nowrap" }}>累計</th>
                <th style={{ textAlign: "center" }}>ﾗﾝｸ</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", color: "var(--muted,#8a93a0)" }}>該当なし</td></tr>
              ) : rows.map((x, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--line,#eef1f5)" }}>
                  <td style={{ textAlign: "left", padding: "6px 10px", maxWidth: 240 }}>{x.menu}</td>
                  <td style={{ textAlign: "left", padding: "6px 10px", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink2,#5b6472)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLOR[x.cat] }} />{CAT_LABEL[x.cat]}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{x.qty.toLocaleString()}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{yen(x.sales)}</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{x.cost.toFixed(1)}%</td>
                  <td style={{ textAlign: "right", padding: "6px 10px" }}>{x.kosei.toFixed(2)}%</td>
                  <td style={{ textAlign: "right", padding: "6px 10px", color: "var(--muted,#8a93a0)" }}>{x.cum.toFixed(1)}%</td>
                  <td style={{ textAlign: "center", padding: "6px 10px" }}>
                    <span style={{ display: "inline-block", minWidth: 20, padding: "1px 7px", borderRadius: 5, fontWeight: 700, fontSize: 11, color: "#fff", background: RANK_COLOR[x.rank] }}>{x.rank}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted,#8a93a0)", padding: "8px 12px", borderTop: "1px solid var(--line,#eef1f5)" }}>
          表示 {rows.length} / {detail.count} 品目{cat !== "all" ? `（${CAT_LABEL[cat as CatKey]}）` : ""} · 列見出しクリックで並べ替え · ランクはFWのABC区分
        </div>
      </div>
    </div>
  );
}
