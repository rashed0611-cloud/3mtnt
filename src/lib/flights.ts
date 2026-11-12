/**
 * Public flight search helpers.
 *
 * The storefront has no GDS connection, so the search validates a real request,
 * measures the route and returns an indicative fare band that the flight desk
 * confirms against live inventory. Nothing here is a bookable price.
 */

export interface Airport {
  code: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export const AIRPORTS: Airport[] = [
  { code: "DAC", city: "Dhaka", country: "Bangladesh", lat: 23.8433, lon: 90.3978 },
  { code: "CGP", city: "Chattogram", country: "Bangladesh", lat: 22.2496, lon: 91.8133 },
  { code: "CXB", city: "Cox's Bazar", country: "Bangladesh", lat: 21.4522, lon: 91.9639 },
  { code: "ZYL", city: "Sylhet", country: "Bangladesh", lat: 24.9632, lon: 91.8668 },
  { code: "JED", city: "Jeddah", country: "Saudi Arabia", lat: 21.6796, lon: 39.1565 },
  { code: "MED", city: "Madinah", country: "Saudi Arabia", lat: 24.5534, lon: 39.7051 },
  { code: "RUH", city: "Riyadh", country: "Saudi Arabia", lat: 24.9576, lon: 46.6988 },
  { code: "DXB", city: "Dubai", country: "United Arab Emirates", lat: 25.2532, lon: 55.3657 },
  { code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates", lat: 24.433, lon: 54.6511 },
  { code: "DOH", city: "Doha", country: "Qatar", lat: 25.2731, lon: 51.6081 },
  { code: "KWI", city: "Kuwait City", country: "Kuwait", lat: 29.2266, lon: 47.9689 },
  { code: "MCT", city: "Muscat", country: "Oman", lat: 23.5933, lon: 58.2844 },
  { code: "IST", city: "Istanbul", country: "Türkiye", lat: 41.2753, lon: 28.7519 },
  { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lon: 101.7099 },
  { code: "SIN", city: "Singapore", country: "Singapore", lat: 1.3644, lon: 103.9915 },
  { code: "BKK", city: "Bangkok", country: "Thailand", lat: 13.69, lon: 100.7501 },
  { code: "HKG", city: "Hong Kong", country: "Hong Kong", lat: 22.308, lon: 113.9185 },
  { code: "CAN", city: "Guangzhou", country: "China", lat: 23.3924, lon: 113.2988 },
  { code: "DEL", city: "Delhi", country: "India", lat: 28.5562, lon: 77.1 },
  { code: "CCU", city: "Kolkata", country: "India", lat: 22.6547, lon: 88.4467 },
  { code: "MAA", city: "Chennai", country: "India", lat: 12.9941, lon: 80.1709 },
  { code: "BOM", city: "Mumbai", country: "India", lat: 19.0896, lon: 72.8656 },
  { code: "KTM", city: "Kathmandu", country: "Nepal", lat: 27.6966, lon: 85.3591 },
  { code: "CMB", city: "Colombo", country: "Sri Lanka", lat: 7.1808, lon: 79.8841 },
  { code: "MLE", city: "Malé", country: "Maldives", lat: 4.1918, lon: 73.5291 },
  { code: "TAS", city: "Tashkent", country: "Uzbekistan", lat: 41.2579, lon: 69.2812 },
  { code: "ALA", city: "Almaty", country: "Kazakhstan", lat: 43.3521, lon: 77.0405 },
  { code: "CAI", city: "Cairo", country: "Egypt", lat: 30.1219, lon: 31.4056 },
  { code: "LHR", city: "London", country: "United Kingdom", lat: 51.47, lon: -0.4543 },
  { code: "CDG", city: "Paris", country: "France", lat: 49.0097, lon: 2.5479 },
  { code: "FRA", city: "Frankfurt", country: "Germany", lat: 50.0379, lon: 8.5622 },
  { code: "AMS", city: "Amsterdam", country: "Netherlands", lat: 52.3105, lon: 4.7683 },
  { code: "FCO", city: "Rome", country: "Italy", lat: 41.8003, lon: 12.2389 },
  { code: "JFK", city: "New York", country: "United States", lat: 40.6413, lon: -73.7781 },
  { code: "YYZ", city: "Toronto", country: "Canada", lat: 43.6777, lon: -79.6248 },
  { code: "NRT", city: "Tokyo", country: "Japan", lat: 35.7719, lon: 140.3929 },
  { code: "ICN", city: "Seoul", country: "South Korea", lat: 37.4602, lon: 126.4407 },
  { code: "SYD", city: "Sydney", country: "Australia", lat: -33.9399, lon: 151.1753 },
];

const AIRPORT_MAP = new Map(AIRPORTS.map((airport) => [airport.code, airport]));

export const TRIP_TYPES = [
  { key: "oneway", label: "One way" },
  { key: "round", label: "Round trip" },
] as const;

export type TripType = (typeof TRIP_TYPES)[number]["key"];

export const CABIN_CLASSES = [
  { key: "economy", label: "Economy", factor: 1 },
  { key: "premium", label: "Premium economy", factor: 1.7 },
  { key: "business", label: "Business", factor: 3.1 },
] as const;

export type CabinClass = (typeof CABIN_CLASSES)[number]["key"];

export function isTripType(value: unknown): value is TripType {
  return value === "oneway" || value === "round";
}

export function isCabinClass(value: unknown): value is CabinClass {
  return value === "economy" || value === "premium" || value === "business";
}

export function cabinLabel(key: CabinClass) {
  return CABIN_CLASSES.find((item) => item.key === key)?.label ?? "Economy";
}

export function airportByCode(code: unknown): Airport | undefined {
  if (typeof code !== "string") return undefined;
  return AIRPORT_MAP.get(code.trim().toUpperCase());
}

export function airportName(airport: Airport) {
  return `${airport.city} (${airport.code})`;
}

/** Local calendar date (yyyy-mm-dd); avoids the UTC offset trap of toISOString. */
export function todayISO(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export function formatFlightDate(iso: string, withYear = true) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function distanceKm(a: Airport, b: Airport) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * earthRadius * Math.asin(Math.sqrt(h)));
}

/** Rough non-stop block time for the great-circle distance. */
export function durationMinutes(km: number) {
  return Math.round((km / 780 + 0.55) * 60);
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function routeType(km: number) {
  if (km < 1500) return "Short-haul";
  if (km < 4500) return "Medium-haul";
  return "Long-haul";
}

export interface FlightQuery {
  trip: TripType;
  from: Airport;
  to: Airport;
  depart: string;
  ret: string;
  adults: number;
  children: number;
  infants: number;
  cabin: CabinClass;
}

export type FlightSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function whole(value: string | string[] | undefined, fallback: number) {
  const number = Number.parseInt(first(value), 10);
  return Number.isFinite(number) ? number : fallback;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string) {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && todayISO(date) === value;
}

/**
 * Validates a public search request. Every value is re-checked here, so the
 * results page and the flight-desk handoff never trust the query string.
 */
export function parseFlightSearch(params: FlightSearchParams, now = new Date()) {
  const errors: string[] = [];
  const from = airportByCode(first(params.from)) ?? AIRPORTS[0];
  const to = airportByCode(first(params.to));

  if (!airportByCode(first(params.from))) errors.push("Choose a departure airport from the list.");
  if (!to) errors.push("Choose a destination airport from the list.");
  if (to && from.code === to.code) errors.push("The departure and destination airports must be different.");

  const trip: TripType = isTripType(first(params.trip)) ? (first(params.trip) as TripType) : "oneway";
  const depart = first(params.depart);
  const ret = first(params.return);
  const today = todayISO(now);
  const horizon = addDaysISO(today, 400);

  if (!depart) errors.push("Choose a departure date.");
  else if (!isRealDate(depart)) errors.push("The departure date is not a valid date.");
  else if (depart < today) errors.push("The departure date cannot be in the past.");
  else if (depart > horizon) errors.push("Searches are open for the next 12 months.");

  let returnDate = "";
  if (trip === "round") {
    if (!ret) errors.push("Choose a return date for a round trip.");
    else if (!isRealDate(ret)) errors.push("The return date is not a valid date.");
    else if (depart && ret <= depart) errors.push("The return date must be after the departure date.");
    else if (ret > horizon) errors.push("Searches are open for the next 12 months.");
    else returnDate = ret;
  }

  const adults = whole(params.adults, 1);
  const children = whole(params.children, 0);
  const infants = whole(params.infants, 0);
  if (adults < 1 || adults > 9) errors.push("Search between 1 and 9 adults.");
  if (children < 0 || children > 8) errors.push("Children must be between 0 and 8.");
  if (infants < 0 || infants > adults) errors.push("There cannot be more infants than adults.");

  const cabin: CabinClass = isCabinClass(first(params.cabin)) ? (first(params.cabin) as CabinClass) : "economy";

  const query: FlightQuery = {
    trip,
    from,
    to: to ?? AIRPORTS[1],
    depart,
    ret: returnDate,
    adults: Math.min(9, Math.max(1, adults)),
    children: Math.min(8, Math.max(0, children)),
    infants: Math.min(4, Math.max(0, infants)),
    cabin,
  };

  return { query, errors };
}

export function flightSearchHref(query: Pick<FlightQuery, "trip" | "depart" | "ret" | "adults" | "children" | "infants" | "cabin"> & { from: Airport | string; to: Airport | string }) {
  const params = new URLSearchParams({
    trip: query.trip,
    from: typeof query.from === "string" ? query.from : query.from.code,
    to: typeof query.to === "string" ? query.to : query.to.code,
    depart: query.depart,
    adults: String(query.adults),
    children: String(query.children),
    infants: String(query.infants),
    cabin: query.cabin,
  });
  if (query.trip === "round" && query.ret) params.set("return", query.ret);
  return `/flights/search?${params.toString()}`;
}

export function passengerSummary(query: Pick<FlightQuery, "adults" | "children" | "infants">) {
  const parts = [`${query.adults} adult${query.adults === 1 ? "" : "s"}`];
  if (query.children) parts.push(`${query.children} child${query.children === 1 ? "" : "ren"}`);
  if (query.infants) parts.push(`${query.infants} infant${query.infants === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

/** Children are assumed at three quarters of an adult fare; infants travel free. */
export function chargeableSeats(query: Pick<FlightQuery, "adults" | "children">) {
  return query.adults + query.children * 0.75;
}

export function roundToHundred(value: number) {
  return Math.round(value / 100) * 100;
}

export interface FareBand {
  cabin: CabinClass;
  label: string;
  perPersonLow: number;
  perPersonHigh: number;
  totalLow: number;
  totalHigh: number;
}

/**
 * Indicative fare bands for the route. These are planning estimates built from
 * the great-circle distance, cabin and trip type — the desk confirms the real
 * fare against live inventory before anything is ticketed.
 */
export function fareBands(query: FlightQuery): FareBand[] {
  const km = distanceKm(query.from, query.to);
  const oneWay = 9000 + km * 7.5;
  const tripFactor = query.trip === "round" ? 1.8 : 1;
  const seats = chargeableSeats(query);

  return CABIN_CLASSES.map((cabin) => {
    const base = oneWay * tripFactor * cabin.factor;
    const perPersonLow = roundToHundred(base * 0.88);
    const perPersonHigh = roundToHundred(base * 1.18);
    return {
      cabin: cabin.key,
      label: cabin.label,
      perPersonLow,
      perPersonHigh,
      totalLow: roundToHundred(perPersonLow * seats),
      totalHigh: roundToHundred(perPersonHigh * seats),
    };
  });
}

export function selectedBand(query: FlightQuery) {
  return fareBands(query).find((band) => band.cabin === query.cabin) ?? fareBands(query)[0];
}

/** Nearby departure options for the "other airports" suggestion strip. */
export function nearbyAirports(airport: Airport, limit = 4) {
  return AIRPORTS.filter((item) => item.code !== airport.code)
    .map((item) => ({ airport: item, km: distanceKm(airport, item) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);
}

export function flightReference(prefix = "FL") {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = Math.random().toString(36).toUpperCase().slice(2, 4);
  return `${prefix}-${stamp}${random}`;
}
