import type { Metadata } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const noto = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-noto", display: "swap" });

export const metadata: Metadata = {
  title: "店舗情報管理 | NEXUS GROUP",
  description: "店舗情報管理ポータル",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" data-theme="ai-dark" className={`${inter.variable} ${noto.variable}`}>
      <head>
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
