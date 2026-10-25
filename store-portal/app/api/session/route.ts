import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { collections } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
  const authed = cookies().get("sp_session")?.value === "ok";
  return NextResponse.json({ authed, user: authed ? collections.user : null });
}
