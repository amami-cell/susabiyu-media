import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { collections } from "@/lib/mockData";

export const dynamic = "force-dynamic";

// POST /api/login { email, password } → セッション確立（仕様書 5-1）
// デモ: 空でなければ認証成功。実運用では認証基盤に接続する。
export async function POST(req: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }
  const email = (body.email ?? "").trim();
  const password = (body.password ?? "").trim();
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "メールアドレスとパスワードを入力してください。" }, { status: 400 });
  }
  cookies().set("sp_session", "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true, user: collections.user });
}
