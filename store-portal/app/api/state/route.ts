import { NextResponse } from "next/server";
import { collections, versions } from "@/lib/mockData";
import type { Collections, CollectionKey } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/state            → 全コレクション一括
// GET /api/state?keys=a,b   → 指定コレクションのみ（差分取得・仕様書 5-3）
export async function GET(req: Request) {
  const keys = new URL(req.url).searchParams.get("keys");
  if (!keys) {
    return NextResponse.json({ collections, v: versions });
  }
  const wanted = keys.split(",").map((s) => s.trim()) as CollectionKey[];
  const partial: Partial<Collections> = {};
  const pv: Record<string, number> = {};
  for (const k of wanted) {
    if (k in collections) {
      // @ts-expect-error index access across union
      partial[k] = collections[k];
      pv[k] = versions[k];
    }
  }
  return NextResponse.json({ collections: partial, v: pv });
}
