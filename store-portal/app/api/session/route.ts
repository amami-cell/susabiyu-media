import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, userFromSession, SESSION_COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const sess = verifySession(cookies().get(SESSION_COOKIE)?.value);
  return NextResponse.json({ authed: !!sess, user: sess ? userFromSession(sess) : null });
}
