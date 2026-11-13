import type { CatalogKind } from "@/lib/media";

/** Where a catalogue record is edited in the admin workspace. */
export function packageEditHref(kind: CatalogKind, id: string): string {
  switch (kind) {
    case "tour":
      return `/admin/tours/${id}/edit`;
    case "hotel":
      return `/admin/hotels/${id}/edit`;
    case "visa":
      return `/admin/visas/${id}/edit`;
    case "hajj":
      return `/admin/hajj-umrah/packages/${id}/edit`;
  }
}

/**
 * Opens the Image Gallery in "package" mode. The gallery uploads the chosen
 * files straight into that package's cover or related-photo folder.
 */
export function galleryUploadHref(kind: CatalogKind, id: string, slot: "cover" | "related"): string {
  return `/admin/gallery?package=${encodeURIComponent(`${kind}:${id}`)}&slot=${slot}`;
}
