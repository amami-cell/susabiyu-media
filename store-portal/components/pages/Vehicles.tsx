"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, type Col } from "../DataTable";
import type { Vehicle } from "@/lib/types";

function soon(ym: string) {
  const [y, m] = ym.split("/").map(Number);
  if (!y || !m) return false;
  const diff = (new Date(y, m - 1, 1).getTime() - new Date(2026, 9, 26).getTime()) / 86400000;
  return diff <= 45;
}

const cols: Col<Vehicle>[] = [
  { key: "name", label: "車両" },
  { key: "plate", label: "ナンバー", mono: true },
  { key: "store", label: "配置" },
  { key: "inspection", label: "車検満了", render: (r) => <Badge text={r.inspection} cls={soon(r.inspection) ? "a" : "n"} /> },
  { key: "insurance", label: "任意保険満了", render: (r) => <Badge text={r.insurance} cls={soon(r.insurance) ? "a" : "n"} /> },
];

export default function Vehicles() {
  const rows = useStore((s) => s.collections.vehicles) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>社用車</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={720} />
    </div>
  );
}
