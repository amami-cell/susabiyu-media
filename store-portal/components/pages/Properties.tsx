"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, yen, type Col } from "../DataTable";
import type { Property } from "@/lib/types";

const ST: Record<string, string> = { 募集中: "a", 商談中: "b", 成約: "g" };
const cols: Col<Property>[] = [
  { key: "area", label: "エリア" },
  { key: "name", label: "物件" },
  { key: "size", label: "面積(坪)", align: "right", render: (r) => r.size.toLocaleString() },
  { key: "rent", label: "月額賃料", align: "right", render: (r) => yen(r.rent) },
  { key: "unit", label: "坪単価", align: "right", render: (r) => yen(r.unit) },
  { key: "status", label: "状況", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
];

export default function Properties() {
  const rows = useStore((s) => s.collections.properties) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>募集物件・賃料相場</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={720} />
    </div>
  );
}
