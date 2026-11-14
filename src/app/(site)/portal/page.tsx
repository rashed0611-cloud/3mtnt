import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, LockKeyhole, ReceiptText, Ticket, UserRound } from "lucide-react";
import { PageBanner, bannerCardClass } from "@/components/public/page-banner";
import { getPublicSettings } from "@/lib/db/public";
import { pageAccentStyle, pageContent } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: "Customer portal",
  description: "The 3M Tours & Travels customer portal — bookings, documents and invoices in one place.",
};

const BENEFITS = [
  { icon: Ticket, title: "Your bookings", text: "See upcoming departures, hotel stays, visa files and pilgrimage groups." },
  { icon: FileText, title: "Travel documents", text: "Download itineraries, vouchers and confirmed documents when they're ready." },
  { icon: ReceiptText, title: "Invoices & payments", text: "Review invoices, deposit milestones and outstanding balances." },
  { icon: UserRound, title: "Traveller profiles", text: "Keep passport and contact details up to date for every traveller." },
];

export default async function PortalPage() {
  const settings = await getPublicSettings();
  const pageSettings = settings.pages.portal;
  const hero = pageContent("portal", pageSettings);

  return (
    <div style={pageAccentStyle(pageSettings)}>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <PageBanner page={pageSettings} />
        <div className={bannerCardClass(pageSettings, "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8")}>
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Customer portal</span>
          </nav>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                <LockKeyhole className="h-3 w-3" /> {hero.eyebrow}
              </span>
              <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink sm:text-[38px]">{hero.heading}</h1>
              <p className="mt-2 max-w-xl text-[12.5px] leading-6 text-slate-500">
                {hero.subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[11.5px] font-semibold text-white hover:bg-primary-strong">
                  Ask about my booking <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/tours" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[11.5px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary">
                  Browse tours
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="text-[12.5px] font-semibold text-ink">Portal sign-in</p>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9.5px] font-semibold text-amber-700">Coming soon</span>
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Email or booking reference</label>
                  <input disabled placeholder="you@example.com or TB-000001" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] text-slate-400" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-500">Password</label>
                  <input disabled type="password" placeholder="••••••••" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[12px] text-slate-400" />
                </div>
                <button disabled className="h-10 w-full rounded-xl bg-slate-200 text-[12px] font-semibold text-slate-500">Sign in (not yet available)</button>
              </div>
              <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">
                Staff can sign in to the operations workspace from the <Link href="/login" className="font-semibold text-primary hover:underline">staff login</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
              <p className="mt-3 text-[12.5px] font-semibold text-ink">{title}</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
          <h2 className="text-[18px] font-bold text-ink">Need something from your booking today?</h2>
          <p className="mx-auto mt-1 max-w-lg text-[11.5px] leading-5 text-slate-500">
            Our operations desk can resend invoices, share documents or confirm balances while the portal is being finished.
          </p>
          <Link href="/contact?interest=Existing%20booking%20support" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-primary-strong">
            Contact the operations desk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
