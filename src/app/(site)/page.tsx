import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Compass,
  FileCheck2,
  Globe2,
  Headphones,
  Hotel,
  Landmark,
  MapPin,
  Plane,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { HeroSearch } from "@/components/public/hero-search";
import { DestinationTile, TourCard } from "@/components/public/tour-card";
import { getRepository } from "@/lib/db";
import { formatMoney } from "@/lib/utils";

const SERVICES = [
  { title: "Tour packages", text: "Curated group and private journeys across Asia, the Gulf and Europe.", href: "/tours", icon: Globe2, tone: "bg-blue-50 text-blue-600" },
  { title: "Hotels", text: "Hand-checked stays from city boutique hotels to beachfront resorts.", href: "/hotels", icon: Hotel, tone: "bg-violet-50 text-violet-600" },
  { title: "Visa services", text: "Document checklists, embassy timing and application tracking.", href: "/visas", icon: FileCheck2, tone: "bg-amber-50 text-amber-600" },
  { title: "Hajj & Umrah", text: "Guided pilgrimage packages with group leaders and full support.", href: "/hajj-umrah", icon: Landmark, tone: "bg-emerald-50 text-emerald-600" },
  { title: "Flights", text: "Fare planning, routing advice and ticketing support from a real travel desk.", href: "/flights", icon: Plane, tone: "bg-sky-50 text-sky-600" },
  { title: "Corporate travel", text: "Policy-friendly itineraries, invoicing and dedicated coordinators.", href: "/contact", icon: Users, tone: "bg-slate-100 text-slate-600" },
];

const PROMISES = [
  { title: "A real team, not a call queue", text: "Every enquiry reaches a named travel specialist who owns it from quote to return.", icon: Headphones },
  { title: "Transparent, itemised pricing", text: "Adult, child and add-on pricing is clear before you commit — in BDT or your currency.", icon: Wallet },
  { title: "Documents handled properly", text: "Visa checklists, passports and pilgrimage readiness tracked with permission-aware access.", icon: ShieldCheck },
  { title: "One operating record", text: "Your booking, payments, invoices and travel documents live together in one place.", icon: BadgeCheck },
];

const TESTIMONIALS = [
  {
    quote: "The team rebuilt our family Umrah itinerary twice without a hint of impatience. Every document was checked before we even asked.",
    name: "Farhana A.",
    detail: "Umrah group · Dhaka",
  },
  {
    quote: "We booked a 10-day Switzerland tour for six people. The day-by-day plan matched exactly what we experienced on the ground.",
    name: "Daniel R.",
    detail: "Private tour · Chattogram",
  },
  {
    quote: "Visa processing was the part I dreaded most. The checklist, appointment reminder and updates made it completely painless.",
    name: "Sadia K.",
    detail: "Schengen visa · Sylhet",
  },
];

