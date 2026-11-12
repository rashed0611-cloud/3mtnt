import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
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
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { HolidayShowcase } from "@/components/public/holiday-showcase";
import { TravelSearch } from "@/components/public/travel-search";
import { DestinationTile } from "@/components/public/tour-card";
import { getPublicDatabase } from "@/lib/db/public";
import { cn, formatMoney, titleCase } from "@/lib/utils";

const SERVICES = [
  { title: "Flights", text: "One-way, return and multi-city fares confirmed by a real flight desk.", href: "/flights", icon: Plane, tone: "bg-sky-50 text-sky-600" },
  { title: "Hotels", text: "City stays and beach resorts, checked before they reach you.", href: "/hotels", icon: Hotel, tone: "bg-violet-50 text-violet-600" },
  { title: "Holidays", text: "Group, private and fixed-departure holidays across Asia, the Gulf and Europe.", href: "/tours", icon: Globe2, tone: "bg-blue-50 text-blue-600" },
  { title: "Visa", text: "Document checklists, embassy timing and application tracking.", href: "/visas", icon: FileCheck2, tone: "bg-amber-50 text-amber-600" },
  { title: "Hajj & Umrah", text: "Guided pilgrimage with hotels near the Haram and clear milestones.", href: "/hajj-umrah", icon: Landmark, tone: "bg-emerald-50 text-emerald-600" },
  { title: "Plan with AI", text: "Describe the trip and get a specialist-checked starting point.", href: "/plan", icon: Sparkles, tone: "bg-fuchsia-50 text-fuchsia-600" },
];

const PROMISES = [
  { title: "A named specialist", text: "Every enquiry reaches a planner who owns it from first quote to return.", icon: Headphones },
  { title: "Clear, itemised pricing", text: "Adult, child and add-on costs are visible before you commit, in BDT.", icon: Wallet },
  { title: "Documents handled properly", text: "Visa checklists, passports and pilgrimage readiness tracked in one file.", icon: ShieldCheck },
  { title: "Booked only when confirmed", text: "No online charge: the desk confirms live availability and fare rules first.", icon: BadgeCheck },
];

const TESTIMONIALS = [
  {
    title: "Good support!",
    quote:
      "The team rebuilt our family Umrah itinerary twice without a hint of impatience. Every document was checked before we even asked.",
    name: "Farhana A.",
    detail: "Umrah group · Dhaka",
  },
  {
    title: "Excellent trip!",
    quote:
      "We booked a 10-day Switzerland holiday for six people. The day-by-day plan matched exactly what we experienced on the ground.",
    name: "Daniel R.",
    detail: "Private holiday · Chattogram",
  },
  {
    title: "Perfect itinerary!",
    quote:
      "Visa processing was the part I dreaded most. The checklist, appointment reminder and updates made it completely painless.",
    name: "Sadia K.",
    detail: "Schengen visa · Sylhet",
  },
];

const TIPS = [
  {
    title: "Check passport validity first",
    text: "Most destinations want six months beyond your return date. Renew before you book, not after.",
    icon: FileCheck2,
  },
  {
    title: "Visa timing drives the plan",
    text: "Embassy windows vary by country and season. Start the file before you lock in flights.",
    icon: Clock3,
  },
  {
    title: "Shoulder season is the value window",
    text: "A few weeks either side of peak dates usually means better rates and quieter stays.",
    icon: CalendarDays,
  },
  {
    title: "Ask what the fare includes",
    text: "Baggage, seat selection and changes differ by airline. We show the rules before payment.",
    icon: ShieldCheck,
  },
];

const POPULAR_SEARCHES = [
  { label: "Dhaka → Dubai flights", href: "/flights/search?trip=oneway&from=DAC&to=DXB" },
  { label: "Dhaka → Jeddah flights", href: "/flights/search?trip=oneway&from=DAC&to=JED" },
  { label: "Bali holidays", href: "/tours?destination=Bali" },
  { label: "Maldives resorts", href: "/hotels?location=Maldives" },
  { label: "Umrah packages", href: "/hajj-umrah?kind=umrah" },
  { label: "Schengen visa", href: "/visas?q=Schengen" },
];

