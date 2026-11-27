"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, type Col } from "../DataTable";
import { Icon } from "../Icon";
import type { ManualDoc } from "@/lib/types";

const cols: Col<ManualDoc>[] = [
  { key: "category", label: "カテゴリ", render: (r) => <Badge text={r.category} cls="n" /> },
  { key: "title", label: "タイトル" },
  { key: "updated", label: "更新日", mono: true },
  {
    key: "open", label: "", sortable: false,
    render: () => <span style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>開く <Icon name="ExternalLink" size={13} /></span>,
  },
];

export default function Manual() {
  const rows = useStore((s) => s.collections.manual) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>マニュアル</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={640} />
    </div>
  );
}
