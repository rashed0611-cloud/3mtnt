import { promises as fs } from "fs";
import path from "path";
import { isDeletableMediaPath, MEDIA_BUCKET } from "@/lib/media";
import { createSupabaseAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";
// Always read the current object: a deleted or replaced cover must not be
// served from a stale server cache. HTTP/CDN caching is set on the response.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

/** Long-lived but replaceable: covers keep the same path when re-uploaded. */
const CACHE_CONTROL = "public, max-age=60, s-maxage=300, stale-while-revalidate=86400";

function contentTypeFor(name: string) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

function imageResponse(body: Buffer, contentType: string, name: string) {
  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Content-Length": String(body.byteLength),
    "Cache-Control": CACHE_CONTROL,
    "Content-Disposition": `inline; filename="${name.replace(/[^\w.-]/g, "_")}"`,
    "X-Content-Type-Options": "nosniff",
  };
  // SVGs can contain scripts; never let one run with site privileges.
  if (contentType === "image/svg+xml") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
  }
  return new Response(body, { headers });
}

/**
 * Streams an uploaded image from Supabase Storage (or the local uploads folder
 * in development) through the site's own domain. Phones then load images from
 * the same origin as the page, with normal HTTP caching instead of a
 * third-party host that sends `no-cache` and cookies.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const objectPath = (segments ?? []).join("/");

  if (!objectPath || !isDeletableMediaPath(objectPath)) {
    return new Response("Not found", { status: 404 });
  }

  const name = objectPath.split("/").pop() ?? "image";
  const fallbackType = contentTypeFor(name);

  if (isSupabaseConfigured()) {
    try {
      const admin = createSupabaseAdminClient();
      const { data, error } = await admin.storage.from(MEDIA_BUCKET).download(objectPath);
      if (error || !data) return new Response("Not found", { status: 404 });
      const buffer = Buffer.from(await data.arrayBuffer());
      return imageResponse(buffer, data.type || fallbackType, name);
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  try {
    const filePath = path.join(process.cwd(), "public", "uploads", ...objectPath.split("/"));
    const buffer = await fs.readFile(filePath);
    return imageResponse(buffer, fallbackType, name);
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
