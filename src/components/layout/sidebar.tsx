"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  X,
} from "lucide-react";
import { normalizeRole, roleLabel } from "@/lib/access";
import { navigationForRole } from "@/lib/nav-access";
import type { SessionUser } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

interface SidebarProps {
  user: SessionUser;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function pathOf(href: string) {
  return href.split("?")[0];
}

function isItemActive(pathname: string, href: string) {
  const base = pathOf(href);
  if (base === "/admin") return pathname === "/admin";
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function Sidebar({ user, collapsed, onCollapsedChange, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const sections = useMemo(() => navigationForRole(normalizeRole(user.role)), [user.role]);

  const activeGroupLabel = useMemo(() => {
    for (const section of sections) {
      for (const group of section.groups) {
        if (group.items.some((item) => isItemActive(pathname, item.href))) return group.label;
      }
    }
    return "";
  }, [pathname, sections]);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    activeGroupLabel ? { [activeGroupLabel]: true } : { Dashboard: true },
  );

  useEffect(() => {
    if (activeGroupLabel) setOpenGroups((current) => ({ ...current, [activeGroupLabel]: true }));
  }, [activeGroupLabel]);

  function toggleGroup(label: string) {
    setOpenGroups((current) => ({ ...current, [label]: !current[label] }));
  }

  const rail = collapsed;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-white transition-all duration-200",
        "lg:z-40 lg:translate-x-0",
        mobileOpen ? "translate-x-0 shadow-pop" : "-translate-x-full",
        rail ? "lg:w-[78px]" : "lg:w-[272px]",
      )}
      aria-label="Main navigation"
    >
      <div className={cn("flex h-16 shrink-0 items-center border-b border-line px-4", rail && "lg:justify-center lg:px-2")}>
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-primary to-[#075bb0] text-white shadow-sm">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <span className={cn("min-w-0 leading-tight", rail && "lg:hidden")}>
            <span className="block text-[15px] font-semibold tracking-tight text-ink">3M Tours</span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">&amp; Travels</span>
          </span>
        </Link>
        <button
          onClick={onMobileClose}
          className="ml-auto rounded-control p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className={cn("min-h-0 flex-1 overflow-y-auto px-3 py-4", rail && "lg:px-2")}>
        {sections.map((section, sectionIndex) => (
          <div key={`${section.label}-${sectionIndex}`} className={cn(sectionIndex > 0 && "mt-5", rail && "lg:mt-3")}>
            {section.label ? (
              <p className={cn("mb-2 px-2.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400", rail && "lg:hidden")}>
                {section.label}
              </p>
            ) : null}

            {rail ? (
              <div className="hidden flex-col items-center gap-1 lg:flex">
                {section.groups.map((group) => {
                  const Icon = group.icon;
                  const active = activeGroupLabel === group.label;
                  return (
                    <button
                      key={group.label}
                      title={group.label}
                      onClick={() => {
                        onCollapsedChange(false);
                        setOpenGroups((current) => ({ ...current, [group.label]: true }));
                      }}
                      className={cn(
                        "flex h-10 w-11 items-center justify-center rounded-control text-slate-500 transition hover:bg-slate-100 hover:text-ink",
                        active && "bg-primary/10 text-primary",
                      )}
                      aria-label={`Open ${group.label}`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-0.5">
                {section.groups.map((group) => {
                  const Icon = group.icon;
                  const isOpen = Boolean(openGroups[group.label]);
                  const hasActive = activeGroupLabel === group.label;
                  const single = group.items.length === 1;

                  if (single) {
                    const item = group.items[0];
                    const active = isItemActive(pathname, item.href);
                    return (
                      <Link
                        key={group.label}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-2.5 rounded-control px-2.5 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink",
                          active && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-slate-600", active && "text-primary")} />
                        <span className="truncate">{group.label}</span>
                      </Link>
                    );
                  }

                  return (
                    <div key={group.label}>
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink",
                          hasActive && !isOpen && "text-ink",
                        )}
                        aria-expanded={isOpen}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 text-slate-400", hasActive && "text-primary")} />
                        <span className="min-w-0 flex-1 truncate">{group.label}</span>
                        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition", isOpen && "rotate-180")} />
                      </button>

                      {isOpen ? (
                        <div className="mb-1 ml-[19px] mt-0.5 space-y-0.5 border-l border-line pl-2.5">
                          {group.items.map((item) => {
                            const active = isItemActive(pathname, item.href);
                            return (
                              <Link
                                key={`${group.label}-${item.href}`}
                                href={item.href}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-[6px] px-2 py-[7px] text-[12.5px] text-slate-500 transition hover:bg-slate-100 hover:text-ink",
                                  active && "bg-primary/10 font-medium text-primary hover:bg-primary/10 hover:text-primary",
                                )}
                              >
                                <span className="truncate">{item.label}</span>
                                {item.badge ? (
                                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{item.badge}</span>
                                ) : null}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={cn("shrink-0 border-t border-line p-3", rail && "lg:px-2")}>
        <div
          className={cn(
            "mb-3 rounded-card border border-line bg-gradient-to-br from-slate-50 to-white p-3",
            rail && "lg:hidden",
          )}
        >
          <div className="flex items-center gap-2">
            <LifeBuoy className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-semibold text-ink">Need a hand?</p>
          </div>
          <p className="mt-1 text-[10.5px] leading-4 text-muted">Onboarding, data imports and supplier setup.</p>
          <a
            href="mailto:support@3mtnt.com"
            className="mt-2 inline-block text-[10.5px] font-semibold text-primary hover:underline"
          >
            Contact support →
          </a>
        </div>

        <div className={cn("flex items-center gap-2.5", rail && "lg:flex-col")}>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white"
            title={user.name}
          >
            {initials(user.name)}
          </span>
          <div className={cn("min-w-0 flex-1", rail && "lg:hidden")}>
            <p className="truncate text-[12px] font-semibold text-ink">{user.name}</p>
            <p className="truncate text-[10.5px] text-muted">{roleLabel(user.role)}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-control p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>

        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn(
            "mt-3 hidden w-full items-center gap-2 rounded-control px-2 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 hover:text-ink lg:flex",
            rail && "lg:justify-center",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          <span className={cn(rail && "lg:hidden")}>Collapse menu</span>
        </button>
      </div>
    </aside>
  );
}
