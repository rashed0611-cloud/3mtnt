import type { Metadata } from "next";
import { HardDrive, ImageIcon, Images, Package } from "lucide-react";
import { GalleryManager } from "@/components/admin/gallery-manager";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { canWriteModule, normalizeRole } from "@/lib/access";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { isCatalogKind, listMediaLibrary, MEDIA_MODULES, type CatalogKind } from "@/lib/media";
import { toMediaDisplayUrl } from "@/lib/media-url";
import { isSitePageKey, sitePageDefinition } from "@/lib/site-pages";

export const metadata: Metadata = { title: "Image gallery" };

const EDIT_HREF: Record<CatalogKind, (id: string) => string> = {
  tour: (id) => `/admin/tours/${id}/edit`,
  hotel: (id) => `/admin/hotels/${id}/edit`,
  visa: (id) => `/admin/visas/${id}/edit`,
  hajj: (id) => `/admin/hajj-umrah/packages/${id}/edit`,
};

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string; slot?: string; page?: string }>;
}) {
  const params = await searchParams;
  const user = await requireModuleAccess(MEDIA_MODULES, "view");
  const [items, db] = await Promise.all([listMediaLibrary(), getRepository().getDatabase()]);

  const productNames = new Map<string, string>();
  for (const tour of db.tours) productNames.set(`tour:${tour.id}`, tour.title);
  for (const hotel of db.hotels) productNames.set(`hotel:${hotel.id}`, hotel.name);
  for (const visa of db.visas) productNames.set(`visa:${visa.id}`, `${visa.country} ${visa.visaType}`);
  for (const pkg of db.hajjPackages) productNames.set(`hajj:${pkg.id}`, pkg.title);

  // When the page is opened from a package edit screen, uploads are attached
  // to that package instead of the general gallery.
  const [kind, id] = (params.package ?? "").split(":");
  const target =
    isCatalogKind(kind) && id && productNames.has(`${kind}:${id}`)
      ? {
          kind,
          id,
          name: productNames.get(`${kind}:${id}`) ?? id,
          slot: params.slot === "related" ? ("related" as const) : ("cover" as const),
          editHref: EDIT_HREF[kind](id),
        }
      : undefined;

  // When the page is opened from a page editor, the chosen image becomes that
  // page's banner instead of a package cover.
  const pageKey = params.page;
  const pageTarget =
    !target && isSitePageKey(pageKey)
      ? {
          key: pageKey,
          label: sitePageDefinition(pageKey).label,
          editHref: `/admin/pages/${pageKey}/edit`,
          currentBanner: toMediaDisplayUrl(db.settings.pages[pageKey].banner.imageUrl),
        }
      : undefined;

  // Where a site image is currently used, so deleting it is an informed choice.
  // Stored settings keep absolute Supabase URLs, so normalise them to the
  // same proxy paths the library items use.
  const siteUsage = new Map<string, string>();
  const appearance = db.settings.appearance;
  if (appearance.banner.imageUrl) siteUsage.set(toMediaDisplayUrl(appearance.banner.imageUrl), "Homepage banner");
  if (appearance.brand.logoUrl) siteUsage.set(toMediaDisplayUrl(appearance.brand.logoUrl), "Site logo");
  if (appearance.brand.faviconUrl) siteUsage.set(toMediaDisplayUrl(appearance.brand.faviconUrl), "Browser icon");
  for (const image of db.settings.gallery) siteUsage.set(toMediaDisplayUrl(image.url), "Homepage gallery");
  for (const [key, page] of Object.entries(db.settings.pages)) {
    if (!page.banner.imageUrl) continue;
    const label = isSitePageKey(key) ? sitePageDefinition(key).label : key;
    siteUsage.set(toMediaDisplayUrl(page.banner.imageUrl), `${label} banner`);
  }

  const gallery = items.map((item) => ({
    ...item,
    usedBy:
      item.kind && item.entityId
        ? productNames.get(`${item.kind}:${item.entityId}`)
        : siteUsage.get(item.url),
  }));

  const covers = gallery.filter((item) => item.group === "catalog").length;
  const related = gallery.filter((item) => item.group === "product").length;
  const totalBytes = gallery.reduce((sum, item) => sum + item.size, 0);
  const role = normalizeRole(user.role);
  const canManage = MEDIA_MODULES.some((module) => canWriteModule(role, module));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Image gallery"
        description="Every uploaded image in one place — product cover photos and website media. Upload once, copy the link, or remove what is no longer used."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Image gallery" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Images stored" value={String(gallery.length)} hint="Covers, related photos and site media" icon={Images} tone="blue" />
        <StatCard label="Product covers" value={String(covers)} hint="Tours, hotels, visas and Hajj" icon={Package} tone="violet" />
        <StatCard label="Related photos" value={String(related)} hint="Product photo strips" icon={ImageIcon} tone="amber" />
        <StatCard label="Storage used" value={formatBytes(totalBytes)} hint="Supabase Storage" icon={HardDrive} tone="slate" />
      </div>

      <GalleryManager items={gallery} canManage={canManage} target={target} pageTarget={pageTarget} />
    </div>
  );
}
