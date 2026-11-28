// 販促ROI（値引・サービス券）のデータ層。
// FW「値割引明細」(SearchNewaribiki) と「サービス券明細」(SearchServiceTicket) を
// 2025/01〜 月次で取得。値引・割引・クーポンの利用枚数と金額（＝販促原資）を可視化。
import raw from "./promoData.json";

export type PromoType = "neb" | "srv";
export interface PromoLine { name: string; count: number; amount: number }
export interface PromoAgg { lines: PromoLine[]; count: number; amount: number }

interface RawStore { cd: string; neb: Record<string, [string, number, number][]>; srv: Record<string, [string, number, number][]> }
const DATA = raw as unknown as {
  period: string; stores: string[]; months: string[];
  data: Record<string, RawStore>;
};

export const PROMO_PERIOD = DATA.period;
export const PROMO_STORES = DATA.stores;
export const PROMO_MONTHS = DATA.months;

export function storeMonths(store: string): string[] {
  const d = DATA.data[store];
  if (!d) return [];
  const s = new Set<string>([...Object.keys(d.neb), ...Object.keys(d.srv)]);
  return [...s].sort();
}

function aggFrom(rows: [string, number, number][] | undefined): PromoAgg {
  const map = new Map<string, PromoLine>();
  for (const [name, count, amount] of rows || []) {
    const e = map.get(name) ?? { name, count: 0, amount: 0 };
    e.count += count; e.amount += amount; map.set(name, e);
  }
  const lines = [...map.values()].sort((a, b) => b.amount - a.amount);
  return { lines, count: lines.reduce((s, l) => s + l.count, 0), amount: lines.reduce((s, l) => s + l.amount, 0) };
}

// month="all" で期間合算
export function getAgg(store: string, month: string, type: PromoType): PromoAgg {
  const d = DATA.data[store];
  if (!d) return { lines: [], count: 0, amount: 0 };
  const src = type === "neb" ? d.neb : d.srv;
  if (month === "all") {
    const all: [string, number, number][] = [];
    for (const mk of Object.keys(src)) all.push(...src[mk]);
    return aggFrom(all);
  }
  return aggFrom(src[month]);
}

// 月次推移（値引＋券の合計金額）
export function monthlyTotals(store: string): { m: string; neb: number; srv: number }[] {
  const d = DATA.data[store];
  if (!d) return [];
  const months = storeMonths(store);
  return months.map((m) => ({
    m,
    neb: (d.neb[m] || []).reduce((s, r) => s + r[2], 0),
    srv: (d.srv[m] || []).reduce((s, r) => s + r[2], 0),
  }));
}

// 全店ランキング（期間合算の値引＋券金額）
export function storeRanking(): { store: string; neb: number; srv: number; total: number }[] {
  return PROMO_STORES.map((store) => {
    const neb = getAgg(store, "all", "neb").amount;
    const srv = getAgg(store, "all", "srv").amount;
    return { store, neb, srv, total: neb + srv };
  }).sort((a, b) => b.total - a.total);
}

export const yen = (n: number) => "¥" + Math.round(n).toLocaleString();
