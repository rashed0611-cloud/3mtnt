import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Info,
  Mail,
  PhoneCall,
  Plane,
  Route,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { FlightQuoteForm } from "@/components/public/flight-quote-form";
import { FlightSearchForm } from "@/components/public/flight-search-form";
import { getPublicSettings } from "@/lib/db/public";
import {
  TRIP_TYPES,
  addDaysISO,
  airportByCode,
  cabinLabel,
  distanceKm,
  durationMinutes,
  fareBands,
  flightSearchHref,
  formatDuration,
  formatFlightDate,
  nearbyAirports,
  parseFlightSearch,
  passengerSummary,
  routeDistanceKm,
  routeType,
  selectedBand,
  todayISO,
  type FlightQuery,
  type FlightSearchParams,
} from "@/lib/flights";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Flight search",
  description:
    "Search one-way and round-trip flights from Dhaka, Chattogram, Sylhet and Cox's Bazar. See indicative fares instantly and send the route to the 3M Tours & Travels flight desk for live options.",
};

const POPULAR_ROUTES = [
  { from: "DAC", to: "DXB" },
  { from: "DAC", to: "JED" },
  { from: "DAC", to: "KUL" },
  { from: "DAC", to: "BKK" },
  { from: "DAC", to: "SIN" },
  { from: "DAC", to: "LHR" },
];

function money(value: number) {
  return formatMoney(value, "BDT", 0);
}

function metaFor(query: FlightQuery) {
  const km = routeDistanceKm(query);
  const legs = Math.max(1, query.legs.length);
  return {
    km,
    minutes: durationMinutes(km),
    legs,
    routeType: routeType(km / legs),
    bands: fareBands(query),
    selected: selectedBand(query),
  };
}

function stopsFor(query: FlightQuery) {
  const stops = query.legs.reduce<{ city: string; code: string }[]>((acc, leg) => {
    if (!acc.length) acc.push({ city: leg.from.city, code: leg.from.code });
    acc.push({ city: leg.to.city, code: leg.to.code });
    return acc;
  }, []);
  return stops.length > 1 ? stops : [{ city: query.from.city, code: query.from.code }, { city: query.to.city, code: query.to.code }];
}

