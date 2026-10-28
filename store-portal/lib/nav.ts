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
    };

export const NAV: NavEntry[] = [
  { k: "dashboard", icon: "LayoutDashboard", t: "ダッシュボード" },
  { k: "schedule", icon: "CalendarDays", t: "スケジュール", g: true },
  { k: "stores", icon: "Store", t: "店舗一覧" },
  { k: "media", icon: "Megaphone", t: "媒体一覧" },
  { k: "reviews", icon: "MessageSquareText", t: "口コミ" },
  { k: "idpw", icon: "KeyRound", t: "ID・PW" },
  { k: "vendors", icon: "Briefcase", t: "取引先" },
  { k: "equipment", icon: "Package", t: "貸与備品管理" },
  { k: "vehicles", icon: "Car", t: "社用車" },
  { k: "drawings", icon: "Ruler", t: "図面・見積" },
  { k: "capex", icon: "Landmark", t: "CAPEX" },
  { k: "properties", icon: "Building2", t: "募集物件・賃料相場" },
  { sec: "マーケティング" },
  { k: "promo", icon: "Presentation", t: "販促会議", soon: true },
  { k: "minutes", icon: "FileText", t: "議事録" },
  { sec: "タスク" },
  { k: "tasks", icon: "ListChecks", t: "タスク" },
  { k: "alerts", icon: "Bell", t: "許可・アラート", cnt: 8 },
  { k: "ms", icon: "ClipboardCheck", t: "MS・レセ・試食" },
  { k: "change", icon: "FilePenLine", t: "変更申請" },
  { k: "workflow", icon: "Workflow", t: "ワークフロー", soon: true },
  { k: "userreq", icon: "UserPlus", t: "ユーザー申請" },
  { k: "feedback", icon: "Lightbulb", t: "サイト改善要望" },
  { line: true },
  { k: "manual", icon: "BookOpen", t: "マニュアル" },
  { sec: "マスタ" },
  { k: "corp", icon: "Database", t: "法人マスタ" },
  { k: "history", icon: "History", t: "情報変更履歴" },
  { sec: "外部ツール" },
  { k: "instagram", icon: "Instagram", t: "インスタ投稿確認", ext: true },
];

export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  NAV.filter((n): n is Extract<NavEntry, { k: string }> => "k" in n).map((n) => [n.k, n.t])
);
