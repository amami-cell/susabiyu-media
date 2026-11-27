import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dataSource } from "@/lib/server/datasource";
import { verifySession, SESSION_COOKIE } from "@/lib/server/auth";
import { COLLECTION_TO_PAGE } from "@/lib/server/access";

export const dynamic = "force-dynamic";

const MUTABLE = new Set([
  "stores", "notices", "schedule", "media", "reviews", "changes", "tasks", "alerts",
  "vendors", "equipment", "vehicles", "credentials", "minutes",
  "drawings", "capex", "properties", "ms", "userreq", "feedback", "corp", "history", "manual",
]);

// POST /api/mutate { action?, collection, id?, patch?, item? }  action: "update"(既定) | "create"
// データソース（既定モック／http 切替可）に委譲し、更新後の version を返す（仕様書 5-3 ⑥）。
export async function POST(req: Request) {
  if (!verifySession(cookies().get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { action?: string; collection?: string; id?: string; patch?: Record<string, unknown>; item?: { id?: string } } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const { action = "update", collection } = body;
  if (!collection || !MUTABLE.has(collection)) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  // 書き込み側にも pageAccess を強制（read 側だけでは整合しない）
  const page = COLLECTION_TO_PAGE[collection];
  if (page) {
    const pa = (await dataSource.getState(["pageAccess"])).collections.pageAccess as Record<string, boolean> | undefined;
    if (pa && pa[page] === false) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  if (action === "create") {
    if (!body.item || !body.item.id) return NextResponse.json({ error: "bad item" }, { status: 400 });
    const res = await dataSource.create(collection, body.item as { id: string });
    if (res === "dup") return NextResponse.json({ error: "duplicate id" }, { status: 409 });
    if (res === "notfound") return NextResponse.json({ error: "unknown collection" }, { status: 400 });
    return NextResponse.json({ ok: true, v: res.v });
  }

  const { id, patch } = body;
  if (!id || !patch) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const res = await dataSource.update(collection, id, patch);
  if (res === "notfound") return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, v: res.v });
}
