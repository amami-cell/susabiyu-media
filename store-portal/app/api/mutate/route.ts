import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { collections, versions } from "@/lib/mockData";

export const dynamic = "force-dynamic";

const MUTABLE = new Set(["stores", "notices", "schedule", "media", "reviews", "changes", "tasks", "alerts"]);

// POST /api/mutate { collection, id, patch }
// モックデータをその場で更新し、該当コレクションの version を更新して返す（仕様書 5-3 ⑥）。
// 注: モックはサーバープロセス内メモリ。実運用では各コレクションの永続ストアに書き込む。
export async function POST(req: Request) {
  if (cookies().get("sp_session")?.value !== "ok") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { collection?: string; id?: string; patch?: Record<string, unknown> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { collection, id, patch } = body;
  if (!collection || !id || !patch || !MUTABLE.has(collection)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const list = (collections as unknown as Record<string, { id: string }[]>)[collection];
  const item = list?.find((x) => x.id === id);
  if (!item) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  Object.assign(item, patch);
  versions[collection] = Date.now();
  return NextResponse.json({ ok: true, v: { [collection]: versions[collection] } });
}
