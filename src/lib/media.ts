import "server-only";

import crypto from "node:crypto";
import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import type { ModuleKey } from "@/lib/access";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const MEDIA_BUCKET = "site-media";
export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

/** Staff who may manage the shared image library. */
export const MEDIA_MODULES: ModuleKey[] = ["content", "settings", "tours", "hotels", "visas", "hajj"];

/** Site-wide folders already used by the website editor. */
export const SITE_FOLDERS = ["gallery", "banner", "brand", "seo"] as const;
export type SiteFolder = (typeof SITE_FOLDERS)[number];

/** Product catalogues that can carry a cover image. */
export const CATALOG_KINDS = ["tour", "hotel", "visa", "hajj"] as const;
export type CatalogKind = (typeof CATALOG_KINDS)[number];

/** Related photos live at `catalog-media/<kind>/<productId>__<uuid>.<ext>`. */
export const PRODUCT_IMAGES_FOLDER = "catalog-media";

const EXTENSIONS = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

const MIME_BY_EXTENSION = new Map(Array.from(EXTENSIONS, ([mime, extension]) => [extension, mime]));

export function isCatalogKind(value: unknown): value is CatalogKind {
  return typeof value === "string" && (CATALOG_KINDS as readonly string[]).includes(value);
}

export function isSiteFolder(value: unknown): value is SiteFolder {
  return typeof value === "string" && (SITE_FOLDERS as readonly string[]).includes(value);
}

function extensionFor(file: File) {
  const extension = EXTENSIONS.get(file.type);
  if (!extension) throw new Error("Use a JPG, PNG, WebP or AVIF image.");
  return extension;
}

function validateFile(file: File) {
  if (!file || file.size === 0) throw new Error("Choose an image file to upload.");
  if (file.size > MAX_MEDIA_BYTES) throw new Error("Each image must be 4 MB or smaller.");
  return extensionFor(file);
}

async function ensureBucket() {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.storage.getBucket(MEDIA_BUCKET);
  if (!data) {
    const { error } = await admin.storage.createBucket(MEDIA_BUCKET, { public: true });
    if (error) throw new Error(`Could not prepare image storage: ${error.message}`);
  }
  return admin;
}

/**
 * Public images are served through the site's own `/api/media` route rather
 * than straight from Supabase. That keeps them on the same origin as the page,
 * avoids third-party cookie/cache behaviour on phones and gives the CDN a
 * stable cacheable URL.
 */
function supabasePublicUrl(objectPath: string) {
  return `/api/media/${objectPath}`;
}

function localDirectory(...segments: string[]) {
  return path.join(process.cwd(), "public", "uploads", ...segments);
}

/* ------------------------------------------------------------------ */
/* Catalog cover images                                                */
/* ------------------------------------------------------------------ */

/**
 * Covers live at `site-media/catalog/<kind>/<productId>.<ext>`. Listing the
 * folder once per request tells the storefront which products actually have a
 * cover, so pages never request images that do not exist.
 */
export const listCatalogCovers = cache(async (kind: CatalogKind): Promise<Map<string, string>> => {
  const covers = new Map<string, string>();

  if (isSupabaseConfigured()) {
    try {
      const admin = await ensureBucket();
      const { data, error } = await admin.storage.from(MEDIA_BUCKET).list(`catalog/${kind}`, { limit: 1000 });
      if (error) return covers;
      for (const object of data ?? []) {
        if (!object.name || object.name.startsWith(".") || !object.id) continue;
        const id = object.name.replace(/\.[^.]+$/, "");
        // Covers keep the same path when replaced. A version query makes the
        // browser and CDN fetch the new photo immediately after an upload.
        const version = object.updated_at ? `?v=${encodeURIComponent(object.updated_at)}` : "";
        covers.set(id, `${supabasePublicUrl(`catalog/${kind}/${object.name}`)}${version}`);
      }
    } catch {
      return covers;
    }
    return covers;
  }

  try {
    const directory = localDirectory("catalog", kind);
    for (const name of await fs.readdir(directory)) {
      if (name.startsWith(".")) continue;
      const stat = await fs.stat(path.join(directory, name)).catch(() => null);
      const version = stat ? `?v=${Math.round(stat.mtimeMs)}` : "";
      covers.set(name.replace(/\.[^.]+$/, ""), `/uploads/catalog/${kind}/${name}${version}`);
    }
  } catch {
    /* No local uploads yet. */
  }
  return covers;
});

