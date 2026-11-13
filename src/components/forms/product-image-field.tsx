"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import {
  removeCatalogCoverAction,
  uploadCatalogCoverAction,
  type MediaActionState,
} from "@/app/admin/gallery/actions";

type CatalogKind = "tour" | "hotel" | "visa" | "hajj";

/**
 * Cover image editor for a catalogue record. Uploads are stored immediately,
 * so the product keeps its existing save button for the text fields. The
 * controls are buttons rather than forms because this component is rendered
 * inside the product form.
 */
export function ProductImageField({
  kind,
  id,
  url,
  label = "Cover image",
  hint = "Shown on the website card and page header. JPG, PNG, WebP or AVIF up to 4 MB.",
}: {
  kind: CatalogKind;
  id?: string;
  url?: string;
  label?: string;
  hint?: string;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(url ?? "");
  const [stamp, setStamp] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setPreview(url ?? "");
  }, [url]);

  function runUpload(file: File) {
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("id", id ?? "");
    formData.set("file", file);

    startTransition(async () => {
      const result: MediaActionState = await uploadCatalogCoverAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) setPreview(result.url);
      setStamp(result.stamp);
      setMessage(result.message ?? "Cover image saved.");
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    });
  }

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
      setStamp(undefined);
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
            <img
              src={`${preview}${stamp ? `?v=${stamp}` : ""}`}
              alt="Current cover"
              className="h-full w-full object-cover"
            />
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

        <div className="flex min-w-[180px] flex-col gap-1.5">
          {disabled ? (
            <p className="rounded-control border border-dashed border-line bg-slate-50 px-3 py-2 text-[10.5px] leading-4 text-slate-500">
              Save this package first. The cover image can be added on the edit screen.
            </p>
          ) : (
            <>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) runUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" /> {preview ? "Replace image" : "Upload image"}
              </button>
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
