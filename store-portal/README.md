# 店舗情報管理ポータル（store-portal）

NEXUS GROUP「店舗情報管理」ポータルの UI/UX を仕様書どおりに再現した実アプリ。
**Next.js (App Router) + Tailwind CSS + Zustand** 構成。`susabiyu-media` 内の独立アプリ
（既存の静的サイトとは分離。単体で `npm` ビルド／Vercel デプロイする）。

## セットアップ

```bash
cd store-portal
npm install
npm run dev     # http://localhost:3000
```

本番ビルド:

```bash
npm run build
npm run start
```

## 構成

```
store-portal/
├─ app/
│  ├─ layout.tsx            # フォント(Inter + Noto Sans JP)・テーマ・ちらつき防止スクリプト
│  ├─ page.tsx              # クライアントシェル（ハッシュルーティング／折りたたみ／ドロワー）
│  ├─ globals.css           # 仕様書の実測値（色/px/200msモーション）
│  └─ api/
│     ├─ state/route.ts         # GET /api/state（全量 or ?keys=... 差分）
│     ├─ state/version/route.ts # GET /api/state/version（軽量ポーリング）
│     └─ build/route.ts         # GET /api/build（最終更新/コミット）
├─ components/
│  ├─ Sidebar.tsx           # 左サイドバー（アクティブ金バー・バッジ・G連携・畳む）
│  ├─ Drawer.tsx            # 右スライドドロワー（slide-in/Esc/スクロールロック）
│  ├─ Icon.tsx             # lucide-react アイコン（17px / stroke 1.7）
│  └─ pages/               # Dashboard / Stores / Placeholder
└─ lib/
   ├─ store.ts             # Zustand（collections / versions / merge / snapshot）
   ├─ useSync.ts           # 同期（IndexedDBキャッシュ即描画＋30秒version＋差分取得）
   ├─ idb.ts               # 最小 IndexedDB ラッパー
   ├─ nav.ts               # ナビ定義（仕様書 2-2 の並び）
   ├─ types.ts / mockData.ts
```

## 再現した要素（仕様書準拠）

- **サイドバー**: ブランド帯・ユーザー行・全ナビ（セクション見出し／件数バッジ／G連携／外部↗／準備中）、
  アクティブ時のゴールド左バー 3px、hover/active 配色（実測値）、独立スクロールの細いダークバー。
- **畳む/開く**: 240px⇄56px を 200ms `cubic-bezier(.4,0,.2,1)` でサイドバーと本文同時スライド。
  `localStorage["nav-collapsed"]` 永続化＋ペイント前の復元でちらつき防止。畳んでも金バー残存、ラベルは `title`。
- **本文**: あいさつバナー、KPI、クイックスタート（hover 2px 浮上）、お知らせ/最新情報、
  店舗一覧（検索・チップフィルタ・集計バー・固定ヘッダーのテーブル・行の営業部カラーライン・ステータスピル・⚠）。
- **ドロワー**: 行クリックで 200ms スライドイン、未入力警告ボックス、ラベル|値の定義リスト、
  Esc キー＆背景クリックで閉じる、背面スクロールロック（仕様書の改善推奨を反映）。
- **モバイル(<768px)**: 上部スティッキーバー＋☰、オフキャンバスのサイドバー。
- **データ同期（仕様書 5-3 改良版）**: 起動時に IndexedDB キャッシュを即描画→全量取得、
  30秒ごと＋タブ復帰/フォーカスで `/api/state/version` を確認し、差分コレクションだけ `?keys=` で部分取得。
  非表示タブではポーリング停止。
- **書き込み（楽観的更新・仕様書 5-3 ⑤⑥）**: `useMutate` がストアを先に書き換え→`POST /api/mutate`→
  失敗時はロールバック＋トースト。成功時はサーバーが該当コレクションの version を更新。
  タスクの状態切替（未着手→進行中→完了）、変更申請の承認/差戻しで実装。
- **アプリ内テーマ**: ダーク/ライトサイドバー（仕様書の `ai-dark` / `ai`）をフッターで切替。

## デプロイ（Vercel）

```bash
# リポジトリを Vercel に import し、Root Directory を store-portal に設定
# Framework Preset: Next.js（自動検出）
```

ビルド時にコミットハッシュ/日時を埋め込む場合は環境変数:
`NEXT_PUBLIC_COMMIT` / `NEXT_PUBLIC_BUILT_AT`（`app/api/build/route.ts` が参照）。

## 本番データへの接続

`app/api/state/*`・`app/api/mutate` は現在モックデータ（`lib/mockData.ts`）を読み書きする。
書き込みはサーバープロセス内メモリのため、再起動やサーバーレスの複数インスタンスでは永続しない。
実運用では各 route を実データソース（DB／外部API）に差し替える。
クライアント側（`useSync` / `useMutate` / Zustand）は変更不要。
