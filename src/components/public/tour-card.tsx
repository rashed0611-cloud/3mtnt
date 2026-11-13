import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, Star, Users } from "lucide-react";
import type { Tour } from "@/lib/types";
import { fallbackImage } from "@/lib/fallback-image";
import { gradientFor, destinationInitials } from "@/lib/public";
import { formatMoney, titleCase } from "@/lib/utils";

export function TourCard({ tour, coverUrl }: { tour: Tour; coverUrl?: string }) {
  const image = coverUrl || fallbackImage(tour.destination, tour.title);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className={`relative flex h-40 items-end bg-gradient-to-br ${gradientFor(tour.destination)} p-4`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/5" />
          <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {titleCase(tour.type)}
          </span>
          <div className="relative flex w-full items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">Destination</p>
              <p className="text-[20px] font-bold leading-tight text-white">{tour.destination}</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-[13px] font-bold text-white backdrop-blur">
              {destinationInitials(tour.destination)}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {tour.durationDays} days</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {tour.capacity} seats</span>
          <span className="ml-auto inline-flex items-center gap-0.5 font-semibold text-amber-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {tour.featured ? "4.9" : "4.7"}
          </span>
        </div>
        <Link href={`/tours/${tour.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-[14px] font-semibold leading-snug text-ink transition group-hover:text-primary">{tour.title}</h3>
        </Link>
        <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-5 text-slate-500">{tour.description}</p>
        <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-[9.5px] uppercase tracking-wide text-slate-400">From / adult</p>
            <p className="text-[16px] font-bold text-ink">{formatMoney(tour.adultPrice, "BDT", 0)}</p>
          </div>
          <Link
            href={`/tours/${tour.slug}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            View trip <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DestinationTile({
  destination,
  count,
  from,
}: {
  destination: string;
  count: number;
  from: number;
}) {
  return (
    <Link
      href={`/tours?destination=${encodeURIComponent(destination)}`}
      className={`group relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${gradientFor(destination)} p-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_80%_20%,white_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-white/20" />
      <div className="absolute -right-2 -top-2 h-14 w-14 rounded-full border border-white/20" />
      <div className="relative">
        <p className="inline-flex items-center gap-1 text-[10px] font-medium text-white/75">
          <MapPin className="h-3 w-3" /> {count} {count === 1 ? "holiday" : "holidays"}
        </p>
        <p className="mt-1 text-[18px] font-bold leading-tight">{destination}</p>
        <p className="mt-0.5 text-[11px] text-white/80">From {formatMoney(from, "BDT", 0)}</p>
      </div>
    </Link>
  );
}
