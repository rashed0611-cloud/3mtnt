import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Clock3, FileCheck2, Globe2, Phone, ShieldCheck, Timer, Wallet } from "lucide-react";
import { getPublicDatabase } from "@/lib/db/public";
import { fallbackImage } from "@/lib/fallback-image";
import { PhotoStrip } from "@/components/public/photo-strip";
import { listCatalogCovers, listImagesForProduct } from "@/lib/media";
import { formatMoney } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await getPublicDatabase();
  const visa = db.visas.find((item) => item.id === id);
  if (!visa) return { title: "Visa not found" };
  return { title: `${visa.country} ${visa.visaType}`, description: visa.description.slice(0, 160) };
}

export default async function VisaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getPublicDatabase();
  const visa = db.visas.find((item) => item.id === id);
  if (!visa) notFound();
  const coverUrl = (await listCatalogCovers("visa")).get(visa.id);
  const heroImage = coverUrl || fallbackImage(visa.country, visa.visaType);
  const relatedPhotos = await listImagesForProduct("visa", visa.id);

  const interest = encodeURIComponent(`${visa.country} ${visa.visaType} visa`);
  const others = db.visas.filter((item) => item.id !== visa.id && item.status === "active" && item.country === visa.country);

  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-[#fff8ed] to-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-400" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/visas" className="hover:text-primary">Visa</Link>
            <span>/</span>
            <span className="text-slate-600">{visa.country}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-amber-600">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage} alt="" className="h-full w-full object-cover" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">{visa.visaType}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <Check className="h-2.5 w-2.5" /> Accepting applications
                  </span>
                </div>
                <h1 className="mt-1.5 text-[28px] font-bold leading-tight tracking-tight text-ink sm:text-[34px]">{visa.country} visa</h1>
                <p className="mt-1 max-w-xl text-[12px] leading-6 text-slate-500">{visa.description}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Service fee</p>
              <p className="text-[20px] font-bold text-ink">{formatMoney(visa.price, "BDT", 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <PhotoStrip images={relatedPhotos.map((image) => image.url)} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, label: "Processing time", value: visa.processingTime },
                { icon: FileCheck2, label: "Documents", value: `${visa.requiredDocuments.length} required` },
                { icon: Timer, label: "Application mode", value: "Assisted online" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <Icon className="h-4 w-4 text-amber-500" />
                  <p className="mt-2 text-[9.5px] uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="text-[12px] font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">Document checklist</h2>
              <p className="mt-1 text-[11.5px] text-slate-500">Prepare clear scans or originals. Your specialist checks every item before submission.</p>
              <div className="mt-3 space-y-2">
                {visa.requiredDocuments.map((document, index) => (
                  <div key={document} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[12px] text-slate-700">{document}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">How it works</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  { title: "Share your details", text: "Tell us your nationality, destination and travel dates." },
                  { title: "Document review", text: "We send a checklist and check every file before submission." },
                  { title: "Application filed", text: "Your specialist books the appointment and files the application." },
                  { title: "Decision & next steps", text: "We track the outcome and help with onward travel planning." },
                ].map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <p className="text-[10px] font-semibold text-amber-600">STEP {index + 1}</p>
                    <p className="mt-1 text-[12px] font-semibold text-ink">{step.title}</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Visa service fee</p>
              <p className="text-[26px] font-bold leading-tight text-ink">{formatMoney(visa.price, "BDT", 0)}</p>
              <p className="mt-0.5 text-[10.5px] text-slate-500">Embassy fees, if any, are quoted separately.</p>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11.5px]">
                <div className="flex justify-between"><dt className="text-slate-500">Destination</dt><dd className="font-medium text-ink">{visa.country}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Visa type</dt><dd className="font-medium text-ink">{visa.visaType}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Processing</dt><dd className="font-medium text-ink">{visa.processingTime}</dd></div>
              </dl>
              <div className="mt-4 space-y-2">
                <Link href={`/contact?interest=${interest}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-primary-strong">
                  Start my application <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a href="tel:+8801700000000" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> Talk to the visa desk
                </a>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Documents are stored securely and shared only with the relevant embassy or consulate.
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-amber-900"><Wallet className="h-3.5 w-3.5" /> Payment terms</p>
              <p className="mt-1 text-[10.5px] leading-5 text-amber-800/80">A service deposit starts your file; embassy fees are collected at submission. Refunds follow the embassy policy.</p>
            </div>
          </aside>
        </div>

        {others.length ? (
          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-[18px] font-bold tracking-tight text-ink">Other {visa.country} visa options</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((item) => (
                <Link key={item.id} href={`/visas/${item.id}`} className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-md">
                  <p className="text-[12.5px] font-semibold text-ink group-hover:text-primary">{item.visaType}</p>
                  <p className="mt-0.5 text-[10.5px] text-slate-500">{item.processingTime} · {formatMoney(item.price, "BDT", 0)}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
