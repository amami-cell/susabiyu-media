import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dataSource } from "@/lib/server/datasource";
import { verifySession, SESSION_COOKIE } from "@/lib/server/auth";
import { PAGE_TO_COLLECTION } from "@/lib/server/access";

export const dynamic = "force-dynamic";

// 軽量バージョンポーリング（仕様書 5-1）。要認証。
// pageAccess=false のコレクションの version は返さない（遮断中コレクションの無駄な再取得を防ぐ）。
export async function GET() {
  if (!verifySession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // versions() は内部オブジェクトの参照を返しうるのでコピーしてから加工する
  const v: Record<string, number> = { ...(await dataSource.versions()) };
  const pa = (await dataSource.getState(["pageAccess"])).collections.pageAccess as Record<string, boolean> | undefined;
  if (pa) {
    for (const [page, col] of Object.entries(PAGE_TO_COLLECTION)) {
      if (pa[page] === false) delete v[col];
    }
  }
  return new NextResponse(JSON.stringify({ latest: Date.now(), v }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
