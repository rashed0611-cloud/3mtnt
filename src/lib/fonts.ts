export interface FontOption {
  key: string;
  label: string;
  /** CSS font-family stack used for the public site. */
  stack: string;
  /** Google Fonts family query (without the base URL). */
  google: string;
  category: "Sans" | "Serif" | "Display";
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: "inter",
    label: "Inter",
    stack: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    google: "Inter:wght@400;500;600;700;800",
    category: "Sans",
  },
  {
    key: "plus-jakarta",
    label: "Plus Jakarta Sans",
    stack: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Plus+Jakarta+Sans:wght@400;500;600;700;800",
    category: "Sans",
  },
  {
    key: "manrope",
    label: "Manrope",
    stack: '"Manrope", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Manrope:wght@400;500;600;700;800",
    category: "Sans",
  },
  {
    key: "dm-sans",
    label: "DM Sans",
    stack: '"DM Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "DM+Sans:wght@400;500;600;700",
    category: "Sans",
  },
  {
    key: "poppins",
    label: "Poppins",
    stack: '"Poppins", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Poppins:wght@400;500;600;700",
    category: "Sans",
  },
  {
    key: "figtree",
    label: "Figtree",
    stack: '"Figtree", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Figtree:wght@400;500;600;700;800",
    category: "Sans",
  },
  {
    key: "source-serif",
    label: "Source Serif",
    stack: '"Source Serif 4", Georgia, Cambria, "Times New Roman", serif',
    google: "Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700",
    category: "Serif",
  },
  {
    key: "lora",
    label: "Lora",
    stack: '"Lora", Georgia, Cambria, "Times New Roman", serif',
    google: "Lora:wght@400;500;600;700",
    category: "Serif",
  },
  {
    key: "merriweather",
    label: "Merriweather",
    stack: '"Merriweather", Georgia, Cambria, "Times New Roman", serif',
    google: "Merriweather:wght@400;700",
    category: "Serif",
  },
  {
    key: "playfair",
    label: "Playfair Display",
    stack: '"Playfair Display", Georgia, Cambria, "Times New Roman", serif',
    google: "Playfair+Display:wght@500;600;700;800",
    category: "Display",
  },
  {
    key: "sora",
    label: "Sora",
    stack: '"Sora", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Sora:wght@400;500;600;700",
    category: "Display",
  },
  {
    key: "space-grotesk",
    label: "Space Grotesk",
    stack: '"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Space+Grotesk:wght@400;500;600;700",
    category: "Display",
  },
];

const FONT_MAP = new Map(FONT_OPTIONS.map((font) => [font.key, font]));

export const DEFAULT_BODY_FONT = "inter";
export const DEFAULT_HEADING_FONT = "plus-jakarta";

export function isFontKey(value: unknown): value is string {
  return typeof value === "string" && FONT_MAP.has(value);
}

export function fontByKey(key: string): FontOption {
  return FONT_MAP.get(key) ?? FONT_MAP.get(DEFAULT_BODY_FONT)!;
}

export function fontStack(key: string): string {
  return fontByKey(key).stack;
}

/** One Google Fonts request for the body and heading families actually in use. */
export function googleFontsHref(keys: string[]): string {
  const families = [...new Set(keys.filter(isFontKey))].map((key) => `family=${fontByKey(key).google}`);
  if (!families.length) return "";
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
