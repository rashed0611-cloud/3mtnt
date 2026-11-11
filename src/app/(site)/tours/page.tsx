import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Filter, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { TourCard } from "@/components/public/tour-card";
import { Pagination } from "@/components/ui/pagination";
import { getRepository } from "@/lib/db";
import { titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tour packages",
  description: "Browse original group, private and fixed-departure tour packages across Asia, the Gulf and Europe.",
};

const PAGE_SIZE = 9;

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; destination?: string; page?: string }>;
}) {
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const term = (params.q ?? "").trim().toLowerCase();
  const destinations = Array.from(new Set(db.tours.map((tour) => tour.destination))).sort();
  const types = Array.from(new Set(db.tours.map((tour) => tour.type)));

  const filtered = db.tours
    .filter((tour) => tour.status === "active")
    .filter((tour) => {
      const haystack = [tour.title, tour.destination, tour.type, tour.supplier, tour.description].join(" ").toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (params.type && tour.type !== params.type) return false;
      if (params.destination && tour.destination !== params.destination) return false;
      return true;
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = filtered.length ? Math.min(...filtered.map((tour) => tour.adultPrice)) : 0;

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Tours</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                <Compass className="h-3 w-3" /> {db.tours.length} original itineraries
              </span>
              <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">Tour packages</h1>
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-slate-500">
                Group departures, private journeys and custom routes — all priced transparently and operated by our own travel desk.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Journeys from</p>
              <p className="text-[20px] font-bold text-ink">৳{from.toLocaleString("en-US")}</p>
            </div>
          </div>

          <form method="get" className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-[1fr_190px_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search destination, tour or supplier"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-[12.5px] outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
                aria-label="Search tours"
              />
            </div>
            <select
              name="destination"
              defaultValue={params.destination ?? ""}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              aria-label="Filter by destination"
            >
              <option value="">All destinations</option>
              {destinations.map((destination) => <option key={destination} value={destination}>{destination}</option>)}
            </select>
            <select
              name="type"
              defaultValue={params.type ?? ""}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              aria-label="Filter by tour type"
            >
              <option value="">All tour types</option>
              {types.map((type) => <option key={type} value={type}>{titleCase(type)}</option>)}
            </select>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12px] font-semibold text-white transition hover:bg-primary-strong">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Apply
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-slate-500">
            <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "journey" : "journeys"} match your search
          </p>
          <div className="flex flex-wrap gap-1.5">
            {params.destination ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-[10.5px] font-medium text-primary">
                <MapPin className="h-3 w-3" /> {params.destination}
              </span>
            ) : null}
            {params.type ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-medium text-slate-600">
                <Filter className="h-3 w-3" /> {titleCase(params.type)}
              </span>
            ) : null}
          </div>
        </div>

        {paged.length ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/tours" />
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
            <Compass className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-[15px] font-semibold text-ink">No journeys match those filters</h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-slate-500">
              Try a broader search, or tell us the trip you have in mind and we&apos;ll build it from scratch.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/tours" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11.5px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary">
                Clear filters
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white">
                Plan a custom trip <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
