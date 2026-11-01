"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

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

// 見出しクリックで実際に並び替わり、上部の検索ボックスで全フィールドを横断絞り込みできる汎用テーブル。
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  minWidth = 680,
  onRowClick,
  searchable = true,
  searchPlaceholder = "絞り込み検索（名称・コードなど）",
}: {
  columns: Col<T>[];
  rows: T[];
  minWidth?: number;
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return rows;
    return rows.filter((r) =>
      Object.values(r as Record<string, unknown>).some(
        (v) => (typeof v === "string" || typeof v === "number") && String(v).toLowerCase().includes(kw)
      )
    );
  }, [rows, q]);

  const value = (r: T, key: string): string | number => {
    const col = columns.find((c) => c.key === key);
    if (col?.sortValue) return col.sortValue(r);
    return (r as Record<string, unknown>)[key] as string | number;
  };

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        const va = value(a, sort.key);
        const vb = value(b, sort.key);
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * sort.dir;
        return String(va ?? "").localeCompare(String(vb ?? ""), "ja", { numeric: true }) * sort.dir;
      })
    : filtered;

  const toggle = (key: string) =>
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

  const empty = sorted.length === 0;

  return (
    <div>
      {searchable && (
        <div className="dt-toolbar">
          <div className="search sm">
            <span className="si"><Icon name="Search" size={16} /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label="絞り込み検索" />
          </div>
          <span className="dt-count">
            {q.trim() ? `${sorted.length} 件 / 全 ${rows.length} 件` : `全 ${rows.length} 件`}
          </span>
        </div>
      )}
      <div className="tbl-wrap has-cards">
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
            {empty ? (
              <tr>
                <td colSpan={columns.length} className="dt-empty">該当する項目がありません</td>
              </tr>
            ) : (
              sorted.map((r) => (
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
              ))
            )}
          </tbody>
        </table>

        {/* モバイル: テーブルを隠しカードリストに切替（仕様書 4-5） */}
        <div className="card-list">
          {empty ? (
            <div className="dt-empty">該当する項目がありません</div>
          ) : (
            sorted.map((r) => (
              <div key={r.id} className="cl-card" onClick={onRowClick ? () => onRowClick(r) : undefined} style={{ cursor: onRowClick ? "pointer" : "default" }}>
                {columns.map((c) => {
                  const v = c.render ? c.render(r) : ((r as Record<string, unknown>)[c.key] as ReactNode);
                  return (
                    <div className="cl-row" key={c.key}>
                      {c.label && <span className="cl-k">{c.label}</span>}
                      <span className="cl-v">{v}</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
