"use client";
import { useStore } from "@/lib/store";
import { useMutate } from "@/lib/useMutate";
import { DataTable, Badge, type Col } from "../DataTable";
import { Icon } from "../Icon";
import type { Feedback } from "@/lib/types";

const ST: Record<string, string> = { 受付: "a", 対応中: "b", 完了: "g", 見送り: "n" };

export default function FeedbackPage() {
  const rows = useStore((s) => s.collections.feedback) ?? [];
  const mutate = useMutate();
  const cols: Col<Feedback>[] = [
    { key: "category", label: "カテゴリ", render: (r) => <Badge text={r.category} cls="n" /> },
    { key: "text", label: "要望" },
    { key: "author", label: "起票者", render: (r) => <span className="muted">{r.author}</span> },
    {
      key: "votes", label: "票", align: "right",
      render: (r) => (
        <button className="cell-btn" title="+1" onClick={() => mutate("feedback", r.id, { votes: r.votes + 1 })} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontVariantNumeric: "tabular-nums" }}>
          <Icon name="Lightbulb" size={13} />{r.votes}
        </button>
      ),
    },
    { key: "status", label: "状況", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
  ];
  return (
    <div className="pg">
      <div className="page-head"><h2>サイト改善要望</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={720} />
    </div>
  );
}
