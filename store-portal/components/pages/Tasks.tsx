"use client";
import { useStore } from "@/lib/store";
import { useMutate } from "@/lib/useMutate";
import type { Task } from "@/lib/types";

const STAT: Record<string, string> = { 未着手: "n", 進行中: "b", 完了: "g" };
const PRIO: Record<string, string> = { 高: "r", 中: "a", 低: "n" };
const NEXT: Record<Task["status"], Task["status"]> = { 未着手: "進行中", 進行中: "完了", 完了: "未着手" };

export default function Tasks() {
  const tasks = useStore((s) => s.collections.tasks) ?? [];
  const mutate = useMutate();

  return (
    <div className="pg">
      <div className="page-head"><h2>タスク</h2></div>
      <div className="tbl-wrap">
        <table style={{ minWidth: 680 }}>
          <thead>
            <tr><th>タスク</th><th>担当</th><th>期限</th><th>優先</th><th>状態（クリックで変更）</th></tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
