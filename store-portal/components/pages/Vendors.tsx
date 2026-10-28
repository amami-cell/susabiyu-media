"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, type Col } from "../DataTable";
import type { Vendor } from "@/lib/types";

const cols: Col<Vendor>[] = [
  { key: "name", label: "取引先名" },
  { key: "category", label: "区分", render: (r) => <Badge text={r.category} cls="n" /> },
  { key: "contact", label: "担当窓口", render: (r) => <span className="muted">{r.contact}</span> },
  { key: "tel", label: "電話", mono: true },
  { key: "stores", label: "取引店舗数", align: "right", render: (r) => `${r.stores} 店` },
];

export default function Vendors() {
  const rows = useStore((s) => s.collections.vendors) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>取引先</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={720} />
    </div>
  );
}
