import type { PackageCovers } from "@/lib/types";

/**
 * The existing package heroes use an 85% overlay on the left, fading to 25%
 * on the right. Keeping that as the default means adding the control does not
 * change how any package page looks until someone moves the slider.
 */
export const DEFAULT_PACKAGE_OVERLAY = 85;

export function packageCoverKey(kind: string, id: string) {
  return `${kind}:${id}`;
}

export function packageCoverOverlay(
  covers: PackageCovers | null | undefined,
  kind: string,
  id: string,
) {
  const value = covers?.[packageCoverKey(kind, id)]?.overlay;
  return typeof value === "number" && Number.isFinite(value) ? value : DEFAULT_PACKAGE_OVERLAY;
}

/**
 * Darkens a cover photo behind white hero copy. The left side is darkest for
 * the title, then fades to the right, matching the original fixed gradient.
 */
export function coverOverlayStyle(overlay: number, rgb = "2,6,23") {
  const raw = Number.isFinite(overlay) ? overlay : DEFAULT_PACKAGE_OVERLAY;
  const value = Math.max(0, Math.min(85, raw)) / 100;
  return {
    background: `linear-gradient(90deg, rgba(${rgb},${value}) 0%, rgba(${rgb},${value * 0.706}) 55%, rgba(${rgb},${value * 0.294}) 100%)`,
  };
}
