import Link from "next/link";
import { Compass, Mail, MapPin, Phone } from "lucide-react";
import type { AppSettings } from "@/lib/types";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Tour packages", href: "/tours" },
      { label: "Hotels", href: "/hotels" },
      { label: "Visa services", href: "/visas" },
      { label: "Hajj & Umrah", href: "/hajj-umrah" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About 3M Tours", href: "/contact" },
      { label: "Plan a trip", href: "/contact" },
      { label: "Customer portal", href: "/portal" },
      { label: "Staff workspace", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Talk to a specialist", href: "/contact" },
      { label: "Booking policy", href: "/contact" },
      { label: "Visa document guide", href: "/visas" },
      { label: "Payment options", href: "/contact" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: AppSettings }) {
  return (
    <footer className="mt-16 bg-[#0d1b2e] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-bold tracking-tight text-white">3M Tours & Travels</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">Go further, plan lighter</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-[12px] leading-6 text-slate-400">
              Original journeys across Asia, the Middle East and Europe — with a real operations team behind every booking,
              visa file and pilgrimage group.
            </p>
            <div className="mt-5 space-y-2 text-[12px]">
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-500" /> {settings.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-500" /> {settings.email}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {settings.address}</p>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[12px] text-slate-400 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-[11px] text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {settings.legalName}. All rights reserved. Fictional demo brand.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Demo site · no live bookings</span>
            <Link href="/login" className="transition hover:text-slate-300">Staff login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
