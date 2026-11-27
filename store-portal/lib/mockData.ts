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
  vendors: [
    { id: "v1", name: "大阪フードサプライ", category: "食材卸", contact: "営業部 田中", tel: "06-6300-0001", stores: 9 },
    { id: "v2", name: "関西酒類販売", category: "酒類卸", contact: "西村", tel: "06-6300-0002", stores: 12 },
    { id: "v3", name: "ナニワ厨房設備", category: "厨房機器", contact: "保守課", tel: "06-6300-0003", stores: 14 },
    { id: "v4", name: "クリーンプロ関西", category: "清掃・衛生", contact: "受付", tel: "06-6300-0004", stores: 11 },
    { id: "v5", name: "ミヤコ内装", category: "内装・改装", contact: "設計 森本", tel: "075-200-0005", stores: 4 },
    { id: "v6", name: "セキュリティ大阪", category: "警備・防犯", contact: "24h受付", tel: "06-6300-0006", stores: 13 },
  ],
  equipment: [
    { id: "eq1", item: "iPad（POS）", store: "すさび湯 梅田本店", qty: 4, status: "貸与中", assignedTo: "店長 加藤" },
    { id: "eq2", item: "モバイルプリンタ", store: "すさび湯 三宮店", qty: 3, status: "貸与中", assignedTo: "店長 佐藤" },
    { id: "eq3", item: "券売機", store: "ひよこ飯店", qty: 1, status: "修理", assignedTo: "—" },
    { id: "eq4", item: "制服（冬）", store: "本部倉庫", qty: 60, status: "在庫", assignedTo: "—" },
    { id: "eq5", item: "ハンディ端末", store: "ARATA", qty: 5, status: "貸与中", assignedTo: "店長 林" },
    { id: "eq6", item: "ビールサーバー", store: "たいだい", qty: 2, status: "廃棄", assignedTo: "—" },
  ],
  vehicles: [
    { id: "ve1", name: "ハイエース", plate: "大阪 800 あ 12-34", store: "本部", inspection: "2027/03", insurance: "2026/11" },
    { id: "ve2", name: "軽バン（配送）", plate: "なにわ 480 さ 56-78", store: "第一営業部", inspection: "2026/12", insurance: "2027/02" },
    { id: "ve3", name: "営業車 プリウス", plate: "京都 300 た 90-12", store: "第三営業部", inspection: "2027/06", insurance: "2027/01" },
    { id: "ve4", name: "冷蔵トラック", plate: "神戸 100 か 34-56", store: "本部", inspection: "2026/11", insurance: "2026/12" },
  ],
  credentials: [
    { id: "cr1", service: "食べログ 管理画面", store: "すさび湯 梅田本店", loginId: "umeda_honten", password: "demo-pass-0001", url: "https://owner.tabelog.com" },
    { id: "cr2", service: "Google ビジネス", store: "すさび湯 梅田本店", loginId: "susabiyu.umeda@example.com", password: "demo-pass-0002", url: "https://business.google.com" },
    { id: "cr3", service: "ぐるなび 加盟店", store: "ひよこ飯店", loginId: "hiyoko1069", password: "demo-pass-0003", url: "https://pro.gnavi.co.jp" },
    { id: "cr4", service: "Instagram", store: "梅田GOLD", loginId: "umeda_gold_official", password: "demo-pass-0004", url: "https://instagram.com" },
  ],
  minutes: [
    { id: "mi1", date: "10/24", title: "第三営業部 定例会議", attendees: "森・天野 ほか 4名", summary: "烏丸店の改装スケジュールと三条店の契約進捗を共有。次回までに見積3社。" },
    { id: "mi2", date: "10/17", title: "媒体運用ミーティング", attendees: "本部 情報システム ほか 3名", summary: "Google ビジネスの口コミ返信フローを統一。ぐるなび連携の再認証を依頼。" },
    { id: "mi3", date: "10/10", title: "本部 月次会議", attendees: "各営業部長・本部", summary: "9月実績レビュー。未入力項目の削減目標を 164→50 に設定。" },
  ],
  drawings: [
    { id: "d1", store: "すさび湯 烏丸店", kind: "見積", title: "客席改装 A工事", amount: 8650000, date: "10/23", status: "確認待ち" },
    { id: "d2", store: "すさび湯 烏丸店", kind: "図面", title: "1F レイアウト図 rev.3", amount: null, date: "10/22", status: "作成中" },
    { id: "d3", store: "お初天神GOLD", kind: "見積", title: "厨房排気ダクト更新", amount: 1240000, date: "10/18", status: "確定" },
    { id: "d4", store: "ARATA", kind: "図面", title: "看板デザイン提案", amount: null, date: "10/15", status: "確定" },
    { id: "d5", store: "すさび湯 三条店", kind: "見積", title: "新規内装 一式", amount: 23800000, date: "10/12", status: "確認待ち" },
  ],
  capex: [
    { id: "cx1", store: "すさび湯 烏丸店", title: "客席改装", category: "改装", amount: 8650000, applicant: "第三営業部 森", status: "一次承認" },
    { id: "cx2", store: "お初天神GOLD", title: "厨房ダクト更新", category: "設備", amount: 1240000, applicant: "特販部 中村", status: "決裁済" },
    { id: "cx3", store: "すさび湯 三条店", title: "新規出店 内装", category: "出店", amount: 23800000, applicant: "第三営業部 森", status: "申請中" },
    { id: "cx4", store: "熊の鳥焼", title: "空調更新", category: "設備", amount: 980000, applicant: "第一営業部 高橋", status: "却下" },
  ],
  properties: [
    { id: "p1", area: "大阪キタ", name: "梅田スカイフロント 2F", size: 42, rent: 1260000, unit: 30000, status: "商談中" },
    { id: "p2", area: "難波", name: "なんば南ビル 1F", size: 28, rent: 980000, unit: 35000, status: "募集中" },
    { id: "p3", area: "神戸", name: "三宮センター街 B1", size: 35, rent: 770000, unit: 22000, status: "募集中" },
    { id: "p4", area: "京都", name: "四条烏丸 角地", size: 24, rent: 840000, unit: 35000, status: "成約" },
  ],
  ms: [
    { id: "ms1", store: "すさび湯 梅田本店", kind: "MS", date: "10/20", score: "88点", staff: "外部調査" },
    { id: "ms2", store: "ARATA", kind: "試食", date: "10/19", score: "新メニュー3品 承認", staff: "本部 天野" },
    { id: "ms3", store: "ひよこ飯店", kind: "レセプト", date: "10/16", score: "指摘2件", staff: "第二営業部 林" },
    { id: "ms4", store: "熊の鳥焼", kind: "MS", date: "10/12", score: "92点", staff: "外部調査" },
  ],
  userreq: [
    { id: "u1", name: "山田 太郎", dept: "第一営業部", type: "新規登録", status: "申請中", date: "10/24" },
    { id: "u2", name: "鈴木 花子", dept: "本部", type: "権限変更", status: "承認", date: "10/22" },
    { id: "u3", name: "佐々木 健", dept: "第二営業部", type: "退職", status: "承認", date: "10/20" },
    { id: "u4", name: "田口 実", dept: "特販部", type: "新規登録", status: "却下", date: "10/18" },
  ],
  feedback: [
    { id: "f1", author: "第三営業部 森", category: "店舗一覧", text: "一覧にエリア別の集計行がほしい。", votes: 12, status: "対応中" },
    { id: "f2", author: "本部 天野", category: "媒体一覧", text: "口コミ評価の推移グラフを出したい。", votes: 9, status: "受付" },
    { id: "f3", author: "第一営業部 高橋", category: "タスク", text: "期限が近い順の既定ソートがほしい。", votes: 7, status: "完了" },
    { id: "f4", author: "特販部 中村", category: "全般", text: "ダークモードの文字コントラストを上げたい。", votes: 3, status: "見送り" },
  ],
  corp: [
    { id: "co1", name: "株式会社ネクサスグループ", rep: "代表取締役 天野", stores: 118, founded: "2008/06", fiscalMonth: "3月" },
    { id: "co2", name: "ネクサスフード合同会社", rep: "代表 西村", stores: 18, founded: "2016/04", fiscalMonth: "9月" },
    { id: "co3", name: "GOLD ダイニング株式会社", rep: "代表 中村", stores: 6, founded: "2019/11", fiscalMonth: "3月" },
  ],
  history: [
    { id: "h1", at: "10/24 18:02", target: "すさび湯 烏丸店", field: "ステータス", by: "第三営業部 森", before: "営業中", after: "改装予定" },
    { id: "h2", at: "10/23 14:30", target: "ARATA", field: "電話番号", by: "第二営業部 林", before: "06-6212-0000", after: "06-6212-1097" },
    { id: "h3", at: "10/22 09:11", target: "すさび湯 三条店", field: "ステータス", by: "第三営業部 森", before: "—", after: "契約待ち" },
    { id: "h4", at: "10/20 20:45", target: "お初天神GOLD", field: "営業時間", by: "特販部 中村", before: "17:00-23:00", after: "17:00-24:00" },
  ],
  manual: [
    { id: "man1", category: "衛生", title: "食品衛生マニュアル 2026年版", updated: "2026/09/01" },
    { id: "man2", category: "接客", title: "接客サービス基準書", updated: "2026/07/15" },
    { id: "man3", category: "システム", title: "店舗情報管理ポータル 操作ガイド", updated: "2026/10/24" },
    { id: "man4", category: "防災", title: "防火・避難マニュアル", updated: "2026/05/30" },
  ],
};

// コレクション別の最終更新時刻（仕様書 5-1 /api/state/version 相当）
export const versions: Versions = Object.fromEntries(
  Object.keys(collections).map((k) => [k, 1700000000000])
) as Versions;
