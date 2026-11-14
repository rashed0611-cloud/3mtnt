"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { uploadSiteImage } from "@/lib/gallery-upload";
import { isSitePageKey, sitePageDefinition } from "@/lib/site-pages";
import { isHexColor, normalizeHex } from "@/lib/theme";
import type { SitePageSettings } from "@/lib/types";
import { toText } from "@/lib/utils";

export interface PageSettingsState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

function safeMedia(value: string) {
  const url = value.trim();
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return "";
}

function clampNumber(value: FormDataEntryValue | null, min: number, max: number, fallback: number) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.round(Math.min(max, Math.max(min, number)));
}

export async function updatePageAction(_prev: PageSettingsState, formData: FormData): Promise<PageSettingsState> {
  await requireModuleAccess("settings", "write");

  const key = toText(formData.get("page"));
  if (!isSitePageKey(key)) return { error: "That page cannot be edited from here." };
  const definition = sitePageDefinition(key);

  const heading = toText(formData.get("heading"));
  const subtitle = toText(formData.get("subtitle"));
  const eyebrow = toText(formData.get("eyebrow")).slice(0, 80);
  const accentRaw = toText(formData.get("accent"));

  const fieldErrors: Record<string, string> = {};
  if (heading.length < 3) fieldErrors.heading = "Add a heading of at least 3 characters.";
  if (subtitle.length < 10) fieldErrors.subtitle = "Add a short introduction for visitors.";
  if (accentRaw && !isHexColor(accentRaw)) fieldErrors.accent = "Use a hex colour such as #0b74de, or leave it empty.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    const settings = await getRepository().getSettings();
    let imageUrl = safeMedia(toText(formData.get("bannerUrl")));

    const file = formData.get("bannerFile");
    if (file instanceof File && file.size > 0) {
      imageUrl = await uploadSiteImage(file, "banner");
    }

    const page: SitePageSettings = {
      banner: {
        imageUrl,
        overlay: clampNumber(formData.get("overlay"), 0, 85, 55),
      },
      eyebrow,
      heading,
      subtitle,
      accent: accentRaw ? normalizeHex(accentRaw, "") : "",
    };

    await getRepository().updateSettings({ pages: { ...settings.pages, [key]: page } });

    revalidatePath("/", "layout");
    revalidatePath(definition.path);
    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${key}/edit`);

    return { message: `${definition.label} updated. The public page is live.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save this page." };
  }
}
