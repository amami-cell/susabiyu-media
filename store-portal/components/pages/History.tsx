"use client";
import { useStore } from "@/lib/store";
import { DataTable, type Col } from "../DataTable";
import { Icon } from "../Icon";
import type { HistoryEntry } from "@/lib/types";

const cols: Col<HistoryEntry>[] = [
  { key: "at", label: "日時", mono: true },
  { key: "target", label: "対象" },
  { key: "field", label: "項目" },
  { key: "by", label: "変更者", render: (r) => <span className="muted">{r.by}</span> },
  {
    key: "change", label: "変更内容", sortable: false,
    render: (r) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span className="faint" style={{ textDecoration: "line-through" }}>{r.before}</span>
        <Icon name="ChevronsRight" size={13} />
        <b>{r.after}</b>
      </span>
    ),
  },
];

export default function History() {
  const rows = useStore((s) => s.collections.history) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>情報変更履歴</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={760} />
    </div>
  );
}
