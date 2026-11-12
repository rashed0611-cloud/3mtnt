"use server";

import { getRepository } from "@/lib/db";
import {
  TRIP_TYPES,
  cabinLabel,
  distanceKm,
  durationMinutes,
  flightReference,
  flightSearchHref,
  formatDuration,
  formatFlightDate,
  parseFlightSearch,
  passengerSummary,
  selectedBand,
} from "@/lib/flights";
import { formatMoney } from "@/lib/utils";

export interface FlightQuoteState {
  ok?: boolean;
  reference?: string;
  name?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const SEARCH_FIELDS = ["trip", "from", "to", "depart", "return", "adults", "children", "infants", "cabin"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Hands a public flight search to the flight desk. No account is required: the
 * visitor only supplies contact details, and the search itself is re-validated
 * from hidden fields so the CRM record always matches a real, current request.
 */
export async function requestFlightQuoteAction(_prev: FlightQuoteState, formData: FormData): Promise<FlightQuoteState> {
  // Honeypot: real visitors never fill this hidden field.
  if (text(formData, "website")) {
    return { ok: true, name: text(formData, "name") || "traveller", reference: flightReference() };
  }

  const name = text(formData, "name");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const message = text(formData, "message").slice(0, 600);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (phone.replace(/\D/g, "").length < 6) fieldErrors.phone = "Enter a phone or WhatsApp number.";
  if (Object.keys(fieldErrors).length) {
    return { error: "Please check the highlighted fields and try again.", fieldErrors };
  }

  const search = Object.fromEntries(SEARCH_FIELDS.map((key) => [key, text(formData, key)]));
  const { query, errors } = parseFlightSearch(search);
  if (errors.length) {
    return { error: "That flight search is no longer valid. Please run the search again so we quote the right route." };
  }

  const band = selectedBand(query);
  const tripLabel = TRIP_TYPES.find((item) => item.key === query.trip)?.label ?? "One way";
  const route = `${query.from.city} (${query.from.code}) → ${query.to.city} (${query.to.code})`;
  const dates =
    query.trip === "round"
      ? `${formatFlightDate(query.depart)} – ${formatFlightDate(query.ret)}`
      : formatFlightDate(query.depart);
  const km = distanceKm(query.from, query.to);
  const cabin = cabinLabel(query.cabin);

  const reference = flightReference();
  const requirement = `Flight search · ${tripLabel} · ${route} · ${dates} · ${passengerSummary(query)} · ${cabin}`;
  const notes = [
    `Reference: ${reference}`,
    `Indicative ${cabin.toLowerCase()} band shown on the website: ${formatMoney(band.perPersonLow, "BDT", 0)}–${formatMoney(band.perPersonHigh, "BDT", 0)} per traveller; party total ${formatMoney(band.totalLow, "BDT", 0)}–${formatMoney(band.totalHigh, "BDT", 0)}.`,
    `Route distance ${km.toLocaleString("en-US")} km, about ${formatDuration(durationMinutes(km))} non-stop.`,
    message ? `Visitor note: ${message}` : "",
    `Repeat this search: ${flightSearchHref(query)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const daysUntilDeparture = Math.round(
    (new Date(`${query.depart}T00:00:00`).getTime() - Date.now()) / 86_400_000,
  );

  try {
    await getRepository().createLead({
      name,
      phone,
      email,
      source: "website",
      requirement,
      assignedTo: "Flight desk",
      priority: daysUntilDeparture <= 14 ? "high" : "medium",
      tags: ["Website enquiry", "Flight search"],
      status: "new",
      estimatedValue: band.totalLow,
      notes,
      nextFollowUp: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      lastContact: new Date().toISOString().slice(0, 10),
    });
  } catch {
    return { error: "We couldn't pass this search to the flight desk just now. Please email us and we will pick it up." };
  }

  return { ok: true, reference, name: name.split(/\s+/)[0] };
}
