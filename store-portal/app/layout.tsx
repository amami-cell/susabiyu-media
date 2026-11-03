import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "店舗情報管理 | NEXUS GROUP",
  description: "店舗情報管理ポータル",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="ai-dark">
      <head>
        {/* フォントはランタイムに <link> で読み込む（next/font のビルド時フェッチを避け、
            ネットワーク制限のある CI/ビルド環境でも確実にビルドできるようにする）。 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
        />
        {/* 初回描画のちらつき防止（仕様書 2・8-2）: ペイント前に折りたたみ状態を復元 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('nav-collapsed')==='1')document.documentElement.setAttribute('data-nav-collapsed','');}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
