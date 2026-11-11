import type { CSSProperties } from "react";
import { googleFontsHref, fontStack } from "@/lib/fonts";
import type { SiteAppearance } from "@/lib/types";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value.trim());
}

/** Expands #abc to #aabbcc so CSS variables are always full-length. */
export function normalizeHex(value: unknown, fallback: string): string {
  if (!isHexColor(value)) return fallback;
  const hex = value.trim().toLowerCase();
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
}

export function hexToRgbTriplet(value: string): string {
  const hex = normalizeHex(value, "#000000").slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/** Darkens a colour by a percentage, used for hover states. */
export function shade(value: string, percent: number): string {
  const hex = normalizeHex(value, "#000000").slice(1);
  const channels = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `#${channels
    .map((channel) => {
      const next = Math.round(channel + (percent / 100) * (percent < 0 ? channel : 255 - channel));
      return Math.max(0, Math.min(255, next)).toString(16).padStart(2, "0");
    })
    .join("")}`;
}

export function relativeLuminance(value: string): number {
  const hex = normalizeHex(value, "#ffffff").slice(1);
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** True when white text is the safer choice on this background. */
export function prefersLightText(background: string): boolean {
  return relativeLuminance(background) < 0.45;
}

/**
 * CSS custom properties consumed by the public-site theme wrapper. Tailwind
 * colours read the same variables, so the whole storefront follows the editor.
 */
export function themeStyle(appearance: SiteAppearance): CSSProperties {
  const { colors, typography, banner } = appearance;
  return {
    "--primary": colors.primary,
    "--primary-rgb": hexToRgbTriplet(colors.primary),
    "--primary-strong": shade(colors.primary, -18),
    "--primary-strong-rgb": hexToRgbTriplet(shade(colors.primary, -18)),
    "--accent": colors.accent,
    "--accent-rgb": hexToRgbTriplet(colors.accent),
    "--page-bg": colors.page,
    "--page-rgb": hexToRgbTriplet(colors.page),
    "--text": colors.text,
    "--ink-rgb": hexToRgbTriplet(colors.text),
    "--footer-bg": colors.footer,
    "--footer-rgb": hexToRgbTriplet(colors.footer),
    "--font-sans": fontStack(typography.bodyFont),
    "--font-heading": fontStack(typography.headingFont),
    "--heading-weight": String(typography.headingWeight),
    "--site-radius": `${typography.radius}px`,
    "--radius-card": `${typography.radius}px`,
    "--radius-control": `${Math.max(4, Math.round(typography.radius * 0.66))}px`,
    "--banner-overlay": String(banner.overlay / 100),
  } as CSSProperties;
}

export function themeStylesheetHref(appearance: SiteAppearance): string {
  return googleFontsHref([appearance.typography.bodyFont, appearance.typography.headingFont]);
}
