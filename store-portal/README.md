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
- **書き込み（楽観的更新・仕様書 5-3 ⑤⑥）**: `useMutate`/`useCreate` がストアを先に書き換え→`POST /api/mutate`→
  失敗時はロールバック＋トースト。成功時はサーバーが該当コレクションの version を更新。
  タスク状態切替／変更申請・ユーザー申請の承認/差戻し／改善要望の+1／**店舗の新規追加フォーム**で実装。
- **テーブルの実ソート**: 見出しクリックで昇順/降順（数値・文字を自動判定）。店舗一覧ほか各一覧で有効。
- **新デプロイ検知（仕様書 5-4）**: 60秒ごとに `/api/build` を確認し、コミットが変わると「新しいバージョンがあります［更新］」バナーを表示。
- **アクセスログ（仕様書 6）**: ページ遷移ごとに `navigator.sendBeacon('/api/access', …)`。
- **全画面を実データ表示**: ダッシュボード/店舗一覧/スケジュール/媒体一覧/口コミ/変更申請/タスク/許可アラート/
  取引先/貸与備品/社用車/ID・PW/議事録/図面・見積/CAPEX/募集物件/MS・レセ・試食/ユーザー申請/改善要望/法人マスタ/変更履歴/マニュアル
  （販促会議・ワークフローは仕様どおり「準備中」表示）。
- **アプリ内テーマ**: ダーク/ライトサイドバー（仕様書の `ai-dark` / `ai`）をフッターで切替。

## 本番デプロイ

`.env.example` を複製して本番値を設定する。要点:

1. **認証**: `AUTH_SECRET`（必須）＋ `AUTH_USERS` か `AUTH_EMAIL`/`AUTH_PASSWORD`。
   未設定だと開発モード（任意資格情報で通過）になり、`NODE_ENV=production` では起動時に警告する。
2. **データソース**: 自己ホスト/Docker は `DATA_SOURCE=file`（`DATA_DIR` に JSON 永続）、
   サーバーレス/外部基盤は `DATA_SOURCE=http` ＋ `API_BASE`。既定は `mock`（非永続）。

### Docker（自己ホスト・永続あり）

```bash
docker build -t store-portal ./store-portal
docker run -p 3000:3000 \
  -e AUTH_SECRET=xxxxx -e AUTH_EMAIL=admin@nexus.co.jp -e AUTH_PASSWORD=xxxxx \
  -e DATA_SOURCE=file -v $PWD/data:/app/.data \
  store-portal
```

`output: "standalone"` でビルドするので、イメージは Node ランタイム＋必要ファイルのみ。
ヘルスチェックは `GET /api/health`。

### Vercel（サーバーレス）

Root Directory を `store-portal` に設定（Next.js 自動検出）。ファイル永続は使えないため
`DATA_SOURCE=http` ＋ `API_BASE`（外部データAPI）を設定する。`AUTH_SECRET` と資格情報も環境変数で設定。

### CI

`.github/workflows/store-portal-ci.yml` が `store-portal/**` の変更時に `npm ci` → `npm run build`
（型チェック・Lint 含む）を実行する。

ビルド情報（サイドバー下部表示）は `NEXT_PUBLIC_COMMIT` / `NEXT_PUBLIC_BUILT_AT` で埋め込み可能。

## セキュリティ

- セッションは httpOnly＋署名付き（HMAC-SHA256, 8時間）。本番は `secure` Cookie。
- `/api/state`・`/api/mutate` はセッション検証でゲート。
- セキュリティヘッダ（X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy）を付与。

## 本番データへの接続

データ取得/書き込みは `lib/server/datasource.ts` の `DataSource` 抽象に集約。既定は
**モック**（`lib/mockData.ts`、サーバー内メモリ＝再起動やサーバーレス複数インスタンスでは非永続）。
環境変数で外部バックエンドへ切替できる（API ルートもクライアントも変更不要）:

```bash
DATA_SOURCE=http
API_BASE=https://api.example.com   # /state・/mutate を提供するエンドポイント
```

`.env.example` を参照。実運用では `http` 実装の向き先を実データソース（DB/外部API）にするだけ。
