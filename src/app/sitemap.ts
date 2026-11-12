import type { MetadataRoute } from "next";
import { getRepository } from "@/lib/db";

function baseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const db = await getRepository().getDatabase();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tours`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/hotels`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/visas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/hajj-umrah`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/flights`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/flights/search`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/portal`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [
    ...staticRoutes,
    ...db.tours
      .filter((tour) => tour.status === "active")
      .map((tour) => ({
        url: `${base}/tours/${tour.slug}`,
        lastModified: new Date(tour.createdAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...db.hotels
      .filter((hotel) => hotel.status === "publish")
      .map((hotel) => ({
        url: `${base}/hotels/${hotel.slug}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ...db.visas
      .filter((visa) => visa.status === "active")
      .map((visa) => ({
        url: `${base}/visas/${visa.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...db.hajjPackages
      .filter((pkg) => pkg.status === "active")
      .map((pkg) => ({
        url: `${base}/hajj-umrah/${pkg.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
