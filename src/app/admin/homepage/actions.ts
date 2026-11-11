"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { uploadGalleryImage } from "@/lib/gallery-upload";
import type { GalleryImage, HomepageContent } from "@/lib/types";
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

export async function updateHomepageAction(_prev: HomepageState, formData: FormData): Promise<HomepageState> {
  await requireModuleAccess("settings", "write");

  const headline = toText(formData.get("headline"));
  const eyebrow = toText(formData.get("eyebrow"));
  const highlight = toText(formData.get("highlight"));
  const subtitle = toText(formData.get("subtitle"));
  const galleryTitle = toText(formData.get("galleryTitle"));
  const gallerySubtitle = toText(formData.get("gallerySubtitle"));
  const primaryLabel = toText(formData.get("primaryLabel")) || "Browse tours";
  const secondaryLabel = toText(formData.get("secondaryLabel")) || "Talk to a specialist";

  const fieldErrors: Record<string, string> = {};
  if (headline.length < 3) fieldErrors.headline = "Add a headline of at least 3 characters.";
  if (subtitle.length < 10) fieldErrors.subtitle = "Add a short introduction for visitors.";

  const homepage: HomepageContent = {
    eyebrow,
    headline,
    highlight,
    subtitle,
    primaryLabel,
    primaryHref: safeLink(toText(formData.get("primaryHref")), "/tours"),
    secondaryLabel,
    secondaryHref: safeLink(toText(formData.get("secondaryHref")), "/contact"),
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

  const files = formData
    .getAll("galleryFiles")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    for (const file of files) {
      const url = await uploadGalleryImage(file);
      gallery.push({ id: crypto.randomUUID(), url, caption: "", alt: "" });
    }

    await getRepository().updateSettings({ homepage, gallery });
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    revalidatePath("/admin");
    return {
      message:
        files.length > 0
          ? `Front page saved and ${files.length} image${files.length === 1 ? "" : "s"} uploaded.`
          : "Front page saved. The public site is updated.",
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the front page." };
  }
}