export default async function HomePage() {
  const db = await getRepository().getDatabase();
  const settings = db.settings;
  const home = settings.homepage;
  const gallery = settings.gallery;
  const tours = db.tours.filter((tour) => tour.status === "active");
  const featured = [...tours].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3);

  const destinationMap = new Map<string, { destination: string; count: number; from: number }>();
  for (const tour of tours) {
    const current = destinationMap.get(tour.destination) ?? { destination: tour.destination, count: 0, from: tour.adultPrice };
    current.count += 1;
    current.from = Math.min(current.from, tour.adultPrice);
    destinationMap.set(tour.destination, current);
  }
  const destinations = [...destinationMap.values()].sort((a, b) => b.count - a.count).slice(0, 6);
  const pilgrims = db.hajjPackages.reduce((sum, pkg) => sum + pkg.booked, 0);
  const fromPrice = tours.length ? Math.min(...tours.map((tour) => tour.adultPrice)) : 0;
  const nextPackage = [...db.hajjPackages]
    .filter((pkg) => pkg.departureDate >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-[#eef5ff] via-[#f7faff] to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-20">
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3 py-1 text-[10.5px] font-semibold text-primary shadow-sm">
              <Sparkles className="h-3 w-3" /> {home.eyebrow}
            </span>
            <h1 className="mt-5 max-w-2xl text-[34px] font-bold leading-[1.08] tracking-tight text-ink sm:text-[46px]">
              {home.headline} {home.highlight ? <span className="text-primary">{home.highlight}</span> : null}
            </h1>
            <p className="mt-4 max-w-xl text-[13.5px] leading-7 text-slate-600 sm:text-[14.5px]">
              {home.subtitle}
            </p>

            <div className="mt-6 max-w-2xl">
              <HeroSearch />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {home.primaryLabel ? (
                <Link
                  href={home.primaryHref}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
                >
                  {home.primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
              {home.secondaryLabel ? (
                <Link
                  href={home.secondaryHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                >
                  {home.secondaryLabel}
                </Link>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-[11.5px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> ATAB-style service standards</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure document handling</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-emerald-500" /> Replies within one business day</span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-6 text-white shadow-[0_30px_80px_-30px_rgba(11,116,222,0.55)]">
              <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_25%_20%,white_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Featured journey</p>
                  <p className="mt-1 text-[22px] font-bold leading-tight">Maldives Overwater Escape</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11.5px] text-white/80"><MapPin className="h-3.5 w-3.5" /> South Malé Atoll · 5 days</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur"><Compass className="h-5 w-5" /></span>
              </div>

              <div className="relative mt-8 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Nights", value: "4" },
                  { label: "Guests", value: "2" },
                  { label: "Rating", value: "4.9" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 px-2 py-2.5 backdrop-blur">
                    <p className="text-[15px] font-bold">{item.value}</p>
                    <p className="text-[9px] uppercase tracking-wide text-white/65">{item.label}</p>
                  </div>
                ))}
              </div>

              <div className="relative mt-5 rounded-2xl bg-white p-4 text-ink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Starting from</p>
                    <p className="text-[19px] font-bold">{formatMoney(189000, "BDT", 0)}</p>
                  </div>
                  <Link href="/tours" className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-2 text-[11px] font-semibold text-white">
                    View trips <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 from 128 travellers · includes transfers
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Next pilgrimage departure</p>
                <p className="mt-0.5 text-[12px] font-semibold text-ink">{nextPackage ? nextPackage.title : "Ramadan Umrah 2027"}</p>
                <p className="mt-0.5 text-[10.5px] text-slate-500">
                  {nextPackage ? new Date(`${nextPackage.departureDate}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Dates on request"} · {pilgrims} pilgrims booked
                </p>
              </div>
              <Link href="/hajj-umrah" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100">
                <Landmark className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 bg-white/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { value: `${db.tours.length}+`, label: "Original tour packages" },
              { value: `${db.hotels.length}+`, label: "Checked hotel partners" },
              { value: `${db.visas.length}+`, label: "Visa products" },
              { value: `${pilgrims}`, label: "Pilgrims booked" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2.5">
                <span className="h-8 w-px bg-primary/20" />
                <div>
                  <p className="text-[16px] font-bold leading-tight text-ink">{stat.value}</p>
                  <p className="text-[10px] text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tours */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Handpicked journeys</p>
            <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Trips our travellers ask for twice</h2>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-6 text-slate-500">
              Fixed departures and private itineraries with realistic pacing, verified stays and room to breathe.
            </p>
          </div>
          <Link href="/tours" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
            Browse all {db.tours.length} tours <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}
        </div>
      </section>

      {/* Gallery */}
      {gallery.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-14 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Gallery</p>
              <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">{home.galleryTitle}</h2>
              {home.gallerySubtitle ? (
                <p className="mt-1.5 max-w-xl text-[12.5px] leading-6 text-slate-500">{home.gallerySubtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image) => (
              <figure key={image.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt || image.caption || "3M Tours & Travels journey"}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {image.caption ? (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-3 pt-10 text-[12px] font-medium text-white">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {/* Services */}
      <section className="border-y border-slate-200 bg-[#f7f9fd]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">One travel desk</p>
            <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Everything around the journey, joined up</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map(({ title, text, href, icon: Icon, tone }) => (
              <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <h3 className="mt-3 text-[13.5px] font-semibold text-ink group-hover:text-primary">{title}</h3>
                <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Where next?</p>
            <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Destinations with real availability</h2>
          </div>
          <Link href="/tours" className="text-[11.5px] font-semibold text-primary hover:underline">See every destination</Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <DestinationTile key={destination.destination} {...destination} />
          ))}
        </div>
      </section>

      {/* Pilgrimage banner */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07332a] via-[#0a4a3b] to-[#0b6b4f] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-emerald-300/20" />
          <div className="absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                <Landmark className="h-3 w-3" /> Hajj & Umrah
              </span>
              <h2 className="mt-3 max-w-xl text-[26px] font-bold leading-tight sm:text-[30px]">A pilgrimage planned with care, from paperwork to return.</h2>
              <p className="mt-2 max-w-xl text-[12.5px] leading-6 text-emerald-100/80">
                Group leaders, document readiness, hotels near the Haram and clear payment milestones. Our pilgrimage desk stays with
                your family for the whole journey.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/hajj-umrah" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11.5px] font-semibold text-emerald-900 transition hover:bg-emerald-50">
                  View packages <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[11.5px] font-semibold text-white transition hover:bg-white/10">
                  Speak to the pilgrimage desk
                </Link>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { label: "Packages", value: String(db.hajjPackages.length) },
                { label: "Pilgrims booked", value: String(pilgrims) },
                { label: "Seats this season", value: String(db.hajjPackages.reduce((sum, pkg) => sum + pkg.capacity, 0)) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur">
                  <p className="text-[20px] font-bold leading-tight">{item.value}</p>
                  <p className="text-[9.5px] uppercase tracking-wide text-emerald-100/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="border-y border-slate-200 bg-[#f7f9fd]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Why 3M Tours &amp; Travels</p>
            <h2 className="mt-1.5 max-w-lg text-[26px] font-bold tracking-tight text-ink">The detail is the difference</h2>
            <p className="mt-2 max-w-lg text-[12.5px] leading-6 text-slate-500">
              We keep the messy parts — supplier confirmations, visa timing, rooming lists, balances — in one operating system, so
              your trip feels simple from the outside.
            </p>
            <div className="mt-6 grid gap-3">
              {PROMISES.map(({ title, text, icon: Icon }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">{title}</p>
                    <p className="mt-0.5 text-[11.5px] leading-5 text-slate-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {TESTIMONIALS.map((testimonial) => (
              <figure key={testimonial.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <Quote className="h-5 w-5 text-primary/30" />
                <blockquote className="mt-2 text-[12.5px] leading-6 text-slate-600">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[11.5px] font-semibold text-ink">{testimonial.name}</p>
                    <p className="text-[10px] text-slate-400">{testimonial.detail}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/10 via-white to-cyan-50 px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">
              <CalendarDays className="h-3 w-3" /> Start with a conversation
            </p>
            <h2 className="mt-2 max-w-xl text-[24px] font-bold tracking-tight text-ink">Tell us where you want to go. We&apos;ll handle the rest.</h2>
            <p className="mt-1.5 text-[12px] text-slate-500">No obligation quote, typically within one business day. From {formatMoney(fromPrice, "BDT", 0)} per traveller.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong">
              Plan my trip <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/tours" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
              Explore tours
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
