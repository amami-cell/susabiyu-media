import { NextResponse } from "next/server";
import { versions } from "@/lib/mockData";

export const dynamic = "force-dynamic";

// 軽量バージョンポーリング（仕様書 5-1）。数百バイト。
export async function GET() {
  return new NextResponse(JSON.stringify({ latest: Date.now(), v: versions }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
