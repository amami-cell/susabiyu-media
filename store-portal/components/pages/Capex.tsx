"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, yen, type Col } from "../DataTable";
import type { Capex } from "@/lib/types";

const ST: Record<string, string> = { 申請中: "a", 一次承認: "b", 決裁済: "g", 却下: "r" };
const cols: Col<Capex>[] = [
  { key: "store", label: "店舗/部署" },
  { key: "title", label: "件名" },
  { key: "category", label: "区分", render: (r) => <Badge text={r.category} cls="n" /> },
  { key: "amount", label: "金額", align: "right", render: (r) => yen(r.amount) },
  { key: "applicant", label: "申請者", render: (r) => <span className="muted">{r.applicant}</span> },
  { key: "status", label: "決裁状況", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
];

export default function CapexPage() {
  const rows = useStore((s) => s.collections.capex) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>CAPEX（設備投資）</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={760} />
    </div>
  );
}
