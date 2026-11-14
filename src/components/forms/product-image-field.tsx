"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageIcon, Plus } from "lucide-react";
import { galleryUploadHref } from "@/lib/media-links";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

/**
 * Cover image picker for a catalogue record. The screen only offers an
 * "Add image" action; choosing the photo happens in the Image Gallery, which
 * opens in a new tab so unsaved form changes survive.
 */
export function ProductImageField({
  kind,
  id,
  url,
  label = "Cover image",
  hint = "Click Add image to choose a photo in the Image Gallery. It is shown on the website card and page header. Choosing a new photo replaces the current one.",
}: {
  kind: CatalogKind;
  id?: string;
  url?: string;
  label?: string;
  hint?: string;
}) {
  const router = useRouter();
  const awaitingGallery = useRef(false);

  // The gallery opens in another tab, so refresh this form when the editor
  // comes back into focus to show the image that was just chosen.
  useEffect(() => {
    function onFocus() {
      if (!awaitingGallery.current) return;
      awaitingGallery.current = false;
      router.refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-[11.5px] font-medium text-slate-700">{label}</p>
        <p className="text-[10.5px] leading-4 text-slate-500">{hint}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Current cover"
            className="h-[104px] w-[168px] rounded-control border border-line object-cover"
          />
        ) : (
          <div className="flex h-[104px] w-[168px] flex-col items-center justify-center gap-1 rounded-control border border-dashed border-line bg-slate-50 text-slate-400">
            <ImageIcon className="h-5 w-5" />
            <span className="text-[10px] font-medium">No image yet</span>
          </div>
        )}

        {id ? (
          <Link
            href={galleryUploadHref(kind, id, "cover")}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              awaitingGallery.current = true;
            }}
            className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5" /> {url ? "Change image" : "Add image"}
          </Link>
        ) : (
          <p className="rounded-control border border-dashed border-line bg-slate-50 px-3 py-2 text-[10.5px] leading-4 text-slate-500">
            Save this package first. The image can be added on the edit screen.
          </p>
        )}
      </div>
    </div>
  );
}
