"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { SERVICE_TABS, type ServiceTabKey } from "@/lib/public";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [tab, setTab] = useState<ServiceTabKey>("tours");
  const [term, setTerm] = useState("");
  const active = SERVICE_TABS.find((item) => item.key === tab) ?? SERVICE_TABS[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.35)] sm:p-3">
      <div className="flex flex-wrap gap-1 border-b border-slate-100 px-1 pb-2">
        {SERVICE_TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition",
              tab === item.key ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const query = term.trim();
          router.push(query ? `${active.href}?q=${encodeURIComponent(query)}` : active.href);
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={active.placeholder}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-[13px] text-ink outline-none transition placeholder:text-slate-400 focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10"
            aria-label={active.placeholder}
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[12.5px] font-semibold text-white shadow-sm transition hover:bg-primary-strong"
        >
          Search <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
