import { NextResponse } from "next/server";
import { dataSource } from "@/lib/server/datasource";

export const dynamic = "force-dynamic";

// 軽量バージョンポーリング（仕様書 5-1）。アクティブなデータソースの version を返す
// （mock/file/http いずれでも実際の更新を検知できるようにする）。
export async function GET() {
  const v = await dataSource.versions();
  return new NextResponse(JSON.stringify({ latest: Date.now(), v }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
