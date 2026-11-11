"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { updateHomepageAction, type HomepageState } from "@/app/admin/homepage/actions";
import type { AppSettings, GalleryImage } from "@/lib/types";

const initialState: HomepageState = {};

export function HomepageForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateHomepageAction, initialState);
  const [rows, setRows] = useState<GalleryImage[]>(settings.gallery);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    setRows(settings.gallery);
  }, [settings.gallery]);

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  return (
    <form action={formAction} className="space-y-6">
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

      <section className="space-y-4">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Hero copy</h2>
          <p className="text-[11px] text-muted">The first thing visitors read on the public home page.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow / badge" className="sm:col-span-2">
            <Input name="eyebrow" defaultValue={settings.homepage.eyebrow} maxLength={80} />
          </Field>
          <Field label="Headline" required error={errors.headline}>
            <Input name="headline" defaultValue={settings.homepage.headline} required />
          </Field>
          <Field label="Highlighted phrase" hint="Shown in the brand colour after the headline.">
            <Input name="highlight" defaultValue={settings.homepage.highlight} />
          </Field>
          <Field label="Introduction" className="sm:col-span-2" error={errors.subtitle} required>
            <Textarea name="subtitle" rows={3} defaultValue={settings.homepage.subtitle} required />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Calls to action</h2>
          <p className="text-[11px] text-muted">Buttons shown under the hero search.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary button label">
            <Input name="primaryLabel" defaultValue={settings.homepage.primaryLabel} />
          </Field>
          <Field label="Primary button link">
            <Input name="primaryHref" defaultValue={settings.homepage.primaryHref} placeholder="/tours" />
          </Field>
          <Field label="Secondary button label">
            <Input name="secondaryLabel" defaultValue={settings.homepage.secondaryLabel} />
          </Field>
          <Field label="Secondary button link">
            <Input name="secondaryHref" defaultValue={settings.homepage.secondaryHref} placeholder="/contact" />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Gallery</h2>
          <p className="text-[11px] text-muted">Shown on the home page beneath the featured tours.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gallery heading">
            <Input name="galleryTitle" defaultValue={settings.homepage.galleryTitle} />
          </Field>
          <Field label="Gallery introduction">
            <Input name="gallerySubtitle" defaultValue={settings.homepage.gallerySubtitle} />
          </Field>
        </div>

        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="rounded-control border border-dashed border-line px-3 py-4 text-center text-[11.5px] text-muted">
              No gallery images yet. Add one by URL or upload a file below.
            </p>
          ) : null}

          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-card border border-line bg-slate-50/50 p-3 sm:grid-cols-[150px_minmax(0,1fr)_auto]">
              <input type="hidden" name="galleryId" value={row.id} />
              <div className="relative h-[92px] overflow-hidden rounded-control border border-line bg-white">
                {row.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.url} alt={row.alt || row.caption || `Gallery image ${index + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-slate-300">
                    <ImagePlus className="h-5 w-5" />
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Input
                  name="galleryUrl"
                  value={row.url}
                  onChange={(event) =>
                    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, url: event.target.value } : item)))
                  }
                  placeholder="https://… or /uploads/gallery/…"
                  aria-label={`Image URL ${index + 1}`}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    name="galleryCaption"
                    value={row.caption}
                    onChange={(event) =>
                      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, caption: event.target.value } : item)))
                    }
                    placeholder="Caption"
                    aria-label={`Image caption ${index + 1}`}
                  />
                  <Input
                    name="galleryAlt"
                    value={row.alt}
                    onChange={(event) =>
                      setRows((current) => current.map((item) => (item.id === row.id ? { ...item, alt: event.target.value } : item)))
                    }
                    placeholder="Alt text (for accessibility)"
                    aria-label={`Image alt text ${index + 1}`}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))}
                className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-control border border-line bg-white px-2.5 text-[11.5px] font-medium text-slate-500 hover:border-red-200 hover:text-red-600"
                aria-label={`Remove image ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setRows((current) => [...current, { id: crypto.randomUUID(), url: "", caption: "", alt: "" }])
            }
            className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-line bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
          >
            <ImagePlus className="h-3.5 w-3.5" /> Add image by URL
          </button>
        </div>

        <Field label="Upload images" hint="JPG, PNG, WebP, GIF or AVIF · up to 4 MB each. Uploaded images are appended to the gallery.">
          <input
            type="file"
            name="galleryFiles"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            aria-label="Upload gallery images"
            className="block w-full rounded-control border border-dashed border-line bg-slate-50/60 px-3 py-2.5 text-[11.5px] text-slate-500 file:mr-3 file:rounded file:border-0 file:bg-primary file:px-2.5 file:py-1.5 file:text-[11px] file:font-semibold file:text-white"
          />
        </Field>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={pending} className="h-10">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save front page"}
        </Button>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Upload className="h-3.5 w-3.5 text-primary" /> Saves to Supabase and updates the live public site.
        </span>
      </div>
    </form>
  );
}
