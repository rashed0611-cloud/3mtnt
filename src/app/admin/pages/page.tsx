import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, ImageIcon, LayoutTemplate, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { toMediaDisplayUrl } from "@/lib/media-url";
import { DETAIL_PAGES, SITE_PAGES } from "@/lib/site-pages";

export const metadata: Metadata = { title: "Pages" };

export default async function PagesAdminPage() {
  await requireModuleAccess("settings", "view");
  const settings = await getRepository().getSettings();
  const homeBanner = settings.appearance.banner.imageUrl;
  const customised = SITE_PAGES.filter((page) => settings.pages[page.key].banner.imageUrl).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pages"
        description="Every storefront page in one place. Give a page its own banner, heading, introduction and accent colour."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Pages" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> View site
            </Link>
            <Link
              href="/admin/homepage"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white hover:bg-primary/90"
            >
              <LayoutTemplate className="h-3.5 w-3.5" /> Website editor
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="blue">{SITE_PAGES.length + 1} editable pages</Badge>
        <Badge tone="slate">{customised} with a custom banner</Badge>
        <Badge tone="slate">{DETAIL_PAGES.length} detail pages</Badge>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-ink">Main pages</h2>
          <span className="text-[11px] text-muted">Banner, copy and accent colour</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="card-surface overflow-hidden">
            <div className="relative flex h-32 items-end bg-gradient-to-br from-primary/15 via-page to-white p-3">
              {homeBanner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toMediaDisplayUrl(homeBanner)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              {homeBanner ? <div className="absolute inset-0 bg-slate-950/40" /> : null}
              <span className="relative inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700">
                Home page
              </span>
            </div>
            <div className="flex items-start justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold text-ink">Home</p>
                <p className="text-[10.5px] text-muted">/ · hero banner and sections</p>
              </div>
              <Link
                href="/admin/homepage"
                className="inline-flex shrink-0 items-center gap-1 rounded-control border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
          </article>

          {SITE_PAGES.map((page) => {
            const saved = settings.pages[page.key];
            return (
              <article key={page.key} className="card-surface overflow-hidden">
                <div className="relative flex h-32 items-end bg-gradient-to-br from-primary/15 via-page to-white p-3">
                  {saved.banner.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={toMediaDisplayUrl(saved.banner.imageUrl)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: `rgba(15,23,42,${saved.banner.overlay / 100})` }} />
                    </>
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <ImageIcon className="h-6 w-6" />
                    </span>
                  )}
                  <span className="relative inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9.5px] font-semibold text-slate-700">
                    {saved.banner.imageUrl ? "Custom banner" : "Default design"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-ink">{page.label}</p>
                    <p className="text-[10.5px] text-muted">{page.path}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={page.path}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded-control border border-line bg-white px-2 py-1.5 text-slate-500 hover:border-primary/30 hover:text-primary"
                      aria-label={`View ${page.label}`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                    <Link
                      href={`/admin/pages/${page.key}/edit`}
                      className="inline-flex items-center gap-1 rounded-control border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-ink">Detail pages</h2>
          <span className="text-[11px] text-muted">Banner comes from each package</span>
        </div>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Package detail pages</CardTitle>
              <CardDescription>
                These pages use the cover image and related photos of the tour, hotel, visa or Hajj package they open.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-line/70">
            {DETAIL_PAGES.map((page) => (
              <div key={page.path} className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-ink">
                    {page.label} <span className="font-normal text-muted">· {page.path}</span>
                  </p>
                  <p className="text-[10.5px] text-muted">{page.note}</p>
                </div>
                <Link
                  href={page.editor}
                  className="inline-flex items-center gap-1 rounded-control border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary"
                >
                  <Plus className="h-3 w-3" /> Manage packages
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
