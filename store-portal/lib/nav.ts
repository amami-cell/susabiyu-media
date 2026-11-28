// サイドバーのナビ定義（仕様書 2-2 の並び）
export type NavEntry =
  | { sec: string }
  | { line: true }
  | {
      k: string;
      icon: string; // lucide-react のコンポーネント名
      t: string;
      g?: boolean; // Google 連携バッジ
      cnt?: number; // 件数バッジ
      ext?: boolean; // 外部リンク ↗
      soon?: boolean; // （準備中）
      emoji?: string; // 絵文字アイコン（仕様書 2-2 外部ツール）
    };

// 販促管理用に絞り込み。目的は「ベース（店舗・媒体・実績）を調べやすくする」こと。
// エンタープライズ系モジュール（ID/PW・取引先・備品・社用車・図面見積・CAPEX・募集物件・
// ワークフロー・法人マスタ 等）は販促用途に不要なため非表示。
export const NAV: NavEntry[] = [
  { k: "dashboard", icon: "LayoutDashboard", t: "ホーム" },
  { sec: "調べる" },
  { k: "stores", icon: "Store", t: "店舗一覧" },
  { k: "media", icon: "Megaphone", t: "媒体一覧" },
  { k: "reviews", icon: "MessageSquareText", t: "口コミ" },
  { k: "abc", icon: "BarChart3", t: "ABC分析" },
  { k: "timeband", icon: "Clock", t: "時間帯別" },
  { k: "tbabc", icon: "Clock4", t: "時間帯別ABC" },
  { sec: "販促" },
  { k: "pop", icon: "Images", t: "販促物POP" },
  { k: "schedule", icon: "CalendarDays", t: "スケジュール", g: true },
  { k: "promo", icon: "Presentation", t: "販促会議", soon: true },
  { k: "minutes", icon: "FileText", t: "議事録" },
  { sec: "外部ツール" },
  { k: "instagram", icon: "Instagram", t: "インスタ投稿確認", ext: true, emoji: "📷" },
];

export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  NAV.filter((n): n is Extract<NavEntry, { k: string }> => "k" in n).map((n) => [n.k, n.t])
);
