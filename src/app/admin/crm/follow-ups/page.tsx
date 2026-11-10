import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Contact } from "lucide-react";
import { LeadStatusControl } from "@/components/crm/lead-status-control";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Follow-ups" };

export default async function FollowUpsPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const leads = db.leads
    .filter((lead) => lead.nextFollowUp && !["converted", "lost"].includes(lead.status))
    .sort((a, b) => (a.nextFollowUp ?? "").localeCompare(b.nextFollowUp ?? ""));

  const overdue = leads.filter((lead) => (lead.nextFollowUp ?? "") < today);
  const upcoming = leads.filter((lead) => (lead.nextFollowUp ?? "") >= today);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Follow-ups"
        description="Keep every warm opportunity moving. Overdue follow-ups are highlighted so nothing slips."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "CRM", href: "/admin/crm" }, { label: "Follow-ups" }]}
        actions={
          <Link href="/admin/crm/leads" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            All leads
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { title: "Overdue", items: overdue, tone: "red" as const },
          { title: "Scheduled", items: upcoming, tone: "blue" as const },
        ].map((group) => (
          <Card key={group.title}>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-ink">{group.title} follow-ups</h2>
                <p className="text-[11px] text-muted">{group.items.length} leads</p>
              </div>
              <Badge tone={group.tone}>{group.items.length}</Badge>
            </div>
            {group.items.length ? (
              <div className="divide-y divide-line">
                {group.items.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-3 px-4 py-3">
                    <Avatar name={lead.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-ink">{lead.name}</p>
                      <p className="truncate text-[10.5px] text-muted">{lead.requirement}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                        <CalendarClock className="h-3 w-3" />
                        <span className={group.title === "Overdue" ? "font-medium text-danger" : ""}>{formatDate(lead.nextFollowUp)}</span>
                        <span>·</span>
                        <span>{formatMoney(lead.estimatedValue, "BDT", 0)}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <LeadStatusControl id={lead.id} status={lead.status} returnTo="/admin/crm/follow-ups" />
                      <span className="text-[9.5px] text-slate-400">{titleCase(lead.priority)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Contact className="h-5 w-5" />} title={`No ${group.title.toLowerCase()} follow-ups`} description="You are on top of the pipeline." className="py-10" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
