import type { NextConfig } from "next";

/**
 * The storefront uses plural module routes (`/flights`, `/visas`, `/hotels`,
 * `/tours`) because the workspace holds many products. Travellers and campaign
 * links often use the singular form, so every singular alias redirects to its
 * canonical page — including nested paths such as `/flight/search`.
 */
const SINGULAR_ALIASES: { from: string; to: string }[] = [
  { from: "flight", to: "flights" },
  { from: "visa", to: "visas" },
  { from: "hotel", to: "hotels" },
  { from: "tour", to: "tours" },
  { from: "holiday", to: "tours" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
  async redirects() {
    return SINGULAR_ALIASES.flatMap(({ from, to }) => [
      { source: `/${from}`, destination: `/${to}`, permanent: true },
      { source: `/${from}/:path*`, destination: `/${to}/:path*`, permanent: true },
    ]);
  },
};

export default nextConfig;
