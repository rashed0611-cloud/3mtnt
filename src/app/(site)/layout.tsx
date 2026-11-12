import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { SupportWidget } from "@/components/public/support-widget";
import { getSessionUser } from "@/lib/auth";
import { getPublicDatabase, getPublicSettings } from "@/lib/db/public";
import { themeStyle, themeStylesheetHref } from "@/lib/theme";
import type { SiteAnnouncement } from "@/lib/types";

// The public site reads live workspace settings, tours and gallery content.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const appearance = settings.appearance;
  const brandName = settings.siteName.replace(/\s*ERP\s*$/i, "");
  const title = appearance.seo.title || `${brandName} — ${settings.tagline}`;
  const description = appearance.seo.description || settings.tagline;
  const image = appearance.seo.ogImageUrl || appearance.banner.imageUrl;

  return {
    title: {
      absolute: title,
      template: `%s · ${brandName}`,
    },
    description,
    icons: appearance.brand.faviconUrl ? { icon: appearance.brand.faviconUrl } : undefined,
    openGraph: {
      type: "website",
      siteName: brandName,
      title,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

function announcementStyle(tone: SiteAnnouncement["tone"]) {
  if (tone === "dark") return { background: "#0f172a", color: "#ffffff" };
  if (tone === "light") return { background: "#f1f5f9", color: "#334155" };
  return { background: "var(--primary)", color: "#ffffff" };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [user, db] = await Promise.all([getSessionUser(), getPublicDatabase()]);
  const { appearance } = db.settings;
  const brandName = db.settings.siteName.replace(/\s*ERP\s*$/i, "");
  const fontHref = themeStylesheetHref(appearance);
  const announcement = appearance.announcement;

  return (
    <div className="site-theme min-h-screen" style={themeStyle(appearance)}>
      {fontHref ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={fontHref} />
        </>
      ) : null}

      {announcement.enabled && announcement.text ? (
        <div className="px-4 py-2 text-center text-[11.5px] font-medium" style={announcementStyle(announcement.tone)}>
          <span>{announcement.text}</span>
          {announcement.linkLabel ? (
            <a href={announcement.linkHref} className="ml-2 underline underline-offset-2 hover:opacity-90">
              {announcement.linkLabel}
            </a>
          ) : null}
        </div>
      ) : null}

      <SiteHeader
        siteName={brandName}
        signedIn={Boolean(user)}
        logoUrl={appearance.brand.logoUrl}
        logoText={db.settings.logoText}
        tagline={appearance.brand.logoTagline}
      />
      <main>{children}</main>
      <SiteFooter settings={db.settings} />
      <SupportWidget phone={db.settings.phone} whatsapp={appearance.brand.whatsapp || undefined} />
    </div>
  );
}
