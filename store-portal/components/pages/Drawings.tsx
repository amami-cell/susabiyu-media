"use client";
import { useStore } from "@/lib/store";
import { DataTable, Badge, yen, type Col } from "../DataTable";
import type { Drawing } from "@/lib/types";

const ST: Record<string, string> = { 作成中: "n", 確認待ち: "a", 確定: "g" };
const cols: Col<Drawing>[] = [
  { key: "store", label: "店舗" },
  { key: "kind", label: "種別", render: (r) => <Badge text={r.kind} cls="n" /> },
  { key: "title", label: "件名" },
  { key: "amount", label: "金額", align: "right", sortValue: (r) => r.amount ?? -1, render: (r) => yen(r.amount) },
  { key: "date", label: "日付", mono: true },
  { key: "status", label: "ステータス", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
];

export default function Drawings() {
  const rows = useStore((s) => s.collections.drawings) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>図面・見積</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={760} />
    </div>
  );
}
