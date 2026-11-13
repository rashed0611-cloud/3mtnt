"use server";

import { revalidatePath } from "next/cache";
import { requireModuleAccess } from "@/lib/auth";
import { uploadSiteImage } from "@/lib/gallery-upload";
import {
  copyMediaToProduct,
  deleteMediaObject,
  isCatalogKind,
  MEDIA_MODULES,
  removeCatalogCover,
  removeProductImage,
  uploadCatalogCover,
  uploadProductImages,
  type CatalogKind,
} from "@/lib/media";
import type { ModuleKey } from "@/lib/access";

export interface MediaActionState {
  ok?: boolean;
  error?: string;
  url?: string;
  stamp?: number;
  message?: string;
}

const MODULE_FOR_KIND: Record<CatalogKind, ModuleKey> = {
  tour: "tours",
  hotel: "hotels",
  visa: "visas",
  hajj: "hajj",
};

/** Media editors are staff who can change catalogue content or the website. */
const PUBLIC_PATHS: Record<CatalogKind, string[]> = {
  tour: ["/", "/tours"],
  hotel: ["/", "/hotels"],
  visa: ["/", "/visas"],
  hajj: ["/", "/hajj-umrah"],
};

function revalidateCatalog(kind: CatalogKind) {
  revalidatePath("/admin/gallery");
  revalidatePath("/admin", "layout");
  for (const path of PUBLIC_PATHS[kind]) revalidatePath(path);
}

function readKind(formData: FormData): CatalogKind | null {
  const value = formData.get("kind");
  return isCatalogKind(value) ? value : null;
}

export async function uploadCatalogCoverAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "").trim();
  if (!kind || !id) return { error: "Save this package once, then add its cover image." };

  await requireModuleAccess(MODULE_FOR_KIND[kind], "write");

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose an image file to upload." };

  try {
    const url = await uploadCatalogCover(kind, id, file);
    revalidateCatalog(kind);
    return { ok: true, url, stamp: Date.now(), message: "Cover image saved." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not upload the image." };
  }
}

export async function removeCatalogCoverAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "").trim();
  if (!kind || !id) return { error: "Nothing to remove." };

  await requireModuleAccess(MODULE_FOR_KIND[kind], "write");

  try {
    await removeCatalogCover(kind, id);
    revalidateCatalog(kind);
    return { ok: true, message: "Cover image removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not remove the image." };
  }
}

export async function uploadProductImagesAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "").trim();
  if (!kind || !id) return { error: "Save this package once, then add photos." };

  await requireModuleAccess(MODULE_FOR_KIND[kind], "write");

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { error: "Choose at least one photo to upload." };

  try {
    await uploadProductImages(kind, id, files);
    revalidateCatalog(kind);
    return {
      ok: true,
      message: `${files.length} photo${files.length === 1 ? "" : "s"} added.`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not upload the photos." };
  }
}

/** Reuse an existing gallery image as a package cover or related photo. */
export async function useLibraryImageAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const kind = readKind(formData);
  const id = String(formData.get("id") ?? "").trim();
  const objectPath = String(formData.get("path") ?? "").trim();
  const slot = formData.get("slot") === "related" ? "related" : "cover";
  if (!kind || !id) return { error: "Save this package once, then choose its images." };
  if (!objectPath) return { error: "Choose an image from the gallery." };

  await requireModuleAccess(MODULE_FOR_KIND[kind], "write");

  try {
    await copyMediaToProduct(kind, id, objectPath, slot);
    revalidateCatalog(kind);
    return { ok: true, message: slot === "cover" ? "Cover image updated." : "Photo added." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not use that image." };
  }
}

export async function removeProductImageAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  const objectPath = String(formData.get("path") ?? "").trim();
  const kind = objectPath.split("/")[1];
  if (!isCatalogKind(kind)) return { error: "That photo cannot be removed." };

  await requireModuleAccess(MODULE_FOR_KIND[kind], "write");

  try {
    await removeProductImage(objectPath);
    revalidateCatalog(kind);
    return { ok: true, message: "Photo removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not remove the photo." };
  }
}

export async function uploadGalleryImagesAction(_prev: MediaActionState, formData: FormData): Promise<MediaActionState> {
  await requireModuleAccess(MEDIA_MODULES, "write");

  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { error: "Choose at least one image to upload." };

  try {
    for (const file of files) await uploadSiteImage(file, "gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/homepage");
    return { ok: true, message: `${files.length} image${files.length === 1 ? "" : "s"} uploaded to the gallery.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not upload the images." };
  }
}

export async function deleteMediaAction(objectPath: string): Promise<MediaActionState> {
  await requireModuleAccess(MEDIA_MODULES, "write");

  try {
    await deleteMediaObject(objectPath);
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Image deleted." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not delete the image." };
  }
}
