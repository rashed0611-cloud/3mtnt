import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, CalendarPlus, FileSearch, Globe2, Landmark, Plane, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create booking" };

const services = [
  {
    title: "Tour package",
    description: "Six-step guided wizard with travellers, dates, pricing, documents and review.",
    href: "/admin/create-booking/tour",
    icon: Globe2,
    tone: "from-blue-500/15 to-blue-500/5 text-blue-600",
    badge: "Recommended",
  },
  {
    title: "Hotel stay",
    description: "Capture property, check-in/out, guests, room rate and payment schedule.",
    href: "/admin/create-booking/standard?service=hotel",
    icon: Building2,
    tone: "from-violet-500/15 to-violet-500/5 text-violet-600",
    badge: "Inventory-linked",
  },
  {
    title: "Visa processing",
    description: "Country, visa type, embassy timeline, documents and service fee.",
    href: "/admin/create-booking/standard?service=visa",
    icon: FileSearch,
    tone: "from-amber-500/15 to-amber-500/5 text-amber-600",
    badge: "Document workflow",
  },
  {
    title: "Hajj & Umrah",
    description: "Package, departure group, pilgrims and deposit collection.",
    href: "/admin/create-booking/standard?service=hajj",
    icon: Landmark,
    tone: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    badge: "Pilgrim records",
  },
];

export default async function CreateBookingPage() {
  await requireUser();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Create a booking"
        description="Every service runs through the same booking ledger, so finance, operations and the customer see one source of truth."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Booking management" }, { label: "Create booking" }]}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {services.map(({ title, description, href, icon: Icon, tone, badge }) => (
          <Link key={title} href={href} className="card-surface group relative flex items-start gap-4 p-5 transition hover:border-primary/30 hover:shadow-md">
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-gradient-to-br ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-ink group-hover:text-primary">{title}</h2>
                <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">{badge}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-5 text-muted">{description}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                Start booking <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Card className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[12.5px] font-semibold text-ink">One booking model, every service</p>
            <p className="mt-0.5 max-w-2xl text-[11.5px] leading-5 text-muted">
              Flight bookings can be added from the flight workspace once a PNR is confirmed. All services share references, payments,
              invoices, documents and audit history.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/all-bookings" className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50">
            <CalendarPlus className="h-3.5 w-3.5" /> All bookings
          </Link>
          <Link href="/admin/flights" className="inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50">
            <Plane className="h-3.5 w-3.5" /> Flights
          </Link>
        </div>
      </Card>

      <div className="rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
        <strong className="font-semibold text-slate-700">Good to know:</strong> a customer profile is created automatically if you enter a new
        traveller during checkout. Draft bookings do not generate an invoice until confirmed.
      </div>
    </div>
  );
}
