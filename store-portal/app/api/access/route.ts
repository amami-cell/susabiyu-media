import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST /api/access — ページ遷移ごとのアクセスログ（仕様書 6, navigator.sendBeacon の受け口）。
// 本番では監査ログに記録する。ここでは 204 を返すだけ。
export async function POST() {
  return new NextResponse(null, { status: 204 });
}
