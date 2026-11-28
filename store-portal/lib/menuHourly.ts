// 時間帯別メニュー出数のデータ層。
// FW「時間帯別メニュー出数」(HourlyDesMenuC2 / fn630) を 1時間刻み(0-23時)で取得し、
// メニュー1品ごとの時間分布・カテゴリ(FW部門ABC結合＋名称補完)を保持したもの。
import raw from "./menuHourlyData.json";

export type CatKey = "nomi" | "tabe" | "lunch" | "course" | "drink" | "ala" | "none";

export interface MenuRow {
  name: string;
  cat: CatKey;
  hours: number[]; // 24要素 time00..time23 の出数
  total: number;
}
export interface MhStore {
  cd: string;
  nm: string;
  period: string;
  hourlyTotal: number[]; // 24 出数(品数)
  catHourly: Partial<Record<CatKey, number[]>>; // cat -> 24
  menus: MenuRow[];
  kyaku: number[];     // 24 客数(時間帯別売上の集客・日平均)
  uriage: number[];    // 24 売上(税抜)
  hanbai: number[];    // 24 総出数(SalesHourly)
  perItem: number[];   // 24 一人当たり出品数(料理品数/客数)
  perDrink: number[];  // 24 一人当たり出杯数(ドリンク/客数)
  unitPrice: number[]; // 24 一点単価(売上/総出数)
}

interface RawStore {
  cd: string; nm: string; period: string;
  hourlyTotal: number[];
  catHourly: Record<string, number[]>;
  menus: [string, CatKey, number[], number][];
  kyaku: number[]; uriage: number[]; hanbai: number[];
  perItem: number[]; perDrink: number[]; unitPrice: number[];
}
const DATA = raw as unknown as {
  period: string; note: string;
  catLab: Record<CatKey, string>;
  catOrder: CatKey[];
  stores: RawStore[];
};

export const MH_PERIOD = DATA.period;
export const MH_NOTE = DATA.note;
export const MH_CAT_LAB = DATA.catLab;
export const MH_CAT_ORDER = DATA.catOrder;

// カテゴリ色（datavizカテゴリ配色・固定順）
export const MH_CAT_COLOR: Record<CatKey, string> = {
  ala: "#257de0",     // アラカルト（主役）＝青
  drink: "#00b894",   // ドリンク＝アクア
  lunch: "#f47230",   // ランチ＝オレンジ
  course: "#8a5cf6",  // 宴会・コース＝パープル
  nomi: "#f2a600",    // 飲み放題＝イエロー
  tabe: "#ee7fac",    // 食べ放題＝マゼンタ
  none: "#9aa3b0",    // 未分類＝グレー
};

// 1時間 → バンド
export type BandKey = "lunch" | "dinner" | "late";
export const MH_BANDS: { key: BandKey; label: string; range: string; hours: number[] }[] = [
  { key: "lunch", label: "ランチ", range: "10-17時", hours: [10, 11, 12, 13, 14, 15, 16] },
  { key: "dinner", label: "ディナー", range: "17-23時", hours: [17, 18, 19, 20, 21, 22] },
  { key: "late", label: "深夜", range: "23-10時", hours: [23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
];
export function bandOfHour(h: number): BandKey {
  if (h >= 10 && h <= 16) return "lunch";
  if (h >= 17 && h <= 22) return "dinner";
  return "late";
}
// 営業日順（10時始まり）で並べた時間配列
export const HOUR_ORDER: number[] = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const MH_STORES: { cd: string; nm: string }[] = DATA.stores.map((s) => ({ cd: s.cd, nm: s.nm }));

export function getStore(cd: string): MhStore | null {
  const s = DATA.stores.find((x) => x.cd === cd);
  if (!s) return null;
  return {
    cd: s.cd, nm: s.nm, period: s.period,
    hourlyTotal: s.hourlyTotal,
    catHourly: s.catHourly as Partial<Record<CatKey, number[]>>,
    menus: s.menus.map(([name, cat, hours, total]) => ({ name, cat, hours, total })),
    kyaku: s.kyaku, uriage: s.uriage, hanbai: s.hanbai,
    perItem: s.perItem, perDrink: s.perDrink, unitPrice: s.unitPrice,
  };
}

// 時間別指標の定義
export type MetricKey = "qty" | "perItem" | "perDrink" | "unitPrice" | "kyaku";
export const MH_METRICS: { key: MetricKey; label: string; unit: string; stacked: boolean }[] = [
  { key: "qty", label: "出数(品数)", unit: "点", stacked: true },
  { key: "perItem", label: "一人当たり出品数", unit: "点/人", stacked: false },
  { key: "perDrink", label: "一人当たり出杯数", unit: "杯/人", stacked: false },
  { key: "unitPrice", label: "一点単価", unit: "円", stacked: false },
  { key: "kyaku", label: "客数", unit: "人", stacked: false },
];
export function metricAt(s: MhStore, m: MetricKey, h: number): number {
  switch (m) {
    case "qty": return s.hourlyTotal[h] || 0;
    case "perItem": return s.perItem[h] || 0;
    case "perDrink": return s.perDrink[h] || 0;
    case "unitPrice": return s.unitPrice[h] || 0;
    case "kyaku": return s.kyaku[h] || 0;
  }
}

export function peakHour(hours: number[]): number {
  let bi = 0, bv = -1;
  for (let h = 0; h < 24; h++) if (hours[h] > bv) { bv = hours[h]; bi = h; }
  return bi;
}
export function bandTotals(hours: number[]): Record<BandKey, number> {
  const t: Record<BandKey, number> = { lunch: 0, dinner: 0, late: 0 };
  for (let h = 0; h < 24; h++) t[bandOfHour(h)] += hours[h] || 0;
  return t;
}
