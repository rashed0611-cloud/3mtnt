import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  href,
  trend,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "blue" | "green" | "amber" | "red" | "violet" | "slate";
  href?: string;
  trend?: string;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-600",
    slate: "bg-slate-100 text-slate-600",
  } as const;

  const content = (
    <div className="card-surface flex h-full flex-col justify-between gap-3 p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-tight text-ink">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-control", tones[tone])}>
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {trend ? <p className="text-[11px] font-medium text-emerald-600">{trend}</p> : null}
    </div>
  );

  if (href) return <a href={href}>{content}</a>;
  return content;
}
