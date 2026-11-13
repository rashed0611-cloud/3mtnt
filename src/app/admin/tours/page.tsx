import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download, Globe2, MapPin, Pencil, Plus, Star, Users } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Tours" };

const PAGE_SIZE = 10;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; destination?: string; page?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const destinations = Array.from(new Set(db.tours.map((tour) => tour.destination))).sort();

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = db.tours.filter((tour) => {
    const haystack = [tour.title, tour.destination, tour.code, tour.supplier].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && tour.status !== params.status) return false;
    if (params.type && tour.type !== params.type) return false;
    if (params.destination && tour.destination !== params.destination) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const avgPrice = db.tours.length ? db.tours.reduce((sum, tour) => sum + tour.adultPrice, 0) / db.tours.length : 0;
  const stats = [
    { label: "Tour packages", value: String(db.tours.length), icon: Globe2 },
    { label: "Published", value: String(db.tours.filter((tour) => tour.status === "active").length), icon: Star },
    { label: "Destinations", value: String(destinations.length), icon: MapPin },
    { label: "Average adult price", value: formatMoney(avgPrice, "BDT", 0), icon: Users },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tour packages"
        description="Build, publish and price multi-day experiences with itineraries, departures and supplier costing."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Tour package" }, { label: "Tours" }]}
        actions={
          <>
            <a href="/admin/tours/export" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link href="/admin/tours/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <Plus className="h-3.5 w-3.5" /> Add tour
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-center justify-between p-4">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{value}</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-blue-50 text-blue-600">
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
            <Badge tone="blue">{db.tours.filter((tour) => tour.featured).length} featured</Badge>
          </div>
          <FilterBar
            placeholder="Search tour, destination or supplier…"
            filters={[
              { name: "status", label: "All statuses", options: [{ value: "active", label: "Published" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }] },
              { name: "type", label: "All types", options: ["custom", "fixed_departure", "private", "group"].map((value) => ({ value, label: titleCase(value) })) },
              { name: "destination", label: "All destinations", options: destinations.map((destination) => ({ value: destination, label: destination })) },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[980px]">
                <thead>
                  <tr>
                    <th>Tour</th>
                    <th>Destination</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th className="text-right">Adult price</th>
                    <th className="text-right">Child price</th>
                    <th className="text-center">Capacity</th>
                    <th>Supplier</th>
                    <th>Created</th>
                    <th className="text-right">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((tour) => (
                    <tr key={tour.id}>
                      <td>
                        <Link href={`/admin/tours/${tour.id}/edit`} className="group flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                            <Globe2 className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="max-w-[220px] truncate text-[12.5px] font-medium text-ink group-hover:text-primary">{tour.title}</span>
                              {tour.featured ? <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" /> : null}
                            </span>
                            <span className="block font-mono text-[10px] text-muted">{tour.code}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-[12px]">{tour.destination}</td>
                      <td><Badge tone={tour.type === "private" ? "violet" : tour.type === "group" ? "blue" : "neutral"}>{titleCase(tour.type)}</Badge></td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">{tour.durationDays}D / {tour.durationNights}N</td>
                      <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(tour.adultPrice, "BDT", 0)}</td>
                      <td className="whitespace-nowrap text-right text-[12px] text-slate-600">{formatMoney(tour.childPrice, "BDT", 0)}</td>
                      <td className="text-center text-[12px]">{tour.capacity}</td>
                      <td className="max-w-[150px] truncate text-[11.5px] text-slate-600">{tour.supplier}</td>
                      <td className="whitespace-nowrap text-[11px] text-muted">{formatDate(tour.createdAt, { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="text-right"><StatusBadge status={tour.status} /></td>
                      <td className="text-right">
                        <Link
                          href={`/admin/tours/${tour.id}/edit`}
                          className="inline-flex items-center gap-1 rounded-control border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/tours" />
          </>
        ) : (
          <EmptyState
            icon={<Globe2 className="h-5 w-5" />}
            title="No tours match those filters"
            description="Adjust your filters or add a new tour package to the catalogue."
            action={
              <Link href="/admin/tours/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                <Plus className="h-3.5 w-3.5" /> Add tour
              </Link>
            }
          />
        )}
      </Card>

      <div className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
        <p>Need to sell a custom itinerary? Start from the booking wizard and attach a package later.</p>
        <Link href="/admin/create-booking/tour" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Tour booking wizard <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
