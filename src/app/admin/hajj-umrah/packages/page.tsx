import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Download, Landmark, Moon, Plane, Plus, Users, Wallet } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Hajj & Umrah packages" };

const PAGE_SIZE = 10;

const kindTone = {
  hajj: "green",
  umrah: "blue",
  ramadan_umrah: "violet",
} as const;

const kindIcon = {
  hajj: Landmark,
  umrah: Plane,
  ramadan_umrah: Moon,
} as const;

export default async function HajjPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string; status?: string; page?: string; saved?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const packages = db.hajjPackages;
  const today = new Date().toISOString().slice(0, 10);
  const term = (params.q ?? "").trim().toLowerCase();

  const filtered = packages.filter((pkg) => {
    const haystack = [pkg.title, pkg.tier, pkg.kind].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.kind && pkg.kind !== params.kind) return false;
    if (params.status && pkg.status !== params.status) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pilgrims = packages.reduce((sum, pkg) => sum + pkg.booked, 0);
  const capacity = packages.reduce((sum, pkg) => sum + pkg.capacity, 0);
  const utilisation = percent(pilgrims, capacity);
  const upcoming = packages.filter((pkg) => pkg.departureDate >= today);
  const depositValue = packages.reduce((sum, pkg) => sum + pkg.booked * pkg.price, 0);

  const stats = [
    { label: "Packages", value: String(packages.length), hint: `${packages.filter((pkg) => pkg.status === "active").length} active`, icon: Landmark, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Seats sold", value: String(pilgrims), hint: `${capacity} total capacity`, icon: Users, tone: "bg-violet-50 text-violet-600" },
    { label: "Occupancy", value: `${utilisation}%`, hint: `${capacity - pilgrims} seats remaining`, icon: Plane, tone: "bg-blue-50 text-blue-600" },
    { label: "Package value", value: formatMoney(depositValue, "BDT", 0), hint: `${upcoming.length} upcoming departures`, icon: Wallet, tone: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hajj & Umrah packages"
        description="Departure inventory for pilgrim journeys — tiers, capacity, occupancy and pricing across Hajj and Umrah seasons."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hajj & Umrah" }, { label: "Packages" }]}
        actions={
          <>
            <a
              href="/admin/hajj-umrah/packages/export"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link
              href="/admin/hajj-umrah/packages/new"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add package
            </Link>
            <Link
              href="/admin/create-booking/standard?service=hajj"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> New pilgrim booking
            </Link>
          </>
        }
      />

      {params.saved ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Package saved. Departure inventory and the public pilgrimage page are up to date.
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
              <h2 className="text-sm font-semibold text-ink">Package catalogue</h2>
              <p className="text-[11px] text-muted">{filtered.length} packages match your filters</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">{packages.filter((pkg) => pkg.kind === "hajj").length} Hajj</Badge>
              <Badge tone="blue">{packages.filter((pkg) => pkg.kind === "umrah").length} Umrah</Badge>
              <Badge tone="violet">{packages.filter((pkg) => pkg.kind === "ramadan_umrah").length} Ramadan</Badge>
            </div>
          </div>
          <FilterBar
            placeholder="Search package or tier…"
            filters={[
              {
                name: "kind",
                label: "All types",
                options: [
                  { value: "hajj", label: "Hajj" },
                  { value: "umrah", label: "Umrah" },
                  { value: "ramadan_umrah", label: "Ramadan Umrah" },
                ],
              },
              {
                name: "status",
                label: "All statuses",
                options: [
                  { value: "active", label: "Active" },
                  { value: "draft", label: "Draft" },
                ],
              },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Type</th>
                    <th>Departure</th>
                    <th>Return</th>
                    <th className="text-right">Price / pilgrim</th>
                    <th className="w-[180px]">Occupancy</th>
                    <th className="text-right">Package value</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((pkg) => {
                    const used = percent(pkg.booked, pkg.capacity);
                    const Icon = kindIcon[pkg.kind];
                    return (
                      <tr key={pkg.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600">
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-[12.5px] font-medium text-ink">
                                <Link href={`/admin/hajj-umrah/packages/${pkg.id}/edit`} className="hover:text-primary hover:underline">
                                  {pkg.title}
                                </Link>
                              </p>
                              <p className="text-[10px] text-muted">{pkg.tier} tier</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge tone={kindTone[pkg.kind]}>{pkg.kind === "ramadan_umrah" ? "Ramadan Umrah" : titleCase(pkg.kind)}</Badge>
                        </td>
                        <td className="whitespace-nowrap text-[11.5px] text-slate-600">{formatDate(pkg.departureDate)}</td>
                        <td className="whitespace-nowrap text-[11.5px] text-slate-600">{formatDate(pkg.returnDate)}</td>
                        <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(pkg.price, "BDT", 0)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={used >= 90 ? "h-full rounded-full bg-red-500" : used >= 60 ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-500"}
                                style={{ width: `${Math.min(100, used)}%` }}
                              />
                            </div>
                            <span className="text-[10.5px] text-slate-500">
                              {pkg.booked}/{pkg.capacity} · {used}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(pkg.booked * pkg.price, "BDT", 0)}</td>
                        <td className="text-right">
                          <StatusBadge status={pkg.status === "active" ? "active" : "draft"} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/hajj-umrah/packages" />
          </>
        ) : (
          <EmptyState
            icon={<Landmark className="h-5 w-5" />}
            title="No packages match those filters"
            description="Try another type or clear the search. Package inventory is managed by the Hajj and Umrah desk."
          />
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pilgrims", hint: "Pilgrim profiles and contacts", href: "/admin/hajj-umrah/pilgrims", icon: Users },
          { label: "Groups & departures", hint: "Group leaders and manifests", href: "/admin/hajj-umrah/groups", icon: Plane },
          { label: "Bookings", hint: "Deposits, balances and status", href: "/admin/hajj-umrah/bookings", icon: Wallet },
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
        <p>Need a new season, tier or group allocation?</p>
        <Link href="/admin/hajj-umrah/settings" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Hajj settings <Plus className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
