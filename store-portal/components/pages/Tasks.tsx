"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useMutate } from "@/lib/useMutate";
import FilterChips from "../FilterChips";
import type { Task } from "@/lib/types";

const STAT: Record<string, string> = { 未着手: "n", 進行中: "b", 完了: "g" };
const PRIO: Record<string, string> = { 高: "r", 中: "a", 低: "n" };
const NEXT: Record<Task["status"], Task["status"]> = { 未着手: "進行中", 進行中: "完了", 完了: "未着手" };
const STATUSES: Task["status"][] = ["未着手", "進行中", "完了"];

export default function Tasks() {
  const tasks = useStore((s) => s.collections.tasks) ?? [];
  const mutate = useMutate();
  const [f, setF] = useState("all");

  const rows = f === "all" ? tasks : tasks.filter((t) => t.status === f);
  const opts = [
    { v: "all", label: "すべて", n: tasks.length },
    ...STATUSES.map((s) => ({ v: s, label: s, n: tasks.filter((t) => t.status === s).length, cls: `chip-${STAT[s]}` })),
  ];

  return (
    <div className="pg">
      <div className="page-head"><h2>タスク</h2></div>
      <FilterChips options={opts} value={f} onChange={setF} />
      <div className="tbl-wrap">
        <table style={{ minWidth: 680 }}>
          <thead>
            <tr><th>タスク</th><th>担当</th><th>期限</th><th>優先</th><th>状態（クリックで変更）</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="dt-empty">該当するタスクがありません</td></tr>
            ) : (
              rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td className="muted">{t.assignee}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{t.due}</td>
                  <td><span className={`sp ${PRIO[t.priority]}`}>{t.priority}</span></td>
                  <td>
                    <span
                      className={`sp ${STAT[t.status]} clickable`}
                      title="クリックで状態を切り替え"
                      onClick={() => mutate("tasks", t.id, { status: NEXT[t.status] })}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
