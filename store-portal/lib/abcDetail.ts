// メニュー別ABC分析のデータ層（FW ABC分析の実データ・税抜）。
// lib/abcDetailData.json は fw_detail_all.csv（FW ABC分析エクスポート）から
// イニシエート運営23店舗分を抽出・整形したもの（店舗別・商品単位・A/B/Cランク付き）。
import raw from "./abcDetailData.json";

export type Rank = "A" | "B" | "C";

export interface AbcRow {
  menu: string;
  qty: number; // 販売数量
  sales: number; // 売上金額（税抜）
  cost: number; // 原価率 %
  kosei: number; // 売上構成比 %
  cum: number; // 累計構成比 %
  rank: Rank;
}

export interface AbcStoreDetail {
  cd: string;
  total: number; // 合計売上（税抜）
  count: number; // メニュー品目数
  abc: Record<Rank, number>; // ランク別件数
  abcSales: Record<Rank, number>; // ランク別売上
  rows: AbcRow[]; // 売上降順
}

interface RawStore {
  cd: string;
  total: number;
  count: number;
  abc: Record<Rank, number>;
  abcSales: Record<Rank, number>;
  rows: [string, number, number, number, number, number, Rank][];
}

const DATA = raw as unknown as {
  period: string;
  stores: string[];
  data: Record<string, RawStore>;
};

export const ABC_PERIOD: string = DATA.period;
export const ABC_STORES: string[] = DATA.stores; // 売上降順

export function getStoreDetail(store: string): AbcStoreDetail | null {
  const d = DATA.data[store];
  if (!d) return null;
  return {
    cd: d.cd,
    total: d.total,
    count: d.count,
    abc: d.abc,
    abcSales: d.abcSales,
    rows: d.rows.map((r) => ({
      menu: r[0], qty: r[1], sales: r[2], cost: r[3], kosei: r[4], cum: r[5], rank: r[6],
    })),
  };
}

export const yen = (n: number) => "¥" + Math.round(n).toLocaleString();
export const pct = (n: number) => n.toFixed(1) + "%";
