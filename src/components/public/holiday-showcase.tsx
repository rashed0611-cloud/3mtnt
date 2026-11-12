"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TourCard } from "@/components/public/tour-card";
import type { Tour } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "all", label: "All holidays" },
  { key: "group", label: "Group" },
  { key: "private", label: "Private" },
  { key: "fixed_departure", label: "Fixed departures" },
  { key: "family", label: "Family" },
  { key: "custom", label: "Custom" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export function HolidayShowcase({ tours, total }: { tours: Tour[]; total: number }) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return tours;
    if (filter === "family") return tours.filter((tour) => /family|kids|child/i.test(tour.title));
    return tours.filter((tour) => tour.type === filter);
  }, [filter, tours]);

  const counts = useMemo(() => {
    const map = new Map<FilterKey, number>();
    for (const item of FILTERS) {
      map.set(
        item.key,
        item.key === "all"
          ? tours.length
          : item.key === "family"
            ? tours.filter((tour) => /family|kids|child/i.test(tour.title)).length
            : tours.filter((tour) => tour.type === item.key).length,
      );
    }
    return map;
  }, [tours]);

  return (
    <div>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {FILTERS.map((item) => {
          const count = counts.get(item.key) ?? 0;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              disabled={count === 0}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11.5px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
                filter === item.key
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9.5px] font-bold",
                  filter === item.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, 6).map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
          <p className="text-[13px] font-semibold text-ink">No holidays in this style right now</p>
          <p className="mt-1 text-[11.5px] text-slate-500">
            The desk can build a private itinerary instead — tell us what you have in mind.
          </p>
          <Link
            href="/plan"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white"
          >
            Plan with AI <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Showing {Math.min(filtered.length, 6)} of {total} published holidays · prices per adult in BDT
        </p>
        <Link
          href="/tours"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11.5px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
        >
          View all packages <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
