import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "3M Tours & Travels ERP — Travel operations, without the spreadsheets",
    template: "%s · 3M Tours & Travels ERP",
  },
  description:
    "A modular travel agency ERP for tours, hotels, visas, Hajj and Umrah, CRM, finance and operations.",
  applicationName: "3M Tours & Travels ERP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b74de",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
