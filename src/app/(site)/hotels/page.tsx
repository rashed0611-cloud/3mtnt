import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Building2, CalendarDays, Hotel, MapPin, Search, Star, Users } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { PageBanner, bannerCardClass } from "@/components/public/page-banner";
import { getPublicDatabase } from "@/lib/db/public";
import { fallbackImage } from "@/lib/fallback-image";
import { listCatalogCovers, listProductImages } from "@/lib/media";
import { gradientFor, destinationInitials } from "@/lib/public";
import { pageAccentStyle, pageContent } from "@/lib/site-pages";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hotels",
  description: "Browse checked hotel partners across regional and international destinations, with clear nightly rates.",
};

const PAGE_SIZE = 9;

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    location?: string;
    stars?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    rooms?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const db = await getPublicDatabase();
  const pageSettings = db.settings.pages.hotels;
  const hero = pageContent("hotels", pageSettings);
  const covers = new Map(await listCatalogCovers("hotel"));
  for (const image of await listProductImages("hotel")) {
    if (!covers.has(image.entityId)) covers.set(image.entityId, image.url);
  }
  const term = (params.q ?? "").trim().toLowerCase();
  const locations = Array.from(new Set(db.hotels.map((hotel) => hotel.location))).sort();
  const stay =
    params.checkIn && params.checkOut
      ? {
          from: new Date(`${params.checkIn}T00:00:00`),
          to: new Date(`${params.checkOut}T00:00:00`),
          guests: Math.max(1, Number(params.adults ?? 2) || 2),
          rooms: Math.max(1, Number(params.rooms ?? 1) || 1),
        }
      : null;
  const stayLabel = stay
    ? `${stay.from.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${stay.to.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      })} · ${stay.guests} ${stay.guests === 1 ? "guest" : "guests"} · ${stay.rooms} ${stay.rooms === 1 ? "room" : "rooms"}`
    : "";

  const filtered = db.hotels
    .filter((hotel) => hotel.status === "publish")
    .filter((hotel) => {
      const haystack = [hotel.name, hotel.location, hotel.supplier, hotel.description, ...hotel.amenities].join(" ").toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (params.location && hotel.location !== params.location) return false;
      if (params.stars && String(hotel.starRating) !== params.stars) return false;
      return true;
    })
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.starRating - a.starRating);

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = filtered.length ? Math.min(...filtered.map((hotel) => hotel.price)) : 0;

  return (
    <div style={pageAccentStyle(pageSettings)}>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <PageBanner page={pageSettings} />
        <div className={bannerCardClass(pageSettings, "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8")}>
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Hotels</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700">
                <Hotel className="h-3 w-3" /> {hero.eyebrow || `${db.hotels.length} hotel partners`}
              </span>
              <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">{hero.heading}</h1>
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-slate-500">
                {hero.subtitle}
              </p>
              {stay ? (
                <p className="mt-2 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[10.5px] font-semibold text-violet-700">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {stayLabel}</span>
                  <span className="inline-flex items-center gap-1 text-slate-500"><Users className="h-3 w-3" /> Rates confirmed by the desk</span>
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Nightly rates from</p>
              <p className="text-[20px] font-bold text-ink">৳{from.toLocaleString("en-US")}</p>
            </div>
          </div>

          <form method="get" className="mt-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-[1fr_200px_160px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search hotel, area or amenity"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-3 text-[12.5px] outline-none transition focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
                aria-label="Search hotels"
              />
            </div>
            <select name="location" defaultValue={params.location ?? ""} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" aria-label="Filter by location">
              <option value="">All locations</option>
              {locations.map((location) => <option key={location} value={location}>{location}</option>)}
            </select>
            <select name="stars" defaultValue={params.stars ?? ""} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[12px] text-slate-600 outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10" aria-label="Filter by star rating">
              <option value="">Any rating</option>
              {[5, 4, 3].map((stars) => <option key={stars} value={stars}>{stars} star</option>)}
            </select>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12px] font-semibold text-white transition hover:bg-primary-strong">
              <Building2 className="h-3.5 w-3.5" /> Search
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[12px] text-slate-500">
          <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "property" : "properties"} available
        </p>

        {paged.length ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paged.map((hotel) => {
                const image = covers.get(hotel.id) || fallbackImage(hotel.location, hotel.name);
                return (
                <article key={hotel.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <Link href={`/hotels/${hotel.slug}`} className="block">
                    <div className={`relative flex h-40 items-end bg-gradient-to-br ${gradientFor(hotel.location)} p-4`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/5" />
                      <div className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-white/15 px-2 py-1 text-[9.5px] font-semibold text-white backdrop-blur">
                        {Array.from({ length: hotel.starRating }).map((_, index) => (
                          <Star key={index} className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                        ))}
                      </div>
                      <div className="relative flex w-full items-end justify-between">
                        <div>
                          <p className="text-[9.5px] uppercase tracking-[0.16em] text-white/70">Property</p>
                          <p className="text-[19px] font-bold leading-tight text-white">{hotel.name}</p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[12px] font-bold text-white backdrop-blur">
                          {destinationInitials(hotel.location)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="flex items-center gap-1 text-[10.5px] text-slate-500"><MapPin className="h-3 w-3" /> {hotel.location}</p>
                    <Link href={`/hotels/${hotel.slug}`}>
                      <h3 className="mt-1.5 text-[14px] font-semibold text-ink transition group-hover:text-primary">{hotel.name}</h3>
                    </Link>
                    <p className="mt-1 line-clamp-2 text-[11.5px] leading-5 text-slate-500">{hotel.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {hotel.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-medium text-slate-600">{amenity}</span>
                      ))}
                      {hotel.amenities.length > 3 ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-medium text-slate-500">+{hotel.amenities.length - 3}</span> : null}
                    </div>
                    <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Per night</p>
                        <p className="text-[16px] font-bold text-ink">{formatMoney(hotel.price, "BDT", 0)}</p>
                      </div>
                      <Link href={`/hotels/${hotel.slug}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/hotels" />
          </>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
            <BedDouble className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-[15px] font-semibold text-ink">No hotels match those filters</h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-slate-500">Try another location or tell us the stay you need and we&apos;ll source it.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white">
              Request a hotel <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
