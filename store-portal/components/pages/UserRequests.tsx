"use client";
import { useStore } from "@/lib/store";
import { useMutate } from "@/lib/useMutate";
import { DataTable, Badge, type Col } from "../DataTable";
import type { UserRequest } from "@/lib/types";

const ST: Record<string, string> = { 申請中: "a", 承認: "g", 却下: "r" };

export default function UserRequests() {
  const rows = useStore((s) => s.collections.userreq) ?? [];
  const mutate = useMutate();
  const cols: Col<UserRequest>[] = [
    { key: "name", label: "氏名" },
    { key: "dept", label: "部署" },
    { key: "type", label: "申請種別", render: (r) => <Badge text={r.type} cls="n" /> },
    { key: "date", label: "申請日", mono: true },
    { key: "status", label: "ステータス", render: (r) => <Badge text={r.status} cls={ST[r.status]} /> },
    {
      key: "action", label: "操作", sortable: false,
      render: (r) =>
        r.status === "申請中" ? (
          <span className="row-actions">
            <button className="mini ok" onClick={() => mutate("userreq", r.id, { status: "承認" })}>承認</button>
            <button className="mini no" onClick={() => mutate("userreq", r.id, { status: "却下" })}>却下</button>
          </span>
        ) : (
          <span className="faint" style={{ fontSize: 11 }}>—</span>
        ),
    },
  ];
  return (
    <div className="pg">
      <div className="page-head"><h2>ユーザー申請</h2></div>
      <DataTable columns={cols} rows={rows} minWidth={700} />
    </div>
  );
}
