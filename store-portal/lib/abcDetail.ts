// メニュー別ABC分析のデータ層（FW ABC分析の実データ・税抜）。
// lib/abcDetailData.json は fw_detail_all.csv（FW ABC分析エクスポート・全体ABC）を基に、
// FWの部門別データ(deptname)を menu_cd で結合してカテゴリ(飲み放題/食べ放題/ランチ/
// 宴会・コース/ドリンク/アラカルト/未分類)を付与したもの（店舗別・商品単位・A/B/Cランク付き）。
import raw from "./abcDetailData.json";

export type Rank = "A" | "B" | "C";
export type CatKey = "nomi" | "tabe" | "lunch" | "course" | "drink" | "ala" | "none";

export interface AbcRow {
  menu: string;
  qty: number; // 販売数量
  sales: number; // 売上金額（税抜）
  cost: number; // 原価率 %
  kosei: number; // 売上構成比 %
  cum: number; // 累計構成比 %
  rank: Rank;
  cat: CatKey; // カテゴリ
  dept: string; // 部門名（FW部門名・店舗接頭辞除去）
}

export interface CatSummary { count: number; sales: number; cost: number }

export interface AbcStoreDetail {
  cd: string;
  total: number;
  count: number;
  abc: Record<Rank, number>;
  abcSales: Record<Rank, number>;
  cats: Record<CatKey, CatSummary>;
  rows: AbcRow[];
}

interface RawStore {
  cd: string; total: number; count: number;
  abc: Record<Rank, number>; abcSales: Record<Rank, number>;
  cats: Record<CatKey, CatSummary>;
  rows: [string, number, number, number, number, number, Rank, CatKey, string][];
}

const DATA = raw as unknown as {
  period: string;
  stores: string[];
  cats: { label: string; key: CatKey }[];
  data: Record<string, RawStore>;
};

export const ABC_PERIOD: string = DATA.period;
export const ABC_STORES: string[] = DATA.stores; // 売上降順
export const ABC_CATS: { label: string; key: CatKey }[] = DATA.cats;
export const CAT_LABEL: Record<CatKey, string> = Object.fromEntries(
  DATA.cats.map((c) => [c.key, c.label])
) as Record<CatKey, string>;

export function getStoreDetail(store: string): AbcStoreDetail | null {
  const d = DATA.data[store];
  if (!d) return null;
  return {
    cd: d.cd, total: d.total, count: d.count, abc: d.abc, abcSales: d.abcSales, cats: d.cats,
    rows: d.rows.map((r) => ({
      menu: r[0], qty: r[1], sales: r[2], cost: r[3], kosei: r[4], cum: r[5], rank: r[6], cat: r[7], dept: r[8],
    })),
  };
}

export const yen = (n: number) => "¥" + Math.round(n).toLocaleString();

// 部門未設定（FW部門名が空欄＝カテゴリ「未分類」）の店舗別アラート。
export interface BlankDeptAlert {
  store: string;
  count: number; // 未設定品目数
  total: number; // 全品目数
  sales: number; // 未設定分の売上(税抜)
  share: number; // 全体売上に占める割合(%)
  rate: number; // 品目数に占める割合(%)
}
export function getBlankDeptAlerts(): BlankDeptAlert[] {
  const out: BlankDeptAlert[] = [];
  for (const s of DATA.stores) {
    const d = DATA.data[s];
    const none = d.cats.none;
    if (none && none.count > 0) {
      out.push({
        store: s, count: none.count, total: d.count, sales: none.sales,
        share: d.total ? (none.sales / d.total) * 100 : 0,
        rate: d.count ? (none.count / d.count) * 100 : 0,
      });
    }
  }
  return out.sort((a, b) => b.count - a.count);
}
