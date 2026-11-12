"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, MessageCircle, Phone, Sparkles, X } from "lucide-react";

function waHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function SupportWidget({ phone, whatsapp }: { phone: string; whatsapp?: string }) {
  const [open, setOpen] = useState(false);
  const chat = whatsapp || waHref(phone);

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col items-end gap-2 sm:right-6">
      {open ? (
        <div className="w-[280px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Need a hand?</p>
              <p className="mt-0.5 text-[10.5px] leading-4 text-slate-500">
                The travel desk answers calls and messages in business hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support panel"
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 grid gap-1.5">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[11.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" /> {phone}
            </a>
            {chat ? (
              <a
                href={chat}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-[11.5px] font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp the desk
              </a>
            ) : null}
            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-[11.5px] font-semibold text-white transition hover:bg-primary-strong"
            >
              <Sparkles className="h-3.5 w-3.5" /> Plan with AI <ArrowRight className="ml-auto h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close travel desk support" : "Open travel desk support"}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-[0_16px_40px_-12px_rgba(11,116,222,0.7)] transition hover:bg-primary-strong"
      >
        {open ? <X className="h-5 w-5" /> : <Headphones className="h-5 w-5" />}
      </button>
    </div>
  );
}
