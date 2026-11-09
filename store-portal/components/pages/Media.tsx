"use client";
import { useStore } from "@/lib/store";
import { DataTable, type Col } from "../DataTable";
import { Icon } from "../Icon";
import { Stars } from "../Stars";
import type { MediaRow } from "@/lib/types";

const cols: Col<MediaRow>[] = [
  { key: "store", label: "店舗" },
  { key: "source", label: "媒体" },
  { key: "rating", label: "評価", sortValue: (r) => r.rating, render: (r) => (r.source === "Instagram" ? <span className="muted">—</span> : <Stars value={r.rating} />) },
  { key: "reviews", label: "レビュー / フォロワー", align: "right", render: (r) => `${r.reviews.toLocaleString()}${r.source === "Instagram" ? " フォロワー" : " 件"}` },
  {
    key: "synced", label: "連携", sortValue: (r) => (r.synced ? 1 : 0),
    render: (r) =>
      r.synced ? (
        <span className="sp g" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="ClipboardCheck" size={12} />連携済</span>
      ) : (
        <span className="sp r" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="TriangleAlert" size={12} />要再認証</span>
      ),
  },
];

export default function Media() {
  const rows = useStore((s) => s.collections.media) ?? [];
  return (
    <div className="pg">
      <div className="page-head"><h2>媒体一覧</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={640} />
    </div>
  );
}
