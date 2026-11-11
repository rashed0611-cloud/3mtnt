import "server-only";

import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

const BUCKET = "site-media";
export const MAX_GALLERY_IMAGE_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

/**
 * Stores a gallery upload in Supabase Storage when configured, otherwise in
 * `public/uploads/gallery` for local/self-hosted development.
 */
export async function uploadGalleryImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("Choose an image file to upload.");
  if (file.size > MAX_GALLERY_IMAGE_BYTES) {
    throw new Error("Each image must be 4 MB or smaller.");
  }
  const extension = ALLOWED_TYPES.get(file.type);
  if (!extension) {
    throw new Error("Use a JPG, PNG, WebP, GIF or AVIF image.");
  }

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  if (isSupabaseConfigured()) {
    const admin = createSupabaseAdminClient();
    const { data: bucket } = await admin.storage.getBucket(BUCKET);
    if (!bucket) {
      const { error } = await admin.storage.createBucket(BUCKET, { public: true });
      if (error) throw new Error(`Could not prepare image storage: ${error.message}`);
    }
    const { error } = await admin.storage.from(BUCKET).upload(`gallery/${filename}`, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(`Could not upload the image: ${error.message}`);
    return admin.storage.from(BUCKET).getPublicUrl(`gallery/${filename}`).data.publicUrl;
  }

  const directory = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/gallery/${filename}`;
}
