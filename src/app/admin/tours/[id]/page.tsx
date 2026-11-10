import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarPlus, CircleCheck, CircleX, Clock, MapPin, Pencil, Star, Users } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Tour detail" };

export default async function TourDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; saved?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { created, saved } = await searchParams;
  const repo = getRepository();
  const db = await repo.getDatabase();
  const tour = db.tours.find((item) => item.id === id);
  if (!tour) notFound();

  const bookings = db.bookings.filter((booking) => booking.serviceType === "tour" && booking.title === tour.title);

  return (
    <div className="space-y-4">
      <PageHeader
        title={tour.title}
        description={`${tour.code} · ${tour.destination} · ${tour.durationDays} days / ${tour.durationNights} nights`}
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Tours", href: "/admin/tours" }, { label: tour.code }]}
        actions={
          <>
            <Link href="/admin/tours" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <Link href={`/admin/tours/${tour.id}/edit`} className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Edit tour
            </Link>
            <Link href={`/admin/create-booking/tour?tourId=${tour.id}`} className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <CalendarPlus className="h-3.5 w-3.5" /> Book this tour
            </Link>
          </>
        }
      />

      {created ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Tour published successfully and added to the catalogue.
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Tour changes saved. Pricing, itinerary and the public page are up to date.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Adult price" value={formatMoney(tour.adultPrice, "BDT", 0)} icon={Users} tone="blue" />
        <StatCard label="Child price" value={formatMoney(tour.childPrice, "BDT", 0)} icon={Users} tone="violet" />
        <StatCard label="Capacity" value={`${tour.capacity} seats`} icon={Users} tone="green" hint="Per departure" />
        <StatCard label="Bookings" value={String(bookings.length)} icon={CalendarPlus} tone="amber" href="/admin/tour-bookings" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="relative h-36 overflow-hidden rounded-t-card bg-gradient-to-r from-slate-900 via-slate-800 to-primary/50">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_40%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                <div className="text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Destination</p>
                  <p className="flex items-center gap-1.5 text-lg font-semibold"><MapPin className="h-4 w-4" /> {tour.destination}</p>
                </div>
                <div className="flex gap-1.5">
                  <Badge tone="blue" className="bg-white/15 text-white ring-0">{titleCase(tour.type)}</Badge>
                  {tour.featured ? <Badge tone="amber" className="bg-amber-400/90 text-amber-950"><Star className="h-2.5 w-2.5" /> Featured</Badge> : null}
                </div>
              </div>
            </div>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink">About this tour</h2>
                <StatusBadge status={tour.status} />
              </div>
              <p className="text-[12.5px] leading-6 text-slate-600">{tour.description || "No description added yet."}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Supplier", value: tour.supplier },
                  { label: "Created", value: formatDate(tour.createdAt) },
                  { label: "Currency", value: tour.currency },
                ].map((item) => (
                  <div key={item.label} className="rounded-control bg-slate-50 px-3 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">{item.label}</p>
                    <p className="mt-0.5 truncate text-[12px] font-medium text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Day-by-day itinerary</CardTitle>
                <CardDescription>{tour.itinerary.length} days planned</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {tour.itinerary.length ? (
                tour.itinerary.map((day, index) => (
                  <div key={day.day} className="relative flex gap-3 pb-5 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {day.day}
                      </span>
                      {index < tour.itinerary.length - 1 ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
                    </div>
                    <div className="-mt-0.5 min-w-0 pb-1">
                      <p className="text-[12.5px] font-semibold text-ink">{day.title}</p>
                      <p className="mt-0.5 text-[11.5px] leading-5 text-slate-500">{day.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-muted">No itinerary days have been added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Pricing & commission</CardTitle></CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { label: "Adult (twin share)", value: formatMoney(tour.adultPrice, "BDT", 0) },
                { label: "Child (with bed)", value: formatMoney(tour.childPrice, "BDT", 0) },
                { label: "Deposit per person", value: formatMoney(Math.round(tour.adultPrice * 0.3), "BDT", 0) },
                { label: "Agent commission (5%)", value: formatMoney(Math.round(tour.adultPrice * 0.05), "BDT", 0) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between border-b border-line/70 pb-2 text-[12px] last:border-0 last:pb-0">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-ink">{row.value}</span>
                </div>
              ))}
              <div className="rounded-control bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
                <Clock className="mb-1 h-3.5 w-3.5 text-slate-400" />
                Seasonal pricing and departure inventory can be configured in Tour settings.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>What&apos;s included</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1.5">
                {tour.inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[11.5px] text-slate-600">
                    <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {item}
                  </li>
                ))}
              </ul>
              <div className="border-t border-line pt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Not included</p>
                <ul className="space-y-1.5">
                  {tour.exclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[11.5px] text-slate-500">
                      <CircleX className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Link href="/admin/tours/new" className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[12px] font-medium text-slate-600 hover:border-primary/40 hover:text-primary">
            Create another tour <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
