import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  canViewModule,
  canWriteModule,
  normalizeRole,
  type ModuleKey,
} from "@/lib/access";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "3m_session";
const SESSION_DAYS = 7;

function secret() {
  return process.env.AUTH_SECRET || "3m-tours-local-development-secret-change-me";
}

export function localCredentials() {
  return {
    email: process.env.LOCAL_ADMIN_EMAIL || "superadmin@3mtnt.com",
    password: process.env.LOCAL_ADMIN_PASSWORD || "Welcome@3M2026",
    name: process.env.LOCAL_ADMIN_NAME || "Super Administrator",
  };
}

function base64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function sign(body: string) {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createSessionToken(user: SessionUser) {
  const payload = {
    ...user,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
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
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: normalizeRole(payload.role),
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  // Prefer the signed, http-only workspace cookie. It is verified locally, so a
  // flaky network or an unavailable Supabase auth endpoint never signs a user
  // out mid-session. Supabase remains the source of truth at sign-in time.
  const store = await cookies();
  const cached = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (cached) return cached;

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
        role: normalizeRole(user.user_metadata?.role ?? user.app_metadata?.role),
      };
    } catch {
      return null;
    }
  }
  return null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Server-side permission gate for pages and server actions. `mode: "write"`
 * rejects roles that cannot modify the module; `"view"` only checks visibility.
 */
export async function requireModuleAccess(
  module: ModuleKey | ModuleKey[],
  mode: "view" | "write" = "view",
): Promise<SessionUser> {
  const user = await requireUser();
  const role = normalizeRole(user.role);
  const modules = Array.isArray(module) ? module : [module];
  const allowed =
    mode === "write"
      ? modules.some((item) => canWriteModule(role, item))
      : modules.some((item) => canViewModule(role, item));

  if (!allowed) redirect("/admin/denied");
  return user;
}

export function verifyLocalCredentials(email: string, password: string) {
  const local = localCredentials();
  return email.trim().toLowerCase() === local.email.toLowerCase() && password === local.password;
}

export async function clearSession() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut().catch(() => undefined);
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
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
