// 時間帯別ABC分析のデータ層。
// FW「時間帯別売上」(SalesHourly) と「時間帯別メニュー出数」(HourlyDesMenuC2) を
// 2025/01〜 月次で取得し、ランチ/ディナー/深夜の3バンドに集計したもの。
//  ランチ 10:00〜17:00 / ディナー 17:00〜23:00 / 深夜 23:00〜翌10:00
//  客数＝お通し数（お通しのある店）／お通しの無い店は時間帯別売上の客数(集客)。
//  一点単価＝売上÷出品数、一人当たり出品数＝出品数÷客数（既存ABCと同じ計算方針）。
import raw from "./timebandAbcData.json";

export type BandKey = "lunch" | "dinner" | "late";
export interface BandDef { key: BandKey; label: string; range: string }

export interface BandCell {
  qty: number; // 出品数
  sales: number; // 売上(税抜)
  kyaku: number; // 時間帯別売上の客数(集客)
  ot: number; // お通し数
}
export interface BandMetrics {
  qty: number; sales: number; cust: number; // 客数(採用値)
  custSrc: "otooshi" | "sales"; // 客数の出所
  unitPrice: number; // 一点単価 = 売上/出品数
  perCust: number; // 一人当たり出品数 = 出品数/客数
  salesShare: number; // 売上構成比(当月3バンド内)
}

interface RawStore { cd: string; otSource: boolean; months: Record<string, Record<BandKey, BandCell>>; total: Record<BandKey, BandCell> }
const DATA = raw as unknown as {
  period: string; bands: BandDef[]; stores: string[]; months: string[];
  data: Record<string, RawStore>;
};

export const TBA_PERIOD = DATA.period;
export const TBA_BANDS = DATA.bands;
export const TBA_STORES = DATA.stores;
export const TBA_MONTHS = DATA.months;

export function storeMonths(store: string): string[] {
  const d = DATA.data[store];
  return d ? Object.keys(d.months).sort() : [];
}
export function hasOtooshi(store: string): boolean {
  return !!DATA.data[store]?.otSource;
}

function toMetrics(cell: BandCell, otSource: boolean, bandSalesTotal: number): BandMetrics {
  const cust = otSource ? cell.ot : cell.kyaku;
  return {
    qty: cell.qty, sales: cell.sales, cust, custSrc: otSource ? "otooshi" : "sales",
    unitPrice: cell.qty ? Math.round(cell.sales / cell.qty) : 0,
    perCust: cust ? Math.round((cell.qty / cust) * 100) / 100 : 0,
    salesShare: bandSalesTotal ? Math.round((cell.sales / bandSalesTotal) * 1000) / 10 : 0,
  };
}

// month="all" で期間合計
export function getBands(store: string, month: string): Record<BandKey, BandMetrics> | null {
  const d = DATA.data[store];
  if (!d) return null;
  const cells = month === "all" ? d.total : d.months[month];
  if (!cells) return null;
  const tot = (["lunch", "dinner", "late"] as BandKey[]).reduce((s, b) => s + (cells[b]?.sales || 0), 0);
  const out = {} as Record<BandKey, BandMetrics>;
  for (const b of ["lunch", "dinner", "late"] as BandKey[]) out[b] = toMetrics(cells[b] || { qty: 0, sales: 0, kyaku: 0, ot: 0 }, d.otSource, tot);
  return out;
}

export const yen = (n: number) => "¥" + Math.round(n).toLocaleString();
