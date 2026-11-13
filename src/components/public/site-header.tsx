"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Menu, Sparkles, X } from "lucide-react";
import { LanguageMenu } from "@/components/public/language-menu";
import { toMediaDisplayUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Holidays", href: "/tours" },
  { label: "Visa", href: "/visas" },
  { label: "Hajj & Umrah", href: "/hajj-umrah" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader({
  siteName = "3M Tours & Travels",
  signedIn = false,
  logoUrl = "",
  logoText = "3M",
  tagline = "& Travels",
}: {
  siteName?: string;
  signedIn?: boolean;
  logoUrl?: string;
  logoText?: string;
  tagline?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const words = siteName.replace(/\s*ERP\s*$/i, "").split(" ");
  const primaryLine = words.length > 1 ? `${words[0]} ${words[1]}` : siteName;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteName} home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={toMediaDisplayUrl(logoUrl)} alt={siteName} className="h-10 w-auto max-w-[170px] object-contain" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-white shadow-sm">
              {logoText ? <span className="text-[11px] font-bold tracking-tight">{logoText}</span> : <Compass className="h-5 w-5" />}
            </span>
          )}
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight text-ink">{primaryLine}</span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">{tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[12.5px] font-medium transition",
                  active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/plan"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12px] font-semibold transition",
              pathname.startsWith("/plan")
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" /> Plan with AI
          </Link>
          <LanguageMenu />
          <Link
            href={signedIn ? "/admin" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
          >
            {signedIn ? "My workspace" : "Sign in"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 lg:hidden">
          <LanguageMenu />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/plan"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white"
            >
              <Sparkles className="h-4 w-4" /> Plan with AI
            </Link>
            <Link
              href={signedIn ? "/admin" : "/login"}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-slate-600"
            >
              {signedIn ? "My workspace" : "Sign in"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
