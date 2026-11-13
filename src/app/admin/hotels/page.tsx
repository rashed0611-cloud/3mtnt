import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Building2, Download, MapPin, Pencil, Plus, Star } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Hotels" };

const PAGE_SIZE = 12;

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; location?: string; page?: string; saved?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const hotels = db.hotels;
  const locations = Array.from(new Set(hotels.map((hotel) => hotel.location))).sort();
  const term = (params.q ?? "").trim().toLowerCase();

  const filtered = hotels.filter((hotel) => {
    const haystack = [hotel.name, hotel.location, hotel.supplier, ...hotel.amenities].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && hotel.status !== params.status) return false;
    if (params.location && hotel.location !== params.location) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const averageRate = hotels.length ? hotels.reduce((sum, hotel) => sum + hotel.price, 0) / hotels.length : 0;
  const rooms = hotels.reduce((sum, hotel) => sum + hotel.rooms, 0);
  const bookingCount = (name: string) => db.bookings.filter((booking) => booking.serviceType === "hotel" && booking.title === name).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hotels"
        description="The hotel inventory behind the booking desk — properties, room rates, amenities and supplier terms."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hotel" }, { label: "Hotels" }]}
        actions={
          <>
            <a href="/admin/hotels/export" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link href="/admin/hotels/new" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Plus className="h-3.5 w-3.5" /> Add hotel
            </Link>
            <Link href="/admin/hotel" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Building2 className="h-3.5 w-3.5" /> Hotel dashboard
            </Link>
            <Link href="/admin/hotel-bookings" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <Plus className="h-3.5 w-3.5" /> New hotel booking
            </Link>
          </>
        }
      />

      {params.saved ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Hotel saved. The catalogue and public site are up to date.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Properties", value: String(hotels.length), hint: `${locations.length} locations` },
          { label: "Published", value: String(hotels.filter((hotel) => hotel.status === "publish").length), hint: "Live in the catalogue" },
          { label: "Room inventory", value: String(rooms), hint: "Across all properties" },
          { label: "Average nightly rate", value: formatMoney(averageRate, "BDT", 0), hint: "Per room, per night" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{stat.value}</p>
            <p className="mt-0.5 text-[10.5px] text-slate-400">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Hotel catalogue</h2>
              <p className="text-[11px] text-muted">{filtered.length} properties match your filters</p>
            </div>
            <Badge tone="violet">{hotels.filter((hotel) => hotel.featured).length} featured</Badge>
          </div>
          <FilterBar
            placeholder="Search hotel, location, amenity or supplier…"
            filters={[
              {
                name: "status",
                label: "All statuses",
                options: [
                  { value: "publish", label: "Published" },
                  { value: "draft", label: "Draft" },
                  { value: "archived", label: "Archived" },
                ],
              },
              { name: "location", label: "All locations", options: locations.map((location) => ({ value: location, label: location })) },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[920px]">
                <thead>
                  <tr>
                    <th>Hotel</th>
                    <th>Location</th>
                    <th className="text-center">Stars</th>
                    <th className="text-right">Rate / night</th>
                    <th className="text-center">Rooms</th>
                    <th className="text-center">Bookings</th>
                    <th>Amenities</th>
                    <th>Supplier</th>
                    <th className="text-right">Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((hotel) => (
                    <tr key={hotel.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-violet-500/15 to-violet-500/5 text-violet-600">
                            <BedDouble className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="max-w-[210px] truncate text-[12.5px] font-medium text-ink">
                              <Link href={`/admin/hotels/${hotel.id}/edit`} className="hover:text-primary hover:underline">
                                {hotel.name}
                              </Link>
                            </p>
                            <p className="text-[10px] text-muted">{hotel.featured ? "Featured property" : "Standard listing"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {hotel.location}</span>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-0.5 text-[11.5px] font-medium text-amber-600">
                          {hotel.starRating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(hotel.price, "BDT", 0)}</td>
                      <td className="text-center text-[11.5px] text-slate-600">{hotel.rooms}</td>
                      <td className="text-center text-[11.5px] font-medium text-slate-700">{bookingCount(hotel.name)}</td>
                      <td className="max-w-[170px] truncate text-[11px] text-slate-500">{hotel.amenities.join(", ")}</td>
                      <td className="max-w-[150px] truncate text-[11.5px] text-slate-600">{hotel.supplier}</td>
                      <td className="text-right"><StatusBadge status={hotel.status} /></td>
                        <td className="text-right">
                          <Link
                            href={`/admin/hotels/${hotel.id}/edit`}
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
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/hotels" />
          </>
        ) : (
          <EmptyState
            icon={<BedDouble className="h-5 w-5" />}
            title="No hotels match those filters"
            description="Try another location or clear the search. Hotel inventory is managed by the operations team."
          />
        )}
      </Card>

      <div className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
        <p>Looking for arrival sheets and departures?</p>
        <Link href="/admin/hotel/front-desk" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Open front desk <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
