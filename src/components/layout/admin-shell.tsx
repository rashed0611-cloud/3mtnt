"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { Header, type HeaderNotification } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { normalizeRole } from "@/lib/access";
import type { SessionUser } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminShell({
  user,
  notifications,
  children,
}: {
  user: SessionUser;
  notifications: HeaderNotification[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = normalizeRole(user.role);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        user={user}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {mobileOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation overlay"
        />
      ) : null}

      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[78px]" : "lg:pl-[272px]")}>
        <Header
          user={user}
          notifications={notifications}
          onOpenMobile={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((value) => !value)}
        />

        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-5 sm:px-6 lg:px-8">
          {role === "guest" ? (
            <div className="mb-5 flex items-start gap-2.5 rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="font-semibold">View-only access.</span> You can browse every workspace module, but creating,
                editing and deleting records is disabled for the guest role.
              </span>
            </div>
          ) : null}
          {children}
        </main>

        <footer className="mx-auto flex w-full max-w-[1560px] flex-col items-center justify-between gap-1 px-4 pb-5 pt-2 text-[10.5px] text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} 3M Tours & Travels Ltd. · {process.env.NEXT_PUBLIC_APP_NAME || "3M Tours & Travels ERP"}
          </p>
          <p className="flex items-center gap-3">
            <span>v0.1 · Workspace</span>
            <span className="text-slate-300">|</span>
            <span>All times in Asia/Dhaka</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
