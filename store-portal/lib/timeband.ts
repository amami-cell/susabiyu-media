// 時間帯別売上のデータ層（FW「時間帯別売上」SalesHourly・税抜）。
import raw from "./timebandData.json";

export interface HourRow {
  hour: string; // 時刻 "05".."23","00"
  kyaku: number; // 客数
  kumi: number; // 組数
  sales: number; // 売上(税抜)
  tanka: number; // 客単価(税抜)
  kosei: number; // 構成比 %
  kaiten: number; // 回転率
  ninji: number; // 人時生産性
  hanbai: number; // 販売数
}
export interface TimebandStore { cd: string; total: number; rows: HourRow[] }

const DATA = raw as unknown as {
  period: string; note: string; stores: string[];
  data: Record<string, { cd: string; total: number; rows: (string | number)[][] }>;
};

export const TB_PERIOD: string = DATA.period;
export const TB_NOTE: string = DATA.note;
export const TB_STORES: string[] = DATA.stores;

export function getTimeband(store: string): TimebandStore | null {
  const d = DATA.data[store];
  if (!d) return null;
  return {
    cd: d.cd, total: d.total,
    rows: d.rows.map((r) => ({
      hour: String(r[0]), kyaku: +r[1], kumi: +r[2], sales: +r[3], tanka: +r[4],
      kosei: +r[5], kaiten: +r[6], ninji: +r[7], hanbai: +r[8],
    })),
  };
}

export const yen = (n: number) => "¥" + Math.round(n).toLocaleString();
export const hourLabel = (h: string) => (h === "00" ? "24" : h) + "時";
