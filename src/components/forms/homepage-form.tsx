"use client";

import { useActionState, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  Megaphone,
  Palette,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { updateHomepageAction, type HomepageState } from "@/app/admin/homepage/actions";
import { FONT_OPTIONS, fontStack } from "@/lib/fonts";
import { DEFAULT_APPEARANCE } from "@/lib/settings-defaults";
import { prefersLightText, themeStyle } from "@/lib/theme";
import type { AppSettings, GalleryImage, SiteAppearance } from "@/lib/types";
import { cn } from "@/lib/utils";

const initialState: HomepageState = {};

type TabKey = "content" | "brand" | "colours" | "fonts" | "banner" | "sections" | "gallery" | "seo";

const TABS: { key: TabKey; label: string; icon: typeof Palette }[] = [
  { key: "content", label: "Page content", icon: LayoutTemplate },
  { key: "brand", label: "Logo & brand", icon: ImageIcon },
  { key: "colours", label: "Colours", icon: Palette },
  { key: "fonts", label: "Fonts & corners", icon: Type },
  { key: "banner", label: "Header & banner", icon: Megaphone },
  { key: "sections", label: "Sections", icon: Eye },
  { key: "gallery", label: "Gallery", icon: ImagePlus },
  { key: "seo", label: "SEO & sharing", icon: Search },
];

function ColorField({
  label,
  name,
  value,
  error,
  hint,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  error?: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} picker`}
          className="h-10 w-12 cursor-pointer rounded-control border border-line bg-white p-1"
        />
        <Input
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#0b74de"
          maxLength={7}
          spellCheck={false}
          className="font-mono text-[12px]"
        />
      </div>
    </Field>
  );
}

function ImagePicker({
  label,
  hint,
  urlName,
  fileFieldName,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/avif,image/svg+xml",
  previewClassName = "h-16 w-24",
}: {
  label: string;
  hint?: string;
  urlName: string;
  fileFieldName: string;
  value: string;
  onChange: (value: string) => void;
  accept?: string;
  previewClassName?: string;
}) {
  const [local, setLocal] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const objectUrl = useRef<string | null>(null);
  const fieldId = useId();

  useEffect(() => {
    return () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    };
  }, []);

  return (
    <Field label={label} hint={hint}>
      <div className="flex gap-3">
        <div className={cn("relative shrink-0 overflow-hidden rounded-control border border-line bg-slate-50", previewClassName)}>
          {local || value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={local || value} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-300">
              <ImageIcon className="h-5 w-5" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            name={urlName}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… or upload below"
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center gap-2">
            <input
              id={fieldId}
              type="file"
              name={fileFieldName}
              accept={accept}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                if (file) {
                  objectUrl.current = URL.createObjectURL(file);
                  setLocal(objectUrl.current);
                  setFileName(file.name);
                } else {
                  setLocal(null);
                  setFileName("");
                }
              }}
              className="sr-only"
            />
            <label
              htmlFor={fieldId}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-control border border-line bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              <Upload className="h-3 w-3" /> Upload image
            </label>
            <span className="max-w-[140px] truncate text-[10.5px] text-slate-400">
              {fileName || "JPG, PNG, SVG or WebP"}
            </span>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-control border border-line bg-white px-2 py-1 text-[10.5px] font-medium text-slate-500 hover:border-red-200 hover:text-red-600"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Field>
  );
}

function Toggle({
  name,
  label,
  description,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-control border border-line bg-white px-3.5 py-3 transition hover:border-primary/30">
      <input
        type="checkbox"
        name={name}
        value="on"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
      />
      <span>
        <span className="block text-[12px] font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-[10.5px] leading-4 text-slate-500">{description}</span>
      </span>
    </label>
  );
}

export function HomepageForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(updateHomepageAction, initialState);
  const [tab, setTab] = useState<TabKey>("content");
  const [faviconName, setFaviconName] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<string[]>([]);
  const faviconFieldId = useId();
  const [rows, setRows] = useState<GalleryImage[]>(settings.gallery);
  const [appearance, setAppearance] = useState<SiteAppearance>(settings.appearance);
  const [hero, setHero] = useState({
    eyebrow: settings.homepage.eyebrow,
    headline: settings.homepage.headline,
    highlight: settings.homepage.highlight,
    subtitle: settings.homepage.subtitle,
    primaryLabel: settings.homepage.primaryLabel,
    secondaryLabel: settings.homepage.secondaryLabel,
  });
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    setRows(settings.gallery);
    setAppearance(settings.appearance);
  }, [settings.gallery, settings.appearance]);

  useEffect(() => {
    if (state.message) router.refresh();
  }, [state.message, router]);

  const patch = <K extends keyof SiteAppearance>(key: K, value: SiteAppearance[K]) =>
    setAppearance((current) => ({ ...current, [key]: value }));

  const styles = useMemo(() => themeStyle(appearance), [appearance]);
  const banner = appearance.banner;
  const lightHero = Boolean(banner.imageUrl) && prefersLightText("#0f172a");

  return (
    <form action={formAction} className="space-y-5">
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

      <div className="flex flex-wrap gap-1 rounded-control border border-line bg-slate-50 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[11.5px] font-medium transition",
              tab === key ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          {/* ---------------------------------------------------------- */}
          {/* Page content                                               */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "content"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Hero copy</h2>
                <p className="text-[11px] text-muted">The first thing visitors read on the public home page.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow / badge" className="sm:col-span-2">
                  <Input
                    name="eyebrow"
                    value={hero.eyebrow}
                    onChange={(event) => setHero({ ...hero, eyebrow: event.target.value })}
                    maxLength={80}
                  />
                </Field>
                <Field label="Headline" required error={errors.headline}>
                  <Input
                    name="headline"
                    value={hero.headline}
                    onChange={(event) => setHero({ ...hero, headline: event.target.value })}
                    required
                  />
                </Field>
                <Field label="Highlighted phrase" hint="Shown in the brand colour after the headline.">
                  <Input
                    name="highlight"
                    value={hero.highlight}
                    onChange={(event) => setHero({ ...hero, highlight: event.target.value })}
                  />
                </Field>
                <Field label="Introduction" className="sm:col-span-2" error={errors.subtitle} required>
                  <Textarea
                    name="subtitle"
                    rows={3}
                    value={hero.subtitle}
                    onChange={(event) => setHero({ ...hero, subtitle: event.target.value })}
                    required
                  />
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
                  <Input
                    name="primaryLabel"
                    value={hero.primaryLabel}
                    onChange={(event) => setHero({ ...hero, primaryLabel: event.target.value })}
                  />
                </Field>
                <Field label="Primary button link">
                  <Input name="primaryHref" defaultValue={settings.homepage.primaryHref} placeholder="/tours" />
                </Field>
                <Field label="Secondary button label">
                  <Input
                    name="secondaryLabel"
                    value={hero.secondaryLabel}
                    onChange={(event) => setHero({ ...hero, secondaryLabel: event.target.value })}
                  />
                </Field>
                <Field label="Secondary button link">
                  <Input name="secondaryHref" defaultValue={settings.homepage.secondaryHref} placeholder="/contact" />
                </Field>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Brand                                                       */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "brand"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Logo &amp; identity</h2>
                <p className="text-[11px] text-muted">
                  Upload a logo, or leave it empty to use the “{settings.logoText}” monogram. PNG, SVG or WebP with a transparent
                  background works best.
                </p>
              </div>
              <ImagePicker
                label="Logo image"
                hint="Shown in the public header and footer. Recommended height 64px."
                urlName="logoUrl"
                fileFieldName="logoFile"
                value={appearance.brand.logoUrl}
                onChange={(value) => patch("brand", { ...appearance.brand, logoUrl: value })}
                previewClassName="h-16 w-32"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo tagline" hint="Small line under the brand name.">
                  <Input
                    name="logoTagline"
                    value={appearance.brand.logoTagline}
                    onChange={(event) => patch("brand", { ...appearance.brand, logoTagline: event.target.value })}
                    maxLength={40}
                  />
                </Field>
                <Field label="Browser icon (favicon)" hint="PNG, SVG or ICO. 32×32 or 64×64.">
                  <input type="hidden" name="faviconUrl" value={appearance.brand.faviconUrl} />
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-slate-50">
                      {appearance.brand.faviconUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={appearance.brand.faviconUrl} alt="" className="h-6 w-6 object-contain" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-slate-300" />
                      )}
                    </span>
                    <input
                      id={faviconFieldId}
                      type="file"
                      name="faviconFile"
                      accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                      onChange={(event) => setFaviconName(event.target.files?.[0]?.name ?? "")}
                      className="sr-only"
                    />
                    <label
                      htmlFor={faviconFieldId}
                      className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-control border border-line bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
                    >
                      <Upload className="h-3 w-3" /> Upload icon
                    </label>
                    <span className="min-w-0 truncate text-[10.5px] text-slate-400">
                      {faviconName || "PNG, SVG or ICO"}
                    </span>
                  </div>
                </Field>
              </div>
            </section>

            <section className="space-y-4 border-t border-line pt-5">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Social profiles</h2>
                <p className="text-[11px] text-muted">Full links shown in the public footer. Leave empty to hide.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["facebook", "Facebook"],
                  ["instagram", "Instagram"],
                  ["youtube", "YouTube"],
                  ["linkedin", "LinkedIn"],
                  ["whatsapp", "WhatsApp link"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <Input
                      name={key}
                      value={appearance.brand[key as keyof SiteAppearance["brand"]] as string}
                      onChange={(event) => patch("brand", { ...appearance.brand, [key]: event.target.value })}
                      placeholder="https://…"
                      spellCheck={false}
                    />
                  </Field>
                ))}
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Colours                                                     */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "colours"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Brand colours</h2>
                <p className="text-[11px] text-muted">
                  These colours apply across the public site: buttons, links, badges, the page background and the footer.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ColorField
                  label="Primary colour"
                  name="color_primary"
                  value={appearance.colors.primary}
                  error={errors.color_primary}
                  hint="Buttons, links and highlights."
                  onChange={(value) => patch("colors", { ...appearance.colors, primary: value })}
                />
                <ColorField
                  label="Accent colour"
                  name="color_accent"
                  value={appearance.colors.accent}
                  error={errors.color_accent}
                  hint="Decorative gradients and secondary highlights."
                  onChange={(value) => patch("colors", { ...appearance.colors, accent: value })}
                />
                <ColorField
                  label="Page background"
                  name="color_page"
                  value={appearance.colors.page}
                  error={errors.color_page}
                  hint="Behind sections and cards."
                  onChange={(value) => patch("colors", { ...appearance.colors, page: value })}
                />
                <ColorField
                  label="Body text"
                  name="color_text"
                  value={appearance.colors.text}
                  error={errors.color_text}
                  hint="Headings and primary copy."
                  onChange={(value) => patch("colors", { ...appearance.colors, text: value })}
                />
                <ColorField
                  label="Footer background"
                  name="color_footer"
                  value={appearance.colors.footer}
                  error={errors.color_footer}
                  hint="Dark area at the bottom of every page."
                  onChange={(value) => patch("colors", { ...appearance.colors, footer: value })}
                />
              </div>
              <div className="flex flex-wrap gap-2 rounded-control border border-line bg-slate-50 px-3 py-3">
                {Object.entries(appearance.colors).map(([key, value]) => (
                  <span key={key} className="inline-flex items-center gap-1.5 text-[10.5px] text-slate-500">
                    <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: value }} />
                    {key}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Fonts                                                       */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "fonts"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Typography</h2>
                <p className="text-[11px] text-muted">
                  Fonts load from Google Fonts and only the two you choose are downloaded by visitors.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Heading font" hint="Headlines and section titles.">
                  <Select
                    name="headingFont"
                    value={appearance.typography.headingFont}
                    onChange={(event) => patch("typography", { ...appearance.typography, headingFont: event.target.value })}
                    style={{ fontFamily: fontStack(appearance.typography.headingFont) }}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.key} value={font.key}>
                        {font.label} · {font.category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Body font" hint="Paragraphs, menus and forms.">
                  <Select
                    name="bodyFont"
                    value={appearance.typography.bodyFont}
                    onChange={(event) => patch("typography", { ...appearance.typography, bodyFont: event.target.value })}
                    style={{ fontFamily: fontStack(appearance.typography.bodyFont) }}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.key} value={font.key}>
                        {font.label} · {font.category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Heading weight" hint="How bold headline text appears.">
                  <Select
                    name="headingWeight"
                    value={String(appearance.typography.headingWeight)}
                    onChange={(event) => patch("typography", { ...appearance.typography, headingWeight: Number(event.target.value) })}
                  >
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra bold (800)</option>
                  </Select>
                </Field>
                <Field label="Corner radius" hint={`${appearance.typography.radius}px · cards, images and inputs.`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={28}
                      step={1}
                      value={appearance.typography.radius}
                      onChange={(event) =>
                        patch("typography", { ...appearance.typography, radius: Number(event.target.value) })
                      }
                      className="h-2 w-full accent-primary"
                      aria-label="Corner radius"
                    />
                    <Input
                      name="radius"
                      type="number"
                      min={0}
                      max={28}
                      value={appearance.typography.radius}
                      onChange={(event) =>
                        patch("typography", { ...appearance.typography, radius: Number(event.target.value) })
                      }
                      className="w-20"
                    />
                  </div>
                </Field>
              </div>
              <div className="rounded-control border border-line bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Preview</p>
                <p
                  className="mt-1 text-[20px] font-bold text-ink"
                  style={{ fontFamily: fontStack(appearance.typography.headingFont), fontWeight: appearance.typography.headingWeight }}
                >
                  Journeys worth remembering
                </p>
                <p className="mt-1 text-[12px] text-slate-500" style={{ fontFamily: fontStack(appearance.typography.bodyFont) }}>
                  The quick brown fox jumps over the lazy dog · 0123456789
                </p>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Header & banner                                             */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "banner"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Hero banner</h2>
                <p className="text-[11px] text-muted">
                  Upload a wide banner for the top of the home page. Without one, the hero uses a soft brand gradient.
                </p>
              </div>
              <ImagePicker
                label="Banner image"
                hint="Wide image, ideally 2400×1200 or larger. JPG or WebP."
                urlName="bannerUrl"
                fileFieldName="bannerFile"
                value={banner.imageUrl}
                onChange={(value) => patch("banner", { ...banner, imageUrl: value })}
                previewClassName="h-16 w-28"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Overlay darkness" hint={`${banner.overlay}% tint over the image.`}>
                  <input
                    type="range"
                    name="bannerOverlay"
                    min={0}
                    max={85}
                    step={5}
                    value={banner.overlay}
                    onChange={(event) => patch("banner", { ...banner, overlay: Number(event.target.value) })}
                    className="mt-3 h-2 w-full accent-primary"
                  />
                </Field>
                <Field label="Text alignment">
                  <Select
                    name="bannerAlign"
                    value={banner.align}
                    onChange={(event) => patch("banner", { ...banner, align: event.target.value === "center" ? "center" : "left" })}
                  >
                    <option value="left">Left · with featured card</option>
                    <option value="center">Centred · wide banner</option>
                  </Select>
                </Field>
                <Field label="Hero height">
                  <Select
                    name="bannerHeight"
                    value={banner.height}
                    onChange={(event) =>
                      patch("banner", {
                        ...banner,
                        height: event.target.value === "compact" ? "compact" : event.target.value === "tall" ? "tall" : "standard",
                      })
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="standard">Standard</option>
                    <option value="tall">Tall</option>
                  </Select>
                </Field>
              </div>
              <Toggle
                name="bannerShowSearch"
                label="Show the search box in the hero"
                description="Visitors can start a tour, hotel or visa search from the banner."
                checked={banner.showSearch}
                onChange={(checked) => patch("banner", { ...banner, showSearch: checked })}
              />
            </section>

            <section className="space-y-4 border-t border-line pt-5">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Announcement bar</h2>
                <p className="text-[11px] text-muted">A slim strip above the header for offers and seasonal notices.</p>
              </div>
              <Toggle
                name="announcementEnabled"
                label="Show the announcement bar"
                description="Displayed on every public page until switched off."
                checked={appearance.announcement.enabled}
                onChange={(checked) => patch("announcement", { ...appearance.announcement, enabled: checked })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Announcement text" className="sm:col-span-2">
                  <Input
                    name="announcementText"
                    value={appearance.announcement.text}
                    onChange={(event) => patch("announcement", { ...appearance.announcement, text: event.target.value })}
                    maxLength={160}
                  />
                </Field>
                <Field label="Link label">
                  <Input
                    name="announcementLinkLabel"
                    value={appearance.announcement.linkLabel}
                    onChange={(event) => patch("announcement", { ...appearance.announcement, linkLabel: event.target.value })}
                    maxLength={40}
                  />
                </Field>
                <Field label="Link destination">
                  <Input
                    name="announcementLinkHref"
                    value={appearance.announcement.linkHref}
                    onChange={(event) => patch("announcement", { ...appearance.announcement, linkHref: event.target.value })}
                  />
                </Field>
                <Field label="Bar style">
                  <Select
                    name="announcementTone"
                    value={appearance.announcement.tone}
                    onChange={(event) =>
                      patch("announcement", {
                        ...appearance.announcement,
                        tone: event.target.value === "dark" ? "dark" : event.target.value === "light" ? "light" : "brand",
                      })
                    }
                  >
                    <option value="brand">Brand colour</option>
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </Select>
                </Field>
              </div>
            </section>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Sections                                                    */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "sections"} className="space-y-4">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">Home page sections</h2>
              <p className="text-[11px] text-muted">Switch sections off to shorten the page without deleting content.</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["offers", "Offers strip", "Value picks and low-season deal cards under the hero."],
                  ["featuredTours", "Holiday showcase", "Filterable holiday cards built from live tours."],
                  ["stats", "Hero statistics", "Package, hotel, visa and pilgrim counts."],
                  ["gallery", "Gallery", "The image gallery managed below."],
                  ["services", "Services grid", "Flights, hotels, holidays, visa and pilgrimage."],
                  ["destinations", "Destinations", "Destination tiles built from live tours."],
                  ["pilgrimage", "Pilgrimage banner", "Hajj & Umrah promotion block."],
                  ["visas", "Visa cards", "Visa products with fees and processing times."],
                  ["testimonials", "Testimonials", "Traveller quotes, rating and partner strip."],
                  ["tips", "Travel tips", "Practical before-you-book advice."],
                  ["cta", "Closing call to action", "Final quote prompt at the bottom."],
                ] as const
              ).map(([key, label, description]) => (
                <Toggle
                  key={key}
                  name={`section_${key}`}
                  label={label}
                  description={description}
                  checked={appearance.sections[key]}
                  onChange={(checked) => patch("sections", { ...appearance.sections, [key]: checked })}
                />
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Gallery                                                     */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "gallery"} className="space-y-4">
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
                <div key={row.id} className="grid gap-3 rounded-control border border-line bg-slate-50/50 p-3 sm:grid-cols-[130px_minmax(0,1fr)_auto]">
                  <input type="hidden" name="galleryId" value={row.id} />
                  <div className="relative h-[80px] overflow-hidden rounded-control border border-line bg-white">
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
                onClick={() => setRows((current) => [...current, { id: crypto.randomUUID(), url: "", caption: "", alt: "" }])}
                className="inline-flex items-center gap-1.5 rounded-control border border-dashed border-line bg-white px-3 py-2 text-[11.5px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
              >
                <ImagePlus className="h-3.5 w-3.5" /> Add image by URL
              </button>
            </div>

            <Field label="Upload images" hint="JPG, PNG, WebP, GIF, AVIF or SVG · up to 4 MB each. Uploaded images are appended to the gallery.">
              <input
                id={faviconFieldId + "-gallery"}
                type="file"
                name="galleryFiles"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                multiple
                aria-label="Upload gallery images"
                onChange={(event) => setGalleryFiles([...(event.target.files ?? [])].map((file) => file.name))}
                className="sr-only"
              />
              <label
                htmlFor={faviconFieldId + "-gallery"}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-control border border-dashed border-line bg-slate-50/60 px-3 py-5 text-center transition hover:border-primary/40 hover:bg-primary/5"
              >
                <ImagePlus className="h-5 w-5 text-slate-400" />
                <span className="text-[11.5px] font-semibold text-slate-600">Choose images to upload</span>
                <span className="max-w-full truncate text-[10.5px] text-slate-400">
                  {galleryFiles.length ? galleryFiles.join(", ") : "JPG, PNG, WebP, GIF, AVIF or SVG"}
                </span>
              </label>
            </Field>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* SEO                                                         */}
          {/* ---------------------------------------------------------- */}
          <div hidden={tab !== "seo"} className="space-y-5">
            <section className="space-y-4">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Search &amp; sharing</h2>
                <p className="text-[11px] text-muted">Used by search engines and when a link is shared on social media.</p>
              </div>
              <Field label="Site title" hint={`${appearance.seo.title.length}/70 characters.`}>
                <Input
                  name="seoTitle"
                  value={appearance.seo.title}
                  onChange={(event) => patch("seo", { ...appearance.seo, title: event.target.value })}
                  maxLength={70}
                />
              </Field>
              <Field label="Meta description" hint={`${appearance.seo.description.length}/180 characters.`}>
                <Textarea
                  name="seoDescription"
                  rows={3}
                  value={appearance.seo.description}
                  onChange={(event) => patch("seo", { ...appearance.seo, description: event.target.value })}
                  maxLength={180}
                />
              </Field>
              <ImagePicker
                label="Social sharing image"
                hint="Shown when the site is shared. Ideal size 1200×630."
                urlName="ogImageUrl"
                fileFieldName="ogImageFile"
                value={appearance.seo.ogImageUrl}
                onChange={(value) => patch("seo", { ...appearance.seo, ogImageUrl: value })}
                previewClassName="h-16 w-28"
              />
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <Button type="submit" disabled={pending} className="h-10">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pending ? "Saving…" : "Save website"}
            </Button>
            <button
              type="button"
              onClick={() => setAppearance(DEFAULT_APPEARANCE)}
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:text-ink"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset style fields
            </button>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
              <Upload className="h-3.5 w-3.5 text-primary" /> Saves to Supabase and updates the live public site.
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* Live preview                                                  */}
        {/* ------------------------------------------------------------ */}
        <aside className="hidden xl:block">
          <div className="sticky top-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Live preview</p>
              <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-400">
                <Eye className="h-3 w-3" /> Updates as you type
              </span>
            </div>

            <div className="site-theme overflow-hidden rounded-2xl border border-line shadow-sm" style={styles}>
              {appearance.announcement.enabled ? (
                <div
                  className="px-3 py-1.5 text-center text-[9px] font-medium"
                  style={{
                    background:
                      appearance.announcement.tone === "brand"
                        ? "var(--primary)"
                        : appearance.announcement.tone === "dark"
                          ? "#0f172a"
                          : "#f1f5f9",
                    color:
                      appearance.announcement.tone === "light"
                        ? "#334155"
                        : "white",
                  }}
                >
                  {appearance.announcement.text || "Announcement"}
                  {appearance.announcement.linkLabel ? (
                    <span className="ml-1 underline underline-offset-2">{appearance.announcement.linkLabel}</span>
                  ) : null}
                </div>
              ) : null}

              <div className="flex items-center justify-between border-b border-line bg-white px-3 py-2">
                <div className="flex items-center gap-1.5">
                  {appearance.brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={appearance.brand.logoUrl} alt="" className="h-6 w-auto max-w-[90px] object-contain" />
                  ) : (
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-md text-[9px] font-bold text-white"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-strong))" }}
                    >
                      {settings.logoText}
                    </span>
                  )}
                  <span className="leading-none">
                    <span className="block text-[9px] font-bold text-ink">{settings.siteName.replace(" ERP", "")}</span>
                    <span className="block text-[6px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {appearance.brand.logoTagline}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[7px] text-slate-500">
                  <span>Tours</span>
                  <span>Flights</span>
                  <span>Visas</span>
                  <span className="rounded-full px-1.5 py-0.5 text-[6.5px] font-semibold text-white" style={{ background: "var(--primary)" }}>
                    Plan a trip
                  </span>
                </div>
              </div>

              <div
                className={cn("relative", banner.align === "center" ? "text-center" : "")}
                style={{
                  background: banner.imageUrl ? "#0f172a" : "linear-gradient(135deg, rgb(var(--primary-rgb) / 0.14), var(--page-bg))",
                  minHeight: banner.height === "compact" ? 150 : banner.height === "tall" ? 260 : 200,
                }}
              >
                {banner.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `rgba(15, 23, 42, ${banner.overlay / 100})` }} />
                  </>
                ) : null}
                <div className={cn("relative px-4 py-5", banner.align === "center" ? "mx-auto max-w-[260px]" : "")}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[6.5px] font-semibold",
                      lightHero ? "border-white/30 bg-white/10 text-white" : "border-primary/15 bg-white text-primary",
                    )}
                  >
                    ✦ {hero.eyebrow || "Eyebrow"}
                  </span>
                  <p
                    className={cn("mt-2 text-[15px] font-bold leading-tight", lightHero ? "text-white" : "text-ink")}
                    style={{ fontFamily: "var(--font-heading)", fontWeight: appearance.typography.headingWeight }}
                  >
                    {hero.headline || "Your headline"}{" "}
                    <span style={{ color: lightHero ? "rgba(255,255,255,0.85)" : "var(--primary)" }}>{hero.highlight}</span>
                  </p>
                  <p className={cn("mt-1.5 text-[7.5px] leading-3", lightHero ? "text-white/80" : "text-slate-500")}>
                    {(hero.subtitle || "A short introduction for visitors.").slice(0, 120)}
                  </p>
                  {banner.showSearch ? (
                    <div className={cn("mt-3 flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-sm", banner.align === "center" ? "justify-center" : "")}>
                      <Search className="h-2.5 w-2.5 text-slate-400" />
                      <span className="text-[6.5px] text-slate-400">Where do you want to go?</span>
                      <span className="ml-auto rounded-full px-2 py-0.5 text-[6px] font-semibold text-white" style={{ background: "var(--primary)" }}>
                        Search
                      </span>
                    </div>
                  ) : null}
                  <div className={cn("mt-2 flex gap-1.5", banner.align === "center" ? "justify-center" : "")}>
                    <span className="rounded-full px-2 py-1 text-[6.5px] font-semibold text-white" style={{ background: "var(--primary)" }}>
                      {hero.primaryLabel || "Primary"}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 text-[6.5px] font-semibold",
                        lightHero ? "border-white/40 text-white" : "border-line text-slate-600",
                      )}
                    >
                      {hero.secondaryLabel || "Secondary"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-white px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--primary)" }}>
                    Handpicked journeys
                  </span>
                  <span className="text-[6px] text-slate-400">{settings.siteName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="rounded-lg border border-line">
                      <div
                        className="h-8 rounded-t-lg"
                        style={{
                          background: `linear-gradient(135deg, rgb(var(--primary-rgb) / ${0.28 - index * 0.06}), rgb(var(--accent-rgb) / 0.35))`,
                        }}
                      />
                      <div className="space-y-1 p-1.5">
                        <div className="h-1 w-3/4 rounded-full bg-slate-200" />
                        <div className="h-1 w-1/2 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="h-1.5 w-16 rounded-full bg-slate-200" />
                  <div className="h-4 w-10 rounded-full" style={{ background: "var(--primary)" }} />
                </div>
              </div>

              <div className="px-3 py-2.5" style={{ background: "var(--footer-bg)" }}>
                <p className="text-[6.5px] font-semibold text-white">{settings.siteName.replace(" ERP", "")}</p>
                <p className="mt-0.5 text-[5.5px] text-white/50">{settings.phone} · {settings.email}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-control border border-line bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Active sections</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(appearance.sections)
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => (
                    <span key={key} className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">
                      {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </span>
                  ))}
              </div>
              <div className="border-t border-line pt-2 text-[10px] leading-4 text-slate-500">
                <p>
                  <span className="font-semibold text-ink">Fonts:</span>{" "}
                  {FONT_OPTIONS.find((font) => font.key === appearance.typography.headingFont)?.label} /{" "}
                  {FONT_OPTIONS.find((font) => font.key === appearance.typography.bodyFont)?.label}
                </p>
                <p>
                  <span className="font-semibold text-ink">Corners:</span> {appearance.typography.radius}px
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
