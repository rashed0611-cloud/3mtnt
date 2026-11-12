import { DEFAULT_BODY_FONT, DEFAULT_HEADING_FONT, isFontKey } from "@/lib/fonts";
import { normalizeHex } from "@/lib/theme";
import type { AppSettings, GalleryImage, HomepageContent, SiteAppearance, SiteSections } from "@/lib/types";

export const DEFAULT_HOMEPAGE: HomepageContent = {
  eyebrow: "Trusted travel planning, end to end",
  headline: "Discover the",
  highlight: "Extraordinary",
  subtitle:
    "Curated holidays, flight fares, hotel stays, visa files and pilgrimage packages — planned by the same Dhaka team that sees your booking through to the return flight.",
  primaryLabel: "Explore holidays",
  primaryHref: "/tours",
  secondaryLabel: "Plan with AI",
  secondaryHref: "/plan",
  galleryTitle: "Moments from the road",
  gallerySubtitle: "A look at the places, stays and people behind recent 3M journeys.",
};

export const DEFAULT_SECTIONS: SiteSections = {
  offers: true,
  featuredTours: true,
  services: true,
  destinations: true,
  gallery: true,
  pilgrimage: true,
  visas: true,
  testimonials: true,
  tips: true,
  stats: true,
  cta: true,
};

export const DEFAULT_APPEARANCE: SiteAppearance = {
  brand: {
    logoUrl: "",
    faviconUrl: "",
    logoTagline: "& Travels",
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    whatsapp: "",
  },
  colors: {
    primary: "#0b74de",
    accent: "#06b6d4",
    page: "#f5f7fb",
    text: "#172033",
    footer: "#0d1b2e",
  },
  typography: {
    headingFont: DEFAULT_HEADING_FONT,
    bodyFont: DEFAULT_BODY_FONT,
    headingWeight: 700,
    radius: 16,
  },
  banner: {
    imageUrl: "",
    overlay: 55,
    align: "left",
    height: "standard",
    showSearch: true,
  },
  announcement: {
    enabled: false,
    text: "Book your winter escape — early-bird fares are open now.",
    linkLabel: "View tours",
    linkHref: "/tours",
    tone: "brand",
  },
  sections: DEFAULT_SECTIONS,
  seo: {
    title: "3M Tours & Travels — Holidays, flights, hotels and pilgrimage",
    description:
      "Search holidays, flights, hotel stays, visa services and Hajj & Umrah packages from 3M Tours & Travels. Transparent BDT pricing, confirmed by a real Dhaka travel desk.",
    ogImageUrl: "",
  },
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
  appearance: DEFAULT_APPEARANCE,
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

function bool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function safeLink(value: unknown, fallback: string) {
  const link = String(value ?? "").trim();
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (/^https?:\/\//i.test(link)) return link;
  return fallback;
}

function safeImage(value: unknown) {
  return safeLink(value, "");
}

function weight(value: unknown) {
  const number = Math.round(clamp(value, 500, 900, DEFAULT_APPEARANCE.typography.headingWeight) / 100) * 100;
  return Math.min(800, Math.max(500, number));
}

export function normalizeAppearance(value: Partial<SiteAppearance> | null | undefined): SiteAppearance {
  const source = value && typeof value === "object" ? value : {};
  const brand = { ...DEFAULT_APPEARANCE.brand, ...(source.brand ?? {}) };
  const colors = { ...DEFAULT_APPEARANCE.colors, ...(source.colors ?? {}) };
  const typography = { ...DEFAULT_APPEARANCE.typography, ...(source.typography ?? {}) };
  const banner = { ...DEFAULT_APPEARANCE.banner, ...(source.banner ?? {}) };
  const announcement = { ...DEFAULT_APPEARANCE.announcement, ...(source.announcement ?? {}) };
  const sections = { ...DEFAULT_APPEARANCE.sections, ...(source.sections ?? {}) };
  const seo = { ...DEFAULT_APPEARANCE.seo, ...(source.seo ?? {}) };

  return {
    brand: {
      logoUrl: safeImage(brand.logoUrl),
      faviconUrl: safeImage(brand.faviconUrl),
      logoTagline: String(brand.logoTagline ?? "").slice(0, 40),
      facebook: safeLink(brand.facebook, ""),
      instagram: safeLink(brand.instagram, ""),
      youtube: safeLink(brand.youtube, ""),
      linkedin: safeLink(brand.linkedin, ""),
      whatsapp: safeLink(brand.whatsapp, ""),
    },
    colors: {
      primary: normalizeHex(colors.primary, DEFAULT_APPEARANCE.colors.primary),
      accent: normalizeHex(colors.accent, DEFAULT_APPEARANCE.colors.accent),
      page: normalizeHex(colors.page, DEFAULT_APPEARANCE.colors.page),
      text: normalizeHex(colors.text, DEFAULT_APPEARANCE.colors.text),
      footer: normalizeHex(colors.footer, DEFAULT_APPEARANCE.colors.footer),
    },
    typography: {
      headingFont: isFontKey(typography.headingFont) ? typography.headingFont : DEFAULT_APPEARANCE.typography.headingFont,
      bodyFont: isFontKey(typography.bodyFont) ? typography.bodyFont : DEFAULT_APPEARANCE.typography.bodyFont,
      headingWeight: weight(typography.headingWeight),
      radius: Math.round(clamp(typography.radius, 0, 28, DEFAULT_APPEARANCE.typography.radius)),
    },
    banner: {
      imageUrl: safeImage(banner.imageUrl),
      overlay: Math.round(clamp(banner.overlay, 0, 85, DEFAULT_APPEARANCE.banner.overlay)),
      align: banner.align === "center" ? "center" : "left",
      height: banner.height === "compact" || banner.height === "tall" ? banner.height : "standard",
      showSearch: bool(banner.showSearch, DEFAULT_APPEARANCE.banner.showSearch),
    },
    announcement: {
      enabled: bool(announcement.enabled, false),
      text: String(announcement.text ?? "").slice(0, 160),
      linkLabel: String(announcement.linkLabel ?? "").slice(0, 40),
      linkHref: safeLink(announcement.linkHref, DEFAULT_APPEARANCE.announcement.linkHref),
      tone: announcement.tone === "dark" || announcement.tone === "light" ? announcement.tone : "brand",
    },
    sections: {
      offers: bool(sections.offers, true),
      featuredTours: bool(sections.featuredTours, true),
      services: bool(sections.services, true),
      destinations: bool(sections.destinations, true),
      gallery: bool(sections.gallery, true),
      pilgrimage: bool(sections.pilgrimage, true),
      visas: bool(sections.visas, true),
      testimonials: bool(sections.testimonials, true),
      tips: bool(sections.tips, true),
      stats: bool(sections.stats, true),
      cta: bool(sections.cta, true),
    },
    seo: {
      title: String(seo.title ?? "").slice(0, 70),
      description: String(seo.description ?? "").slice(0, 180),
      ogImageUrl: safeImage(seo.ogImageUrl),
    },
  };
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
    appearance: normalizeAppearance(settings.appearance),
  };
}