export default async function FlightSearchPage({ searchParams }: { searchParams: Promise<FlightSearchParams> }) {
  const params = await searchParams;
  const settings = await getPublicSettings();
  const started = Boolean(params.depart || params.to || params.from);
  const { query, errors } = parseFlightSearch(params);

  const tripLabel = TRIP_TYPES.find((item) => item.key === query.trip)?.label ?? "One-way";
  const cabin = cabinLabel(query.cabin);
  const stops = stopsFor(query);
  const routeLabel = stops.map((stop) => `${stop.city} (${stop.code})`).join(" → ");
  const dateLabel =
    query.trip === "multi"
      ? query.legs.map((leg) => formatFlightDate(leg.depart, false)).join(" · ")
      : `${formatFlightDate(query.depart)}${query.ret ? ` – ${formatFlightDate(query.ret)}` : ""}`;
  const searchSummary = started
    ? `${tripLabel} · ${routeLabel} · ${dateLabel} · ${passengerSummary(query)} · ${cabin}`
    : "";
  const meta = metaFor(query);
  const quoteSearch: Record<string, string> = {
    trip: query.trip,
    from: query.from.code,
    to: query.to.code,
    depart: query.depart,
    return: query.ret,
    adults: String(query.adults),
    children: String(query.children),
    infants: String(query.infants),
    cabin: query.cabin,
  };
  query.legs.slice(1).forEach((leg, index) => {
    quoteSearch[`from${index + 2}`] = leg.from.code;
    quoteSearch[`to${index + 2}`] = leg.to.code;
    quoteSearch[`depart${index + 2}`] = leg.depart;
  });
  const estimate = `Indicative ${cabin.toLowerCase()} band ${money(meta.selected.perPersonLow)}–${money(meta.selected.perPersonHigh)} per traveller · ${money(meta.selected.totalLow)}–${money(meta.selected.totalHigh)} for the party.`;
  const today = todayISO();

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-9 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/flights" className="hover:text-primary">Flights</Link>
            <span>/</span>
            <span className="text-slate-600">Search</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                <Search className="h-3 w-3" /> One-way, round trip or multi-city · open to everyone
              </span>
              <h1 className="mt-2 text-[28px] font-bold tracking-tight text-ink sm:text-[34px]">Search flights</h1>
              <p className="mt-1.5 max-w-2xl text-[12.5px] leading-6 text-slate-500">
                Pick one route, add a return, or build a multi-city itinerary. See an indicative fare band straight away, then send the
                search to our flight desk for live options. No account, no payment and no obligation.
              </p>
            </div>
            <Link
              href="/flights"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[11.5px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
            >
              Flight desk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <FlightSearchForm
            className="mt-5"
            defaults={{
              trip: query.trip,
              from: query.from.code,
              to: query.to.code,
              depart: started && query.depart ? query.depart : undefined,
              ret: started && query.ret ? query.ret : undefined,
              adults: query.adults,
              children: query.children,
              infants: query.infants,
              cabin: query.cabin,
              extraLegs: query.legs.slice(1).map((leg) => ({
                from: leg.from.code,
                to: leg.to.code,
                depart: leg.depart,
              })),
            }}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="min-w-0 space-y-5">
          {!started ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-[17px] font-bold text-ink">Start with a route and your dates</h2>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-slate-500">
                Choose <span className="font-semibold text-ink">one-way</span> for a single flight,{" "}
                <span className="font-semibold text-ink">round trip</span> to add the return date, or{" "}
                <span className="font-semibold text-ink">multi-city</span> to join up to three flights. We cover short-haul Gulf and
                Asian routes, pilgrimage flights, and long-haul connections to Europe, North America and Australia.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {POPULAR_ROUTES.map((route) => {
                  const href = flightSearchHref({
                    trip: "round",
                    from: route.from,
                    to: route.to,
                    depart: addDaysISO(today, 21),
                    ret: addDaysISO(today, 28),
                    adults: 1,
                    children: 0,
                    infants: 0,
                    cabin: "economy",
                  });
                  const from = airportByCode(route.from)!;
                  const to = airportByCode(route.to)!;
                  return (
                    <Link
                      key={`${route.from}-${route.to}`}
                      href={href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11.5px] font-medium text-slate-600 hover:border-primary/30 hover:text-primary"
                    >
                      <Plane className="h-3 w-3" /> {from.city} → {to.city}
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : errors.length ? (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-[15px] font-bold text-red-900">That search needs a quick fix</h2>
              <ul className="mt-2 space-y-1 text-[12px] leading-5 text-red-800">
                {errors.map((error) => (
                  <li key={error} className="flex items-start gap-1.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-400" /> {error}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11.5px] text-red-700">Adjust the form above and search again.</p>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{tripLabel} search</p>
                    <h2 className="mt-1 flex flex-wrap items-center gap-2 text-[20px] font-bold tracking-tight text-ink">
                      {stops.map((stop, index) => (
                        <span key={`${stop.code}-${index}`} className="flex items-center gap-2">
                          {index > 0 ? (
                            <span className="flex items-center gap-1 text-slate-300">
                              <span className="h-px w-5 bg-slate-300" />
                              <Plane className="h-3.5 w-3.5 rotate-90 text-primary" />
                              <span className="h-px w-5 bg-slate-300" />
                            </span>
                          ) : null}
                          {stop.city}
                        </span>
                      ))}
                    </h2>
                    <p className="mt-1 text-[11.5px] text-slate-500">
                      {stops.map((stop) => stop.code).join(" → ")} · {meta.legs} {meta.legs === 1 ? "flight" : "flights"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10.5px] font-semibold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> {meta.routeType}
                  </span>
                </div>

                <div className="grid gap-4 px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Departing</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink">{formatFlightDate(query.depart)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {query.trip === "multi" ? "Itinerary" : "Returning"}
                      </p>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink">
                        {query.trip === "multi"
                          ? `${query.legs.length} flights · ${formatFlightDate(query.legs[0]?.depart ?? query.depart, false)}`
                          : query.ret
                            ? formatFlightDate(query.ret)
                            : "One-way"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Users className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Travellers · cabin</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink">{passengerSummary(query)}</p>
                      <p className="text-[10.5px] text-slate-500">{cabin}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Route</p>
                      <p className="mt-0.5 text-[12px] font-semibold text-ink">{meta.km.toLocaleString("en-US")} km</p>
                      <p className="text-[10.5px] text-slate-500">
                        ≈ {formatDuration(meta.minutes)} total flying · {meta.routeType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {query.trip === "multi" ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-[16px] font-bold text-ink">Your itinerary</h2>
                    <p className="mt-1 text-[11.5px] text-slate-500">
                      Each flight is priced together. The desk checks connection times, baggage and any overnight stays.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {query.legs.map((leg, index) => {
                      const legKm = distanceKm(leg.from, leg.to);
                      return (
                        <div key={`${leg.from.code}-${leg.to.code}-${index}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12.5px] font-semibold text-ink">
                              {leg.from.city} ({leg.from.code}) → {leg.to.city} ({leg.to.code})
                            </p>
                            <p className="mt-0.5 text-[10.5px] text-slate-500">
                              {formatFlightDate(leg.depart)} · {legKm.toLocaleString("en-US")} km · ≈{" "}
                              {formatDuration(durationMinutes(legKm))} non-stop
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-end justify-between gap-2 px-5 pt-5">
                  <div>
                    <h2 className="text-[16px] font-bold text-ink">Indicative fare bands</h2>
                    <p className="mt-1 text-[11.5px] leading-5 text-slate-500">
                      A planning range for{" "}
                      {query.trip === "multi"
                        ? "the full multi-city journey"
                        : query.trip === "round"
                          ? "the return journey"
                          : "the one-way journey"}
                      , per traveller and in BDT. Confirmed against live inventory before you pay.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    <Info className="h-3 w-3" /> Estimate, not a quote
                  </span>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-2.5 font-semibold">Cabin</th>
                        <th className="px-5 py-2.5 font-semibold">Per traveller</th>
                        <th className="px-5 py-2.5 font-semibold">Party total</th>
                        <th className="px-5 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {meta.bands.map((band) => {
                        const active = band.cabin === query.cabin;
                        return (
                          <tr
                            key={band.cabin}
                            className={active ? "border-t border-primary/20 bg-primary/5" : "border-t border-slate-100"}
                          >
                            <td className="px-5 py-3">
                              <p className={active ? "text-[12.5px] font-bold text-ink" : "text-[12.5px] font-semibold text-ink"}>
                                {band.label}
                              </p>
                              <p className="text-[10.5px] text-slate-500">
                                {band.cabin === "economy" ? "Standard cabin" : band.cabin === "premium" ? "Extra legroom" : "Lie-flat where offered"}
                              </p>
                            </td>
                            <td className="px-5 py-3 text-[12px] font-semibold text-ink">
                              {money(band.perPersonLow)} – {money(band.perPersonHigh)}
                            </td>
                            <td className="px-5 py-3 text-[12px] font-semibold text-ink">
                              {money(band.totalLow)} – {money(band.totalHigh)}
                            </td>
                            <td className="px-5 py-3 text-right">
                              {active ? (
                                <span className="inline-flex rounded-full bg-primary px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-white">
                                  Your search
                                </span>
                              ) : (
                                <Link
                                  href={flightSearchHref({ ...query, cabin: band.cabin })}
                                  className="text-[10.5px] font-semibold text-primary hover:underline"
                                >
                                  View
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 border-t border-slate-100 px-5 py-4 text-[11px] leading-5 text-slate-500">
                  <p>
                    Children are estimated at 75% of the adult fare and infants under two travel free on a lap. The desk confirms the
                    exact breakdown, taxes and baggage allowance.
                  </p>
                  <p className="flex items-start gap-1.5">
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    Flexible by a day or two, or able to fly from Chattogram or Sylhet instead? That often changes the fare materially.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <Route className="h-4 w-4 text-primary" /> Other airports nearby
                  </h3>
                  <div className="mt-3 grid gap-2">
                    {nearbyAirports(query.from, 3).map(({ airport, km }) => (
                      <div key={airport.code} className="flex items-center justify-between gap-3 text-[11.5px]">
                        <span className="text-slate-600">
                          {airport.city} <span className="text-slate-400">({airport.code})</span>
                        </span>
                        <span className="text-slate-400">{km.toLocaleString("en-US")} km away</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[10.5px] leading-4 text-slate-400">
                    Distances from {query.from.city}. Tell the desk if you can use a secondary airport.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" /> What you get back
                  </h3>
                  <ul className="mt-3 space-y-2 text-[11.5px] leading-5 text-slate-600">
                    <li>Two or three realistic itineraries with airline and routing named.</li>
                    <li>Total fare in BDT including taxes, plus baggage and change rules.</li>
                    <li>Connection times checked — no impossible transfers.</li>
                    <li>No payment until you approve the itinerary.</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-ink">Get exact fares</h2>
            <p className="mt-1 text-[11.5px] text-slate-500">
              {started ? "Send this route to the flight desk." : "Run a search first, then send it to the desk."}
            </p>
            <div className="mt-4">
              {started && !errors.length ? (
                <FlightQuoteForm search={quoteSearch} summary={searchSummary} estimate={estimate} />
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-4 text-[11.5px] leading-5 text-slate-500">
                  Choose your airports and dates above. Once the search runs, this panel lets you pass the route to a specialist with
                  one click.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Prefer to talk?</p>
            <p className="mt-2 flex items-center gap-2 text-[12px] text-slate-700">
              <PhoneCall className="h-3.5 w-3.5 text-primary" />
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="font-medium hover:text-primary hover:underline">
                {settings.phone}
              </a>
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-[12px] text-slate-700">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <a href={`mailto:${settings.email}`} className="font-medium hover:text-primary hover:underline">
                {settings.email}
              </a>
            </p>
            <p className="mt-3 text-[10.5px] leading-4 text-slate-500">
              Sunday–Thursday, 9:00–18:00 (Asia/Dhaka). Mention your reference if you already sent a search.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
