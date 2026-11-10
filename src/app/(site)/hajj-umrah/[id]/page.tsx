import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Check, Landmark, MapPin, Moon, Phone, Plane, ShieldCheck, Users } from "lucide-react";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const pkg = db.hajjPackages.find((item) => item.id === id);
  if (!pkg) return { title: "Package not found" };
  return { title: pkg.title, description: `${pkg.tier} ${pkg.kind.replace(/_/g, " ")} package departing ${pkg.departureDate}.` };
}

export default async function HajjPackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const pkg = db.hajjPackages.find((item) => item.id === id);
  if (!pkg) notFound();

  const used = percent(pkg.booked, pkg.capacity);
  const remaining = Math.max(0, pkg.capacity - pkg.booked);
  const interest = encodeURIComponent(`${pkg.title} (${pkg.tier})`);
  const Icon = pkg.kind === "hajj" ? Landmark : pkg.kind === "ramadan_umrah" ? Moon : Plane;
  const included = [
    "Return economy flights from Dhaka",
    "Visa processing and pilgrimage permits",
    "Hotel accommodation in Makkah and Madinah",
    "Daily meals as per programme",
    "Air-conditioned transport between cities",
    "Group leader and local guide support",
    "Ziyarah visits and orientation briefing",
    "Document readiness checks before departure",
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#07332a] via-[#0a4a3b] to-[#0b6b4f] text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-emerald-300/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-emerald-100/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/hajj-umrah" className="hover:text-white">Hajj & Umrah</Link>
            <span>/</span>
            <span className="text-white/90">{pkg.tier}</span>
          </nav>
          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <Icon className="h-7 w-7" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-100/70">
                {pkg.kind === "ramadan_umrah" ? "Ramadan Umrah" : titleCase(pkg.kind)} · {pkg.tier}
              </p>
              <h1 className="mt-1 max-w-3xl text-[28px] font-bold leading-tight tracking-tight sm:text-[38px]">{pkg.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-white/85">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Departs {formatDate(pkg.departureDate)}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Returns {formatDate(pkg.returnDate)}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Makkah & Madinah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-7">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Package price", value: formatMoney(pkg.price, "BDT", 0) },
                { label: "Seats remaining", value: String(remaining) },
                { label: "Occupancy", value: `${used}%` },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <p className="text-[9.5px] uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="mt-1 text-[16px] font-bold text-ink">{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">What the package includes</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {included.map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="h-3 w-3" />
                    </span>
                    <p className="text-[11.5px] leading-5 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">Journey outline</h2>
              <div className="mt-3 space-y-2">
                {[
                  { day: "Before departure", title: "Briefing & documents", text: "Passport, visa, vaccination and packing checklist reviewed with your group leader." },
                  { day: "Day 1", title: "Departure & arrival", text: "Group flight, airport assistance and transfer to the hotel in Makkah or Madinah." },
                  { day: "Core days", title: "Rituals with guidance", text: "Umrah or Hajj rites supported by your group leader, with scheduled rest and Ziyarah." },
                  { day: "Return", title: "Homeward journey", text: "Transfer to the airport, group check-in and return flight to Dhaka." },
                ].map((step) => (
                  <div key={step.day} className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">{step.day}</span>
                    <div>
                      <p className="text-[12px] font-semibold text-ink">{step.title}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[19px] font-bold tracking-tight text-ink">Payment milestones</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { stage: "Booking deposit", amount: "30%", note: "Confirms your seat" },
                  { stage: "Second payment", amount: "40%", note: "Due 90 days before" },
                  { stage: "Final balance", amount: "30%", note: "Due 30 days before" },
                ].map((milestone) => (
                  <div key={milestone.stage} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                    <p className="text-[15px] font-bold text-ink">{milestone.amount}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-700">{milestone.stage}</p>
                    <p className="text-[10px] text-slate-500">{milestone.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[9.5px] uppercase tracking-wide text-slate-400">Per pilgrim</p>
              <p className="text-[26px] font-bold leading-tight text-ink">{formatMoney(pkg.price, "BDT", 0)}</p>
              <p className="mt-0.5 text-[10.5px] text-slate-500">{remaining} of {pkg.capacity} seats remaining</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${remaining === 0 ? "bg-red-400" : used >= 75 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, used)}%` }} />
              </div>
              <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-[11.5px]">
                <div className="flex justify-between"><dt className="text-slate-500">Package type</dt><dd className="font-medium text-ink">{pkg.kind === "ramadan_umrah" ? "Ramadan Umrah" : titleCase(pkg.kind)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tier</dt><dd className="font-medium text-ink">{pkg.tier}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Departure</dt><dd className="font-medium text-ink">{formatDate(pkg.departureDate)}</dd></div>
              </dl>
              <div className="mt-4 space-y-2">
                <Link href={`/contact?interest=${interest}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-primary-strong">
                  Reserve my seat <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a href="tel:+8801700000000" className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-[12px] font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> Speak to the desk
                </a>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-slate-400">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> Deposit confirms the seat; the balance follows the published milestones.
              </p>
            </div>

            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-900"><Users className="h-3.5 w-3.5" /> Travelling as a family?</p>
              <p className="mt-1 text-[10.5px] leading-5 text-emerald-800/80">We can hold adjacent rooms and connect family files so documents are reviewed together.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
