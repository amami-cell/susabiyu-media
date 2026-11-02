// ABC分析（店舗別・カテゴリ別・月別）のデータ層。
//
// ★現状は「代表値ダミー」をクライアントで生成しています（店舗名から決定論的に算出）。
//   実データへの差し替えは getStoreYear() の中身を
//   POS エクスポート / Google スプレッドシート / API 連携に置き換えるだけで、
//   画面（AbcAnalysis.tsx）側は一切変更不要です。
//
// カテゴリ別の表示指標は画像仕様に準拠：
//   アラカルト   : 客数・客単価・原価率・売上構成比
//   ランチ・定食 : 客数・客単価・原価率・1日A/V
//   宴会・コース : 客数・客単価・原価率・売上構成比
//   食べ放題     : 客数・客単価・原価率・1日A/V・売上構成比
//   飲み放題     : 客数・客単価・原価率・1日A/V・売上構成比

export type MetricKey = "kyakusu" | "kyakutanka" | "genkaritsu" | "uriageKosei" | "avgPerDay";

export interface CategoryDef {
  key: string;
  label: string;
  metrics: MetricKey[];
}

export const CATEGORIES: CategoryDef[] = [
  { key: "arakaruto", label: "アラカルト", metrics: ["kyakusu", "kyakutanka", "genkaritsu", "uriageKosei"] },
  { key: "lunch", label: "ランチ・定食", metrics: ["kyakusu", "kyakutanka", "genkaritsu", "avgPerDay"] },
  { key: "enkai", label: "宴会・コース", metrics: ["kyakusu", "kyakutanka", "genkaritsu", "uriageKosei"] },
  { key: "tabehodai", label: "食べ放題", metrics: ["kyakusu", "kyakutanka", "genkaritsu", "avgPerDay", "uriageKosei"] },
  { key: "nomihodai", label: "飲み放題", metrics: ["kyakusu", "kyakutanka", "genkaritsu", "avgPerDay", "uriageKosei"] },
];

export interface MetricDef {
  label: string;
  unit: string;
  kind: "int" | "yen" | "pct";
}

export const METRIC_LABELS: Record<MetricKey, MetricDef> = {
  kyakusu: { label: "客数", unit: "人", kind: "int" },
  kyakutanka: { label: "客単価", unit: "円", kind: "yen" },
  genkaritsu: { label: "原価率", unit: "%", kind: "pct" },
  uriageKosei: { label: "売上構成比", unit: "%", kind: "pct" },
  avgPerDay: { label: "1日A/V", unit: "人/日", kind: "int" },
};

export const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export interface CatMonth {
  month: number; // 1-12
  kyakusu: number;
  uriage: number; // 税抜売上
  genkaritsu: number; // %
  days: number; // 営業日数
  kyakutanka: number; // 円（= uriage / kyakusu）
  avgPerDay: number; // 人/日（= kyakusu / days）
  uriageKosei: number; // %（= 当カテゴリ売上 / 当月 全カテゴリ売上）
}

export type StoreYear = Record<string, CatMonth[]>; // key: category.key → 12か月分

// --- 決定論ダミー生成（実データ差し替え時はここを置き換え） -------------------
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Profile {
  dayCust: number; // 1日あたり基準客数
  tanka: number; // 基準客単価
  genka: number; // 基準原価率
  season: "even" | "winter" | "summer";
}
const PROFILE: Record<string, Profile> = {
  arakaruto: { dayCust: 55, tanka: 2600, genka: 30, season: "even" },
  lunch: { dayCust: 72, tanka: 1050, genka: 38, season: "even" },
  enkai: { dayCust: 18, tanka: 5200, genka: 27, season: "winter" },
  tabehodai: { dayCust: 34, tanka: 3600, genka: 36, season: "summer" },
  nomihodai: { dayCust: 44, tanka: 1900, genka: 15, season: "winter" },
};

