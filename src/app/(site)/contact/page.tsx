import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { InquiryForm } from "@/components/public/inquiry-form";
import { PageBanner, bannerCardClass } from "@/components/public/page-banner";
import { getPublicDatabase } from "@/lib/db/public";
import { pageAccentStyle, pageContent } from "@/lib/site-pages";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell 3M Tours & Travels about your next journey. A specialist replies with availability, options and a clear quote.",
};

const FAQS = [
  {
    question: "Do you take payment online?",
    answer: "Not through this website. Your specialist confirms availability and sends a secure payment link or invoice before any payment is due.",
  },
  {
    question: "How quickly will I hear back?",
    answer: "Most enquiries receive a first response within one business day. Visa and pilgrimage files may need a short call to scope documents.",
  },
  {
    question: "Can you work with a fixed budget?",
    answer: "Yes. Share the range and we will show what is realistic, where to trade up, and where a simpler option works better.",
  },
  {
    question: "Do you handle groups and corporate travel?",
    answer: "We do. Group departures, family rooming lists, corporate invoicing and multi-traveller documents are part of the operations desk.",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ interest?: string; ref?: string }>;
}) {
  const [params, db] = await Promise.all([searchParams, getPublicDatabase()]);
  const settings = db.settings;
  const pageSettings = settings.pages.contact;
  const hero = pageContent("contact", pageSettings);

  return (
    <div style={pageAccentStyle(pageSettings)}>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary/10 via-page to-white">
        <PageBanner page={pageSettings} />
        <div className={bannerCardClass(pageSettings, "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8")}>
          <nav className="flex items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <span className="text-slate-600">Contact</span>
          </nav>
          <div className="mt-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> {hero.eyebrow}
            </span>
            <h1 className="mt-2 text-[30px] font-bold tracking-tight text-ink sm:text-[36px]">{hero.heading}</h1>
            <p className="mt-1.5 text-[12.5px] leading-6 text-slate-500">
              {hero.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-ink">Travel enquiry</h2>
                <p className="mt-0.5 text-[11.5px] text-slate-500">All fields marked * are required.</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> Private & secure
              </span>
            </div>
            <InquiryForm defaultInterest={params.interest ?? ""} defaultReference={params.ref ?? ""} />
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-[14px] font-semibold text-ink">Talk to us directly</h2>
              <div className="mt-3 space-y-2.5 text-[11.5px]">
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-start gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 transition hover:border-primary/30 hover:bg-slate-50">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    <span className="block font-semibold text-ink">{settings.phone}</span>
                    <span className="text-[10px] text-slate-500">Sat–Thu · 9:00 am – 7:00 pm</span>
                  </span>
                </a>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5 transition hover:border-primary/30 hover:bg-slate-50">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    <span className="block font-semibold text-ink">{settings.email}</span>
                    <span className="text-[10px] text-slate-500">Replies within one business day</span>
                  </span>
                </a>
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 px-3.5 py-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <span>
                    <span className="block font-semibold text-ink">{settings.address}</span>
                    <span className="text-[10px] text-slate-500">Visits by appointment</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h2 className="flex items-center gap-1.5 text-[13px] font-semibold text-ink"><Clock3 className="h-4 w-4 text-primary" /> What happens next</h2>
              <ol className="mt-3 space-y-2.5">
                {[
                  "We read your enquiry and assign a named specialist.",
                  "You receive a first reply with questions or options.",
                  "We confirm availability, documents and a written quote.",
                  "You approve, pay a deposit and we operate the trip.",
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[9.5px] font-bold text-primary shadow-sm">{index + 1}</span>
                    <span className="text-[11.5px] leading-5 text-slate-600">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-strong p-5 text-white">
              <MessageCircle className="h-5 w-5 text-white/70" />
              <p className="mt-2 text-[13px] font-semibold">Already have a booking?</p>
              <p className="mt-1 text-[11px] leading-5 text-white/80">Our operations desk can help with dates, documents and balances for an existing trip.</p>
              <Link href="/portal" className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold text-white underline-offset-2 hover:underline">
                Visit the customer portal
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-10">
          <h2 className="text-[20px] font-bold tracking-tight text-ink">Questions travellers usually ask</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-[12px] font-semibold text-ink">{faq.question}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
