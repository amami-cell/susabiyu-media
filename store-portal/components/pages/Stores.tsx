"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useCreate } from "@/lib/useMutate";
import { DEPT_COLOR } from "@/lib/mockData";
import { Icon } from "../Icon";
import Modal from "../Modal";
import type { Store } from "@/lib/types";

const DEPT_CHIPS = [
  { f: "all", label: "すべて", n: 142, cls: "" },
  { f: "第一営業部", label: "第一営業部", n: 38, cls: "c-purple" },
  { f: "第二営業部", label: "第二営業部", n: 41, cls: "c-blue" },
  { f: "第三営業部", label: "第三営業部", n: 35, cls: "c-green" },
  { f: "特販部", label: "特販部", n: 28, cls: "c-amber" },
];
const DEPTS = ["第一営業部", "第二営業部", "第三営業部", "特販部"];
type SortKey = "name" | "code" | "open";

const EMPTY = { name: "", code: "", dept: "第一営業部", area: "", genre: "", tel: "" };

export default function Stores({ onOpen }: { onOpen: (s: Store) => void }) {
  const stores = useStore((s) => s.collections.stores) ?? [];
  const create = useCreate();
  const [dept, setDept] = useState("all");
  const [q, setQ] = useState("");
  const [compact, setCompact] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let list = stores.filter((s) => {
      if (dept !== "all" && s.dept !== dept) return false;
      if (kw && !(s.name + s.code + s.area + s.dept).toLowerCase().includes(kw)) return false;
      return true;
    });
    if (sort) {
      const val = (s: Store) => (sort.key === "code" ? Number(s.code) : s[sort.key] || "");
      list = [...list].sort((a, b) => {
        const va = val(a), vb = val(b);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * sort.dir;
        return String(va).localeCompare(String(vb), "ja") * sort.dir;
      });
    }
    return list;
  }, [stores, dept, q, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  const arrow = (key: SortKey) => (sort?.key === key ? (sort.dir === 1 ? "▲" : "▼") : "▲▼");

  const submit = async () => {
    setErr("");
    if (!form.name.trim() || !form.code.trim()) { setErr("店舗名とコードは必須です。"); return; }
    if (stores.some((s) => s.code === form.code.trim())) { setErr("そのコードは既に使われています。"); return; }
    setBusy(true);
    const store: Store = {
      id: form.code.trim(), code: form.code.trim(), name: form.name.trim(), dept: form.dept,
      area: form.area.trim() || "—", genre: form.genre.trim() || "—",
      status: "営業中", statusKey: "g", tel: form.tel.trim() || "—", open: "—", warn: 0,
    };
    const ok = await create("stores", store);
    setBusy(false);
    if (ok) { setAdding(false); setForm(EMPTY); }
    else setErr("追加に失敗しました。時間をおいて再試行してください。");
  };

  return (
    <div className="pg">
      <div className="page-head">
        <h2>店舗一覧</h2>
        <button className="btn" onClick={() => { setForm(EMPTY); setErr(""); setAdding(true); }}>
          <Icon name="Plus" size={14} />店舗を追加
        </button>
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
              <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>店舗名 <span className="ar">{arrow("name")}</span></th>
              <th onClick={() => toggleSort("code")} style={{ cursor: "pointer" }}>コード <span className="ar">{arrow("code")}</span></th>
              <th>営業部</th><th>エリア</th><th>業態</th><th>ステータス</th>
              <th onClick={() => toggleSort("open")} style={{ cursor: "pointer" }}>開店日 <span className="ar">{arrow("open")}</span></th>
              <th>電話</th><th></th>
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

      {adding && (
        <Modal
          title="店舗を追加"
          onClose={() => !busy && setAdding(false)}
          footer={
            <>
              <button className="btn sec" onClick={() => setAdding(false)} disabled={busy}>キャンセル</button>
              <button className="btn" onClick={submit} disabled={busy}>{busy ? "追加中…" : "追加する"}</button>
            </>
          }
        >
          {err && <div className="login err" style={{ margin: 0 }}>{err}</div>}
          <div className="field"><label>店舗名 *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="すさび湯 ○○店" /></div>
          <div className="field"><label>店舗コード *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="1234" /></div>
          <div className="field"><label>営業部</label>
            <select value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
              {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="field"><label>エリア</label><input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="大阪キタ" /></div>
          <div className="field"><label>業態</label><input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="和食／鮨" /></div>
          <div className="field"><label>電話</label><input value={form.tel} onChange={(e) => setForm({ ...form, tel: e.target.value })} placeholder="06-0000-0000" /></div>
        </Modal>
      )}
    </div>
  );
}