export async function uploadCatalogCover(kind: CatalogKind, id: string, file: File) {
  const extension = validateFile(file);
  const filename = `${id}.${extension}`;
  const objectPath = `catalog/${kind}/${filename}`;

  if (isSupabaseConfigured()) {
    const admin = await ensureBucket();
    const { data } = await admin.storage.from(MEDIA_BUCKET).list(`catalog/${kind}`, { limit: 1000 });
    const stale = (data ?? [])
      .filter((object) => object.name.startsWith(`${id}.`))
      .map((object) => `catalog/${kind}/${object.name}`);
    if (stale.length) await admin.storage.from(MEDIA_BUCKET).remove(stale);

    // Covers keep the same path when replaced, so the storage edge must not
    // hold the previous photo. The site proxy adds its own versioned caching.
    const { error } = await admin.storage.from(MEDIA_BUCKET).upload(objectPath, file, {
      contentType: file.type,
      upsert: true,
      cacheControl: "0",
    });
    if (error) throw new Error(`Could not upload the image: ${error.message}`);
    return supabasePublicUrl(objectPath);
  }

  const directory = localDirectory("catalog", kind);
  await fs.mkdir(directory, { recursive: true });
  for (const name of await fs.readdir(directory)) {
    if (name.startsWith(`${id}.`)) await fs.unlink(path.join(directory, name)).catch(() => undefined);
  }
  await fs.writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/catalog/${kind}/${filename}`;
}

export async function removeCatalogCover(kind: CatalogKind, id: string) {
  if (isSupabaseConfigured()) {
    const admin = await ensureBucket();
    const { data } = await admin.storage.from(MEDIA_BUCKET).list(`catalog/${kind}`, { limit: 1000 });
    const stale = (data ?? [])
      .filter((object) => object.name.startsWith(`${id}.`))
      .map((object) => `catalog/${kind}/${object.name}`);
    if (stale.length) await admin.storage.from(MEDIA_BUCKET).remove(stale);
    return;
  }

  const directory = localDirectory("catalog", kind);
  for (const name of await fs.readdir(directory).catch(() => [] as string[])) {
    if (name.startsWith(`${id}.`)) await fs.unlink(path.join(directory, name)).catch(() => undefined);
  }
}


/* ------------------------------------------------------------------ */
/* Related product photos                                              */
/* ------------------------------------------------------------------ */

export interface ProductImage {
  /** `<folder>/<name>`, used for deletes. */
  path: string;
  name: string;
  url: string;
  /** Owning catalogue record. */
  entityId: string;
  size: number;
  updatedAt?: string;
}

/** All related photos for a catalogue, newest first. Cached per request. */
export const listProductImages = cache(async (kind: CatalogKind): Promise<ProductImage[]> => {
  const images: ProductImage[] = [];

  if (isSupabaseConfigured()) {
    try {
      const admin = await ensureBucket();
      const { data, error } = await admin.storage
        .from(MEDIA_BUCKET)
        .list(`${PRODUCT_IMAGES_FOLDER}/${kind}`, { limit: 1000 });
      if (error) return images;
      for (const object of data ?? []) {
        if (!object.name || object.name.startsWith(".") || !object.id) continue;
        const entityId = object.name.split("__")[0];
        if (!entityId) continue;
        const objectPath = `${PRODUCT_IMAGES_FOLDER}/${kind}/${object.name}`;
        images.push({
          path: objectPath,
          name: object.name,
          url: supabasePublicUrl(objectPath),
          entityId,
          size: formatBytesToNumber((object.metadata as Record<string, unknown> | null)?.size),
          updatedAt: object.updated_at ?? undefined,
        });
      }
    } catch {
      return images;
    }
    return images.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }

  try {
    const directory = localDirectory(PRODUCT_IMAGES_FOLDER, kind);
    for (const name of await fs.readdir(directory)) {
      if (name.startsWith(".") || !name.includes("__")) continue;
      const stat = await fs.stat(path.join(directory, name)).catch(() => null);
      const entityId = name.split("__")[0];
      images.push({
        path: `${PRODUCT_IMAGES_FOLDER}/${kind}/${name}`,
        name,
        url: `/uploads/${PRODUCT_IMAGES_FOLDER}/${kind}/${name}`,
        entityId,
        size: stat?.size ?? 0,
        updatedAt: stat?.mtime.toISOString(),
      });
    }
  } catch {
    /* No related photos yet. */
  }

  return images.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
});

/** Related photos that belong to one catalogue record. */
export async function listImagesForProduct(kind: CatalogKind, id: string): Promise<ProductImage[]> {
  return (await listProductImages(kind)).filter((image) => image.entityId === id);
}

export async function uploadProductImages(kind: CatalogKind, id: string, files: File[]): Promise<ProductImage[]> {
  if (!files.length) throw new Error("Choose at least one image to upload.");
  const uploaded: ProductImage[] = [];

  for (const file of files) {
    const extension = validateFile(file);
    const name = `${id}__${crypto.randomUUID()}.${extension}`;
    const objectPath = `${PRODUCT_IMAGES_FOLDER}/${kind}/${name}`;

    if (isSupabaseConfigured()) {
      const admin = await ensureBucket();
      const { error } = await admin.storage.from(MEDIA_BUCKET).upload(objectPath, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "60",
      });
      if (error) throw new Error(`Could not upload the image: ${error.message}`);
      uploaded.push({
        path: objectPath,
        name,
        url: supabasePublicUrl(objectPath),
        entityId: id,
        size: file.size,
      });
      continue;
    }

    const directory = localDirectory(PRODUCT_IMAGES_FOLDER, kind);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
    uploaded.push({
      path: objectPath,
      name,
      url: `/uploads/${objectPath}`,
      entityId: id,
      size: file.size,
    });
  }

  return uploaded;
}

/** Read any stored image back so it can be reused for another product. */
async function downloadMediaObject(objectPath: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (isSupabaseConfigured()) {
    const admin = await ensureBucket();
    const { data, error } = await admin.storage.from(MEDIA_BUCKET).download(objectPath);
    if (error || !data) throw new Error(`Could not read that image: ${error?.message ?? "not found"}`);
    return {
      bytes: Buffer.from(await data.arrayBuffer()),
      contentType: data.type || MIME_BY_EXTENSION.get(objectPath.split(".").pop()?.toLowerCase() ?? "") || "application/octet-stream",
    };
  }

  const segments = objectPath.split("/");
  const bytes = await fs.readFile(localDirectory(...segments)).catch(() => null);
  if (!bytes) throw new Error("That image is no longer available.");
  return {
    bytes,
    contentType: MIME_BY_EXTENSION.get(objectPath.split(".").pop()?.toLowerCase() ?? "") ?? "application/octet-stream",
  };
}

/**
 * Reuse an image that already lives in the gallery: copy it into the product's
 * cover slot or its related-photo folder. The original gallery image is kept.
 */
export async function copyMediaToProduct(
  kind: CatalogKind,
  id: string,
  sourcePath: string,
  slot: "cover" | "related",
) {
  if (!isDeletableMediaPath(sourcePath)) throw new Error("That image cannot be used here.");

  const { bytes, contentType } = await downloadMediaObject(sourcePath);
  const extension = EXTENSIONS.get(contentType) ?? sourcePath.split(".").pop()?.toLowerCase() ?? "";
  const mime = MIME_BY_EXTENSION.get(extension);
  if (!mime) throw new Error("Use a JPG, PNG, WebP or AVIF image.");

  const name = sourcePath.split("/").pop() ?? `image.${extension}`;
  const file = new File([bytes], name, { type: mime });

  if (slot === "cover") {
    await uploadCatalogCover(kind, id, file);
    return;
  }
  await uploadProductImages(kind, id, [file]);
}

export async function removeProductImage(objectPath: string) {
  const segments = objectPath.split("/");
  if (
    segments.length !== 3 ||
    segments[0] !== PRODUCT_IMAGES_FOLDER ||
    !isCatalogKind(segments[1]) ||
    !segments[2].includes("__") ||
    segments[2].includes("..")
  ) {
    throw new Error("That image cannot be removed from here.");
  }

  if (isSupabaseConfigured()) {
    const admin = await ensureBucket();
    const { error } = await admin.storage.from(MEDIA_BUCKET).remove([objectPath]);
    if (error) throw new Error(`Could not remove the image: ${error.message}`);
    return;
  }

  await fs.unlink(localDirectory(...segments)).catch(() => undefined);
}

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export interface MediaItem {
  /** `<folder>/<name>`, used for deletes. */
  path: string;
  name: string;
  url: string;
  folder: string;
  /** "catalog" = cover, "product" = related photo, "site" = website media. */
  group: "catalog" | "product" | "site";
  kind?: CatalogKind;
  /** Catalog product id, when the item is a cover. */
  entityId?: string;
  size: number;
  updatedAt?: string;
}

function formatBytesToNumber(value: unknown) {
  const size = Number(value);
  return Number.isFinite(size) ? size : 0;
}

async function listSupabaseFolder(folder: string): Promise<{ name: string; size: number; updatedAt?: string }[]> {
  const admin = await ensureBucket();
  const { data, error } = await admin.storage.from(MEDIA_BUCKET).list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) return [];
  return (data ?? [])
    .filter((object) => object.name && !object.name.startsWith("."))
    .map((object) => ({
      name: object.name,
      size: formatBytesToNumber((object.metadata as Record<string, unknown> | null)?.size),
      updatedAt: object.updated_at ?? undefined,
    }));
}

async function listLocalFolder(...segments: string[]) {
  const directory = localDirectory(...segments);
  const names = await fs.readdir(directory).catch(() => [] as string[]);
  const rows = await Promise.all(
    names
      .filter((name) => !name.startsWith("."))
      .map(async (name) => {
        const stat = await fs.stat(path.join(directory, name)).catch(() => null);
        return { name, size: stat?.size ?? 0, updatedAt: stat?.mtime.toISOString() };
      }),
  );
  return rows;
}

/** Every uploaded image in the bucket, newest first. */
export const listMediaLibrary = cache(async (): Promise<MediaItem[]> => {
  const items: MediaItem[] = [];
  const configured = isSupabaseConfigured();

  for (const folder of SITE_FOLDERS) {
    const rows = configured ? await listSupabaseFolder(folder) : await listLocalFolder(folder);
    for (const row of rows) {
      const objectPath = `${folder}/${row.name}`;
      items.push({
        path: objectPath,
        name: row.name,
        url: configured ? supabasePublicUrl(objectPath) : `/uploads/${objectPath}`,
        folder,
        group: "site",
        size: row.size,
        updatedAt: row.updatedAt,
      });
    }
  }

  for (const kind of CATALOG_KINDS) {
    const rows = configured ? await listSupabaseFolder(`catalog/${kind}`) : await listLocalFolder("catalog", kind);
    for (const row of rows) {
      const objectPath = `catalog/${kind}/${row.name}`;
      items.push({
        path: objectPath,
        name: row.name,
        url: configured ? supabasePublicUrl(objectPath) : `/uploads/${objectPath}`,
        folder: `catalog/${kind}`,
        group: "catalog",
        kind,
        entityId: row.name.replace(/\.[^.]+$/, ""),
        size: row.size,
        updatedAt: row.updatedAt,
      });
    }
  }

  for (const kind of CATALOG_KINDS) {
    const folder = `${PRODUCT_IMAGES_FOLDER}/${kind}`;
    const rows = configured ? await listSupabaseFolder(folder) : await listLocalFolder(PRODUCT_IMAGES_FOLDER, kind);
    for (const row of rows) {
      if (!row.name.includes("__")) continue;
      const objectPath = `${folder}/${row.name}`;
      items.push({
        path: objectPath,
        name: row.name,
        url: configured ? supabasePublicUrl(objectPath) : `/uploads/${objectPath}`,
        folder,
        group: "product",
        kind,
        entityId: row.name.split("__")[0],
        size: row.size,
        updatedAt: row.updatedAt,
      });
    }
  }

  return items.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
});

/** Only allow deleting inside a known folder. */
export function isDeletableMediaPath(objectPath: string) {
  const segments = objectPath.split("/");
  if (segments.some((segment) => !segment || segment.includes("..") || segment.startsWith("."))) return false;
  if (segments.length === 2) return isSiteFolder(segments[0]);
  if (segments.length === 3 && segments[0] === PRODUCT_IMAGES_FOLDER) {
    return isCatalogKind(segments[1]) && segments[2].includes("__");
  }
  if (segments.length === 3) return segments[0] === "catalog" && isCatalogKind(segments[1]);
  return false;
}

export async function deleteMediaObject(objectPath: string) {
  if (!isDeletableMediaPath(objectPath)) throw new Error("That image cannot be deleted from here.");
  const segments = objectPath.split("/");

  if (isSupabaseConfigured()) {
    const admin = await ensureBucket();
    const { error } = await admin.storage.from(MEDIA_BUCKET).remove([objectPath]);
    if (error) throw new Error(`Could not delete the image: ${error.message}`);
    return;
  }

  await fs.unlink(localDirectory(...segments)).catch(() => undefined);
}
