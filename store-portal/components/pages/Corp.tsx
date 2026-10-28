"use client";
import { useStore } from "@/lib/store";
import { DataTable, type Col } from "../DataTable";
import type { Corp } from "@/lib/types";

const cols: Col<Corp>[] = [
  { key: "name", label: "法人名" },
  { key: "rep", label: "代表", render: (r) => <span className="muted">{r.rep}</span> },
  { key: "stores", label: "店舗数", align: "right", render: (r) => `${r.stores} 店` },
  { key: "founded", label: "設立", mono: true },
  { key: "fiscalMonth", label: "決算月" },
];

export default function CorpPage() {
  const rows = useStore((s) => s.collections.corp) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>法人マスタ</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={680} />
    </div>
  );
}
