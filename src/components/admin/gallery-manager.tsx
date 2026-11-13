"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Copy,
  ImageIcon,
  Images,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deleteMediaAction,
  uploadCatalogCoverAction,
  uploadGalleryImagesAction,
  uploadProductImagesAction,
  useLibraryImageAction,
  type MediaActionState,
} from "@/app/admin/gallery/actions";
import { toAbsoluteMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

type MediaKind = "tour" | "hotel" | "visa" | "hajj";

export interface GalleryTarget {
  kind: MediaKind;
  id: string;
  name: string;
  slot: "cover" | "related";
  editHref: string;
}

export interface GalleryItem {
  path: string;
  name: string;
  url: string;
  folder: string;
  group: "catalog" | "product" | "site";
  kind?: MediaKind;
  entityId?: string;
  size: number;
  updatedAt?: string;
  usedBy?: string;
}

const FILTERS = [
  { key: "all", label: "All images" },
  { key: "cover", label: "Covers" },
  { key: "related", label: "Related photos" },
  { key: "tour", label: "Tours" },
  { key: "hotel", label: "Hotels" },
  { key: "visa", label: "Visas" },
  { key: "hajj", label: "Hajj" },
  { key: "site", label: "Site media" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const KIND_LABEL: Record<MediaKind, string> = {
  tour: "Tour cover",
  hotel: "Hotel cover",
  visa: "Visa cover",
  hajj: "Hajj cover",
};

const PHOTO_LABEL: Record<MediaKind, string> = {
  tour: "Tour photo",
  hotel: "Hotel photo",
  visa: "Visa photo",
  hajj: "Hajj photo",
};

function formatBytes(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function GalleryManager({
  items,
  canManage,
  target,
}: {
  items: GalleryItem[];
  canManage: boolean;
  target?: GalleryTarget;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const relatedInput = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const [uploadState, uploadAction, uploading] = useActionState(uploadGalleryImagesAction, {} as MediaActionState);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attachMessage, setAttachMessage] = useState<string | null>(null);
  const [attaching, startAttach] = useTransition();

  useEffect(() => {
    if (uploadState.ok) {
      if (fileInput.current) fileInput.current.value = "";
      router.refresh();
    }
  }, [uploadState, router]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "site" && item.group !== "site") return false;
      if (filter === "cover" && item.group !== "catalog") return false;
      if (filter === "related" && item.group !== "product") return false;
      if (filter !== "all" && !["site", "cover", "related"].includes(filter) && item.kind !== filter) return false;
      if (!needle) return true;
      return [item.name, item.path, item.usedBy, item.kind].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [items, filter, term]);

  async function copyUrl(item: GalleryItem) {
    try {
      await navigator.clipboard.writeText(toAbsoluteMediaUrl(item.url));
      setCopied(item.path);
    } catch {
      setCopied(null);
    }
  }

  function uploadCover(files: FileList) {
    if (!target) return;
    const file = files[0];
    if (!file) return;
    setAttachError(null);
    setAttachMessage(null);
    const formData = new FormData();
    formData.set("kind", target.kind);
    formData.set("id", target.id);
    formData.set("file", file);

    startAttach(async () => {
      const result: MediaActionState = await uploadCatalogCoverAction({}, formData);
      if (result.error) {
        setAttachError(result.error);
        return;
      }
      setAttachMessage(result.message ?? "Cover image saved.");
      if (coverInput.current) coverInput.current.value = "";
      router.refresh();
    });
  }

  function uploadRelated(files: FileList) {
    if (!target || !files.length) return;
    setAttachError(null);
    setAttachMessage(null);
    const formData = new FormData();
    formData.set("kind", target.kind);
    formData.set("id", target.id);
    for (const file of Array.from(files)) formData.append("files", file);

    startAttach(async () => {
      const result: MediaActionState = await uploadProductImagesAction({}, formData);
      if (result.error) {
        setAttachError(result.error);
        return;
      }
      setAttachMessage(result.message ?? "Photos added.");
      if (relatedInput.current) relatedInput.current.value = "";
      router.refresh();
    });
  }

  function useImage(item: GalleryItem) {
    if (!target) return;
    setAttachError(null);
    setAttachMessage(null);
    const formData = new FormData();
    formData.set("kind", target.kind);
    formData.set("id", target.id);
    formData.set("path", item.path);
    formData.set("slot", target.slot);

    startAttach(async () => {
      const result: MediaActionState = await useLibraryImageAction({}, formData);
      if (result.error) {
        setAttachError(result.error);
        return;
      }
      setAttachMessage(result.message ?? "Image added to the package.");
      router.refresh();
    });
  }

  function remove(item: GalleryItem) {
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteMediaAction(item.path);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      setConfirming(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {target ? (
        <div className="card-surface space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-ink">Adding images for {target.name}</p>
              <p className="text-[11px] leading-5 text-muted">
                Choose an image below to display on this package, or upload a new one. Images are attached to this package
                immediately and stay in the gallery.
              </p>
            </div>
            <Link
              href={target.editHref}
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to package
            </Link>
          </div>

          {canManage ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => (target.slot === "cover" ? coverInput : relatedInput).current?.click()}
                  disabled={attaching}
                  className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {attaching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload new image
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11px] font-medium text-slate-500">
                  <Images className="h-3.5 w-3.5" /> Or pick one from the gallery below
                </span>
              </div>
              <input
                ref={coverInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => {
                  if (event.currentTarget.files?.length) uploadCover(event.currentTarget.files);
                }}
              />
              <input
                ref={relatedInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (event.currentTarget.files?.length) uploadRelated(event.currentTarget.files);
                }}
              />
            </>
          ) : (
            <p className="rounded-control border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-900">
              Your role can view this package but not change its images.
            </p>
          )}

          {attachError ? (
            <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
              {attachError}
            </p>
          ) : attachMessage ? (
            <p className="text-[11px] font-medium text-emerald-600">
              {attachMessage}{" "}
              <Link href={target.editHref} className="font-semibold underline underline-offset-2">
                Back to package
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {canManage && !target ? (
        <div className="card-surface p-4">
          <form action={uploadAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-blue-50 text-primary">
                <Upload className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold text-ink">Upload images</p>
                <p className="text-[11px] text-muted">JPG, PNG, WebP, AVIF or GIF up to 4 MB each. Upload several at once.</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInput}
                type="file"
                name="files"
                multiple
                accept="image/*"
                className="max-w-[240px] text-[11px] text-slate-600 file:mr-2 file:rounded-control file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-[11px] file:font-semibold file:text-slate-600 hover:file:bg-slate-200"
              />
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
          {uploadState.error ? (
            <p role="alert" className="mt-3 rounded-control border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
              {uploadState.error}
            </p>
          ) : uploadState.message ? (
            <p className="mt-3 text-[11px] font-medium text-emerald-600">{uploadState.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="card-surface flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                filter === item.key ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search by name or package"
            className="w-full rounded-control border border-line bg-white py-1.5 pl-8 pr-3 text-[11.5px] text-ink outline-none focus:border-primary lg:w-[240px]"
          />
        </label>
      </div>

      {deleteError ? (
        <p role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-medium text-red-700">
          {deleteError}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Images className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-ink">{items.length === 0 ? "No images uploaded yet" : "No images match this filter"}</p>
          <p className="max-w-sm text-[11.5px] text-muted">
            {items.length === 0
              ? "Upload a photo here, or add a cover image from any tour, hotel, visa or Hajj package edit screen."
              : "Try a different filter or clear the search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const isConfirming = confirming === item.path;
            const isTargetImage =
              target &&
              item.kind === target.kind &&
              item.entityId === target.id &&
              (target.slot === "cover" ? item.group === "catalog" : item.group === "product");
            return (
              <article key={item.path} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.usedBy ?? item.name} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute left-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                    {item.kind ? (item.group === "product" ? PHOTO_LABEL[item.kind] : KIND_LABEL[item.kind]) : "Site media"}
                  </span>
                  {isTargetImage ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[9.5px] font-semibold text-white">
                      <Check className="h-2.5 w-2.5" /> In this package
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-ink">{item.usedBy ?? item.name}</p>
                    <p className="truncate text-[10px] text-muted" title={item.path}>
                      {item.path}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>{formatBytes(item.size)}</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>

                  {target && canManage ? (
                    <button
                      type="button"
                      onClick={() => useImage(item)}
                      disabled={attaching}
                      className="inline-flex w-full items-center justify-center gap-1 rounded-control bg-primary px-2 py-1.5 text-[10.5px] font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                    >
                      {attaching ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : target.slot === "cover" ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Images className="h-3 w-3" />
                      )}
                      {target.slot === "cover" ? "Use as cover" : "Add to package"}
                    </button>
                  ) : null}

                  <div className="flex gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => copyUrl(item)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-control border border-line bg-white px-2 py-1.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
                    >
                      {copied === item.path ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      {copied === item.path ? "Copied" : "Copy URL"}
                    </button>
                    {canManage ? (
                      isConfirming ? (
                        <span className="flex flex-1 gap-1">
                          <button
                            type="button"
                            onClick={() => remove(item)}
                            disabled={deleting}
                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-control bg-red-600 px-2 py-1.5 text-[10.5px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirming(null)}
                            className="inline-flex items-center justify-center rounded-control border border-line bg-white px-2 py-1.5 text-slate-500 hover:bg-slate-50"
                            aria-label="Cancel delete"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirming(item.path)}
                          className="inline-flex items-center justify-center gap-1 rounded-control border border-line bg-white px-2 py-1.5 text-[10.5px] font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {items.length > 0 ? (
        <p className="flex items-center gap-1.5 text-[10.5px] text-muted">
          <ImageIcon className="h-3 w-3" /> {filtered.length} of {items.length} image{items.length === 1 ? "" : "s"} shown. Deleting an image removes it from
          storage — product covers and website placements that use it will stop showing it.
        </p>
      ) : null}
    </div>
  );
}
