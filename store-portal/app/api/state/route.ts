import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dataSource } from "@/lib/server/datasource";
import { verifySession, SESSION_COOKIE } from "@/lib/server/auth";
import type { Collections } from "@/lib/types";

export const dynamic = "force-dynamic";

// pageAccess=false のページに対応するコレクションはサーバー側でも遮断する
// （仕様書6: メニュー非表示だけでなくデータ送信も止める）。
const PAGE_TO_COLLECTION: Record<string, string> = {
  stores: "stores", schedule: "schedule", media: "media", reviews: "reviews",
  idpw: "credentials", vendors: "vendors", equipment: "equipment", vehicles: "vehicles",
  capex: "capex", properties: "properties", minutes: "minutes", tasks: "tasks",
  alerts: "alerts", ms: "ms", change: "changes", userreq: "userreq", feedback: "feedback",
  corp: "corp", history: "history", drawings: "drawings", manual: "manual",
};

// GET /api/state            → 全コレクション一括
// GET /api/state?keys=a,b   → 指定コレクションのみ（差分取得・仕様書 5-3）
export async function GET(req: Request) {
  if (!verifySession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const keys = new URL(req.url).searchParams.get("keys");
  const { collections, v } = await dataSource.getState(keys ? keys.split(",").map((s) => s.trim()) : undefined);

  let pa = collections.pageAccess as Record<string, boolean> | undefined;
  if (!pa) {
    pa = (await dataSource.getState(["pageAccess"])).collections.pageAccess as Record<string, boolean> | undefined;
  }
  if (pa) {
    const bag = collections as Record<string, unknown>;
    for (const [page, col] of Object.entries(PAGE_TO_COLLECTION)) {
      if (pa[page] === false && col in bag) delete bag[col];
    }
  }

  return NextResponse.json({ collections: collections as Partial<Collections>, v });
}
