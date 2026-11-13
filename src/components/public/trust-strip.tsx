import { BadgeCheck, Star } from "lucide-react";

/** Two-letter mark for a supplier name, used in place of a logo file. */
function initials(name: string) {
  const words = name
    .replace(/[^A-Za-z0-9 &]/g, " ")
    .split(/[\s&]+/)
    .filter(Boolean);
  if (words.length === 0) return "3M";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

/**
 * Reviewer metric plus the ground partners the desk actually contracts with.
 * Every value is derived from live workspace data, so nothing here claims a
 * volume the agency cannot stand behind.
 */
export function TrustStrip({
  partners,
  rating,
  summary,
}: {
  partners: string[];
  rating: string;
  summary: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:items-center">
          <div className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 sm:max-w-[320px] lg:max-w-none">
            <p className="text-[34px] font-bold leading-none tracking-tight text-ink">{rating}</p>
            <div className="min-w-0">
              <div className="flex gap-0.5" aria-label={`${rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-1 text-[10.5px] leading-4 text-slate-500">
                Average post-trip feedback from 3M travellers
              </p>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Supplier partners on the ground
              </p>
              <p className="text-[10.5px] font-medium text-slate-400">{summary}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {partners.map((name) => (
                <div
                  key={name}
                  className="flex min-w-[148px] flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10.5px] font-bold tracking-tight text-primary">
                    {initials(name)}
                  </span>
                  <span className="truncate text-[11px] font-semibold text-slate-600">{name}</span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 inline-flex items-start gap-1.5 text-[10.5px] leading-4 text-slate-500">
              <BadgeCheck className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-500" />
              Contracted and settled by our Dhaka desk, so one team owns your trip from quote to return.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
