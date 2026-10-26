import crypto from "crypto";
import { collections } from "@/lib/mockData";
import type { User } from "@/lib/types";

// ── 本番グレード認証 ──
// AUTH_SECRET が設定されていれば本番モード: 署名付き(HMAC-SHA256)セッション Cookie を発行・検証し、
// 資格情報は環境変数（AUTH_USERS か AUTH_EMAIL/AUTH_PASSWORD）で検証する。
// AUTH_SECRET 未設定時は開発モード: 任意のメール/パスワードで通過（起動ログに警告）。
const SECRET = process.env.AUTH_SECRET || "";
export const DEV_AUTH = !SECRET;
const TTL_SEC = 60 * 60 * 8; // 8時間

if (DEV_AUTH && process.env.NODE_ENV === "production") {
  // 本番で未設定なら運用者に気付かせる（フェイルセーフとして動作は継続）
  console.warn("[auth] AUTH_SECRET 未設定: 開発モードで起動しています。本番では AUTH_SECRET と資格情報を設定してください。");
}

export interface SessionPayload {
  email: string;
  name: string;
  dept: string;
  role: string;
  exp: number; // epoch 秒
}

function hmac(body: string): string {
  return crypto.createHmac("sha256", SECRET || "dev-insecure").update(body).digest("base64url");
}

// 定数時間比較（@types/node の型差異を吸収）
function tse(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && crypto.timingSafeEqual(a as unknown as Uint8Array, b as unknown as Uint8Array);
}

export function signSession(p: Omit<SessionPayload, "exp">): string {
  const payload: SessionPayload = { ...p, exp: Math.floor(Date.now() / 1000) + TTL_SEC };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = hmac(body);
  if (!tse(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (!p.exp || p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}

function matchPassword(input: string, stored: string): boolean {
  // stored が 64桁hex なら sha256、それ以外は平文として比較
  if (/^[0-9a-f]{64}$/i.test(stored)) {
    const h = crypto.createHash("sha256").update(input).digest("hex");
    return tse(Buffer.from(h), Buffer.from(stored.toLowerCase()));
  }
  return tse(Buffer.from(input), Buffer.from(stored));
}

// 資格情報を検証し、成功ならセッション用のユーザー情報を返す。
export function checkCredentials(email: string, password: string): SessionPayload | null {
  const base = { name: collections.user.name, dept: collections.user.dept, role: collections.user.role };
  if (DEV_AUTH) {
    return email && password ? { email, ...base, exp: 0 } : null;
  }
  // AUTH_USERS="email:secret,email2:secret2"（secret は平文 or sha256hex）
  const users = (process.env.AUTH_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  for (const u of users) {
    const i = u.indexOf(":");
    if (i <= 0) continue;
    const e = u.slice(0, i);
    const p = u.slice(i + 1);
    if (e === email && matchPassword(password, p)) return { email, ...base, exp: 0 };
  }
  // 単一ユーザー fallback
  if (process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD) {
    if (email === process.env.AUTH_EMAIL && matchPassword(password, process.env.AUTH_PASSWORD)) {
      return { email, ...base, exp: 0 };
    }
  }
  return null;
}

export function userFromSession(p: SessionPayload): User {
  return { name: p.name, dept: p.dept, initial: p.name.slice(0, 1), role: p.role };
}

export const SESSION_COOKIE = "sp_session";
