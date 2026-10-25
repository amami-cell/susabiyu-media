"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { DEPT_COLOR } from "@/lib/mockData";
import { Icon } from "../Icon";
import type { Store } from "@/lib/types";

const DEPT_CHIPS = [
  { f: "all", label: "すべて", n: 142, cls: "" },
  { f: "第一営業部", label: "第一営業部", n: 38, cls: "c-purple" },
  { f: "第二営業部", label: "第二営業部", n: 41, cls: "c-blue" },
  { f: "第三営業部", label: "第三営業部", n: 35, cls: "c-green" },
  { f: "特販部", label: "特販部", n: 28, cls: "c-amber" },
];

export default function Stores({ onOpen }: { onOpen: (s: Store) => void }) {
  const stores = useStore((s) => s.collections.stores) ?? [];
  const [dept, setDept] = useState("all");
  const [q, setQ] = useState("");
  const [compact, setCompact] = useState(false);

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return stores.filter((s) => {
      if (dept !== "all" && s.dept !== dept) return false;
      if (kw && !(s.name + s.code + s.area + s.dept).toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [stores, dept, q]);

  return (
    <div className="pg">
      <div className="page-head">
        <h2>店舗一覧</h2>
        <button className="btn"><Icon name="Plus" size={14} />店舗を追加</button>
      </div>

      <div className="toolbar">
        <div className="search">
          <span className="si"><Icon name="Search" size={16} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="店舗名・コード・エリアで検索" />
        </div>

        <div className="chips">
          {DEPT_CHIPS.map((c) => (
            <button key={c.f} className={`chip ${c.cls}${dept === c.f ? " on" : ""}`} onClick={() => setDept(c.f)}>
              {c.label}<span className="n">{c.n}</span>
            </button>
          ))}
        </div>

        <div className="chips">
          <button className="chip c-green">営業中<span className="n">118</span></button>
          <button className="chip c-purple">改装予定<span className="n">6</span></button>
          <button className="chip c-amber">契約待ち<span className="n">8</span></button>
          <button className="chip c-red">中止<span className="n">23</span></button>
          <button className="chip c-red">クローズ<span className="n">1</span></button>
        </div>

        <div className="sumbar">
          <span>クローズ <b>1</b></span><span className="sep">｜</span>
          <span>中止 <b>23</b></span><span className="sep">｜</span>
          <span><Icon name="TriangleAlert" size={13} style={{ color: "var(--warn)", verticalAlign: -2 }} /> 許可あり <b>5</b></span><span className="sep">｜</span>
          <span><Icon name="Square" size={12} style={{ verticalAlign: -1 }} /> 未入力あり <b>164</b></span>
          <label className={`toggle${compact ? " on" : ""}`} onClick={() => setCompact((v) => !v)}>
            <span>コンパクト</span><span className="sw" />
          </label>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>店舗名 <span className="ar">▲▼</span></th><th>コード</th><th>営業部</th><th>エリア</th>
              <th>業態</th><th>ステータス</th><th>開店日 <span className="ar">▲▼</span></th><th>電話</th><th></th>
            </tr>
          </thead>
          <tbody className={compact ? "compact" : ""}>
            {rows.map((s) => (
              <tr key={s.id} onClick={() => onOpen(s)}>
                <td>
                  <div className="stname">
                    <span className="stline" style={{ background: DEPT_COLOR[s.dept] ?? "#cbd5e1" }} />
                    <span>{s.name}</span>
                    {s.statusKey === "p" && <span className="sp p">改装予定</span>}
                    {s.warn > 0 && <span className="warnbadge"><Icon name="TriangleAlert" size={13} />{s.warn}</span>}
                  </div>
                </td>
                <td className="muted">{s.code}</td>
                <td>{s.dept}</td>
                <td>{s.area}</td>
                <td>{s.genre}</td>
                <td><span className={`sp ${s.statusKey}`}>{s.status}</span></td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{s.open}</td>
                <td className="muted" style={{ fontVariantNumeric: "tabular-nums" }}>{s.tel}</td>
                <td><Icon name="ExternalLink" size={15} className="extic" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
