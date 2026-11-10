import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { canViewModule, normalizeRole } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Access denied" };

export default async function AccessDeniedPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const user = await requireUser();
  const role = normalizeRole(user.role);
  const { from } = await searchParams;
  const canSeeSettings = canViewModule(role, "settings");

  return (
    <div className="mx-auto max-w-xl py-10">
      <Card>
        <CardContent className="space-y-5 p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <ShieldAlert className="h-6 w-6" />
          </span>
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight text-ink">This area is not part of your role</h1>
            <p className="text-[12.5px] leading-6 text-muted">
              {from ? (
                <>
                  You tried to open <code className="rounded bg-slate-100 px-1 py-0.5 text-[11.5px]">{from}</code>, which is
                  outside the permissions for the <span className="font-semibold text-slate-600">{role}</span> role.
                </>
              ) : (
                <>Your account does not have permission to open that page.</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white hover:bg-primary-strong"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
            </Link>
            {canSeeSettings ? (
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3.5 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Workspace settings
              </Link>
            ) : null}
          </div>
          <p className="text-[11px] text-slate-400">Need broader access? Ask a super administrator to update your role.</p>
        </CardContent>
      </Card>
    </div>
  );
}
