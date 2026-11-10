"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { publicInquiryAction, type InquiryState } from "@/app/(site)/contact/actions";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-[12.5px] text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10";
const labelClass = "mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-slate-500";

export function InquiryForm({
  defaultInterest = "",
  defaultReference = "",
}: {
  defaultInterest?: string;
  defaultReference?: string;
}) {
  const [state, formAction, pending] = useActionState(publicInquiryAction, {} as InquiryState);
  const errors = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-[19px] font-bold text-emerald-950">Thank you{state.name ? `, ${state.name}` : ""}.</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-6 text-emerald-900/75">
          Your enquiry is with our travel desk. A specialist will reply within one business day with next steps, availability and a
          clear quote. No payment is taken at this stage.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/tours" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-emerald-800">
            Browse tours <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link href="/" className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-[11.5px] font-semibold text-emerald-800 hover:bg-emerald-50">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="inquiry-name">Your name <span className="text-red-500">*</span></label>
          <input id="inquiry-name" name="name" required placeholder="e.g. Ayesha Rahman" className={inputClass} />
          {errors.name ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.name}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="inquiry-email">Email <span className="text-red-500">*</span></label>
          <input id="inquiry-email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
          {errors.email ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.email}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="inquiry-phone">Phone / WhatsApp <span className="text-red-500">*</span></label>
          <input id="inquiry-phone" name="phone" required placeholder="+880 17xx xxx xxx" className={inputClass} />
          {errors.phone ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.phone}</p> : null}
        </div>
        <div>
          <label className={labelClass} htmlFor="inquiry-date">Approximate travel date</label>
          <input id="inquiry-date" name="travelDate" type="date" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="inquiry-travellers">Travellers</label>
          <select id="inquiry-travellers" name="travellers" defaultValue="" className={inputClass}>
            <option value="">Not sure yet</option>
            <option value="1">1 traveller</option>
            <option value="2">2 travellers</option>
            <option value="3-4">3–4 travellers</option>
            <option value="5-8">5–8 travellers</option>
            <option value="9+">9+ travellers / group</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="inquiry-interest">Interested in</label>
          <select id="inquiry-interest" name="interest" defaultValue={defaultInterest || "Tour package"} className={inputClass}>
            {["Tour package", "Hotel stay", "Visa service", "Hajj package", "Umrah package", "Custom itinerary", "Corporate travel", "General enquiry"].map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
            {defaultInterest && !["Tour package", "Hotel stay", "Visa service", "Hajj package", "Umrah package", "Custom itinerary", "Corporate travel", "General enquiry"].includes(defaultInterest) ? (
              <option value={defaultInterest}>{defaultInterest}</option>
            ) : null}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="inquiry-message">Tell us about the trip <span className="text-red-500">*</span></label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          rows={4}
          placeholder="Dates, destination, who's travelling, budget range or anything that matters to you."
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-[12.5px] leading-6 text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
        {errors.message ? <p className="mt-1 text-[11px] font-medium text-red-600">{errors.message}</p> : null}
      </div>

      <input type="hidden" name="reference" value={defaultReference} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor="inquiry-website">Website</label>
        <input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <p className="text-[10.5px] leading-4 text-slate-400">
          By sending this enquiry you agree to be contacted about your trip. We never sell your details.
        </p>
        <button type="submit" disabled={pending} className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-primary-strong disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {pending ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}
