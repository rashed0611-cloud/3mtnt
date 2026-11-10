"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearSession,
  createDemoToken,
  demoCredentials,
  sessionCookieOptions,
  verifyDemoCredentials,
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

  if (!verifyDemoCredentials(email, password)) {
    return { error: "Those credentials do not match this workspace. Try the demo account below.", email };
  }

  const demo = demoCredentials();
  const token = createDemoToken({ id: "demo-admin", name: demo.name, email: demo.email, role: "Super Administrator" });
  const store = await cookies();
  store.set("3m_demo_session", token, sessionCookieOptions());
  redirect(next);
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
