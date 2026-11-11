import type { AppSettings, GalleryImage, HomepageContent } from "@/lib/types";

export const DEFAULT_HOMEPAGE: HomepageContent = {
  eyebrow: "Original journeys, thoughtfully operated",
  headline: "Go further. Plan lighter.",
  highlight: "Travel better.",
  subtitle:
    "3M Tours & Travels designs tours, hotel stays, visa files and pilgrimage packages with the same operations team behind every booking — so the plan you approve is the trip you take.",
  primaryLabel: "Browse tour packages",
  primaryHref: "/tours",
  secondaryLabel: "Talk to a specialist",
  secondaryHref: "/contact",
  galleryTitle: "Moments from the road",
  gallerySubtitle: "A look at the places, stays and people behind recent 3M journeys.",
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  siteName: "3M Tours & Travels ERP",
  tagline: "Travel operations, without the spreadsheets.",
  legalName: "3M Tours & Travels Ltd.",
  email: "hello@3mtnt.com",
  phone: "+880 1711 000 000",
  address: "House 12, Road 7, Banani, Dhaka 1213, Bangladesh",
  defaultCurrency: "BDT",
  timezone: "Asia/Dhaka",
  invoicePrefix: "INV",
  taxRate: 5,
  logoText: "3M",
  tourDefaultStatus: "active",
  tourCancellationDays: 7,
  tourDepositPercent: 30,
  homepage: DEFAULT_HOMEPAGE,
  gallery: [],
};

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

export function normalizeHomepage(value: Partial<HomepageContent> | null | undefined): HomepageContent {
  return {
    ...DEFAULT_HOMEPAGE,
    ...(value && typeof value === "object" ? value : {}),
  };
}

export function normalizeGallery(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item, index) => ({
      id: String(item.id ?? `gallery-${index + 1}`),
      url: String(item.url ?? "").trim(),
      caption: String(item.caption ?? "").trim(),
      alt: String(item.alt ?? "").trim(),
    }))
    .filter((item) => item.url.length > 0);
}

export function normalizeSettings(value: Partial<AppSettings> | null | undefined): AppSettings {
  const settings = value ?? {};
  return {
    ...DEFAULT_APP_SETTINGS,
    ...settings,
    tourDefaultStatus: settings.tourDefaultStatus === "draft" ? "draft" : "active",
    tourCancellationDays: Math.round(clamp(settings.tourCancellationDays, 0, 365, DEFAULT_APP_SETTINGS.tourCancellationDays)),
    tourDepositPercent: Math.round(clamp(settings.tourDepositPercent, 0, 100, DEFAULT_APP_SETTINGS.tourDepositPercent)),
    homepage: normalizeHomepage(settings.homepage),
    gallery: normalizeGallery(settings.gallery),
  };
}
