import type { Collections, Versions } from "./types";

// サーバー側のモックデータ。実アプリでは DB/外部APIに差し替える。
// 店舗名は susabiyu-media グループの実店舗をデモとして使用。
export const DEPT_COLOR: Record<string, string> = {
  第一営業部: "#6d28d9",
  第二営業部: "#1d4ed8",
  第三営業部: "#15803d",
  特販部: "#b45309",
};

// ページ権限（仕様書 6: pageAccess でメニュー表示/非表示を制御）。
// 本部ロールは全画面可視。別ロールはここを false にすると自動で非表示になる。
const PAGE_ACCESS: Record<string, boolean> = {
  dashboard: true, schedule: true, stores: true, media: true, reviews: true, idpw: true,
  vendors: true, equipment: true, vehicles: true, drawings: true, capex: true, properties: true,
  promo: true, minutes: true, tasks: true, alerts: true, ms: true, change: true,
  workflow: true, userreq: true, feedback: true, manual: true, corp: true, history: true, instagram: true,
};

export const collections: Collections = {
  user: { name: "天野 修吾", dept: "本部", initial: "天", role: "本部" },
  pageAccess: PAGE_ACCESS,
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
  schedule: [
    { id: "e1", date: "10/27", time: "10:00", title: "覆面調査（MS）", store: "すさび湯 梅田本店", kind: "MS" },
    { id: "e2", date: "10/27", time: "15:00", title: "新メニュー試食会", store: "ARATA", kind: "試食" },
    { id: "e3", date: "10/28", time: "11:00", title: "エリア定例会議", store: "第三営業部", kind: "会議" },
    { id: "e4", date: "10/29", time: "09:30", title: "消防設備点検", store: "すさび湯 三宮店", kind: "点検" },
    { id: "e5", date: "10/30", time: "14:00", title: "改装キックオフ", store: "すさび湯 烏丸店", kind: "会議" },
    { id: "e6", date: "10/31", time: "18:00", title: "レセプション", store: "お初天神GOLD", kind: "その他" },
  ],
  media: [
    { id: "m1", store: "すさび湯 梅田本店", source: "食べログ", rating: 3.6, reviews: 412, synced: true },
    { id: "m2", store: "すさび湯 梅田本店", source: "Google", rating: 4.3, reviews: 980, synced: true },
    { id: "m3", store: "ARATA", source: "食べログ", rating: 3.5, reviews: 268, synced: true },
    { id: "m4", store: "ひよこ飯店", source: "ぐるなび", rating: 3.4, reviews: 131, synced: false },
    { id: "m5", store: "熊の鳥焼", source: "Google", rating: 4.5, reviews: 642, synced: true },
    { id: "m6", store: "梅田GOLD", source: "Instagram", rating: 0, reviews: 5400, synced: true },
  ],
  reviews: [
    { id: "r1", store: "熊の鳥焼", source: "Google", rating: 5, date: "10/24", author: "K. Tanaka", text: "薪焼きの鶏が絶品。接客も丁寧で満足でした。" },
    { id: "r2", store: "すさび湯 梅田本店", source: "食べログ", rating: 4, date: "10/23", author: "ゲスト", text: "忘年会で利用。コスパ良い。個室が静かで良かった。" },
    { id: "r3", store: "ARATA", source: "食べログ", rating: 2, date: "10/22", author: "匿名", text: "提供が遅かった。味は良いので改善に期待。" },
    { id: "r4", store: "ひよこ飯店", source: "ぐるなび", rating: 4, date: "10/21", author: "M. Sato", text: "北京ダックのコースが豪華。また来たい。" },
    { id: "r5", store: "梅田GOLD", source: "Google", rating: 5, date: "10/20", author: "Y. Ito", text: "記念日に利用。雰囲気が最高でした。" },
  ],
  changes: [
    { id: "c1", store: "ARATA", field: "電話番号", to: "06-6212-1097", applicant: "第二営業部 林", status: "申請中", date: "10/23" },
    { id: "c2", store: "すさび湯 三条店", field: "ステータス", to: "契約待ち", applicant: "第三営業部 森", status: "承認", date: "10/22" },
    { id: "c3", store: "お初天神GOLD", field: "営業時間", to: "17:00-24:00", applicant: "特販部 中村", status: "差戻し", date: "10/20" },
    { id: "c4", store: "すさび湯 烏丸店", field: "改装予定", to: "2026/11 着工", applicant: "第三営業部 森", status: "申請中", date: "10/19" },
  ],
  tasks: [
    { id: "t1", title: "三条店の賃貸契約書アップロード", assignee: "第三営業部 森", due: "10/28", status: "進行中", priority: "高" },
    { id: "t2", title: "烏丸店 改装見積の取得（3社）", assignee: "本部 天野", due: "10/31", status: "未着手", priority: "高" },
    { id: "t3", title: "媒体一覧 Google 連携の再認証", assignee: "本部 情報システム", due: "11/05", status: "未着手", priority: "中" },
    { id: "t4", title: "10月分 MS レポート集計", assignee: "本部 天野", due: "11/02", status: "進行中", priority: "中" },
    { id: "t5", title: "社用車 任意保険の更新確認", assignee: "総務", due: "10/25", status: "完了", priority: "低" },
  ],
  alerts: [
    { id: "a1", store: "すさび湯 三条店", kind: "営業許可証 未登録", due: "期限 11/10", level: "critical" },
    { id: "a2", store: "すさび湯 三条店", kind: "賃貸契約書 未登録", due: "期限 11/10", level: "critical" },
    { id: "a3", store: "すさび湯 烏丸店", kind: "深夜酒類提供届 要更新", due: "期限 11/20", level: "critical" },
    { id: "a4", store: "お初天神GOLD", kind: "未入力項目 1件", due: "—", level: "warn" },
    { id: "a5", store: "すさび湯 梅田本店", kind: "防火管理者 変更届", due: "期限 12/01", level: "warn" },
    { id: "a6", store: "ARATA", kind: "食品衛生責任者 要確認", due: "期限 12/15", level: "warn" },
    { id: "a7", store: "梅田GOLD", kind: "消防点検 日程未確定", due: "—", level: "warn" },
    { id: "a8", store: "ひよこ飯店", kind: "媒体連携エラー（ぐるなび）", due: "—", level: "warn" },
  ],
};

// コレクション別の最終更新時刻（仕様書 5-1 /api/state/version 相当）
export const versions: Versions = Object.fromEntries(
  Object.keys(collections).map((k) => [k, 1700000000000])
) as Versions;
