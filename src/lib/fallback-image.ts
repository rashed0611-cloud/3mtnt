/**
 * Bundled destination photography used when a catalogue record has no uploaded
 * cover yet. Uploaded covers always win, so staff can replace any of these
 * from the edit screen; this only stops seeded or brand-new products from
 * rendering as an empty gradient on cards and detail pages.
 */

const DESTINATION_IMAGES: { keywords: string[]; src: string }[] = [
  {
    keywords: ["bali", "indonesia", "ubud", "seminyak", "nusa", "denpasar"],
    src: "/media/gallery/bali-sanur-beach.jpg",
  },
  {
    keywords: ["maldives", "male", "maafushi", "hulhumale", "atoll"],
    src: "/media/hero-maldives-bungalows.jpg",
  },
  {
    keywords: ["switzerland", "swiss", "zurich", "geneva", "lucerne", "interlaken", "zermatt", "alps", "jungfrau"],
    src: "/media/gallery/switzerland-matterhorn.jpg",
  },
  {
    keywords: ["dubai", "emirates", "uae", "abu dhabi", "sharjah"],
    src: "/media/gallery/dubai-skyline.jpg",
  },
  {
    keywords: ["bangkok", "thailand", "phuket", "krabi", "chiang"],
    src: "/media/gallery/bangkok-riverside.jpg",
  },
  {
    keywords: ["istanbul", "turkey", "cappadocia", "sultanahmet"],
    src: "/media/gallery/istanbul-skyline.jpg",
  },
  {
    keywords: ["dhaka", "bangladesh", "cox", "sylhet", "chittagong"],
    src: "/media/gallery/coxs-bazar-beach.jpg",
  },
  {
    keywords: ["hajj", "umrah", "makkah", "madinah", "medina", "saudi", "ramadan", "pilgrimage"],
    src: "/media/gallery/istanbul-skyline.jpg",
  },
];

const FALLBACKS = DESTINATION_IMAGES.map((entry) => entry.src);

/** Pick a stable, destination-relevant photo for a product without a cover. */
export function fallbackImage(...values: (string | undefined | null)[]): string {
  const needle = values.filter(Boolean).join(" ").toLowerCase();

  for (const entry of DESTINATION_IMAGES) {
    if (entry.keywords.some((keyword) => needle.includes(keyword))) return entry.src;
  }

  // No known destination: choose consistently so a product keeps the same
  // photo between renders instead of flickering through the set.
  let hash = 0;
  for (let index = 0; index < needle.length; index += 1) {
    hash = (hash * 31 + needle.charCodeAt(index)) >>> 0;
  }
  return FALLBACKS[hash % FALLBACKS.length];
}
