import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkCredentials, signSession, userFromSession, SESSION_COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

// POST /api/login { email, password } → 資格情報を検証し署名付きセッションを発行（仕様書 5-1）
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
  const sess = checkCredentials(email, password);
  if (!sess) {
    return NextResponse.json({ ok: false, error: "メールアドレスまたはパスワードが正しくありません。" }, { status: 401 });
  }
  const token = signSession({ email: sess.email, name: sess.name, dept: sess.dept, role: sess.role });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true, user: userFromSession(sess) });
}
