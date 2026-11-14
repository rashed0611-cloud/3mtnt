import type { CSSProperties } from "react";
import { hexToRgbTriplet, isHexColor, shade } from "@/lib/theme";
import type { SitePageKey, SitePageSettings } from "@/lib/types";

export interface SitePageDefinition {
  key: SitePageKey;
  label: string;
  path: string;
  /** Trail label shown after "Home /". */
  breadcrumb: string;
  description: string;
  /** Built-in badge text. Empty means the page shows its own live counts. */
  eyebrow: string;
  heading: string;
  subtitle: string;
}

/**
 * Top-level storefront pages whose banner, heading and accent colour can be
 * changed from the admin Pages screen. Detail pages are driven by their
 * catalogue record instead.
 */
export const SITE_PAGES: SitePageDefinition[] = [
  {
    key: "tours",
    label: "Tours",
    path: "/tours",
    breadcrumb: "Holidays",
    description: "The holiday listing with search, filters and package cards.",
    eyebrow: "",
    heading: "Holidays",
    subtitle:
      "Group departures, private itineraries and family holidays — priced transparently and operated by our own travel desk.",
  },
  {
    key: "hotels",
    label: "Hotels",
    path: "/hotels",
    breadcrumb: "Hotels",
    description: "The hotel listing with stay filters and nightly rates.",
    eyebrow: "",
    heading: "Hotels",
    subtitle:
      "City stays, beach resorts and family-friendly properties — checked by our operations team and bookable with transfers.",
  },
  {
    key: "visas",
    label: "Visa",
    path: "/visas",
    breadcrumb: "Visa",
    description: "Visa products, fees and processing times.",
    eyebrow: "",
    heading: "Visa",
    subtitle:
      "Clear requirements, realistic processing windows and a document checklist for every application. We prepare, check and track the file from submission to decision.",
  },
  {
    key: "hajj",
    label: "Hajj & Umrah",
    path: "/hajj-umrah",
    breadcrumb: "Hajj & Umrah",
    description: "Pilgrimage packages with departures and seat availability.",
    eyebrow: "",
    heading: "Hajj & Umrah, with a team beside you",
    subtitle:
      "Group leaders, hotels close to the Haram, document readiness and clear payment milestones. We stay with your family from the first briefing to the return flight.",
  },
  {
    key: "flights",
    label: "Flights",
    path: "/flights",
    breadcrumb: "Flights",
    description: "Flight search, fare bands and the quote request form.",
    eyebrow: "Flight desk · economy to business",
    heading: "Flights, planned properly",
    subtitle:
      "Search one-way, round-trip or multi-city flights for an indicative fare band, then let the same operations team that handles your holiday, hotel or visa file confirm live options.",
  },
  {
    key: "flightSearch",
    label: "Flight search",
    path: "/flights/search",
    breadcrumb: "Flight search",
    description: "The flight search form, fare bands and quote request.",
    eyebrow: "One-way, round trip or multi-city · open to everyone",
    heading: "Search flights",
    subtitle:
      "Pick one route, add a return, or build a multi-city itinerary. See an indicative fare band straight away, then send the search to our flight desk for live options. No account, no payment and no obligation.",
  },
  {
    key: "contact",
    label: "Contact",
    path: "/contact",
    breadcrumb: "Contact",
    description: "The enquiry form and direct contact details.",
    eyebrow: "No obligation quote",
    heading: "Tell us where you want to go",
    subtitle:
      "Share a few details and a named travel specialist will reply with availability, options and a clear, itemised quote — usually within one business day.",
  },
  {
    key: "plan",
    label: "Plan with AI",
    path: "/plan",
    breadcrumb: "Plan with AI",
    description: "The guided trip planner and its form.",
    eyebrow: "Guided travel planner",
    heading: "Describe the trip. Get a plan a specialist has checked.",
    subtitle:
      "Our planner pairs your preferences with the holidays, flights, hotels, visa products and pilgrimage packages the desk can confirm right now. It creates a file for a named specialist — so you get a considered answer, not a generic auto-reply.",
  },
  {
    key: "portal",
    label: "Customer portal",
    path: "/portal",
    breadcrumb: "Customer portal",
    description: "The customer portal preview page.",
    eyebrow: "Portal preview",
    heading: "Your trip, in one place.",
    subtitle:
      "The customer portal is being prepared. Soon you'll be able to sign in to view bookings, documents, invoices and payment milestones without calling the office.",
  },
];

export const DETAIL_PAGES = [
  {
    label: "Tour detail",
    path: "/tours/[slug]",
    editor: "/admin/tours",
    note: "Banner and photo strip come from the tour package images.",
  },
  {
    label: "Hotel detail",
    path: "/hotels/[slug]",
    editor: "/admin/hotels",
    note: "Banner and photo strip come from the hotel package images.",
  },
  {
    label: "Visa detail",
    path: "/visas/[id]",
    editor: "/admin/visas",
    note: "Hero banner and photo strip come from the visa package images.",
  },
  {
    label: "Hajj package detail",
    path: "/hajj-umrah/[id]",
    editor: "/admin/hajj-umrah/packages",
    note: "Hero banner and photo strip come from the Hajj package images.",
  },
] as const;

export function isSitePageKey(value: unknown): value is SitePageKey {
  return typeof value === "string" && SITE_PAGES.some((page) => page.key === value);
}

export function sitePageDefinition(key: SitePageKey): SitePageDefinition {
  return SITE_PAGES.find((page) => page.key === key) ?? SITE_PAGES[0];
}

/** Saved copy, falling back to the built-in text when a field is blank. */
export function pageContent(key: SitePageKey, page: SitePageSettings) {
  const definition = sitePageDefinition(key);
  return {
    eyebrow: page.eyebrow.trim() || definition.eyebrow,
    heading: page.heading.trim() || definition.heading,
    subtitle: page.subtitle.trim() || definition.subtitle,
  };
}

export function hasPageBanner(page: SitePageSettings) {
  return Boolean(page.banner.imageUrl.trim());
}

/**
 * Per-page accent colour. An empty value means "use the site brand colour",
 * which the layout already provides.
 */
export function pageAccentStyle(page: SitePageSettings): CSSProperties | undefined {
  if (!isHexColor(page.accent)) return undefined;
  const accent = page.accent.trim().toLowerCase();
  return {
    "--primary": accent,
    "--primary-rgb": hexToRgbTriplet(accent),
    "--primary-strong": shade(accent, -18),
    "--primary-strong-rgb": hexToRgbTriplet(shade(accent, -18)),
  } as CSSProperties;
}
