import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dataSource } from "@/lib/server/datasource";
import { verifySession, SESSION_COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

// GET /api/state            → 全コレクション一括
// GET /api/state?keys=a,b   → 指定コレクションのみ（差分取得・仕様書 5-3）
export async function GET(req: Request) {
  if (!verifySession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const keys = new URL(req.url).searchParams.get("keys");
  const { collections, v } = await dataSource.getState(keys ? keys.split(",").map((s) => s.trim()) : undefined);
  return NextResponse.json({ collections, v });
}
