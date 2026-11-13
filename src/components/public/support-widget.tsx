"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, MessageCircle, Phone, Sparkles, X } from "lucide-react";

function waHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function WhatsAppMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
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

      {chat ? (
        <a
          href={chat}
          target="_blank"
          rel="noreferrer noopener"
          aria-label="Chat with the 3M travel desk on WhatsApp"
          className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_16px_40px_-12px_rgba(37,211,102,0.85)] transition hover:bg-[#1eb257] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <WhatsAppMark className="h-6 w-6" />
          <span className="pointer-events-none absolute right-full mr-2.5 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10.5px] font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">
            WhatsApp the desk
          </span>
        </a>
      ) : null}
    </div>
  );
}
