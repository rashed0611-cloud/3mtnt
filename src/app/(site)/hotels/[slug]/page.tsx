import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BedDouble, Check, MapPin, Phone, ShieldCheck, Star, Users, Utensils } from "lucide-react";
import { getPublicDatabase } from "@/lib/db/public";
import { fallbackImage } from "@/lib/fallback-image";
import { PhotoStrip } from "@/components/public/photo-strip";
import { listCatalogCovers, listImagesForProduct } from "@/lib/media";
import { gradientFor, destinationInitials } from "@/lib/public";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getPublicDatabase();
  const hotel = db.hotels.find((item) => item.slug === slug || item.id === slug);
  if (!hotel) return { title: "Hotel not found" };
  return { title: hotel.name, description: hotel.description.slice(0, 160) };
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getPublicDatabase();
  const hotel = db.hotels.find((item) => item.slug === slug || item.id === slug);
  if (!hotel) notFound();
  const coverUrl = (await listCatalogCovers("hotel")).get(hotel.id);
  const heroImage = coverUrl || fallbackImage(hotel.location, hotel.name);
  const relatedPhotos = await listImagesForProduct("hotel", hotel.id);

  const related = db.hotels.filter((item) => item.id !== hotel.id && item.status === "publish" && item.location === hotel.location).slice(0, 3);
  const interest = encodeURIComponent(`${hotel.name}, ${hotel.location}`);

  return (
    <>
      <section className={`relative overflow-hidden bg-gradient-to-br ${gradientFor(hotel.location)}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-14">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/hotels" className="hover:text-white">Hotels</Link>
            <span>/</span>
            <span className="text-white/90">{hotel.location}</span>
          </nav>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: hotel.starRating }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                ))}
              </div>
              <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">{hotel.name}</h1>
              <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-white/85"><MapPin className="h-3.5 w-3.5" /> {hotel.location}</p>
            </div>
            <span className="hidden h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-[18px] font-bold backdrop-blur sm:flex">
              {destinationInitials(hotel.location)}
            </span>
          </div>
        </div>
      </section>

      <PhotoStrip images={relatedPhotos.map((image) => image.url)} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-7">
            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">About the property</h2>
              <p className="mt-2 text-[12.5px] leading-7 text-slate-600">{hotel.description}</p>
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">Amenities & features</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[11.5px] font-medium text-slate-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: BedDouble, label: "Room inventory", value: `${hotel.rooms} rooms` },
                { icon: Users, label: "Occupancy", value: "Up to 3 guests" },
                { icon: Utensils, label: "Meal plan", value: "Breakfast included" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <p className="mt-2 text-[9.5px] uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-[12px] font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">Good to know</h2>
              <ul className="mt-2 space-y-1.5 text-[11.5px] leading-6 text-slate-600">
                <li>Check-in from 2:00 pm · check-out by 12:00 noon. Early check-in on request.</li>
                <li>Rates are per room per night and include breakfast unless stated otherwise.</li>
                <li>Airport transfers and extra services can be added by your travel specialist.</li>
                <li>Supplier: <span className="font-medium text-ink">{hotel.supplier}</span>.</li>
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Nightly rate from</p>
              <p className="text-[26px] font-bold leading-tight text-ink">{formatMoney(hotel.price, "BDT", 0)}</p>
              <p className="mt-0.5 text-[10.5px] text-slate-500">Per room · breakfast included</p>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11.5px]">
                <div className="flex justify-between"><dt className="text-slate-500">Star rating</dt><dd className="font-medium text-ink">{hotel.starRating} star</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Rooms</dt><dd className="font-medium text-ink">{hotel.rooms}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className="font-medium text-emerald-600">Available</dd></div>
              </dl>
              <div className="mt-4 space-y-2">
                <Link href={`/contact?interest=${interest}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-primary-strong">
                  Request this stay <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a href="tel:+8801700000000" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> Ask about rooms
                </a>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Availability is confirmed by our team before payment. No online charge.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-slate-200 bg-page">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-[21px] font-bold tracking-tight text-ink">More stays in {hotel.location}</h2>
              <Link href={`/hotels?location=${encodeURIComponent(hotel.location)}`} className="text-[11.5px] font-semibold text-primary hover:underline">See all</Link>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/hotels/${item.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradientFor(item.location)} text-[10px] font-bold text-white`}>
                      {destinationInitials(item.location)}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">{item.starRating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                  </div>
                  <p className="mt-2 text-[12.5px] font-semibold text-ink group-hover:text-primary">{item.name}</p>
                  <p className="text-[10.5px] text-slate-500">{formatMoney(item.price, "BDT", 0)} / night</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
