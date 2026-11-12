"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Compass, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Tours", href: "/tours" },
  { label: "Hotels", href: "/hotels" },
  { label: "Visas", href: "/visas" },
  {
    label: "Flights",
    href: "/flights",
    children: [
      {
        label: "Search flights",
        href: "/flights/search",
        hint: "One way or round trip · open to everyone",
        icon: Search,
      },
      {
        label: "Flight desk",
        href: "/flights",
        hint: "Quotes, reissues and group travel",
        icon: Compass,
      },
    ],
  },
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
  const [flightOpen, setFlightOpen] = useState(false);
  const pathname = usePathname();
  const words = siteName.split(" ");
  const primaryLine = words.length > 1 ? `${words[0]} ${words[1]}` : siteName;

  useEffect(() => {
    setOpen(false);
    setFlightOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteName} home`}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} className="h-10 w-auto max-w-[170px] object-contain" />
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

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {LINKS.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            if (!link.children) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[12.5px] font-medium transition",
                    active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            }

            return (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setFlightOpen(true)}
                onMouseLeave={() => setFlightOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setFlightOpen((value) => !value)}
                  aria-expanded={flightOpen}
                  aria-haspopup="menu"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[12.5px] font-medium transition",
                    active ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-100 hover:text-ink",
                  )}
                >
                  {link.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition", flightOpen && "rotate-180")} />
                </button>

                {flightOpen ? (
                  <div className="absolute left-0 top-full w-[290px] pt-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_-20px_rgba(15,23,42,0.35)]">
                      {link.children.map((child) => {
                        const Icon = child.icon;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-start gap-2.5 rounded-xl px-2.5 py-2.5 transition hover:bg-primary/5"
                          >
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[12.5px] font-semibold text-ink">{child.label}</span>
                              <span className="mt-0.5 block text-[10.5px] leading-4 text-slate-500">{child.hint}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={signedIn ? "/admin" : "/login"}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-ink"
          >
            {signedIn ? "Open workspace" : "Staff login"}
          </Link>
          <Link
            href="/flights/search"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
          >
            Search flights <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {LINKS.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
                {link.children ? (
                  <div className="mb-1 ml-3 grid gap-0.5 border-l border-slate-200 pl-3">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 hover:text-primary"
                      >
                        {child.label}
                        <span className="mt-0.5 block text-[10.5px] font-normal leading-4 text-slate-400">{child.hint}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/flights/search"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-[12.5px] font-semibold text-white"
            >
              <Search className="h-4 w-4" /> Search flights
            </Link>
            <Link
              href={signedIn ? "/admin" : "/login"}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-[12.5px] font-semibold text-slate-600"
            >
              {signedIn ? "Open workspace" : "Staff login"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
