import type { Collections, Versions } from "./types";

// サーバー側のモックデータ。実アプリでは DB/外部APIに差し替える。
// 店舗名は susabiyu-media グループの実店舗をデモとして使用。
export const DEPT_COLOR: Record<string, string> = {
  第一営業部: "#6d28d9",
  第二営業部: "#1d4ed8",
  第三営業部: "#15803d",
  特販部: "#b45309",
};

export const collections: Collections = {
  user: { name: "天野 修吾", dept: "本部", initial: "天" },
  stores: [
    { id: "1006", name: "すさび湯 梅田本店", code: "1006", dept: "第一営業部", area: "大阪キタ", genre: "和食／鮨", status: "営業中", statusKey: "g", tel: "06-6345-1006", open: "2019/04/12", warn: 0, media: "食べログ・ぐるなび・Google ビジネス" },
    { id: "1169", name: "すさび湯 三宮店", code: "1169", dept: "第二営業部", area: "神戸", genre: "和食／鮨", status: "営業中", statusKey: "g", tel: "078-321-1169", open: "2021/07/01", warn: 0, media: "食べログ・Google ビジネス" },
    { id: "1712", name: "すさび湯 烏丸店", code: "1712", dept: "第三営業部", area: "京都", genre: "和食／鮨", status: "改装予定", statusKey: "p", tel: "075-255-1712", open: "2022/11/18", warn: 1, media: "食べログ・ぐるなび" },
    { id: "1728", name: "すさび湯 天満橋店", code: "1728", dept: "第一営業部", area: "大阪ミナミ", genre: "和食／鮨", status: "営業中", statusKey: "g", tel: "06-6943-1728", open: "2023/03/20", warn: 0 },
    { id: "1742", name: "すさび湯 三条店", code: "1742", dept: "第三営業部", area: "京都", genre: "和食／鮨", status: "契約待ち", statusKey: "a", tel: "—", open: "—", warn: 2 },
    { id: "1163", name: "梅田GOLD", code: "1163", dept: "特販部", area: "大阪キタ", genre: "ビストロ", status: "営業中", statusKey: "g", tel: "06-6360-1163", open: "2020/09/05", warn: 0 },
    { id: "1729", name: "お初天神GOLD", code: "1729", dept: "特販部", area: "大阪キタ", genre: "ビストロ", status: "営業中", statusKey: "g", tel: "06-6360-1729", open: "2023/06/14", warn: 1 },
    { id: "1097", name: "ARATA", code: "1097", dept: "第二営業部", area: "大阪ミナミ", genre: "イタリアン", status: "営業中", statusKey: "g", tel: "06-6212-1097", open: "2018/12/01", warn: 0 },
    { id: "1069", name: "ひよこ飯店", code: "1069", dept: "第二営業部", area: "大阪ミナミ", genre: "中華", status: "営業中", statusKey: "g", tel: "06-6484-1069", open: "2017/05/22", warn: 0 },
    { id: "1154", name: "熊の鳥焼", code: "1154", dept: "第一営業部", area: "大阪キタ", genre: "焼鳥", status: "営業中", statusKey: "g", tel: "06-6377-1154", open: "2021/02/10", warn: 0 },
    { id: "1162", name: "たぬきや", code: "1162", dept: "第一営業部", area: "大阪ミナミ", genre: "串カツ", status: "営業中", statusKey: "g", tel: "06-6630-1162", open: "2019/08/30", warn: 0 },
    { id: "1137", name: "たいだい", code: "1137", dept: "第三営業部", area: "京都", genre: "しゃぶしゃぶ", status: "中止", statusKey: "x", tel: "—", open: "—", warn: 0 },
    { id: "1131", name: "UMAMI 本町", code: "1131", dept: "特販部", area: "大阪ミナミ", genre: "居酒屋", status: "クローズ", statusKey: "r", tel: "—", open: "2016/04/01", warn: 0 },
  ],
  notices: [
    { id: "n1", date: "10/24", text: "媒体一覧に「食べログ」評価の自動取得を追加しました。", tag: "NEW" },
    { id: "n2", date: "10/21", text: "CAPEX申請フローの承認者設定が変更されました。", tag: "更新" },
    { id: "n3", date: "10/18", text: "貸与備品管理の棚卸し期限は 11/15 です。", tag: "期限" },
    { id: "n4", date: "10/15", text: "社用車の保険更新が完了しました。", tag: "完了" },
  ],
};

// コレクション別の最終更新時刻（仕様書 5-1 /api/state/version 相当）
export const versions: Versions = {
  user: 1700000000000,
  stores: 1700000000000,
  notices: 1700000000000,
};
