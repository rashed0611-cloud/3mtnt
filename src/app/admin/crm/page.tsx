import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarClock, Contact, Flame, Target, TrendingUp, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "CRM dashboard" };

const PIPELINE = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "converted"] as const;
const SOURCE_TONE: Record<string, string> = {
  website: "bg-blue-500",
  facebook: "bg-indigo-500",
  phone: "bg-emerald-500",
  referral: "bg-amber-500",
  walk_in: "bg-violet-500",
  agent: "bg-cyan-500",
  other: "bg-slate-400",
};

export default async function CrmDashboardPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const leads = db.leads;
  const active = leads.filter((lead) => !["converted", "lost"].includes(lead.status));
  const pipelineValue = active.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const overdueFollowUps = active.filter((lead) => lead.nextFollowUp && lead.nextFollowUp < today);
  const converted = leads.filter((lead) => lead.status === "converted");
  const lost = leads.filter((lead) => lead.status === "lost");
  const newLeads = leads.filter((lead) => lead.status === "new");

  const sources = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.source] = (acc[lead.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const upcoming = active
    .filter((lead) => lead.nextFollowUp)
    .sort((a, b) => (a.nextFollowUp ?? "").localeCompare(b.nextFollowUp ?? ""))
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <PageHeader
        title="CRM dashboard"
        description="Pipeline health, follow-up discipline and conversion — one view for the sales team."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "CRM" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link href="/admin/crm/follow-ups" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <CalendarClock className="h-3.5 w-3.5" /> Follow-ups
            </Link>
            <Link href="/admin/crm/leads/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <UserPlus className="h-3.5 w-3.5" /> New lead
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total leads" value={String(leads.length)} icon={Contact} tone="blue" href="/admin/crm/leads" />
        <StatCard label="New leads" value={String(newLeads.length)} hint="Awaiting first contact" icon={Flame} tone="violet" />
        <StatCard label="Overdue follow-ups" value={String(overdueFollowUps.length)} hint="Past scheduled date" icon={CalendarClock} tone={overdueFollowUps.length ? "red" : "green"} href="/admin/crm/follow-ups" />
        <StatCard label="Converted" value={String(converted.length)} hint={`${percent(converted.length, leads.length)}% conversion`} icon={Target} tone="green" />
        <StatCard label="Lost" value={String(lost.length)} hint="Closed without booking" icon={ArrowUpRight} tone="slate" />
        <StatCard label="Pipeline value" value={formatMoney(pipelineValue, "BDT", 0)} hint={`${active.length} active opportunities`} icon={TrendingUp} tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Lead pipeline</CardTitle>
              <CardDescription>Opportunities by stage — drag-free status updates happen on the leads list</CardDescription>
            </div>
            <Link href="/admin/crm/leads" className="text-[11px] font-semibold text-primary hover:underline">Open board</Link>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-2">
            <div className="flex min-w-[720px] gap-2">
              {PIPELINE.map((stage) => {
                const stageLeads = leads.filter((lead) => lead.status === stage);
                const value = stageLeads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
                return (
                  <div key={stage} className="w-[190px] shrink-0 rounded-card bg-slate-50 p-2">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">{titleCase(stage)}</p>
                      <span className="rounded-full bg-white px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500">{stageLeads.length}</span>
                    </div>
                    <p className="mb-2 px-1 text-[10px] text-slate-400">{formatMoney(value, "BDT", 0)}</p>
                    <div className="space-y-1.5">
                      {stageLeads.slice(0, 3).map((lead) => (
                        <Link key={lead.id} href={`/admin/crm/leads?q=${encodeURIComponent(lead.name)}`} className="block rounded-control border border-line bg-white p-2 shadow-sm transition hover:border-primary/30">
                          <p className="line-clamp-1 text-[11px] font-medium text-ink">{lead.name}</p>
                          <p className="mt-0.5 line-clamp-1 text-[9.5px] text-muted">{lead.requirement}</p>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="text-[9.5px] font-semibold text-slate-600">{formatMoney(lead.estimatedValue, "BDT", 0)}</span>
                            <Badge tone={lead.priority === "urgent" ? "red" : lead.priority === "high" ? "amber" : "neutral"} className="px-1 py-0 text-[8.5px] uppercase">{lead.priority}</Badge>
                          </div>
                        </Link>
                      ))}
                      {!stageLeads.length ? <p className="rounded-control border border-dashed border-slate-200 px-2 py-4 text-center text-[9.5px] text-slate-400">No leads</p> : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Lead sources</CardTitle>
                <CardDescription>Where enquiries originate</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-2">
              {sources.map(([source, count]) => (
                <div key={source}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="capitalize text-slate-600">{source.replace(/_/g, " ")}</span>
                    <span className="font-medium text-slate-700">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${SOURCE_TONE[source] ?? "bg-slate-400"}`} style={{ width: `${percent(count, leads.length)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Next follow-ups</CardTitle>
                <CardDescription>{overdueFollowUps.length} overdue</CardDescription>
              </div>
              <Link href="/admin/crm/follow-ups" className="text-[11px] font-semibold text-primary hover:underline">All</Link>
            </CardHeader>
            <CardContent className="divide-y divide-line pt-1">
              {upcoming.length ? (
                upcoming.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-2 py-2">
                    <Avatar name={lead.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-medium text-ink">{lead.name}</p>
                      <p className="text-[10px] text-muted">{lead.nextFollowUp ? formatDate(lead.nextFollowUp) : "—"} · {titleCase(lead.status)}</p>
                    </div>
                    <span className={`text-[10px] font-semibold ${lead.nextFollowUp && lead.nextFollowUp < today ? "text-danger" : "text-slate-400"}`}>
                      {lead.nextFollowUp && lead.nextFollowUp < today ? "Overdue" : "Scheduled"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-[11px] text-muted">No scheduled follow-ups.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent opportunities</CardTitle>
            <CardDescription>Latest leads and their estimated value</CardDescription>
          </div>
          <Link href="/admin/crm/leads" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            All leads <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <div className="table-wrap">
          <table className="data-table min-w-[820px]">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Requirement</th>
                <th>Source</th>
                <th>Assigned</th>
                <th>Follow-up</th>
                <th className="text-right">Value</th>
                <th className="text-right">Stage</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 6).map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={lead.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink">{lead.name}</p>
                        <p className="truncate text-[10px] text-muted">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[220px] truncate text-[11.5px] text-slate-600">{lead.requirement}</td>
                  <td className="text-[11.5px] capitalize text-slate-600">{lead.source.replace(/_/g, " ")}</td>
                  <td className="text-[11.5px] text-slate-600">{lead.assignedTo}</td>
                  <td className="whitespace-nowrap text-[11.5px]">{lead.nextFollowUp ? formatDate(lead.nextFollowUp) : "—"}</td>
                  <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(lead.estimatedValue, "BDT", 0)}</td>
                  <td className="text-right"><Badge tone={lead.status === "converted" ? "green" : lead.status === "lost" ? "red" : "blue"}>{titleCase(lead.status)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
