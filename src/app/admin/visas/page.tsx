import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Download, FileCheck2, FileSearch, Globe2, Pencil, Plus, Timer, Wallet } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Visa list" };

const PAGE_SIZE = 12;

export default async function VisasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; country?: string; page?: string; saved?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const visas = db.visas;
  const countries = Array.from(new Set(visas.map((visa) => visa.country))).sort();
  const term = (params.q ?? "").trim().toLowerCase();

  const filtered = visas.filter((visa) => {
    const haystack = [visa.country, visa.visaType, visa.processingTime, visa.description, ...visa.requiredDocuments]
      .join(" ")
      .toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && visa.status !== params.status) return false;
    if (params.country && visa.country !== params.country) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const averageFee = visas.length ? visas.reduce((sum, visa) => sum + visa.price, 0) / visas.length : 0;
  const totalDocs = visas.reduce((sum, visa) => sum + visa.requiredDocuments.length, 0);
  const applications = db.bookings.filter((booking) => booking.serviceType === "visa");
  const serviceRevenue = applications.reduce((sum, booking) => sum + booking.total, 0);

  const stats = [
    { label: "Visa products", value: String(visas.length), hint: `${countries.length} destinations`, icon: Globe2, tone: "bg-amber-50 text-amber-600" },
    { label: "Published", value: String(visas.filter((visa) => visa.status === "active").length), hint: `${visas.filter((visa) => visa.status === "draft").length} in draft`, icon: FileCheck2, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Average fee", value: formatMoney(averageFee, "BDT", 0), hint: `${totalDocs} documents referenced`, icon: Wallet, tone: "bg-blue-50 text-blue-600" },
    { label: "Application revenue", value: formatMoney(serviceRevenue, "BDT", 0), hint: `${applications.length} files`, icon: FileSearch, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Visa list"
        description="The visa product catalogue — destination, processing time, fee and the document checklist required for each application."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Visa processing" }, { label: "Visa list" }]}
        actions={
          <>
            <a
              href="/admin/visas/export"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link
              href="/admin/visas/new"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add product
            </Link>
            <Link
              href="/admin/create-booking/standard?service=visa"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> New application
            </Link>
          </>
        }
      />

      {params.saved ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Visa product saved. The catalogue and public checklist are up to date.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, tone }) => (
          <Card key={label} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-1 truncate text-lg font-semibold tracking-tight text-ink">{value}</p>
              <p className="mt-0.5 truncate text-[10.5px] text-slate-400">{hint}</p>
            </div>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Visa catalogue</h2>
              <p className="text-[11px] text-muted">{filtered.length} visa products match your filters</p>
            </div>
            <Badge tone="amber">{totalDocs} document requirements</Badge>
          </div>
          <FilterBar
            placeholder="Search country, visa type or document…"
            filters={[
              {
                name: "status",
                label: "All statuses",
                options: [
                  { value: "active", label: "Published" },
                  { value: "draft", label: "Draft" },
                ],
              },
              { name: "country", label: "All countries", options: countries.map((country) => ({ value: country, label: country })) },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Visa type</th>
                    <th>Processing</th>
                    <th className="text-right">Service fee</th>
                    <th className="text-center">Documents</th>
                    <th className="text-center">Applications</th>
                    <th>Requirements</th>
                    <th className="text-right">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((visa) => {
                    const applicationsCount = applications.filter((booking) =>
                      `${booking.title} ${booking.notes ?? ""}`.toLowerCase().includes(visa.country.toLowerCase()),
                    ).length;
                    return (
                      <tr key={visa.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-amber-600">
                              <Globe2 className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-medium text-ink">
                                <Link href={`/admin/visas/${visa.id}/edit`} className="hover:text-primary hover:underline">
                                  {visa.country}
                                </Link>
                              </p>
                              <p className="max-w-[170px] truncate text-[10px] text-muted">{visa.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-[11.5px] text-slate-600">{visa.visaType}</td>
                        <td className="whitespace-nowrap text-[11.5px] text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Timer className="h-3 w-3 text-slate-400" /> {visa.processingTime}
                          </span>
                        </td>
                        <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(visa.price, "BDT", 0)}</td>
                        <td className="text-center">
                          <Badge tone={visa.requiredDocuments.length >= 5 ? "violet" : "blue"} className="px-1.5 py-0 text-[10px]">
                            {visa.requiredDocuments.length}
                          </Badge>
                        </td>
                        <td className="text-center text-[11.5px] font-medium text-slate-700">{applicationsCount}</td>
                        <td className="max-w-[220px] truncate text-[11px] text-slate-500">{visa.requiredDocuments.join(", ")}</td>
                        <td className="text-right">
                          <StatusBadge status={visa.status === "active" ? "publish" : "draft"} />
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/admin/visas/${visa.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-control border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                          >
                            <Pencil className="h-3 w-3" /> Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/visas" />
          </>
        ) : (
          <EmptyState
            icon={<FileSearch className="h-5 w-5" />}
            title="No visa products match those filters"
            description="Try another country or clear the search. Visa products are maintained by the visa desk."
          />
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Visa process", hint: "Live applications and stages", href: "/admin/visa-bookings", icon: FileSearch },
          { label: "Appointments", hint: "Embassy slots and interviews", href: "/admin/visa/appointments", icon: Timer },
          { label: "Embassies", hint: "Contacts, hours and requirements", href: "/admin/visa/embassies", icon: Globe2 },
        ].map(({ label, hint, href, icon: Icon }) => (
          <Link key={label} href={href} className="card-surface group flex items-center justify-between gap-3 p-4 transition hover:border-primary/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-slate-100 text-slate-500">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-ink group-hover:text-primary">{label}</p>
                <p className="text-[10.5px] text-muted">{hint}</p>
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
        <p>Need to add a new destination or visa type?</p>
        <Link href="/admin/visa/settings" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Visa settings <Plus className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
