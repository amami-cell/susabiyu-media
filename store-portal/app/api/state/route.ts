import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dataSource } from "@/lib/server/datasource";
import { verifySession, SESSION_COOKIE } from "@/lib/server/auth";
import { PAGE_TO_COLLECTION } from "@/lib/server/access";
import type { Collections } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/state            → 全コレクション一括
// GET /api/state?keys=a,b   → 指定コレクションのみ（差分取得・仕様書 5-3）
export async function GET(req: Request) {
  if (!verifySession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const keys = new URL(req.url).searchParams.get("keys");
  const wantKeys = keys ? keys.split(",").map((s) => s.trim()) : undefined;

  // pageAccess は権限判定に必須なので、部分取得でも一緒に取得（追加の往復を避ける）
  const fetchKeys = wantKeys ? Array.from(new Set([...wantKeys, "pageAccess"])) : undefined;
  const got = await dataSource.getState(fetchKeys);
  // データソースは全件取得時に内部オブジェクトの参照を返すため、必ずコピーしてから加工する
  const bag: Record<string, unknown> = { ...(got.collections as Record<string, unknown>) };
  const v: Record<string, number> = { ...got.v };

  const pa = bag.pageAccess as Record<string, boolean> | undefined;
  if (pa) {
    for (const [page, col] of Object.entries(PAGE_TO_COLLECTION)) {
      if (pa[page] === false) {
        delete bag[col];
        delete v[col]; // version も落として、解放後に再同期されるようにする
      }
    }
  }
  // クライアントが pageAccess を要求していなければ出力から除く
  if (wantKeys && !wantKeys.includes("pageAccess")) {
    delete bag.pageAccess;
    delete v.pageAccess;
  }

  return NextResponse.json({ collections: bag as Partial<Collections>, v });
}
