import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { PlanForm } from "@/components/public/plan-form";
import { getPublicDatabase } from "@/lib/db/public";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Plan with AI",
  description:
    "Describe the trip you want and 3M Tours & Travels pairs it with real holidays, flights, hotels, visa and pilgrimage options — reviewed by a human specialist.",
};

const STEPS = [
  {
    title: "Tell us the shape of the trip",
    text: "Destination, month, travellers and budget. A sentence about what matters is enough.",
    icon: MessageSquare,
  },
  {
    title: "We match live inventory",
    text: "Your request is matched against the packages and services the desk can actually confirm today.",
    icon: Wand2,
  },
  {
    title: "A specialist checks it",
    text: "A real planner reviews availability, visa timing and pacing before anything is sent back to you.",
    icon: BadgeCheck,
  },
];

export default async function PlanPage() {
  const db = await getPublicDatabase();
  const fromPrice = db.tours.length ? Math.min(...db.tours.map((tour) => tour.adultPrice)) : 0;

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#042f5c] via-[#0b74de] to-[#0e9bd8] text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/90">Plan with AI</span>
          </nav>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                <Sparkles className="h-3 w-3" /> Guided travel planner
              </span>
              <h1 className="mt-4 max-w-xl text-[32px] font-bold leading-[1.1] tracking-tight sm:text-[42px]">
                Describe the trip. Get a plan a specialist has checked.
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-7 text-white/80">
                Our planner pairs your preferences with the holidays, flights, hotels, visa products and pilgrimage packages the desk
                can confirm right now. It creates a file for a named specialist — so you get a considered answer, not a generic
                auto-reply.
              </p>

              <div className="mt-6 grid gap-2.5">
                {STEPS.map(({ title, text, icon: Icon }, index) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold">
                        {index + 1}. {title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-5 text-white/70">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[11px] text-white/60">
                Holidays from {formatMoney(fromPrice, "BDT", 0)} per adult · reviewed by the Dhaka travel desk · no payment online
              </p>
            </div>

            <div>
              <PlanForm />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Honest about automation",
              text: "The planner shortlists real packages; it does not invent prices, hotels or availability. Confirmation comes from the desk.",
              icon: Sparkles,
            },
            {
              title: "One file, one owner",
              text: "Your request becomes a CRM record with a reference. Replies come from the specialist assigned to it.",
              icon: BadgeCheck,
            },
            {
              title: "Or browse on your own",
              text: "Prefer to look first? Every holiday, hotel, visa and pilgrimage package is public — no account needed.",
              icon: Compass,
            },
          ].map(({ title, text, icon: Icon }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-3 text-[13.5px] font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-[11.5px] leading-5 text-slate-500">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
          <p className="text-[12px] text-slate-600">Want to talk it through instead?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white transition hover:bg-primary-strong"
          >
            Contact the travel desk <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
