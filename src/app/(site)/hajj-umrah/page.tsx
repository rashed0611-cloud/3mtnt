import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Landmark, MapPin, Moon, Plane, Search, Users } from "lucide-react";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hajj & Umrah packages",
  description: "Guided Hajj and Umrah packages with group leaders, document readiness and clear payment milestones.",
};

export default async function HajjUmrahPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kind?: string }>;
}) {
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const term = (params.q ?? "").trim().toLowerCase();
  const today = new Date().toISOString().slice(0, 10);

  const filtered = db.hajjPackages
    .filter((pkg) => pkg.status === "active")
    .filter((pkg) => {
      const haystack = [pkg.title, pkg.kind, pkg.tier].join(" ").toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (params.kind && pkg.kind !== params.kind) return false;
      return true;
    })
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));

  const upcoming = filtered.filter((pkg) => pkg.departureDate >= today);
  const pilgrims = filtered.reduce((sum, pkg) => sum + pkg.booked, 0);
  const capacity = filtered.reduce((sum, pkg) => sum + pkg.capacity, 0);
  const kindLabel = (kind: string) => (kind === "ramadan_umrah" ? "Ramadan Umrah" : titleCase(kind));

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-[#07332a] via-[#0a4a3b] to-[#0b6b4f] text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-emerald-300/20" />
        <div className="absolute -bottom-28 right-40 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-emerald-100/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/90">Hajj & Umrah</span>
          </nav>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-100">
                <Landmark className="h-3 w-3" /> {filtered.length} packages · {upcoming.length} upcoming departures
              </span>
              <h1 className="mt-3 max-w-2xl text-[32px] font-bold leading-tight tracking-tight sm:text-[40px]">Hajj & Umrah, with a team beside you</h1>
              <p className="mt-3 max-w-2xl text-[12.5px] leading-6 text-emerald-100/80">
                Group leaders, hotels close to the Haram, document readiness and clear payment milestones. We stay with your family from
                the first briefing to the return flight.
              </p>
              <form method="get" className="mt-6 grid gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur sm:grid-cols-[1fr_180px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-100/60" />
                  <input
                    name="q"
                    defaultValue={params.q ?? ""}
                    placeholder="Search package or tier"
                    className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-[12.5px] text-white outline-none transition placeholder:text-emerald-100/50 focus:border-white/30 focus:bg-white/15"
                    aria-label="Search pilgrimage packages"
                  />
                </div>
                <select name="kind" defaultValue={params.kind ?? ""} className="h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-[12px] text-white outline-none focus:border-white/30" aria-label="Filter by package type">
                  <option value="" className="text-slate-900">All package types</option>
                  <option value="hajj" className="text-slate-900">Hajj</option>
                  <option value="umrah" className="text-slate-900">Umrah</option>
                  <option value="ramadan_umrah" className="text-slate-900">Ramadan Umrah</option>
                </select>
                <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-[12px] font-semibold text-emerald-900 transition hover:bg-emerald-50">
                  <Search className="h-3.5 w-3.5" /> Find package
                </button>
              </form>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {[
                { label: "Pilgrims booked", value: String(pilgrims) },
                { label: "Seats available", value: String(Math.max(0, capacity - pilgrims)) },
                { label: "Destinations", value: "Makkah & Madinah" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur">
                  <p className="text-[18px] font-bold leading-tight">{item.value}</p>
                  <p className="text-[9.5px] uppercase tracking-wide text-emerald-100/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-ink">Pilgrimage packages</h2>
            <p className="mt-1 text-[12px] text-slate-500">Departure dates, occupancy and pricing shown live from the pilgrimage desk.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link href="/hajj-umrah" className={`rounded-full border px-3 py-1.5 text-[10.5px] font-semibold ${!params.kind ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600"}`}>All</Link>
            {["hajj", "umrah", "ramadan_umrah"].map((kind) => (
              <Link key={kind} href={`/hajj-umrah?kind=${kind}`} className={`rounded-full border px-3 py-1.5 text-[10.5px] font-semibold ${params.kind === kind ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600"}`}>
                {kindLabel(kind)}
              </Link>
            ))}
          </div>
        </div>

        {filtered.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pkg) => {
              const used = percent(pkg.booked, pkg.capacity);
              const soldOut = pkg.booked >= pkg.capacity;
              const Icon = pkg.kind === "hajj" ? Landmark : pkg.kind === "ramadan_umrah" ? Moon : Plane;
              return (
                <article key={pkg.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative flex h-32 items-end bg-gradient-to-br from-[#0a4a3b] via-[#0b6b4f] to-[#0d8a63] p-4 text-white">
                    <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_25%_25%,white_1px,transparent_1px)] [background-size:18px_18px]" />
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur"><Icon className="h-4 w-4" /></span>
                    <div className="relative">
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-emerald-100/70">{kindLabel(pkg.kind)} · {pkg.tier}</p>
                      <p className="mt-0.5 text-[16px] font-bold leading-tight">{pkg.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {formatDate(pkg.departureDate)}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Makkah</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">Returns {formatDate(pkg.returnDate)} · {pkg.capacity} seat package</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{pkg.booked} of {pkg.capacity} booked</span>
                        <span className={soldOut ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{soldOut ? "Sold out" : `${used}% full`}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${soldOut ? "bg-red-400" : used >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, used)}%` }} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Per pilgrim</p>
                        <p className="text-[16px] font-bold text-ink">{formatMoney(pkg.price, "BDT", 0)}</p>
                      </div>
                      <Link href={`/hajj-umrah/${pkg.id}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                        Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
            <Landmark className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-[15px] font-semibold text-ink">No packages match your search</h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-slate-500">Speak to the pilgrimage desk for a tailored family or group package.</p>
            <Link href="/contact?interest=Hajj%20%26%20Umrah%20package" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white">
              Ask the pilgrimage desk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Group leader", text: "An experienced guide travels with every group." },
            { title: "Document readiness", text: "Passport, visa and vaccination checks before departure." },
            { title: "Hotels near the Haram", text: "Walking or short shuttle distance, confirmed in writing." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-[12px] font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
