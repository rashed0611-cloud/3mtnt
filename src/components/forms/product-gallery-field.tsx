"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Images, Loader2, Trash2, Upload, X } from "lucide-react";
import {
  removeProductImageAction,
  uploadProductImagesAction,
  type MediaActionState,
} from "@/app/admin/gallery/actions";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

export interface ProductGalleryImage {
  path: string;
  url: string;
}

/**
 * Related-photo editor for a catalogue record. Rendered inside the product
 * form, so it uses buttons and direct server actions instead of nested forms.
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
  const fileInput = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(images);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(images);
  }, [images]);

  function runUpload(files: FileList) {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("id", id ?? "");
    for (const file of Array.from(files)) formData.append("files", file);

    startTransition(async () => {
      const result: MediaActionState = await uploadProductImagesAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "Photos added.");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    });
  }

  function runRemove(path: string) {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("path", path);

    startTransition(async () => {
      const result: MediaActionState = await removeProductImageAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setItems((current) => current.filter((item) => item.path !== path));
      setConfirming(null);
      setMessage(result.message ?? "Photo removed.");
      router.refresh();
    });
  }

  const disabled = !id;

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11.5px] font-medium text-slate-700">Related photos</p>
          <p className="text-[10.5px] leading-4 text-slate-500">
            Shown in the photo strip on the public page. JPG, PNG, WebP or AVIF up to 4 MB each.
          </p>
        </div>
        {!disabled ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            <Images className="h-3 w-3" /> {items.length} photo{items.length === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {disabled ? (
        <p className="rounded-control border border-dashed border-line bg-slate-50 px-3 py-2 text-[10.5px] leading-4 text-slate-500">
          Save this package first. Related photos can be added on the edit screen.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {items.map((item) => {
              const isConfirming = confirming === item.path;
              return (
                <div key={item.path} className="group relative aspect-[4/3] overflow-hidden rounded-control border border-line bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="Related photo" className="h-full w-full object-cover" loading="lazy" />
                  {isConfirming ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-950/70 p-2 text-white">
                      <p className="text-[10px] font-semibold">Remove photo?</p>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => runRemove(item.path)}
                          disabled={pending}
                          className="rounded bg-red-600 px-2 py-1 text-[10px] font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(null)}
                          className="rounded bg-white/15 px-2 py-1 text-[10px] font-semibold hover:bg-white/25"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(item.path)}
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-950/60 text-white opacity-0 transition hover:bg-red-600 focus:opacity-100 group-hover:opacity-100"
                      aria-label="Remove photo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={pending}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-control border border-dashed border-line bg-slate-50 text-slate-500 transition hover:border-primary/40 hover:text-primary disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
              <span className="text-[10px] font-semibold">{pending ? "Uploading…" : "Add photos"}</span>
            </button>
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            onChange={(event) => {
              if (event.currentTarget.files?.length) runUpload(event.currentTarget.files);
            }}
          />

          <p className="flex items-center gap-1 text-[10px] text-muted">
            <Upload className="h-3 w-3" /> Upload several photos at once. The cover image above is shown first on cards.
          </p>
        </>
      )}

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
