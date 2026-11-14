import { toMediaDisplayUrl } from "@/lib/media-url";
import type { SitePageSettings } from "@/lib/types";

/**
 * Background photo for a storefront page header. The page section must be
 * `relative overflow-hidden` for this to sit behind its content.
 */
export function PageBanner({ page }: { page: SitePageSettings }) {
  if (!page.banner.imageUrl) return null;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toMediaDisplayUrl(page.banner.imageUrl)}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: `rgba(15,23,42,${page.banner.overlay / 100})` }} />
    </>
  );
}

/**
 * Light page headers become a white card over a banner photo so the existing
 * dark text and white search forms stay readable.
 */
export function bannerCardClass(page: SitePageSettings, extra?: string) {
  return [page.banner.imageUrl ? "relative my-6 rounded-2xl bg-white/95 shadow-xl backdrop-blur" : "relative", extra]
    .filter(Boolean)
    .join(" ");
}
