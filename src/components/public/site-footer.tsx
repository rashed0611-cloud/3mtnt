import Link from "next/link";
import { Compass, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import { toMediaDisplayUrl } from "@/lib/media-url";
import type { AppSettings } from "@/lib/types";

const COLUMNS = [
  {
    title: "Book",
    links: [
      { label: "Flights", href: "/flights" },
      { label: "Hotels", href: "/hotels" },
      { label: "Holidays", href: "/tours" },
      { label: "Visa", href: "/visas" },
      { label: "Hajj & Umrah", href: "/hajj-umrah" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About 3M Tours", href: "/contact" },
      { label: "Plan with AI", href: "/plan" },
      { label: "Customer portal", href: "/portal" },
      { label: "Staff sign in", href: "/login" },
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
  const { appearance } = settings;
  const brandName = settings.siteName.replace(/\s*ERP\s*$/i, "");
  const socials = [
    { label: "Facebook", href: appearance.brand.facebook, icon: Facebook },
    { label: "Instagram", href: appearance.brand.instagram, icon: Instagram },
    { label: "YouTube", href: appearance.brand.youtube, icon: Youtube },
    { label: "LinkedIn", href: appearance.brand.linkedin, icon: Linkedin },
    { label: "WhatsApp", href: appearance.brand.whatsapp, icon: MessageCircle },
  ].filter((social) => social.href);

  return (
    <footer className="mt-16 text-slate-300" style={{ background: "var(--footer-bg)" }}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              {appearance.brand.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={toMediaDisplayUrl(appearance.brand.logoUrl)} alt={brandName} className="h-10 w-auto max-w-[170px] object-contain" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                  {settings.logoText ? <span className="text-[11px] font-bold">{settings.logoText}</span> : <Compass className="h-5 w-5" />}
                </span>
              )}
              <div>
                <p className="text-[15px] font-bold tracking-tight text-white">{brandName}</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {appearance.brand.logoTagline || "Go further, plan lighter"}
                </p>
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
            {socials.length ? (
              <div className="mt-4 flex items-center gap-2">
                {socials.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            ) : null}
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
          <p>© {new Date().getFullYear()} {settings.legalName}{settings.legalName.trim().endsWith(".") ? "" : "."} All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Independent travel agency · Dhaka, Bangladesh</span>
            <Link href="/login" className="transition hover:text-slate-300">Staff sign in</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
