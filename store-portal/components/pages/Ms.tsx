"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, type Col } from "../DataTable";
import type { MsRecord } from "@/lib/types";

const KIND: Record<string, string> = { MS: "b", レセプト: "a", 試食: "p" };
const cols: Col<MsRecord>[] = [
  { key: "store", label: "店舗" },
  { key: "kind", label: "種別", render: (r) => <Badge text={r.kind} cls={KIND[r.kind]} /> },
  { key: "date", label: "実施日", mono: true },
  { key: "score", label: "結果/スコア" },
  { key: "staff", label: "担当", render: (r) => <span className="muted">{r.staff}</span> },
];

export default function Ms() {
  const rows = useStore((s) => s.collections.ms) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>MS・レセ・試食</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={680} />
    </div>
  );
}
