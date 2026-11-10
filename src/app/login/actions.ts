"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  clearSession,
  createSessionToken,
  localCredentials,
  sessionCookieOptions,
  verifyLocalCredentials,
} from "@/lib/auth";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
  email?: string;
}

function safeNext(next: unknown) {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//")) return "/admin";
  return next;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter both your email address and password.", email };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, email };
    redirect(next);
  }

  if (!verifyLocalCredentials(email, password)) {
    return { error: "Those credentials do not match this workspace.", email };
  }

  const local = localCredentials();
  const token = createSessionToken({ id: "local-admin", name: local.name, email: local.email, role: "superadmin" });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions());
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
