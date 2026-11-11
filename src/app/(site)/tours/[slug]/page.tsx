import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react";
import { TourCard } from "@/components/public/tour-card";
import { getRepository } from "@/lib/db";
import { gradientFor, destinationInitials } from "@/lib/public";
import { formatMoney, titleCase } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getRepository().getDatabase();
  const tour = db.tours.find((item) => item.slug === slug || item.id === slug);
  if (!tour) return { title: "Tour not found" };
  return {
    title: tour.title,
    description: tour.description.slice(0, 160),
  };
}

export default async function TourDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getRepository().getDatabase();
  const tour = db.tours.find((item) => item.slug === slug || item.id === slug);
  if (!tour) notFound();

  const related = db.tours
    .filter((item) => item.id !== tour.id && item.status === "active" && (item.destination === tour.destination || item.type === tour.type))
    .slice(0, 3);

  const interest = encodeURIComponent(`${tour.title} (${tour.code})`);
  const isFull = tour.capacity <= 0;

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/tours" className="hover:text-primary">Tours</Link>
            <span>/</span>
            <span className="text-slate-600">{tour.destination}</span>
          </nav>
        </div>
      </section>

      <section className={`relative overflow-hidden bg-gradient-to-br ${gradientFor(tour.destination)}`}>
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">{titleCase(tour.type)}</span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold backdrop-blur">{tour.code}</span>
            {tour.featured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-[10px] font-bold text-amber-950">
                <Star className="h-2.5 w-2.5 fill-amber-950" /> Featured
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 max-w-3xl text-[30px] font-bold leading-tight tracking-tight sm:text-[40px]">{tour.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-white/85">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {tour.destination}</span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {tour.durationDays} days / {tour.durationNights} nights</span>
            <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Up to {tour.capacity} travellers</span>
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" /> 4.8 traveller rating</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.55fr_0.85fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">The journey</h2>
              <p className="mt-2 text-[12.5px] leading-7 text-slate-600">{tour.description}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Destination", value: tour.destination },
                  { label: "Duration", value: `${tour.durationDays} days` },
                  { label: "Group size", value: `Max ${tour.capacity}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5">
                    <p className="text-[9.5px] uppercase tracking-wide text-slate-400">{item.label}</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-ink">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {tour.itinerary.length ? (
              <div>
                <h2 className="text-[19px] font-bold tracking-tight text-ink">Day-by-day itinerary</h2>
                <div className="mt-4 space-y-0">
                  {tour.itinerary.map((day, index) => (
                    <div key={`${day.day}-${day.title}`} className="relative flex gap-4 pb-5">
                      {index < tour.itinerary.length - 1 ? (
                        <span className="absolute left-[15px] top-8 h-full w-px bg-slate-200" aria-hidden />
                      ) : null}
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-[10.5px] font-bold text-primary">
                        D{day.day}
                      </span>
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-[12.5px] font-semibold text-ink">{day.title}</p>
                        <p className="mt-1 text-[11.5px] leading-6 text-slate-500">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-900">
                  <Check className="h-4 w-4 text-emerald-600" /> What&apos;s included
                </h2>
                <ul className="mt-2.5 space-y-1.5">
                  {tour.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11.5px] leading-5 text-emerald-900/80">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700">
                  <X className="h-4 w-4 text-slate-400" /> Not included
                </h2>
                <ul className="mt-2.5 space-y-1.5">
                  {tour.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11.5px] leading-5 text-slate-500">
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Operated with</p>
                  <p className="text-[12.5px] font-semibold text-ink">{tour.supplier}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[10.5px] text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1"><ShieldCheck className="h-3 w-3 text-emerald-500" /> Secure booking</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1"><BadgeCheck className="h-3 w-3 text-emerald-500" /> Verified supplier</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1"><MessageCircle className="h-3 w-3 text-primary" /> Human support</span>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[9.5px] uppercase tracking-wide text-slate-400">From, per adult</p>
                  <p className="text-[26px] font-bold leading-tight text-ink">{formatMoney(tour.adultPrice, "BDT", 0)}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">Child rate {formatMoney(tour.childPrice, "BDT", 0)}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-[13px] font-bold text-primary">
                  {destinationInitials(tour.destination)}
                </span>
              </div>

              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11.5px]">
                <div className="flex justify-between"><dt className="text-slate-500">Duration</dt><dd className="font-medium text-ink">{tour.durationDays} days</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Availability</dt><dd className={isFull ? "font-medium text-red-600" : "font-medium text-emerald-600"}>{isFull ? "Waitlist" : "Open for booking"}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tour code</dt><dd className="font-mono text-[10.5px] font-medium text-ink">{tour.code}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Deposit</dt>
                  <dd className="font-medium text-ink">
                    {formatMoney(Math.round((tour.adultPrice * db.settings.tourDepositPercent) / 100), "BDT", 0)} per adult
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Free cancellation</dt>
                  <dd className="font-medium text-ink">{db.settings.tourCancellationDays} days before departure</dd>
                </div>
              </dl>

              <div className="mt-4 space-y-2">
                <Link
                  href={`/contact?interest=${interest}`}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-primary-strong"
                >
                  Enquire about this tour <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="tel:+8801700000000"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                >
                  <Phone className="h-3.5 w-3.5" /> Talk to a specialist
                </a>
              </div>
              <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
                No payment taken online. A specialist confirms availability, dates and final pricing before you commit.
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink"><Compass className="h-3.5 w-3.5 text-primary" /> Prefer a custom route?</p>
              <p className="mt-1 text-[10.5px] leading-5 text-slate-500">We can adjust hotels, pace, room types and add-ons for your group.</p>
              <Link href={`/contact?interest=${encodeURIComponent(`Custom ${tour.destination} itinerary`)}`} className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-primary hover:underline">
                Request a custom quote <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-slate-200 bg-[#f7f9fd]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="text-[21px] font-bold tracking-tight text-ink">You might also like</h2>
              <Link href="/tours" className="text-[11.5px] font-semibold text-primary hover:underline">All tours</Link>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <TourCard key={item.id} tour={item} />)}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
