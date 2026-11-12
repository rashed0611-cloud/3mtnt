"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The site is written in English and priced in BDT. The selector is deliberately
 * honest: it shows the active storefront language and marks Bangla as planned
 * rather than pretending to translate pages that are not translated yet.
 */
export function LanguageMenu({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Language and currency"
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-2 text-[11.5px] font-semibold transition",
          tone === "dark"
            ? "border-white/25 text-white hover:bg-white/10"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-ink",
        )}
      >
        <Globe2 className="h-3.5 w-3.5" /> EN
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-[224px] rounded-2xl border border-slate-200 bg-white p-1.5 text-left shadow-[0_18px_50px_-20px_rgba(15,23,42,0.35)]"
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Language</p>
          <button
            type="button"
            role="menuitemradio"
            aria-checked="true"
            className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[12px] font-semibold text-ink hover:bg-slate-50"
          >
            English <Check className="h-3.5 w-3.5 text-primary" />
          </button>
          <div className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[12px] text-slate-400" aria-disabled="true">
            বাংলা
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
              Soon
            </span>
          </div>
          <p className="mt-1 border-t border-slate-100 px-2.5 pb-1 pt-2 text-[10px] leading-4 text-slate-400">
            All prices are quoted in BDT (৳). Documents can be issued in English or Bangla on request.
          </p>
        </div>
      ) : null}
    </div>
  );
}
