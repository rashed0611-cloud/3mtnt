"use server";

import { getPublicDatabase } from "@/lib/db/public";
import { getRepository } from "@/lib/db";
import { flightReference, formatFlightDate } from "@/lib/flights";
import { formatMoney } from "@/lib/utils";

export interface PlanSuggestion {
  title: string;
  slug: string;
  destination: string;
  days: number;
  price: number;
}

export interface PlanState {
  ok?: boolean;
  reference?: string;
  name?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
  suggestions?: PlanSuggestion[];
}

const SERVICES: Record<string, string> = {
  holiday: "Holiday",
  flight: "Flight",
  hotel: "Hotel",
  visa: "Visa",
  pilgrimage: "Hajj & Umrah",
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createPlanAction(_prev: PlanState, formData: FormData): Promise<PlanState> {
  if (text(formData, "website")) {
    return { ok: true, name: text(formData, "name") || "traveller", reference: flightReference("PL") };
  }

  const name = text(formData, "name");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const serviceKey = text(formData, "service") || "holiday";
  const service = SERVICES[serviceKey] ?? "Holiday";
  const destination = text(formData, "destination").slice(0, 80);
  const month = text(formData, "month");
  const travellers = Math.max(1, Math.min(20, Number.parseInt(text(formData, "travellers"), 10) || 2));
  const budget = Number.parseInt(text(formData, "budget").replace(/[^\d]/g, ""), 10) || 0;
  const notes = text(formData, "notes").slice(0, 700);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (phone.replace(/\D/g, "").length < 6) fieldErrors.phone = "Enter a phone or WhatsApp number.";
  if (!destination && !notes) fieldErrors.destination = "Tell us where you would like to go, or describe the trip.";
  if (month && !/^\d{4}-\d{2}$/.test(month)) fieldErrors.month = "Choose a travel month.";
  if (Object.keys(fieldErrors).length) {
    return { error: "Please check the highlighted fields and try again.", fieldErrors };
  }

  const db = await getPublicDatabase();
  const destinationTerm = destination.toLowerCase();
  const suggestions = db.tours
    .filter((tour) => tour.status === "active")
    .map((tour) => ({
      title: tour.title,
      slug: tour.slug,
      destination: tour.destination,
      days: tour.durationDays,
      price: tour.adultPrice,
      score:
        (destinationTerm && tour.destination.toLowerCase().includes(destinationTerm) ? 100 : 0) +
        (destinationTerm && tour.title.toLowerCase().includes(destinationTerm) ? 40 : 0) +
        (budget && tour.adultPrice <= budget * 1.25 ? 30 : 0) +
        (tour.featured ? 10 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.price - b.price)
    .slice(0, 3)
    .map(({ score: _score, ...tour }) => tour);

  const reference = flightReference("PL");
  const monthLabel = month ? formatFlightDate(`${month}-01`, false).replace(/^\w+,?\s*/, "") : "Flexible dates";
  const requirement = `AI planner · ${service} · ${destination || "Open destination"} · ${monthLabel} · ${travellers} ${
    travellers === 1 ? "traveller" : "travellers"
  }${budget ? ` · budget ${formatMoney(budget, "BDT", 0)} per person` : ""}`;
  const notesText = [
    `Reference: ${reference}`,
    `Planner request: ${service}. Destination: ${destination || "not decided"}. Travel month: ${monthLabel}. Travellers: ${travellers}.${
      budget ? ` Budget: ${formatMoney(budget, "BDT", 0)} per person.` : ""
    }`,
    suggestions.length
      ? `Suggested packages shown to the traveller: ${suggestions
          .map((tour) => `${tour.title} (${tour.destination}, ${tour.days} days, from ${formatMoney(tour.price, "BDT", 0)})`)
          .join("; ")}.`
      : "No matching package was shown; the desk should build a custom draft.",
    notes ? `Traveller note: ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await getRepository().createLead({
      name,
      phone,
      email,
      source: "website",
      requirement,
      assignedTo: "Travel desk",
      priority: "high",
      tags: ["Website enquiry", "AI planner", service],
      status: "new",
      estimatedValue: budget ? budget * travellers : 0,
      notes: notesText,
      nextFollowUp: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      lastContact: new Date().toISOString().slice(0, 10),
    });
  } catch {
    return { error: "We couldn't save your plan just now. Please email the travel desk and we will pick it up." };
  }

  return { ok: true, reference, name: name.split(/\s+/)[0], suggestions };
}
