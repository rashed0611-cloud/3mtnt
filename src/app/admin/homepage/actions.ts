"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { uploadSiteImage, type SiteMediaFolder } from "@/lib/gallery-upload";
import { DEFAULT_APPEARANCE } from "@/lib/settings-defaults";
import type { GalleryImage, HomepageContent, SiteAnnouncement, SiteAppearance, SiteSections } from "@/lib/types";
import { isHexColor } from "@/lib/theme";
import { toText } from "@/lib/utils";

export interface HomepageState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

function safeLink(value: string, fallback: string) {
  const href = value.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return fallback;
}

function safeMedia(value: string) {
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return "";
}

function bool(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true" || formData.get(name) === "1";
}

function clampedNumber(value: FormDataEntryValue | null, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(Math.min(max, Math.max(min, number)));
}

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export async function updateHomepageAction(_prev: HomepageState, formData: FormData): Promise<HomepageState> {
  await requireModuleAccess("settings", "write");

  const headline = toText(formData.get("headline"));
  const eyebrow = toText(formData.get("eyebrow"));
  const highlight = toText(formData.get("highlight"));
  const subtitle = toText(formData.get("subtitle"));
  const galleryTitle = toText(formData.get("galleryTitle"));
  const gallerySubtitle = toText(formData.get("gallerySubtitle"));

  const fieldErrors: Record<string, string> = {};
  if (headline.length < 3) fieldErrors.headline = "Add a headline of at least 3 characters.";
  if (subtitle.length < 10) fieldErrors.subtitle = "Add a short introduction for visitors.";

  const colorFields: [string, string][] = [
    ["primary", "Brand colour"],
    ["accent", "Accent colour"],
    ["page", "Page background"],
    ["text", "Text colour"],
    ["footer", "Footer background"],
  ];
  for (const [name, label] of colorFields) {
    if (!isHexColor(toText(formData.get(`color_${name}`)))) {
      fieldErrors[`color_${name}`] = `${label} must be a hex value such as #0b74de.`;
    }
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const homepage: HomepageContent = {
    eyebrow,
    headline,
    highlight,
    subtitle,
    primaryLabel: toText(formData.get("primaryLabel")) || "Explore holidays",
    primaryHref: safeLink(toText(formData.get("primaryHref")), "/tours"),
    secondaryLabel: toText(formData.get("secondaryLabel")) || "Plan with AI",
    secondaryHref: safeLink(toText(formData.get("secondaryHref")), "/plan"),
    galleryTitle: galleryTitle || "Moments from the road",
    gallerySubtitle,
  };

  const ids = formData.getAll("galleryId").map(String);
  const urls = formData.getAll("galleryUrl").map(String);
  const captions = formData.getAll("galleryCaption").map(String);
  const alts = formData.getAll("galleryAlt").map(String);

  const gallery: GalleryImage[] = urls
    .map((url, index) => ({
      id: ids[index]?.trim() || crypto.randomUUID(),
      url: safeLink(url, ""),
      caption: captions[index]?.trim() ?? "",
      alt: alts[index]?.trim() ?? captions[index]?.trim() ?? "",
    }))
    .filter((image) => image.url.length > 0);

  const sections: SiteSections = {
    partners: bool(formData, "section_partners"),
    offers: bool(formData, "section_offers"),
    featuredTours: bool(formData, "section_featuredTours"),
    services: bool(formData, "section_services"),
    destinations: bool(formData, "section_destinations"),
    gallery: bool(formData, "section_gallery"),
    pilgrimage: bool(formData, "section_pilgrimage"),
    visas: bool(formData, "section_visas"),
    testimonials: bool(formData, "section_testimonials"),
    tips: bool(formData, "section_tips"),
    stats: bool(formData, "section_stats"),
    cta: bool(formData, "section_cta"),
  };

  const tone = toText(formData.get("announcementTone"));
  const announcement: SiteAnnouncement = {
    enabled: bool(formData, "announcementEnabled"),
    text: toText(formData.get("announcementText")).slice(0, 160),
    linkLabel: toText(formData.get("announcementLinkLabel")).slice(0, 40),
    linkHref: safeLink(toText(formData.get("announcementLinkHref")), "/tours"),
    tone: tone === "dark" || tone === "light" ? tone : "brand",
  };

  const appearance: SiteAppearance = {
    ...DEFAULT_APPEARANCE,
    brand: {
      ...DEFAULT_APPEARANCE.brand,
      logoUrl: safeMedia(toText(formData.get("logoUrl"))),
      faviconUrl: safeMedia(toText(formData.get("faviconUrl"))),
      logoTagline: toText(formData.get("logoTagline")).slice(0, 40),
      facebook: safeLink(toText(formData.get("facebook")), ""),
      instagram: safeLink(toText(formData.get("instagram")), ""),
      youtube: safeLink(toText(formData.get("youtube")), ""),
      linkedin: safeLink(toText(formData.get("linkedin")), ""),
      whatsapp: safeLink(toText(formData.get("whatsapp")), ""),
    },
    colors: {
      primary: toText(formData.get("color_primary")),
      accent: toText(formData.get("color_accent")),
      page: toText(formData.get("color_page")),
      text: toText(formData.get("color_text")),
      footer: toText(formData.get("color_footer")),
    },
    typography: {
      headingFont: toText(formData.get("headingFont")),
      bodyFont: toText(formData.get("bodyFont")),
      headingWeight: clampedNumber(formData.get("headingWeight"), 500, 800, 700),
      radius: clampedNumber(formData.get("radius"), 0, 28, 16),
    },
    banner: {
      imageUrl: safeMedia(toText(formData.get("bannerUrl"))),
      overlay: clampedNumber(formData.get("bannerOverlay"), 0, 85, 55),
      align: toText(formData.get("bannerAlign")) === "center" ? "center" : "left",
      height:
        toText(formData.get("bannerHeight")) === "compact"
          ? "compact"
          : toText(formData.get("bannerHeight")) === "tall"
            ? "tall"
            : "standard",
      showSearch: bool(formData, "bannerShowSearch"),
    },
    announcement,
    sections,
    seo: {
      title: toText(formData.get("seoTitle")).slice(0, 70),
      description: toText(formData.get("seoDescription")).slice(0, 180),
      ogImageUrl: safeMedia(toText(formData.get("ogImageUrl"))),
    },
  };

  const fileInputs: { name: string; folder: SiteMediaFolder; apply: (url: string) => void }[] = [
    {
      name: "logoFile",
      folder: "brand",
      apply: (url) => {
        appearance.brand.logoUrl = url;
      },
    },
    {
      name: "faviconFile",
      folder: "brand",
      apply: (url) => {
        appearance.brand.faviconUrl = url;
      },
    },
    {
      name: "bannerFile",
      folder: "banner",
      apply: (url) => {
        appearance.banner.imageUrl = url;
      },
    },
    {
      name: "ogImageFile",
      folder: "seo",
      apply: (url) => {
        appearance.seo.ogImageUrl = url;
      },
    },
  ];

  try {
    let uploads = 0;
    for (const input of fileInputs) {
      const file = formData.get(input.name);
      if (isFile(file)) {
        input.apply(await uploadSiteImage(file, input.folder));
        uploads += 1;
      }
    }

    const files = formData
      .getAll("galleryFiles")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    for (const file of files) {
      const url = await uploadSiteImage(file, "gallery");
      gallery.push({ id: crypto.randomUUID(), url, caption: "", alt: "" });
    }

    await getRepository().updateSettings({ homepage, gallery, appearance });
    revalidatePath("/", "layout");
    revalidatePath("/admin/homepage");
    revalidatePath("/admin");

    const uploaded = uploads + files.length;
    return {
      message:
        uploaded > 0
          ? `Website saved and ${uploaded} image${uploaded === 1 ? "" : "s"} uploaded. The public site is updated.`
          : "Website saved. The public site is updated.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the website." };
  }
}