export default async function HomePage() {
  const db = await getPublicDatabase();
  const settings = db.settings;
  const home = settings.homepage;
  const gallery = settings.gallery;
  const appearance = settings.appearance;
  const sections = appearance.sections;
  const banner = appearance.banner;
  const hasBanner = Boolean(banner.imageUrl);
  const centered = banner.align === "center" || !hasBanner;

  const tours = db.tours.filter((tour) => tour.status === "active");
  const visas = db.visas.filter((visa) => visa.status === "active");
  const hotels = db.hotels.filter((hotel) => hotel.status === "publish");
  const today = new Date().toISOString().slice(0, 10);

  const destinationMap = new Map<string, { destination: string; count: number; from: number }>();
  for (const tour of tours) {
    const current = destinationMap.get(tour.destination) ?? { destination: tour.destination, count: 0, from: tour.adultPrice };
    current.count += 1;
    current.from = Math.min(current.from, tour.adultPrice);
    destinationMap.set(tour.destination, current);
  }
  const destinations = [...destinationMap.values()].sort((a, b) => b.count - a.count).slice(0, 8);

  const pilgrims = db.hajjPackages.reduce((sum, pkg) => sum + pkg.booked, 0);
  const fromPrice = tours.length ? Math.min(...tours.map((tour) => tour.adultPrice)) : 0;
  const cheapestTour = [...tours].sort((a, b) => a.adultPrice - b.adultPrice)[0];
  const familyTour = tours.find((tour) => /family|kids|child/i.test(tour.title)) ?? tours.find((tour) => tour.capacity >= 24);
  const cheapestHotel = [...hotels].sort((a, b) => a.price - b.price)[0];
  const nextPackage = [...db.hajjPackages]
    .filter((pkg) => pkg.departureDate >= today)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0];

  const partners = Array.from(
    new Set([...tours.map((tour) => tour.supplier), ...hotels.map((hotel) => hotel.supplier)].filter(Boolean)),
  ).slice(0, 8);

  const visaCountries = Array.from(new Set(visas.map((visa) => visa.country))).sort();
  const hotelLocations = Array.from(new Set(hotels.map((hotel) => hotel.location))).sort();
  const holidayDestinations = Array.from(new Set(tours.map((tour) => tour.destination))).sort();
  const topVisas = [...visas].sort((a, b) => a.price - b.price).slice(0, 4);

  const valuePicks = [
    cheapestTour
      ? {
          tag: "Lowest holiday price",
          title: cheapestTour.destination,
          headline: cheapestTour.title,
          price: formatMoney(cheapestTour.adultPrice, "BDT", 0),
          meta: `${cheapestTour.durationDays} days · ${cheapestTour.capacity} seats`,
          href: `/tours/${cheapestTour.slug}`,
          icon: Compass,
          tone: "from-sky-500 to-blue-600",
        }
      : null,
    familyTour
      ? {
          tag: "Family favourite",
          title: familyTour.destination,
          headline: familyTour.title,
          price: formatMoney(familyTour.adultPrice, "BDT", 0),
          meta: `${familyTour.durationDays} days · family pacing`,
          href: `/tours/${familyTour.slug}`,
          icon: Users,
          tone: "from-violet-500 to-fuchsia-600",
        }
      : null,
    cheapestHotel
      ? {
          tag: "Stay for less",
          title: cheapestHotel.location,
          headline: cheapestHotel.name,
          price: `${formatMoney(cheapestHotel.price, "BDT", 0)} / night`,
          meta: `${cheapestHotel.starRating}-star · ${cheapestHotel.rooms} rooms`,
          href: `/hotels/${cheapestHotel.slug}`,
          icon: Hotel,
          tone: "from-amber-500 to-orange-600",
        }
      : null,
    nextPackage
      ? {
          tag: "Pilgrimage departure",
          title: titleCase(nextPackage.kind),
          headline: nextPackage.title,
          price: formatMoney(nextPackage.price, "BDT", 0),
          meta: `${new Date(`${nextPackage.departureDate}T00:00:00`).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })} · ${Math.max(0, nextPackage.capacity - nextPackage.booked)} seats left`,
          href: "/hajj-umrah",
          icon: Landmark,
          tone: "from-emerald-500 to-teal-700",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      {/* Hero + unified search */}
      <section
        className={cn(
          "relative overflow-hidden border-b border-slate-200",
          hasBanner ? "text-white" : "bg-gradient-to-b from-primary/12 via-page to-white",
        )}
      >
        {hasBanner ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `rgba(15, 23, 42, ${banner.overlay / 100})` }} />
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          </>
        )}

        <div className={cn("relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8", hasBanner ? "pb-12" : "pb-10")}>
          <div className={cn(centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl")}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10.5px] font-semibold shadow-sm",
                hasBanner ? "border-white/30 bg-white/10 text-white backdrop-blur" : "border-primary/15 bg-white text-primary",
              )}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9 / 5 traveller feedback · {pilgrims} pilgrims flown
            </span>
            <h1
              className={cn(
                "mt-5 text-[34px] leading-[1.06] tracking-tight sm:text-[50px]",
                hasBanner ? "text-white" : "text-ink",
              )}
            >
              {home.headline}{" "}
              {home.highlight ? <span className={hasBanner ? "text-white/85" : "text-primary"}>{home.highlight}</span> : null}
            </h1>
            <p
              className={cn(
                "mt-4 text-[13.5px] leading-7 sm:text-[14.5px]",
                centered ? "mx-auto max-w-2xl" : "",
                hasBanner ? "text-white/85" : "text-slate-600",
              )}
            >
              {home.subtitle}
            </p>
          </div>

          {banner.showSearch ? (
            <div className="mx-auto mt-7 max-w-5xl text-left">
              <TravelSearch
                hotelLocations={hotelLocations}
                holidayDestinations={holidayDestinations}
                visaCountries={visaCountries}
              />
              <div
                className={cn(
                  "mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 pr-16 text-[10.5px]",
                  hasBanner ? "text-white/80" : "text-slate-500",
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className={cn("h-3 w-3", hasBanner ? "text-emerald-300" : "text-emerald-500")} /> No account
                  needed
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className={cn("h-3 w-3", hasBanner ? "text-emerald-300" : "text-emerald-500")} /> Prices in BDT
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className={cn("h-3 w-3", hasBanner ? "text-emerald-300" : "text-emerald-500")} /> Confirmed by a
                  real desk
                </span>
                <Link
                  href="/plan"
                  className={cn(
                    "ml-auto inline-flex items-center gap-1 font-semibold hover:underline",
                    hasBanner ? "text-white" : "text-primary",
                  )}
                >
                  Can&apos;t find it? Plan with AI <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : null}

          {!banner.showSearch ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href={home.primaryHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
              >
                {home.primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/plan"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" /> Plan with AI
              </Link>
            </div>
          ) : null}
        </div>

        {sections.stats ? (
          <div className="relative border-t border-slate-200/70 bg-white/70 backdrop-blur">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {[
                { value: `${tours.length}+`, label: "Published holidays" },
                { value: `${hotels.length}+`, label: "Checked hotel partners" },
                { value: `${visas.length}+`, label: "Visa products" },
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
        ) : null}
      </section>

      {/* Offers */}
      {sections.offers && valuePicks.length ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Offers & value picks</p>
              <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">Deals worth planning around</h2>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-slate-500">
                Live starting prices from what the desk can actually confirm today — not a countdown timer.
              </p>
            </div>
            <Link href="/tours" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline">
              View all packages <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {valuePicks.map((pick) => {
              const Icon = pick.icon;
              return (
                <Link
                  key={pick.tag}
                  href={pick.href}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${pick.tone}`} />
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      <Tag className="h-2.5 w-2.5" /> {pick.tag}
                    </span>
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${pick.tone} text-white`}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{pick.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink group-hover:text-primary">
                    {pick.headline}
                  </p>
                  <p className="mt-2 text-[15px] font-bold text-ink">{pick.price}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">{pick.meta}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-[10.5px] text-slate-400">
            Starting prices per person unless marked. Availability, taxes and fare rules are confirmed by the desk before payment.
          </p>
        </section>
      ) : null}

      {/* Best-selling holidays */}
      {sections.featuredTours ? (
        <section className="border-y border-slate-200 bg-page">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Best selling holidays</p>
                <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-ink">Holidays our travellers ask for twice</h2>
                <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-slate-500">
                  Fixed departures, private itineraries and family trips with realistic pacing, checked stays and room to breathe.
                </p>
              </div>
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
              >
                View all packages <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <HolidayShowcase tours={tours} total={tours.length} />
          </div>
        </section>
      ) : null}

      {/* Destinations */}
      {sections.destinations && destinations.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Top destinations</p>
              <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">Where our travellers are going</h2>
            </div>
            <Link href="/tours" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline">
              See every destination <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((destination) => (
              <DestinationTile key={destination.destination} {...destination} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Services */}
      {sections.services ? (
        <section className="border-y border-slate-200 bg-page">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">One travel desk</p>
              <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">Everything around the journey, joined up</h2>
              <p className="mt-1.5 text-[12.5px] leading-6 text-slate-500">
                Flights, stays, visas and pilgrimage files sit with the same team — so nothing falls between suppliers.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map(({ title, text, href, icon: Icon, tone }) => (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-3 text-[13.5px] font-semibold text-ink group-hover:text-primary">{title}</h3>
                  <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Visa cards */}
      {sections.visas && topVisas.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Visa available now</p>
              <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">Visa files, prepared and tracked</h2>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-slate-500">
                Clear requirements, realistic processing windows and a checklist for every application.
              </p>
            </div>
            <Link href="/visas" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline">
              All visa services <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {topVisas.map((visa) => (
              <Link
                key={visa.id}
                href={`/visas/${visa.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <FileCheck2 className="h-4 w-4" />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    Open
                  </span>
                </div>
                <p className="mt-3 text-[13px] font-semibold text-ink group-hover:text-amber-700">{visa.country}</p>
                <p className="text-[10.5px] font-medium text-slate-500">{visa.visaType}</p>
                <div className="mt-2.5 flex items-end justify-between border-t border-slate-100 pt-2.5">
                  <div>
                    <p className="text-[9px] uppercase tracking-wide text-slate-400">From</p>
                    <p className="text-[14px] font-bold text-ink">{formatMoney(visa.price, "BDT", 0)}</p>
                  </div>
                  <p className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <Clock3 className="h-3 w-3" /> {visa.processingTime}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Pilgrimage banner */}
      {sections.pilgrimage ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07332a] via-[#0a4a3b] to-[#0b6b4f] px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-emerald-300/20" />
            <div className="absolute -bottom-24 right-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                  <Landmark className="h-3 w-3" /> Hajj & Umrah
                </span>
                <h2 className="mt-3 max-w-xl text-[26px] font-bold leading-tight sm:text-[30px]">
                  A pilgrimage planned with care, from paperwork to return.
                </h2>
                <p className="mt-2 max-w-xl text-[12.5px] leading-6 text-emerald-100/80">
                  Group leaders, document readiness, hotels near the Haram and clear payment milestones. The pilgrimage desk stays with
                  your family for the whole journey.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/hajj-umrah"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[11.5px] font-semibold text-emerald-900 transition hover:bg-emerald-50"
                  >
                    View packages <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2 text-[11.5px] font-semibold text-white transition hover:bg-white/10"
                  >
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
      ) : null}

      {/* Trust, partners and testimonials */}
      {sections.testimonials ? (
        <section className="border-y border-emerald-900/10 bg-[#eef7f1]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Traveller feedback</p>
                <h2 className="mt-1.5 max-w-md text-[26px] font-bold tracking-tight text-emerald-950">
                  What our travellers say
                </h2>
                <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3">
                  <p className="text-[30px] font-bold leading-none text-emerald-950">4.9</p>
                  <div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="mt-1 text-[10.5px] text-slate-500">Average post-trip feedback from 3M travellers</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {PROMISES.map(({ title, text, icon: Icon }) => (
                    <div key={title} className="flex items-start gap-2.5 rounded-xl border border-emerald-200/70 bg-white/70 px-3.5 py-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-emerald-950">{title}</p>
                        <p className="mt-0.5 text-[11px] leading-5 text-emerald-900/60">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {TESTIMONIALS.map((testimonial) => (
                  <figure key={testimonial.name} className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-emerald-900">{testimonial.title}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star key={index} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="mt-2 flex gap-2 text-[12px] leading-6 text-slate-600">
                      <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                      {testimonial.quote}
                    </blockquote>
                    <figcaption className="mt-3 border-t border-slate-100 pt-2.5">
                      <p className="text-[11.5px] font-semibold text-ink">{testimonial.name}</p>
                      <p className="text-[10px] text-slate-400">{testimonial.detail}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {partners.length ? (
              <div className="mt-8 border-t border-emerald-900/10 pt-5">
                <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-900/50">
                  Our {partners.length} supplier partners on the ground
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {partners.map((partner) => (
                    <span key={partner} className="text-[11.5px] font-semibold tracking-tight text-emerald-900/45">
                      {partner}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {sections.gallery && gallery.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Gallery</p>
            <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">{home.galleryTitle}</h2>
            {home.gallerySubtitle ? (
              <p className="mt-1.5 max-w-xl text-[12.5px] leading-6 text-slate-500">{home.gallerySubtitle}</p>
            ) : null}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(0, 6).map((image) => (
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

      {/* Travel tips */}
      {sections.tips ? (
        <section className="border-y border-slate-200 bg-page">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-primary">Travel tips</p>
              <h2 className="mt-1.5 text-[24px] font-bold tracking-tight text-ink">Before you book, know this</h2>
              <p className="mt-1.5 text-[12px] leading-6 text-slate-500">
                Practical notes from the desk. Nothing here replaces the documents we check with you before departure.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TIPS.map(({ title, text, icon: Icon }) => (
                <article key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-[12.5px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">Popular searches</span>
              {POPULAR_SEARCHES.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary"
                >
                  <MapPin className="h-3 w-3 text-slate-400" /> {item.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Closing CTA */}
      {sections.cta ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/10 via-white to-accent/10 px-6 py-8 sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3 w-3" /> Start with what you have in mind
              </p>
              <h2 className="mt-2 max-w-xl text-[24px] font-bold tracking-tight text-ink">
                Tell us the trip. We&apos;ll bring the options.
              </h2>
              <p className="mt-1.5 text-[12px] text-slate-500">
                No obligation quote, typically within one business day. Holidays from {formatMoney(fromPrice, "BDT", 0)} per adult.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/plan"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
              >
                Plan with AI <Sparkles className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
              >
                Talk to a specialist <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
