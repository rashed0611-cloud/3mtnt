"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Image as ImageIcon, Images, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { updatePageAction, type PageSettingsState } from "@/app/admin/pages/actions";
import { toMediaDisplayUrl } from "@/lib/media-url";
import type { SitePageSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: PageSettingsState = {};

export function PageSettingsForm({
  pageKey,
  pageName,
  path,
  settings,
  defaultEyebrow,
}: {
  pageKey: string;
  pageName: string;
  path: string;
  settings: SitePageSettings;
  defaultEyebrow: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updatePageAction, initialState);
  const galleryHref = `/admin/gallery?page=${pageKey}`;

  const [bannerUrl, setBannerUrl] = useState(settings.banner.imageUrl);
  const [overlay, setOverlay] = useState(settings.banner.overlay);
  const [accent, setAccent] = useState(settings.accent);
  const [eyebrow, setEyebrow] = useState(settings.eyebrow);
  const [heading, setHeading] = useState(settings.heading);
  const [subtitle, setSubtitle] = useState(settings.subtitle);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  // The gallery writes the banner immediately, so pick up its choice when the
  // editor comes back to this tab.
  useEffect(() => {
    setBannerUrl(settings.banner.imageUrl);
  }, [settings.banner.imageUrl]);

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [router]);

  const preview = useMemo(() => (bannerUrl ? toMediaDisplayUrl(bannerUrl) : ""), [bannerUrl]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="page" value={pageKey} />
      <input type="hidden" name="bannerUrl" value={bannerUrl} />

      {state.message ? (
        <div className="flex items-center gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {state.message}
        </div>
      ) : null}
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">Banner</h2>
              <p className="text-[11px] text-muted">
                A wide photo behind the page header. Without one, {pageName} keeps its current design.
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-[120px] w-full max-w-[280px] overflow-hidden rounded-control border border-line bg-slate-100">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Default page design</span>
                  </span>
                )}
                {preview ? <div className="absolute inset-0" style={{ background: `rgba(15,23,42,${overlay / 100})` }} /> : null}
              </div>

              <div className="min-w-[220px] flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={galleryHref}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary/90"
                  >
                    <Images className="h-3.5 w-3.5" /> Choose from gallery
                  </Link>
                  {bannerUrl ? (
                    <button
                      type="button"
                      onClick={() => setBannerUrl("")}
                      className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove banner
                    </button>
                  ) : null}
                </div>
                <p className="text-[10.5px] leading-4 text-muted">
                  Opens the Image Gallery in a new tab. Pick an existing image or upload a new one — the banner is applied
                  immediately. Save this page to update the overlay or copy.
                </p>
                <Field label={`Overlay darkness · ${overlay}%`}>
                  <input
                    type="range"
                    name="overlay"
                    min={0}
                    max={85}
                    step={5}
                    value={overlay}
                    onChange={(event) => setOverlay(Number(event.target.value))}
                    className="mt-2 h-2 w-full accent-primary"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="space-y-4 border-t border-line pt-5">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">Page copy</h2>
              <p className="text-[11px] text-muted">The heading and introduction shown at the top of the page.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Badge text"
                hint={defaultEyebrow ? `Default: ${defaultEyebrow}` : "Leave empty to keep the live counts on this page."}
                className="sm:col-span-2"
                error={errors.eyebrow}
              >
                <Input
                  name="eyebrow"
                  value={eyebrow}
                  onChange={(event) => setEyebrow(event.target.value)}
                  placeholder={defaultEyebrow || "Built automatically from live data"}
                  maxLength={80}
                />
              </Field>
              <Field label="Heading" required className="sm:col-span-2" error={errors.heading}>
                <Input name="heading" value={heading} onChange={(event) => setHeading(event.target.value)} required />
              </Field>
              <Field label="Introduction" required className="sm:col-span-2" error={errors.subtitle}>
                <Textarea name="subtitle" rows={4} value={subtitle} onChange={(event) => setSubtitle(event.target.value)} required />
              </Field>
            </div>
          </section>

          <section className="space-y-4 border-t border-line pt-5">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">Page accent</h2>
              <p className="text-[11px] text-muted">
                Buttons, links and highlights on this page. Leave it empty to follow the site-wide brand colour.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                value={/^#[0-9a-f]{6}$/i.test(accent) ? accent : "#0b74de"}
                onChange={(event) => setAccent(event.target.value)}
                aria-label="Page accent colour picker"
                className="h-10 w-12 cursor-pointer rounded-control border border-line bg-white p-1"
              />
              <Input
                name="accent"
                value={accent}
                onChange={(event) => setAccent(event.target.value)}
                placeholder="#0b74de (optional)"
                maxLength={7}
                spellCheck={false}
                className="w-40 font-mono text-[12px]"
              />
              <button
                type="button"
                onClick={() => setAccent("")}
                className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Use brand colour
              </button>
            </div>
            {errors.accent ? <p className="text-[11px] font-medium text-red-600">{errors.accent}</p> : null}
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pending ? "Saving…" : "Save page"}
            </Button>
            <span className="text-[11px] text-muted">Saves to Supabase and updates {path} immediately.</span>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-4 space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Banner preview</p>
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <div className="relative flex min-h-[190px] flex-col justify-end p-4" style={{ background: "#0f172a" }}>
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `rgba(15,23,42,${overlay / 100})` }} />
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(135deg, rgb(var(--primary-rgb) / 0.14), var(--page-bg))" }}
                  />
                )}
                <div className="relative">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[8px] font-semibold",
                      preview ? "bg-white/15 text-white backdrop-blur" : "bg-white text-primary",
                    )}
                  >
                    {eyebrow || defaultEyebrow || "Page badge"}
                  </span>
                  <p className={cn("mt-2 text-[18px] font-bold leading-tight", preview ? "text-white" : "text-ink")}>
                    {heading || "Page heading"}
                  </p>
                  <p className={cn("mt-1 line-clamp-3 text-[10px] leading-4", preview ? "text-white/80" : "text-slate-500")}>
                    {subtitle || "A short introduction for visitors."}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line px-3 py-2 text-[10px] text-muted">
                <span>{pageName}</span>
                <span>{path}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