// 月別の季節係数（1-12月）
const SEASON: Record<Profile["season"], number[]> = {
  even: [0.95, 0.9, 1.0, 1.0, 1.02, 1.0, 1.05, 1.05, 1.0, 1.02, 1.05, 1.15],
  winter: [1.05, 0.9, 0.95, 0.95, 0.95, 0.9, 0.95, 0.9, 1.0, 1.1, 1.25, 1.6],
  summer: [0.85, 0.8, 0.9, 0.95, 1.05, 1.1, 1.3, 1.35, 1.1, 1.0, 0.95, 1.0],
};

const DAYS = [27, 24, 27, 26, 27, 26, 27, 27, 26, 27, 26, 27];

export function getStoreYear(store: string, year = 2026): StoreYear {
  const base = makeRng(hashStr(store));
  const storeScale = 0.8 + base() * 0.6; // 0.8〜1.4

  // まず売上を全カテゴリ・全月で算出（構成比の分母に使う）
  const raw: Record<string, { kyakusu: number; uriage: number; genkaritsu: number; days: number }[]> = {};
  for (const cat of CATEGORIES) {
    const p = PROFILE[cat.key];
    const rng = makeRng(hashStr(`${store}|${cat.key}|${year}`));
    const catScale = 0.85 + rng() * 0.35;
    raw[cat.key] = MONTH_LABELS.map((_, i) => {
      const days = DAYS[i];
      const season = SEASON[p.season][i];
      const noise = 0.9 + rng() * 0.2;
      const kyakusu = Math.round(p.dayCust * days * season * storeScale * catScale * noise);
      const tanka = Math.round(p.tanka * (0.95 + rng() * 0.12));
      const uriage = kyakusu * tanka;
      const genkaritsu = Math.round((p.genka + (rng() * 5 - 2)) * 10) / 10;
      return { kyakusu, uriage, genkaritsu, days };
    });
  }

  // 当月の全カテゴリ売上合計（構成比の分母）
  const monthTotals = MONTH_LABELS.map((_, i) =>
    CATEGORIES.reduce((sum, cat) => sum + raw[cat.key][i].uriage, 0)
  );

  const out: StoreYear = {};
  for (const cat of CATEGORIES) {
    out[cat.key] = raw[cat.key].map((r, i) => ({
      month: i + 1,
      kyakusu: r.kyakusu,
      uriage: r.uriage,
      genkaritsu: r.genkaritsu,
      days: r.days,
      kyakutanka: r.kyakusu ? Math.round(r.uriage / r.kyakusu) : 0,
      avgPerDay: r.days ? Math.round(r.kyakusu / r.days) : 0,
      uriageKosei: monthTotals[i] ? Math.round((r.uriage / monthTotals[i]) * 1000) / 10 : 0,
    }));
  }
  return out;
}

// 指標の表示整形
export function fmtMetric(v: number, kind: MetricDef["kind"]): string {
  if (kind === "yen") return "¥" + v.toLocaleString();
  if (kind === "pct") return v.toFixed(1) + "%";
  return v.toLocaleString();
}

// 年間の集計（合計/平均）を1カテゴリ分
export function summarizeYear(rows: CatMonth[], key: MetricKey): number {
  if (key === "kyakusu") return rows.reduce((s, r) => s + r.kyakusu, 0);
  if (key === "kyakutanka") {
    const u = rows.reduce((s, r) => s + r.uriage, 0);
    const k = rows.reduce((s, r) => s + r.kyakusu, 0);
    return k ? Math.round(u / k) : 0;
  }
  if (key === "genkaritsu") {
    // 売上加重平均原価率
    const u = rows.reduce((s, r) => s + r.uriage, 0);
    const cost = rows.reduce((s, r) => s + r.uriage * (r.genkaritsu / 100), 0);
    return u ? Math.round((cost / u) * 1000) / 10 : 0;
  }
  if (key === "avgPerDay") {
    const k = rows.reduce((s, r) => s + r.kyakusu, 0);
    const d = rows.reduce((s, r) => s + r.days, 0);
    return d ? Math.round(k / d) : 0;
  }
  // uriageKosei 年平均
  const vals = rows.map((r) => r.uriageKosei);
  return Math.round((vals.reduce((s, v) => s + v, 0) / (vals.length || 1)) * 10) / 10;
}
