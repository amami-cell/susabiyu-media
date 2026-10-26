import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ヘルスチェック（ロードバランサ/監視用）
export async function GET() {
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
