import { NextResponse, type NextRequest } from "next/server";
import {
  canViewModule,
  canWritePath,
  moduleForPath,
  normalizeRole,
  type AppRole,
} from "@/lib/access";

const SESSION_COOKIE = "3m_session";

function decodeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function supabaseRole(request: NextRequest): AppRole | null {
  const parts = request.cookies
    .getAll()
    .filter((cookie) => /^sb-.+-auth-token(\.\d+)?$/.test(cookie.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (!parts.length) return null;

  try {
    let raw = parts.map((part) => part.value).join("");
    if (raw.startsWith("base64-")) raw = raw.slice("base64-".length);
    const session = JSON.parse(decodeBase64(raw)) as { access_token?: string };
    if (!session.access_token) return null;
    const payload = JSON.parse(decodeBase64(session.access_token.split(".")[1])) as {
      user_metadata?: { role?: string };
      app_metadata?: { role?: string };
    };
    return normalizeRole(payload.user_metadata?.role ?? payload.app_metadata?.role);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const hasSupabaseSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
  const localSession = request.cookies.get(SESSION_COOKIE)?.value;

  if (!hasSupabaseSession && !localSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(url);
  }

  // Local development sign-in always maps to the super administrator.
  if (!hasSupabaseSession) return NextResponse.next();

  const role = supabaseRole(request) ?? "guest";

  if (pathname === "/admin/denied") return NextResponse.next();

  if (!canViewModule(role, moduleForPath(pathname)) || !canWritePath(role, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/denied";
    url.search = "";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
