"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarPlus,
  ChevronDown,
  CircleUserRound,
  Command,
  KeyRound,
  LogOut,
  Menu,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { canViewModule, canWriteModule, normalizeRole, roleLabel } from "@/lib/access";
import { navigationForRole } from "@/lib/nav-access";
import type { SessionUser } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

export interface HeaderNotification {
  title: string;
  description: string;
  at: string;
  severity: "info" | "warning" | "critical";
}

interface HeaderProps {
  user: SessionUser;
  notifications: HeaderNotification[];
  onOpenMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

interface SearchEntry {
  label: string;
  href: string;
  group: string;
}

function buildSearchIndex(role: SessionUser["role"]): SearchEntry[] {
  return navigationForRole(normalizeRole(role)).flatMap((section) =>
    section.groups.flatMap((group) =>
      group.items.map((item) => ({
        label: item.label,
        href: item.href,
        group: group.label === item.label ? (section.label || "Workspace") : group.label,
      })),
    ),
  );
}

export function Header({ user, notifications, onOpenMobile, collapsed, onToggleCollapsed }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [panel, setPanel] = useState<"none" | "notifications" | "user">("none");
  const role = normalizeRole(user.role);
  const searchIndex = useMemo(() => buildSearchIndex(user.role), [user.role]);
  const canBook = canWriteModule(role, "bookings");
  const canAdminister = canViewModule(role, "settings");

  useEffect(() => {
    setPanel("none");
    setSearchOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setPanel("none");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return searchIndex
      .filter((entry) => entry.label.toLowerCase().includes(term) || entry.group.toLowerCase().includes(term))
      .slice(0, 7);
  }, [query, searchIndex]);

  const unread = notifications.filter((item) => item.severity !== "info").length || 3;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenMobile}
          className="rounded-control p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={onToggleCollapsed}
          className="hidden rounded-control p-2 text-slate-500 hover:bg-slate-100 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeftOpen className={cn("h-[18px] w-[18px] transition", collapsed ? "" : "rotate-180")} />
        </button>

        <div className="relative ml-0 w-full max-w-md sm:ml-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const target = results[0]?.href ?? (query.trim() ? `/admin/search?q=${encodeURIComponent(query.trim())}` : "/admin");
                router.push(target);
                setSearchOpen(false);
              }
            }}
            placeholder="Search bookings, customers, modules…"
            className="h-9 w-full rounded-control border border-line bg-slate-50/80 pl-9 pr-16 text-[13px] text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
            aria-label="Global search"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
            <Command className="h-2.5 w-2.5" /> K
          </span>

          {searchOpen && (query.trim() || results.length > 0) ? (
            <>
              <button className="fixed inset-0 z-10 cursor-default" aria-label="Close search" onClick={() => setSearchOpen(false)} />
              <div className="absolute left-0 right-0 top-11 z-20 overflow-hidden rounded-card border border-line bg-white p-1.5 shadow-pop">
                {results.length > 0 ? (
                  results.map((entry) => (
                    <Link
                      key={`${entry.href}-${entry.label}`}
                      href={entry.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-control px-2.5 py-2 text-[13px] text-slate-700 hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        {entry.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">{entry.group}</span>
                    </Link>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      router.push(`/admin/search?q=${encodeURIComponent(query.trim())}`);
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-control px-2.5 py-2.5 text-left text-[13px] text-slate-600 hover:bg-slate-50"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                    Search everything for <span className="font-semibold text-ink">“{query.trim()}”</span>
                  </button>
                )}
                <div className="mt-1 flex items-center justify-between border-t border-line px-2.5 py-1.5 text-[10px] text-slate-400">
                  <span>Navigate with ↑↓ · Enter to open</span>
                  <span>Esc to close</span>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          {canBook ? (
            <Link
              href="/admin/create-booking"
              className="hidden items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong sm:inline-flex"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> New booking
            </Link>
          ) : null}

          <div className="relative">
            <button
              onClick={() => setPanel(panel === "notifications" ? "none" : "notifications")}
              className="relative rounded-control p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute right-1.5 top-1.5 flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
              </span>
            </button>

            {panel === "notifications" ? (
              <>
                <button className="fixed inset-0 z-10 cursor-default" aria-label="Close notifications" onClick={() => setPanel("none")} />
                <div className="absolute right-0 top-11 z-20 w-[320px] overflow-hidden rounded-card border border-line bg-white shadow-pop">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-sm font-semibold text-ink">Notifications</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{unread} new</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length ? (
                      notifications.map((item, index) => (
                        <div key={`${item.title}-${index}`} className="flex gap-2.5 border-b border-line/70 px-4 py-3 last:border-0 hover:bg-slate-50/70">
                          <span
                            className={cn(
                              "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                              item.severity === "critical" ? "bg-danger" : item.severity === "warning" ? "bg-amber-500" : "bg-primary",
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-[12px] font-medium text-ink">{item.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted">{item.description}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{item.at}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-8 text-center text-xs text-muted">You are all caught up.</p>
                    )}
                  </div>
                  <Link href="/admin/notifications" className="block border-t border-line px-4 py-2.5 text-center text-[11px] font-semibold text-primary hover:bg-slate-50">
                    View all notifications
                  </Link>
                </div>
              </>
            ) : null}
          </div>

          <button
            onClick={() => setPanel(panel === "user" ? "none" : "user")}
            className="ml-0.5 flex items-center gap-2 rounded-control p-1 pr-1 hover:bg-slate-100 sm:pr-2"
            aria-label="User menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-[11px] font-semibold text-white">
              {initials(user.name)}
            </span>
            <span className="hidden text-left lg:block">
              <span className="block max-w-[130px] truncate text-[12px] font-semibold leading-tight text-ink">{user.name}</span>
              <span className="block text-[10px] leading-tight text-muted">{roleLabel(user.role)}</span>
            </span>
            <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 lg:block" />
          </button>

          {panel === "user" ? (
            <>
              <button className="fixed inset-0 z-10 cursor-default" aria-label="Close user menu" onClick={() => setPanel("none")} />
              <div className="absolute right-3 top-14 z-20 w-[248px] overflow-hidden rounded-card border border-line bg-white p-1.5 shadow-pop sm:right-6 lg:right-8">
                <div className="border-b border-line px-2.5 py-2.5">
                  <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
                  <p className="truncate text-[11px] text-muted">{user.email}</p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-2.5 w-2.5" /> {roleLabel(user.role)}
                  </span>
                </div>
                <Link href="/admin/account" className="mt-1 flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50">
                  <KeyRound className="h-3.5 w-3.5" /> Change password
                </Link>
                {canAdminister ? (
                  <>
                    <Link href="/admin/settings" className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50">
                      <Settings className="h-3.5 w-3.5" /> Workspace settings
                    </Link>
                    <Link href="/admin/activity-logs" className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50">
                      <ShieldCheck className="h-3.5 w-3.5" /> Activity & audit
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-2 rounded-control px-2.5 py-2 text-[12.5px] text-slate-600 hover:bg-slate-50">
                      <CircleUserRound className="h-3.5 w-3.5" /> Team & roles
                    </Link>
                  </>
                ) : null}
                <form action={logoutAction} className="mt-1 border-t border-line pt-1">
                  <button type="submit" className="flex w-full items-center gap-2 rounded-control px-2.5 py-2 text-left text-[12.5px] text-danger hover:bg-red-50">
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
