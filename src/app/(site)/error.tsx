"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-[26px] font-bold tracking-tight text-ink">This page needs a moment</h1>
        <p className="mx-auto mt-2 max-w-lg text-[13px] leading-7 text-slate-500">
          A live service did not respond in time, so the page could not finish. Nothing was booked or charged. Try again — or contact
          the travel desk and we will pick it up from there.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[12.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            Back to home <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[12.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            Contact the desk
          </Link>
        </div>
      </div>
    </section>
  );
}
