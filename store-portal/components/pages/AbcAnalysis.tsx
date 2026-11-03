"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  CATEGORIES,
  METRIC_LABELS,
  MONTH_LABELS,
  getStoreYear,
  fmtMetric,
  summarizeYear,
  type MetricKey,
} from "@/lib/abcData";

const FALLBACK_STORES = ["CRAFTMAN UMAMI", "すさび湯 梅田本店", "すさび湯 三宮店", "ARATA"];
const YEAR = 2026;
const CURRENT_MONTH = 11; // 当月（デモ基準）

export default function AbcAnalysis() {
  const stores = useStore((s) => s.collections.stores) ?? [];
  const storeNames = stores.length ? stores.map((s) => s.name) : FALLBACK_STORES;

  const [store, setStore] = useState(storeNames[0]);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);

  const year = useMemo(() => getStoreYear(store, YEAR), [store]);
  const mi = month - 1;

  const cat = CATEGORIES.find((c) => c.key === activeCat) ?? CATEGORIES[0];
  const rows = year[cat.key];

  return (
    <div className="pg">
      <div className="page-head">
        <h2>ABC分析（店舗別・カテゴリ別）</h2>
        <span className="sp">{YEAR}年 · メニューカテゴリ別の客数・単価・原価・構成比</span>
      </div>

      <div className="card abc-toolbar">
        <label className="abc-field">
          <span>店舗</span>
          <select value={store} onChange={(e) => setStore(e.target.value)}>
            {storeNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="abc-field">
          <span>対象月</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {MONTH_LABELS.map((m, i) => (
              <option key={m} value={i + 1}>{m}{i + 1 === CURRENT_MONTH ? "（当月）" : ""}</option>
            ))}
          </select>
        </label>
        <span className="abc-hint">カテゴリを選ぶと、下に年間（月別）の詳細が出ます</span>
      </div>

      {/* カテゴリ別ボタン（選択月の内訳） */}
      <div className="abc-cats">
        {CATEGORIES.map((c) => {
          const r = year[c.key][mi];
          const on = c.key === activeCat;
          return (
            <button key={c.key} className={`abc-cat${on ? " active" : ""}`} onClick={() => setActiveCat(c.key)} aria-pressed={on}>
              <h4>{c.label}</h4>
              <div className="abc-metrics">
                {c.metrics.map((mk) => (
                  <div className="abc-metric" key={mk}>
                    <span className="mk">{METRIC_LABELS[mk].label}</span>
                    <span className="mv">{fmtMetric(r[mk as MetricKey], METRIC_LABELS[mk].kind)}</span>
                  </div>
                ))}
              </div>
              <span className="abc-cat-foot">{MONTH_LABELS[mi]}の実績 ›</span>
            </button>
          );
        })}
      </div>

      {/* 年間（月別）詳細テーブル */}
      <div className="card abc-detail">
        <h3>
          <span className="emoji">📊</span>{cat.label}｜{YEAR}年 月別詳細
          <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{store}</span>
        </h3>
        <div className="tbl-wrap">
          <table className="abc-table">
            <thead>
              <tr>
                <th className="rowh">指標</th>
                {MONTH_LABELS.map((m, i) => (
                  <th key={m} className={i === mi ? "cur" : ""}>{m}</th>
                ))}
                <th className="tot">合計／平均</th>
              </tr>
            </thead>
            <tbody>
              {cat.metrics.map((mk) => (
                <tr key={mk}>
                  <td className="rowh">{METRIC_LABELS[mk].label}<span className="unit">（{METRIC_LABELS[mk].unit}）</span></td>
                  {rows.map((r, i) => (
                    <td key={i} className={i === mi ? "cur" : ""}>{fmtMetric(r[mk as MetricKey], METRIC_LABELS[mk].kind)}</td>
                  ))}
                  <td className="tot">{fmtMetric(summarizeYear(rows, mk as MetricKey), METRIC_LABELS[mk].kind)}</td>
                </tr>
              ))}
              <tr className="sub">
                <td className="rowh">税抜売上</td>
                {rows.map((r, i) => (
                  <td key={i} className={i === mi ? "cur" : ""}>¥{Math.round(r.uriage / 1000).toLocaleString()}k</td>
                ))}
                <td className="tot">¥{Math.round(rows.reduce((s, r) => s + r.uriage, 0) / 1000).toLocaleString()}k</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="abc-note">
          ※ 現在は代表値（デモ）。実データ（POS／スプレッドシート）に差し替えると同じ画面でそのまま反映されます。
          「1日A/V」＝1営業日あたり客数、「売上構成比」＝当月の全カテゴリ売上に占める割合。
        </div>
      </div>
    </div>
  );
}
