/**
 * Client-safe helpers for turning stored media URLs into same-origin URLs.
 *
 * Images uploaded to Supabase Storage are saved as absolute
 * `https://<project>.supabase.co/storage/v1/object/public/site-media/...`
 * links. Loading those directly from a phone depends on a third-party host,
 * its Cloudflare cookie and its `no-cache` headers, which is fragile on mobile
 * networks. Serving them through `/api/media/...` keeps every image on the
 * site's own domain with long-lived cache headers.
 */

const STORAGE_PATH = "/storage/v1/object/public/site-media/";
const PROXY_PREFIX = "/api/media/";

/** Convert a stored Supabase URL to the same-origin proxy path. */
export function toMediaDisplayUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith(PROXY_PREFIX)) return trimmed;

  const marker = trimmed.indexOf(STORAGE_PATH);
  if (marker >= 0) {
    const objectPath = trimmed.slice(marker + STORAGE_PATH.length).split("?")[0].split("#")[0];
    if (objectPath) return `${PROXY_PREFIX}${objectPath}`;
  }

  return trimmed;
}

/**
 * Absolute version of a display URL, for sharing and clipboard use. Returns
 * the relative path during server rendering because there is no origin yet.
 */
export function toAbsoluteMediaUrl(url?: string | null): string {
  const display = toMediaDisplayUrl(url);
  if (!display) return "";
  if (/^https?:\/\//i.test(display)) return display;
  if (typeof window === "undefined") return display;
  try {
    return new URL(display, window.location.origin).toString();
  } catch {
    return display;
  }
}
