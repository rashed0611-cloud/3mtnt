import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock3, FileCheck2, FileSearch, Search, Wallet } from "lucide-react";
import { PageBanner } from "@/components/public/page-banner";
import { getPublicDatabase } from "@/lib/db/public";
import { fallbackImage } from "@/lib/fallback-image";
import { listCatalogCovers, listProductImages } from "@/lib/media";
import { pageAccentStyle, pageContent } from "@/lib/site-pages";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Visa",
  description: "Visa products with processing times, fees and document checklists for popular destinations.",
};

export default async function VisasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string }>;
}) {
  const params = await searchParams;
  const db = await getPublicDatabase();
  const pageSettings = db.settings.pages.visas;
  const hero = pageContent("visas", pageSettings);
  const covers = new Map(await listCatalogCovers("visa"));
  for (const image of await listProductImages("visa")) {
    if (!covers.has(image.entityId)) covers.set(image.entityId, image.url);
  }
  const term = (params.q ?? "").trim().toLowerCase();
  const countries = Array.from(new Set(db.visas.map((visa) => visa.country))).sort();

  const filtered = db.visas
    .filter((visa) => visa.status === "active")
    .filter((visa) => {
      const haystack = [visa.country, visa.visaType, visa.processingTime, visa.description, ...visa.requiredDocuments].join(" ").toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (params.country && visa.country !== params.country) return false;
      return true;
    });

  const average = filtered.length ? Math.round(filtered.reduce((sum, visa) => sum + visa.price, 0) / filtered.length) : 0;
  const fastest = filtered.length
    ? filtered.reduce((best, visa) => (visa.processingTime.length < best.processingTime.length ? visa : best), filtered[0])
    : null;

  return (
    <div style={pageAccentStyle(pageSettings)}>
      <section
        className="relative overflow-hidden border-b border-slate-200 text-white"
        style={{ background: "linear-gradient(135deg, #042f5c 0%, rgb(var(--primary-rgb)) 55%, #0e9bd8 100%)" }}
      >
        <PageBanner page={pageSettings} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-[10.5px] text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-white/90">Visa</span>
          </nav>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                <FileCheck2 className="h-3 w-3" /> {hero.eyebrow || `${db.visas.length} visa products · ${countries.length} countries`}
              </span>
              <h1 className="mt-3 max-w-2xl text-[32px] font-bold leading-tight tracking-tight sm:text-[40px]">{hero.heading}</h1>
              <p className="mt-3 max-w-2xl text-[12.5px] leading-6 text-white/80">
                {hero.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur">
                <Wallet className="h-4 w-4 text-amber-200" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-white/60">Average fee</p>
                <p className="text-[15px] font-bold text-white">{formatMoney(average, "BDT", 0)}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-3 backdrop-blur">
                <Clock3 className="h-4 w-4 text-sky-200" />
                <p className="mt-1.5 text-[9.5px] uppercase tracking-wide text-white/60">Fastest service</p>
                <p className="text-[12px] font-bold text-white">{fastest ? fastest.processingTime : "—"}</p>
              </div>
            </div>
          </div>

          <form method="get" className="mt-6 grid gap-2 rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur sm:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Search country, visa type or document"
                className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-[12.5px] text-white outline-none transition placeholder:text-white/50 focus:border-white/30 focus:bg-white/15"
                aria-label="Search visas"
              />
            </div>
            <select name="country" defaultValue={params.country ?? ""} className="h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-[12px] text-white outline-none focus:border-white/30" aria-label="Filter by country">
              <option value="" className="text-slate-900">All countries</option>
              {countries.map((country) => <option key={country} value={country} className="text-slate-900">{country}</option>)}
            </select>
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-5 text-[12px] font-semibold text-slate-900 transition hover:bg-white/90">
              <FileSearch className="h-3.5 w-3.5" /> Find visa
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-[12px] text-slate-500">
          <span className="font-semibold text-ink">{filtered.length}</span> visa {filtered.length === 1 ? "product" : "products"} available
        </p>

        {filtered.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((visa) => {
              const image = covers.get(visa.id) || fallbackImage(visa.country, visa.visaType);
              return (
              <article key={visa.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                <Link href={`/visas/${visa.id}`} className="block">
                  <div className="relative flex h-40 items-end bg-gradient-to-br from-amber-600 via-amber-500 to-amber-400 p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-slate-950/5" />
                    <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                      {visa.visaType}
                    </span>
                    <div className="relative">
                      <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-white/70">Visa</p>
                      <p className="text-[20px] font-bold leading-tight text-white">{visa.country}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[10.5px] text-slate-500">{visa.visaType} visa</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9.5px] font-medium text-slate-600">{visa.requiredDocuments.length} docs</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11.5px] leading-5 text-slate-500">{visa.description}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[9px] uppercase tracking-wide text-slate-400">Processing</p>
                      <p className="text-[10.5px] font-semibold text-ink">{visa.processingTime}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[9px] uppercase tracking-wide text-slate-400">Service fee</p>
                      <p className="text-[10.5px] font-semibold text-ink">{formatMoney(visa.price, "BDT", 0)}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4">
                    <Link href={`/visas/${visa.id}`} className="inline-flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                      View requirements <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-14 text-center">
            <FileSearch className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-3 text-[15px] font-semibold text-ink">No visa products match that search</h2>
            <p className="mx-auto mt-1 max-w-sm text-[12px] text-slate-500">Tell us your destination and passport and our visa desk will confirm requirements.</p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[11.5px] font-semibold text-white">
              Ask the visa desk <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-amber-900">Not sure which visa you need?</p>
              <p className="mt-0.5 text-[11.5px] text-amber-800/80">Send us your passport nationality, destination and travel window. We&apos;ll map the right route.</p>
            </div>
            <Link href="/contact?interest=Visa%20eligibility%20check" className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-4 py-2 text-[11.5px] font-semibold text-white hover:bg-amber-950">
              Request an eligibility check <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
