import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/types";

export const DEMO_COOKIE = "3m_demo_session";
const SESSION_DAYS = 7;

function secret() {
  return process.env.AUTH_SECRET || "3m-tours-local-development-secret-change-me";
}

export function demoCredentials() {
  return {
    email: process.env.DEMO_ADMIN_EMAIL || "admin@3mtours.com",
    password: process.env.DEMO_ADMIN_PASSWORD || "demo1234",
    name: process.env.DEMO_ADMIN_NAME || "Demo Administrator",
  };
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(body: string) {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createDemoToken(user: SessionUser) {
  const payload = {
    ...user,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifyDemoToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser & { exp: number };
    if (!payload.exp || payload.exp < Date.now()) return null;
    return { id: payload.id, name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        name: (user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "Administrator",
        email: user.email ?? "",
        role: (user.user_metadata?.role as string | undefined) || "Administrator",
      };
    } catch {
      return null;
    }
  }
  const store = await cookies();
  return verifyDemoToken(store.get(DEMO_COOKIE)?.value);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export function verifyDemoCredentials(email: string, password: string) {
  const demo = demoCredentials();
  return email.trim().toLowerCase() === demo.email.toLowerCase() && password === demo.password;
}

export async function clearSession() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut().catch(() => undefined);
  }
  const store = await cookies();
  store.delete(DEMO_COOKIE);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}
