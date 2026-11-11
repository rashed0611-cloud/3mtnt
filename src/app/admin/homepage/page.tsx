import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, GalleryHorizontalEnd, Palette, ShieldCheck, Type } from "lucide-react";
import { HomepageForm } from "@/components/forms/homepage-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { FONT_OPTIONS } from "@/lib/fonts";

export const metadata: Metadata = { title: "Website editor" };

export default async function HomepageEditorPage() {
  await requireModuleAccess("settings", "view");
  const settings = await getRepository().getSettings();
  const appearance = settings.appearance;
  const headingFont = FONT_OPTIONS.find((font) => font.key === appearance.typography.headingFont);
  const bodyFont = FONT_OPTIONS.find((font) => font.key === appearance.typography.bodyFont);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Website editor"
        description="Change the logo, banner, fonts, colours, sections and gallery — the public site updates as soon as you save."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Website editor" }]}
        actions={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> View public site
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardContent>
            <HomepageForm settings={settings} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" /> Current look
                </CardTitle>
                <CardDescription>A snapshot of the live public theme.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-1.5">
                {Object.entries(appearance.colors).map(([key, value]) => (
                  <span
                    key={key}
                    title={`${key}: ${value}`}
                    className="h-8 flex-1 rounded-control border border-black/10"
                    style={{ background: value }}
                  />
                ))}
              </div>
              <dl className="space-y-2 text-[11.5px]">
                {[
                  ["Primary", appearance.colors.primary],
                  ["Heading font", headingFont?.label ?? appearance.typography.headingFont],
                  ["Body font", bodyFont?.label ?? appearance.typography.bodyFont],
                  ["Corner radius", `${appearance.typography.radius}px`],
                  ["Banner", appearance.banner.imageUrl ? "Custom image" : "Brand gradient"],
                  ["Logo", appearance.brand.logoUrl ? "Uploaded image" : `“${settings.logoText}” monogram`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 border-b border-line/70 pb-1.5 last:border-0 last:pb-0">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" /> What you can edit
                </CardTitle>
                <CardDescription>Everything on the storefront.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-[11.5px] leading-5 text-slate-600">
              <p>Logo, browser icon and social profiles.</p>
              <p>Brand, accent, background, text and footer colours.</p>
              <p>Heading and body fonts, weight and corner radius.</p>
              <p>Hero banner image, overlay, alignment and search box.</p>
              <p>Announcement bar, section visibility, gallery and SEO.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GalleryHorizontalEnd className="h-4 w-4 text-primary" /> Gallery
                </CardTitle>
                <CardDescription>
                  {settings.gallery.length} image{settings.gallery.length === 1 ? "" : "s"} published
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {settings.gallery.slice(0, 4).map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt || image.caption || "Gallery image"}
                  className="h-20 w-full rounded-control border border-line object-cover"
                />
              ))}
              {settings.gallery.length === 0 ? (
                <p className="col-span-2 rounded-control border border-dashed border-line px-3 py-4 text-center text-[11.5px] text-muted">
                  Upload your first image to start the gallery.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Admin only
                </CardTitle>
                <CardDescription>Content changes are restricted.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-[11.5px] leading-5 text-slate-600">
              Only super administrators and administrators can edit the public site. Changes are recorded in the activity log.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
