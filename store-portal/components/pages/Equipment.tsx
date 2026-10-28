"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, type Col } from "../DataTable";
import type { Equipment } from "@/lib/types";

const ST: Record<string, string> = { 貸与中: "b", 在庫: "g", 修理: "a", 廃棄: "n" };
const cols: Col<Equipment>[] = [
  { key: "item", label: "備品" },
  { key: "store", label: "保管/設置" },
  { key: "qty", label: "数量", align: "right" },
  { key: "status", label: "状態", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
  { key: "assignedTo", label: "管理者", render: (r) => <span className="muted">{r.assignedTo}</span> },
];

export default function EquipmentPage() {
  const rows = useStore((s) => s.collections.equipment) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>貸与備品管理</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={720} />
    </div>
  );
}
