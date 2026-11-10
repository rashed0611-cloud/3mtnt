import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDateTime, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity logs" };

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; module?: string; severity?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const term = (params.q ?? "").trim().toLowerCase();
  const modules = Array.from(new Set(db.activities.map((activity) => activity.module))).sort();

  const filtered = db.activities.filter((activity) => {
    if (term && !`${activity.actor} ${activity.action} ${activity.description}`.toLowerCase().includes(term)) return false;
    if (params.module && activity.module !== params.module) return false;
    if (params.severity && activity.severity !== params.severity) return false;
    return true;
  });

  const counts = {
    total: db.activities.length,
    info: db.activities.filter((activity) => activity.severity === "info").length,
    warning: db.activities.filter((activity) => activity.severity === "warning").length,
    critical: db.activities.filter((activity) => activity.severity === "critical").length,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activity & audit log"
        description="Every important record change, payment, status transition and authentication event — retained for compliance."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Users & roles" }, { label: "Activity logs" }]}
        actions={
          <Link href="/admin/users" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            Team & roles
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total events", value: counts.total, icon: Activity, tone: "bg-blue-50 text-blue-600" },
          { label: "Informational", value: counts.info, icon: ShieldCheck, tone: "bg-emerald-50 text-emerald-600" },
          { label: "Warnings", value: counts.warning, icon: ShieldQuestion, tone: "bg-amber-50 text-amber-600" },
          { label: "Critical", value: counts.critical, icon: ShieldAlert, tone: "bg-red-50 text-red-600" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{value}</p>
            </div>
            <span className={`flex h-8 w-8 items-center justify-center rounded-control ${tone}`}><Icon className="h-4 w-4" /></span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Audit trail</h2>
              <p className="text-[11px] text-muted">{filtered.length} events match your filters</p>
            </div>
            <Badge tone="neutral">Read only</Badge>
          </div>
          <FilterBar
            placeholder="Search actor, action or description…"
            filters={[
              { name: "module", label: "All modules", options: modules.map((value) => ({ value, label: value })) },
              { name: "severity", label: "Any severity", options: ["info", "warning", "critical"].map((value) => ({ value, label: titleCase(value) })) },
            ]}
          />
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[860px]">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Event</th>
                  <th>Module</th>
                  <th>Details</th>
                  <th className="text-right">Severity</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((activity) => (
                  <tr key={activity.id}>
                    <td className="whitespace-nowrap text-[11px] text-slate-500">{formatDateTime(activity.createdAt)}</td>
                    <td className="whitespace-nowrap text-[11.5px] font-medium text-ink">{activity.actor}</td>
                    <td className="whitespace-nowrap text-[11.5px] text-slate-700">{titleCase(activity.action)}</td>
                    <td className="whitespace-nowrap"><Badge tone="neutral">{activity.module}</Badge></td>
                    <td className="max-w-[360px] truncate text-[11.5px] text-slate-600">{activity.description}</td>
                    <td className="text-right"><StatusBadge status={activity.severity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-14 text-center text-xs text-muted">No events match those filters.</p>
        )}
      </Card>
    </div>
  );
}
