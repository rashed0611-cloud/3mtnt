import type { Metadata } from "next";
import Link from "next/link";
import { Contact, Download, UserPlus } from "lucide-react";
import { LeadStatusControl } from "@/components/crm/lead-status-control";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; source?: string; assigned?: string; priority?: string; created?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const staff = Array.from(new Set(db.leads.map((lead) => lead.assignedTo))).sort();

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = db.leads.filter((lead) => {
    const haystack = [lead.name, lead.company, lead.phone, lead.email, lead.requirement].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && lead.status !== params.status) return false;
    if (params.source && lead.source !== params.source) return false;
    if (params.assigned && lead.assignedTo !== params.assigned) return false;
    if (params.priority && lead.priority !== params.priority) return false;
    return true;
  });

  const pipelineValue = filtered.filter((lead) => !["converted", "lost"].includes(lead.status)).reduce((sum, lead) => sum + lead.estimatedValue, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leads"
        description="Every enquiry, its owner and the next step. Update a stage inline without leaving the list."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "CRM", href: "/admin/crm" }, { label: "Leads" }]}
        actions={
          <>
            <a href="/admin/crm/leads/export" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link href="/admin/crm/follow-ups" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              Follow-ups
            </Link>
            <Link href="/admin/crm/leads/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <UserPlus className="h-3.5 w-3.5" /> New lead
            </Link>
          </>
        }
      />

      {params.created ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Lead “{params.created}” added to the pipeline.
        </div>
      ) : null}

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Pipeline</h2>
              <p className="text-[11px] text-muted">{filtered.length} leads · {formatMoney(pipelineValue, "BDT", 0)} active value</p>
            </div>
            <div className="flex gap-2">
              <Badge tone="blue">{db.leads.filter((lead) => lead.status === "new").length} new</Badge>
              <Badge tone="amber">{db.leads.filter((lead) => lead.nextFollowUp && lead.nextFollowUp < today && !["converted", "lost"].includes(lead.status)).length} overdue</Badge>
            </div>
          </div>
          <FilterBar
            placeholder="Search lead, company or requirement…"
            filters={[
              { name: "status", label: "All stages", options: ["new", "contacted", "qualified", "proposal_sent", "negotiation", "converted", "lost"].map((value) => ({ value, label: titleCase(value) })) },
              { name: "source", label: "All sources", options: ["website", "facebook", "phone", "referral", "walk_in", "agent", "other"].map((value) => ({ value, label: value.replace(/_/g, " ") })) },
              { name: "assigned", label: "All staff", options: staff.map((value) => ({ value, label: value })) },
              { name: "priority", label: "Any priority", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: titleCase(value) })) },
            ]}
          />
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[1080px]">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Contact</th>
                  <th>Requirement</th>
                  <th>Source</th>
                  <th>Assigned</th>
                  <th>Follow-up</th>
                  <th className="text-right">Value</th>
                  <th>Priority</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar name={lead.name} size="sm" />
                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate text-[12px] font-medium text-ink">{lead.name}</p>
                          <p className="max-w-[180px] truncate text-[10px] text-muted">{lead.company ?? lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-[11.5px] text-slate-600">{lead.phone}</td>
                    <td className="max-w-[230px] truncate text-[11.5px] text-slate-600">{lead.requirement}</td>
                    <td className="text-[11.5px] capitalize text-slate-600">{lead.source.replace(/_/g, " ")}</td>
                    <td className="whitespace-nowrap text-[11.5px] text-slate-600">{lead.assignedTo}</td>
                    <td className="whitespace-nowrap text-[11.5px]">
                      {lead.nextFollowUp ? (
                        <span className={lead.nextFollowUp < today && !["converted", "lost"].includes(lead.status) ? "font-medium text-danger" : ""}>
                          {formatDate(lead.nextFollowUp)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(lead.estimatedValue, "BDT", 0)}</td>
                    <td>
                      <Badge tone={lead.priority === "urgent" ? "red" : lead.priority === "high" ? "amber" : lead.priority === "low" ? "neutral" : "blue"}>
                        {titleCase(lead.priority)}
                      </Badge>
                    </td>
                    <td><LeadStatusControl id={lead.id} status={lead.status} returnTo={`/admin/crm/leads`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Contact className="h-5 w-5" />}
            title="No leads match those filters"
            description="Adjust the filters or create a new lead to start a conversation."
            action={
              <Link href="/admin/crm/leads/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                <UserPlus className="h-3.5 w-3.5" /> New lead
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
