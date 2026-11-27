"use client";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  CATEGORIES,
  METRIC_LABELS,
  getStoreYear,
  fmtMetric,
  summarizeYear,
  type MetricKey,
} from "@/lib/abcData";
import { ABC_STORES, ABC_PERIOD, ABC_MONTHS_WITH_DATA, ABC_PERIOD_LABELS } from "@/lib/abcReal";
import AbcTrendChart, { type TrendCat } from "@/components/AbcTrendChart";
import AbcCostRateChart from "@/components/AbcCostRateChart";
import AbcStoreCompare from "@/components/AbcStoreCompare";

// 業態別の固定配色（dataviz検証済みカテゴリパレット・固定順）
const CAT_COLORS: Record<string, string> = {
  arakaruto: "#257de0", // blue
  lunch: "#f47230",     // orange
  enkai: "#00b894",     // aqua
  tabehodai: "#f2a600", // yellow
  nomihodai: "#ee7fac", // magenta
};

const YEAR = 2026;
const CURRENT_MONTH = ABC_MONTHS_WITH_DATA; // 実データの最終月（2026年10月）

export default function AbcAnalysis() {
  // イニシエート実データのある店舗を優先。無ければアプリ内の店舗一覧にフォールバック。
  const stores = useStore((s) => s.collections.stores) ?? [];
  const storeNames = ABC_STORES.length ? ABC_STORES : (stores.length ? stores.map((s) => s.name) : []);

  const [store, setStore] = useState(storeNames[0]);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [activeCat, setActiveCat] = useState(CATEGORIES[0].key);

  const year = useMemo(() => getStoreYear(store, YEAR), [store]);
  const mi = month - 1;

  const cat = CATEGORIES.find((c) => c.key === activeCat) ?? CATEGORIES[0];
  const rows = (year[cat.key] ?? []).slice(0, ABC_MONTHS_WITH_DATA); // 実データのある期間のみ
  const months = ABC_PERIOD_LABELS;
  const multiPeriod = months.length > 1;
  const trendCats: TrendCat[] = CATEGORIES.map((c) => ({ key: c.key, label: c.label, color: CAT_COLORS[c.key] ?? "#999" }));

  return (
    <div className="pg">
      <div className="page-head">
        <h2>ABC分析（店舗別・カテゴリ別）</h2>
        <span className="sp">{ABC_PERIOD} · イニシエート{storeNames.length}店 · メニューカテゴリ別の売上・原価・構成比</span>
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
        {multiPeriod && (
          <label className="abc-field">
            <span>対象月</span>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {months.map((m, i) => (
                <option key={m} value={i + 1}>{m}{i + 1 === CURRENT_MONTH ? "（最新）" : ""}</option>
              ))}
            </select>
          </label>
        )}
        {!multiPeriod && (
          <label className="abc-field">
            <span>期間</span>
            <span style={{ fontWeight: 700 }}>{ABC_PERIOD_LABELS[0]}</span>
          </label>
        )}
        <span className="abc-hint">カテゴリを選ぶと、下に業態別の内訳が出ます</span>
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
              <span className="abc-cat-foot">{ABC_PERIOD_LABELS[mi]} 実績 ›</span>
            </button>
          );
        })}
      </div>

      {/* 年間（月別）詳細テーブル */}
      <div className="card abc-detail">
        <h3>
          <span className="emoji">📊</span>{cat.label}｜{ABC_PERIOD}
          <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{store}</span>
        </h3>
        <div className="tbl-wrap">
          <table className="abc-table">
            <thead>
              <tr>
                <th className="rowh">指標</th>
                {months.map((m, i) => (
                  <th key={m} className={i === mi ? "cur" : ""}>{m}</th>
                ))}
                {multiPeriod && <th className="tot">合計／平均</th>}
              </tr>
            </thead>
            <tbody>
              {cat.metrics.map((mk) => (
                <tr key={mk}>
                  <td className="rowh">{METRIC_LABELS[mk].label}<span className="unit">（{METRIC_LABELS[mk].unit}）</span></td>
                  {rows.map((r, i) => (
                    <td key={i} className={i === mi ? "cur" : ""}>{fmtMetric(r[mk as MetricKey], METRIC_LABELS[mk].kind)}</td>
                  ))}
                  {multiPeriod && <td className="tot">{fmtMetric(summarizeYear(rows, mk as MetricKey), METRIC_LABELS[mk].kind)}</td>}
                </tr>
              ))}
              <tr className="sub">
                <td className="rowh">税抜売上</td>
                {rows.map((r, i) => (
                  <td key={i} className={i === mi ? "cur" : ""}>¥{Math.round(r.uriage / 1000).toLocaleString()}k</td>
                ))}
                {multiPeriod && <td className="tot">¥{Math.round(rows.reduce((s, r) => s + r.uriage, 0) / 1000).toLocaleString()}k</td>}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="abc-note">
          ※ FOODING JOURNAL「ABC分析」からの実データ（{ABC_PERIOD}）。金額は税抜。
          ABCレポートに客数が無いため「販売点数（点）」「商品単価＝売上÷点数」で表示しています（客数・客単価は日報系の別レポートが必要）。
          「1日平均点数」＝販売点数÷当月暦日数、「売上構成比」＝当月の全カテゴリ売上に占める割合。カテゴリはFW部門名から自動分類。
          対象月を切り替えると各カテゴリの選択月実績が上部に反映されます。11〜12月は未到来のため0表示。
        </div>
      </div>

      {/* 月別 売上推移（業態別スタック） */}
      {multiPeriod && (
        <div className="card abc-detail">
          <h3>
            <span className="emoji">📈</span>月別 売上推移（業態別・税抜）
            <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{store}</span>
          </h3>
          <AbcTrendChart year={year} cats={trendCats} months={months} selected={mi} onSelect={(m) => setMonth(m + 1)} />
          <div className="abc-note">
            ※ 各月の税抜売上を業態別に積み上げ。バーをクリック（またはホバー）すると対象月・内訳が確認できます。選択中の月は枠線で強調。
          </div>
        </div>
      )}

      {/* 月別 原価率の推移（店舗全体・売上加重） */}
      {multiPeriod && (
        <div className="card abc-detail">
          <h3>
            <span className="emoji">📉</span>月別 原価率の推移（店舗全体・税抜）
            <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>{store}</span>
          </h3>
          <AbcCostRateChart year={year} catKeys={CATEGORIES.map((c) => c.key)} months={months} selected={mi} onSelect={(m) => setMonth(m + 1)} />
          <div className="abc-note">
            ※ 店舗全体の月次原価率＝Σ原価÷Σ売上（税抜・全業態加重）。破線は期間平均。マーカーのクリック／ホバーで対象月を切替、売上0の月は線を分断。
          </div>
        </div>
      )}

      {/* 全店横断 原価率比較 */}
      {ABC_STORES.length > 1 && (
        <div className="card abc-detail">
          <h3>
            <span className="emoji">🏬</span>全店横断 原価率比較（{ABC_PERIOD}）
            <span className="muted" style={{ fontWeight: 400, fontSize: 12, marginLeft: 8 }}>イニシエート{storeNames.length}店・原価率が高い順</span>
          </h3>
          <AbcStoreCompare current={store} onSelectStore={(s) => setStore(s)} />
          <div className="abc-note">
            ※ 各店の期間原価率＝Σ原価÷Σ売上（税抜・全業態加重）を高い順に並べたもの。破線は全店平均。選択中の店舗は紫で強調。店名バーのクリックでその店舗に切替。
          </div>
        </div>
      )}
    </div>
  );
}
