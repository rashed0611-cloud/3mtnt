import type { Metadata } from "next";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";
import { getSessionUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

// The public site reads live workspace settings, tours and gallery content.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "3M Tours & Travels — Journeys worth remembering",
    template: "%s · 3M Tours & Travels",
  },
  description:
    "Original tours, hotels, visa services and Hajj & Umrah packages from 3M Tours & Travels. Plan your next journey with a real operations team behind every booking.",
  openGraph: {
    type: "website",
    siteName: "3M Tours & Travels",
    title: "3M Tours & Travels — Journeys worth remembering",
    description:
      "Original tours, hotels, visa services and Hajj & Umrah packages, planned and operated by one travel desk.",
  },
  twitter: {
    card: "summary_large_image",
    title: "3M Tours & Travels — Journeys worth remembering",
    description: "Original tours, hotels, visas and pilgrimage packages from 3M Tours & Travels.",
  },
};

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [user, db] = await Promise.all([getSessionUser(), getRepository().getDatabase()]);

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader signedIn={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter settings={db.settings} />
    </div>
  );
}
