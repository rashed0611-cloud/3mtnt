"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { removeCatalogCoverAction, type MediaActionState } from "@/app/admin/gallery/actions";
import { galleryUploadHref } from "@/lib/media-links";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

/**
 * Cover image editor for a catalogue record. Uploading happens in the Image
 * Gallery so every image lands in one place; this field links there, shows the
 * current cover and can remove it. Removal applies immediately, independently
 * of the product's own save button.
 */
export function ProductImageField({
  kind,
  id,
  url,
  label = "Cover image",
  hint = "Shown on the website card and page header. Upload or replace it in the Image Gallery.",
}: {
  kind: CatalogKind;
  id?: string;
  url?: string;
  label?: string;
  hint?: string;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState(url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const awaitingGallery = useRef(false);

  useEffect(() => {
    setPreview(url ?? "");
  }, [url]);

  // The gallery opens in a new tab, so refresh this form when the editor comes
  // back into focus to pick up the newly uploaded cover.
  useEffect(() => {
    function onFocus() {
      if (!awaitingGallery.current) return;
      awaitingGallery.current = false;
      router.refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  function runRemove() {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("id", id ?? "");

    startTransition(async () => {
      const result: MediaActionState = await removeCatalogCoverAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPreview("");
      setMessage(result.message ?? "Cover image removed.");
      router.refresh();
    });
  }

  const disabled = !id;

  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-[11.5px] font-medium text-slate-700">{label}</p>
        <p className="text-[10.5px] leading-4 text-slate-500">{hint}</p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative h-[104px] w-[168px] overflow-hidden rounded-control border border-line bg-slate-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Current cover" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
              <ImageIcon className="h-5 w-5" />
              <span className="text-[10px] font-medium">No image yet</span>
            </div>
          )}
          {pending ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : null}
        </div>

        <div className="flex min-w-[200px] flex-col gap-1.5">
          {disabled ? (
            <p className="rounded-control border border-dashed border-line bg-slate-50 px-3 py-2 text-[10.5px] leading-4 text-slate-500">
              Save this package first. The cover image can be added on the edit screen.
            </p>
          ) : (
            <>
              <Link
                href={galleryUploadHref(kind, id, "cover")}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  awaitingGallery.current = true;
                }}
                className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary/90"
              >
                <Upload className="h-3.5 w-3.5" /> {preview ? "Replace in gallery" : "Upload in gallery"}
                <ExternalLink className="h-3 w-3 opacity-80" />
              </Link>
              {preview ? (
                <button
                  type="button"
                  onClick={runRemove}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              ) : null}
              <p className="text-[10px] leading-4 text-muted">
                Opens the Image Gallery in a new tab, so unsaved changes here stay put. The gallery uploads the photo and
                attaches it to this package.
              </p>
            </>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
          {error}
        </p>
      ) : message ? (
        <p className="text-[10.5px] font-medium text-emerald-600">{message}</p>
      ) : null}
    </div>
  );
}
