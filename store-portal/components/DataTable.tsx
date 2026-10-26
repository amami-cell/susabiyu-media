"use client";
import { useState, type ReactNode } from "react";

export type Col<T> = {
  key: string;
  label: string;
  mono?: boolean;
  align?: "right";
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  render?: (row: T) => ReactNode;
};

export const Badge = ({ text, cls }: { text: string; cls: string }) => <span className={`sp ${cls}`}>{text}</span>;

export function yen(n: number | null | undefined): string {
  return n == null ? "—" : "¥" + n.toLocaleString("ja-JP");
}

// 見出しクリックで実際に並び替わる汎用テーブル（数値/文字を自動判定）
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  minWidth = 680,
  onRowClick,
}: {
  columns: Col<T>[];
  rows: T[];
  minWidth?: number;
  onRowClick?: (row: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const value = (r: T, key: string): string | number => {
    const col = columns.find((c) => c.key === key);
    if (col?.sortValue) return col.sortValue(r);
    return (r as Record<string, unknown>)[key] as string | number;
  };

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const va = value(a, sort.key);
        const vb = value(b, sort.key);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * sort.dir;
        return String(va ?? "").localeCompare(String(vb ?? ""), "ja") * sort.dir;
      })
    : rows;

  const toggle = (key: string) =>
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  return (
    <div className="tbl-wrap">
      <table style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((c) => {
              const sortable = c.sortable !== false;
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  onClick={sortable ? () => toggle(c.key) : undefined}
                  style={{ cursor: sortable ? "pointer" : "default", textAlign: c.align === "right" ? "right" : "left" }}
                >
                  {c.label}
                  {sortable && <span className="ar"> {active ? (sort!.dir === 1 ? "▲" : "▼") : "▲▼"}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} onClick={onRowClick ? () => onRowClick(r) : undefined} style={{ cursor: onRowClick ? "pointer" : "default" }}>
              {columns.map((c) => (
                <td
                  key={c.key}
                  style={{
                    textAlign: c.align === "right" ? "right" : undefined,
                    fontVariantNumeric: c.align === "right" || c.mono ? "tabular-nums" : undefined,
                    fontFamily: c.mono ? "ui-monospace, monospace" : undefined,
                  }}
                >
                  {c.render ? c.render(r) : ((r as Record<string, unknown>)[c.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
