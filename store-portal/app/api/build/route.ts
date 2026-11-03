import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// サイドバー下部の「最終更新 / v ハッシュ」表示＆新デプロイ検知（仕様書 5-4）
export async function GET() {
  return NextResponse.json({
    build: process.env.NEXT_PUBLIC_BUILD ?? "local",
    commit: process.env.NEXT_PUBLIC_COMMIT ?? "3ad5c9b",
    message: "store-portal",
    builtAt: process.env.NEXT_PUBLIC_BUILT_AT ?? "10/24 19:45",
  });
}
