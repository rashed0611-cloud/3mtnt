"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send, Ticket } from "lucide-react";
import { requestFlightQuoteAction, type FlightQuoteState } from "@/app/(site)/flights/search/actions";

const initialState: FlightQuoteState = {};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-[12.5px] text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-500";

export interface FlightQuoteSearch {
  trip: string;
  from: string;
  to: string;
  depart: string;
  return: string;
  adults: string;
  children: string;
  infants: string;
  cabin: string;
}

export function FlightQuoteForm({
  search,
  summary,
  estimate,
}: {
  search: FlightQuoteSearch;
  summary: string;
  estimate: string;
}) {
  const [state, formAction, pending] = useActionState(requestFlightQuoteAction, initialState);
  const errors = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-[18px] font-bold text-emerald-950">
          Search sent{state.name ? `, ${state.name}` : ""}
        </h2>
        <p className="mt-1.5 text-[12px] leading-6 text-emerald-900/75">
          Our flight desk has your route and dates. A specialist replies within one business day with live options, baggage rules and
          the final fare — no payment until you approve.
        </p>
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Your reference</p>
          <p className="mt-0.5 font-mono text-[15px] font-bold tracking-wide text-emerald-900">{state.reference}</p>
        </div>
        <p className="mt-3 text-[11px] leading-5 text-emerald-900/70">{summary}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            href="/flights"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-emerald-800"
          >
            <Ticket className="h-3.5 w-3.5" /> Search another flight
          </Link>
          <Link
            href="/"
            className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-[11.5px] font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3.5">
      {state.error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Your search</p>
        <p className="mt-1 text-[11.5px] font-medium leading-5 text-ink">{summary}</p>
        <p className="mt-1 text-[11px] text-slate-500">{estimate}</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="flight-quote-name">Your name <span className="text-red-500">*</span></label>
        <input id="flight-quote-name" name="name" required placeholder="e.g. Ayesha Rahman" className={inputClass} />
        {errors.name ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.name}</p> : null}
      </div>
      <div>
        <label className={labelClass} htmlFor="flight-quote-email">Email <span className="text-red-500">*</span></label>
        <input id="flight-quote-email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
        {errors.email ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.email}</p> : null}
      </div>
      <div>
        <label className={labelClass} htmlFor="flight-quote-phone">Phone / WhatsApp <span className="text-red-500">*</span></label>
        <input id="flight-quote-phone" name="phone" required placeholder="+880 17xx xxx xxx" className={inputClass} />
        {errors.phone ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.phone}</p> : null}
      </div>
      <div>
        <label className={labelClass} htmlFor="flight-quote-message">Anything we should know?</label>
        <textarea
          id="flight-quote-message"
          name="message"
          rows={3}
          placeholder="Flexible dates, preferred airline, baggage needs, connecting through a specific city…"
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-[12.5px] leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {Object.entries(search).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <div className="hidden" aria-hidden="true">
        <label htmlFor="flight-quote-website">Website</label>
        <input id="flight-quote-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {pending ? "Sending your search…" : "Get exact fares"}
      </button>
      <p className="text-center text-[10.5px] leading-4 text-slate-400">
        Free to ask · no account needed · we reply within one business day.
      </p>
    </form>
  );
}
