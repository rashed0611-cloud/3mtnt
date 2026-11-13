"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Images, Plus } from "lucide-react";
import { galleryUploadHref } from "@/lib/media-links";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

export interface ProductGalleryImage {
  path: string;
  url: string;
}

/**
 * Related-photo picker for a catalogue record. The screen only offers an
 * "Add image" action; photos are chosen or uploaded in the Image Gallery, which
 * opens in a new tab so unsaved form changes survive.
 */
export function ProductGalleryField({
  kind,
  id,
  images,
}: {
  kind: CatalogKind;
  id?: string;
  images: ProductGalleryImage[];
}) {
  const router = useRouter();
  const awaitingGallery = useRef(false);

  // Photos are chosen in another tab, so refresh when this form is focused
  // again to show what the gallery just attached.
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
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11.5px] font-medium text-slate-700">Related photos</p>
          <p className="text-[10.5px] leading-4 text-slate-500">
            Click Add image to choose photos in the Image Gallery. They appear in the photo strip on the public page.
          </p>
        </div>
        {id ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            <Images className="h-3 w-3" /> {images.length} photo{images.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {id ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {images.map((item) => (
            <div key={item.path} className="relative aspect-[4/3] overflow-hidden rounded-control border border-line bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="Related photo" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}

          <Link
            href={galleryUploadHref(kind, id, "related")}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              awaitingGallery.current = true;
            }}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-control border border-dashed border-primary/40 bg-primary/5 text-primary transition hover:border-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Add image</span>
          </Link>
        </div>
      ) : (
        <p className="rounded-control border border-dashed border-line bg-slate-50 px-3 py-2 text-[10.5px] leading-4 text-slate-500">
          Save this package first. Related photos can be added on the edit screen.
        </p>
      )}
    </div>
  );
}
