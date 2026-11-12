"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileCheck2,
  Landmark,
  Loader2,
  Plane,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { createPlanAction, type PlanState } from "@/app/(site)/plan/actions";
import { cn, formatMoney } from "@/lib/utils";

const SERVICES = [
  { key: "holiday", label: "Holiday", icon: Compass },
  { key: "flight", label: "Flights", icon: Plane },
  { key: "hotel", label: "Hotel", icon: BedDouble },
  { key: "visa", label: "Visa", icon: FileCheck2 },
  { key: "pilgrimage", label: "Hajj & Umrah", icon: Landmark },
] as const;

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[12.5px] font-medium text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

const initial: PlanState = {};

export function PlanForm() {
  const [state, formAction, pending] = useActionState(createPlanAction, initial);

  if (state.ok) {
    const firstName = state.name || "there";
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <h2 className="mt-4 text-[22px] font-bold tracking-tight text-ink">Thanks, {firstName} — your plan is with the desk</h2>
        <p className="mt-2 max-w-xl text-[12.5px] leading-6 text-slate-500">
          Reference <span className="font-semibold text-ink">{state.reference}</span>. A travel specialist reviews your preferences
          personally and replies by email or WhatsApp within one business day. Nothing is booked or charged until you approve the
          itinerary and price.
        </p>

        {state.suggestions && state.suggestions.length ? (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Start from these holidays</p>
            <div className="mt-2 grid gap-2">
              {state.suggestions.map((tour) => (
                <Link
                  key={tour.slug}
                  href={`/tours/${tour.slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-semibold text-ink">{tour.title}</p>
                    <p className="text-[10.5px] text-slate-500">
                      {tour.destination} · {tour.days} days · from {formatMoney(tour.price, "BDT", 0)} per adult
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/tours"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
          >
            Browse holidays <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            Contact the travel desk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.5)] sm:p-6">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div>
        <p className={labelClass}>What are you planning?</p>
        <div className="flex flex-wrap gap-1.5">
          {SERVICES.map(({ key, label, icon: Icon }, index) => (
            <label key={key} className="cursor-pointer">
              <input type="radio" name="service" value={key} defaultChecked={index === 0} className="peer sr-only" />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-[11.5px] font-semibold text-slate-600 transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                <Icon className="h-3.5 w-3.5" /> {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="plan-name">Your name</label>
          <input id="plan-name" name="name" required autoComplete="name" className={inputClass} placeholder="Full name" />
          {state.fieldErrors?.name ? <p className="mt-1 text-[10.5px] font-medium text-red-600">{state.fieldErrors.name}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-phone">Phone or WhatsApp</label>
          <input id="plan-phone" name="phone" required autoComplete="tel" className={inputClass} placeholder="+880 17…" />
          {state.fieldErrors?.phone ? <p className="mt-1 text-[10.5px] font-medium text-red-600">{state.fieldErrors.phone}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-email">Email</label>
          <input id="plan-email" name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
          {state.fieldErrors?.email ? <p className="mt-1 text-[10.5px] font-medium text-red-600">{state.fieldErrors.email}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-destination">Where to?</label>
          <input id="plan-destination" name="destination" className={inputClass} placeholder="City, country or region" />
          {state.fieldErrors?.destination ? (
            <p className="mt-1 text-[10.5px] font-medium text-red-600">{state.fieldErrors.destination}</p>
          ) : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="plan-month">Travel month</label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input id="plan-month" name="month" type="month" className={cn(inputClass, "pl-9")} />
          </div>
          {state.fieldErrors?.month ? <p className="mt-1 text-[10.5px] font-medium text-red-600">{state.fieldErrors.month}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="plan-travellers">Travellers</label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="plan-travellers"
                name="travellers"
                type="number"
                min={1}
                max={20}
                defaultValue={2}
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="plan-budget">Budget / person</label>
            <div className="relative">
              <Wallet className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="plan-budget"
                name="budget"
                inputMode="numeric"
                placeholder="৳ optional"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass} htmlFor="plan-notes">Anything we should know?</label>
        <textarea
          id="plan-notes"
          name="notes"
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12.5px] leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          placeholder="Dates, children's ages, celebrations, must-see places, visa questions…"
        />
      </div>

      {state.error ? (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {pending ? "Sending to the desk…" : "Build my plan"}
        </button>
        <p className="text-[10.5px] leading-4 text-slate-400">
          Reviewed by a human specialist. No payment, no obligation, no spam.
        </p>
      </div>
    </form>
  );
}
