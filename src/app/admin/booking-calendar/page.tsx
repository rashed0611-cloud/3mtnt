import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Plane, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import type { Booking } from "@/lib/types";
import { cn, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking calendar" };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const serviceTone: Record<Booking["serviceType"], string> = {
  tour: "border-blue-200 bg-blue-50 text-blue-700",
  hotel: "border-violet-200 bg-violet-50 text-violet-700",
  visa: "border-amber-200 bg-amber-50 text-amber-700",
  hajj: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function parseMonth(value?: string) {
  const now = new Date();
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-").map(Number);
    if (month >= 1 && month <= 12) return { year, monthIndex: month - 1 };
  }
  return { year: now.getFullYear(), monthIndex: now.getMonth() };
}

function monthParam(year: number, monthIndex: number) {
  const date = new Date(year, monthIndex, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function BookingCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; type?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const { year, monthIndex } = parseMonth(params.month);
  const db = await getRepository().getDatabase();
  const today = iso(new Date());
  const first = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const cells = Math.ceil((leading + daysInMonth) / 7) * 7;

  const monthBookings = db.bookings.filter((booking) => {
    if (params.type && booking.serviceType !== params.type) return false;
    return booking.startDate.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);
  });

  const byDate = new Map<string, Booking[]>();
  for (const booking of monthBookings) {
    const list = byDate.get(booking.startDate) ?? [];
    list.push(booking);
    byDate.set(booking.startDate, list);
  }

  const revenue = monthBookings.reduce((sum, booking) => sum + booking.total, 0);
  const travellers = monthBookings.reduce((sum, booking) => sum + booking.travelers, 0);
  const prev = new Date(year, monthIndex - 1, 1);
  const next = new Date(year, monthIndex + 1, 1);
  const suffix = params.type ? `&type=${params.type}` : "";

  const upcoming = [...monthBookings].sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, 6);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Booking calendar"
        description="Every departure, check-in and appointment across tours, hotels, visas and Hajj in one operational calendar."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Booking management" }, { label: "Calendar" }]}
        actions={
          <Link
            href="/admin/create-booking"
            className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Create booking
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Departures this month" value={String(monthBookings.length)} hint={`${MONTHS[monthIndex]} ${year}`} icon={CalendarDays} tone="blue" />
        <StatCard label="Travellers" value={String(travellers)} hint="Across all services" icon={Users} tone="violet" />
        <StatCard label="Gross value" value={formatMoney(revenue, "BDT", 0)} hint="Booked value this month" icon={Wallet} tone="green" />
        <StatCard
          label="Hajj & Umrah groups"
          value={String(monthBookings.filter((booking) => booking.serviceType === "hajj").length)}
          hint="Pilgrim departures"
          icon={Plane}
          tone="amber"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/booking-calendar?month=${monthParam(prev.getFullYear(), prev.getMonth())}${suffix}`}
              className="rounded-control border border-line p-1.5 text-slate-500 hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <h2 className="min-w-[170px] text-center text-sm font-semibold text-ink">
              {MONTHS[monthIndex]} {year}
            </h2>
            <Link
              href={`/admin/booking-calendar?month=${monthParam(next.getFullYear(), next.getMonth())}${suffix}`}
              className="rounded-control border border-line p-1.5 text-slate-500 hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link href="/admin/booking-calendar" className="ml-1 rounded-control border border-line px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50">
              Today
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/admin/booking-calendar?month=${monthParam(year, monthIndex)}`}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10.5px] font-medium",
                !params.type ? "border-primary bg-primary text-white" : "border-line bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              All services
            </Link>
            {(["tour", "hotel", "visa", "hajj"] as const).map((type) => (
              <Link
                key={type}
                href={`/admin/booking-calendar?month=${monthParam(year, monthIndex)}&type=${type}`}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10.5px] font-medium",
                  params.type === type ? "border-primary bg-primary text-white" : "border-line bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {type === "hajj" ? "Hajj & Umrah" : titleCase(type)}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-line bg-slate-50/70">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: cells }, (_, index) => {
            const dayNumber = index - leading + 1;
            const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
            const date = new Date(year, monthIndex, dayNumber);
            const key = iso(date);
            const dayBookings = inMonth ? byDate.get(key) ?? [] : [];
            const isToday = key === today && inMonth;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[104px] border-b border-r border-line p-1.5 last:border-r-0",
                  !inMonth && "bg-slate-50/50",
                  inMonth && index % 7 === 6 && "border-r-0",
                )}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium",
                      !inMonth && "text-slate-300",
                      inMonth && !isToday && "text-slate-600",
                      isToday && "bg-primary text-white",
                    )}
                  >
                    {inMonth ? dayNumber : new Date(year, monthIndex, dayNumber).getDate()}
                  </span>
                  {dayBookings.length > 2 ? <span className="text-[9px] font-semibold text-slate-400">+{dayBookings.length - 2}</span> : null}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/all-bookings/${booking.id}`}
                      className={cn("block truncate rounded border px-1.5 py-0.5 text-[9.5px] font-medium leading-4 hover:underline", serviceTone[booking.serviceType])}
                      title={`${booking.ref} · ${booking.customerName} · ${booking.title}`}
                    >
                      {booking.ref}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 text-[10px] text-slate-500">
          {(["tour", "hotel", "visa", "hajj"] as const).map((type) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full border", serviceTone[type])} />
              {type === "hajj" ? "Hajj & Umrah" : titleCase(type)}
            </span>
          ))}
          <span className="ml-auto">Showing departure / check-in dates</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Departures in {MONTHS[monthIndex]}</h2>
              <p className="text-[11px] text-muted">Next services in date order</p>
            </div>
            <Link href="/admin/all-bookings" className="text-[11px] font-semibold text-primary hover:underline">
              All bookings
            </Link>
          </div>
          {upcoming.length ? (
            <div className="divide-y divide-line">
              {upcoming.map((booking) => (
                <Link key={booking.id} href={`/admin/all-bookings/${booking.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-[9px] uppercase tracking-wide text-muted">{new Date(`${booking.startDate}T00:00:00`).toLocaleString("en-GB", { month: "short" })}</p>
                    <p className="text-[15px] font-semibold leading-4 text-ink">{booking.startDate.slice(8, 10)}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{booking.title}</p>
                    <p className="truncate text-[10.5px] text-muted">
                      {booking.ref} · {booking.customerName} · {booking.travelers} traveller{booking.travelers === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Badge tone={booking.serviceType === "tour" ? "blue" : booking.serviceType === "hotel" ? "violet" : booking.serviceType === "visa" ? "amber" : "green"}>
                    {titleCase(booking.serviceType)}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No departures this month" description="Use the arrows to browse another month or create a new booking." />
          )}
        </Card>

        <Card>
          <div className="border-b border-line px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">Month at a glance</h2>
            <p className="text-[11px] text-muted">Service mix for {MONTHS[monthIndex]}</p>
          </div>
          <div className="space-y-3 p-4">
            {(["tour", "hotel", "visa", "hajj"] as const).map((type) => {
              const rows = monthBookings.filter((booking) => booking.serviceType === type);
              const value = rows.reduce((sum, booking) => sum + booking.total, 0);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-600">{type === "hajj" ? "Hajj & Umrah" : titleCase(type)}</span>
                    <span className="font-medium text-ink">{rows.length} · {formatMoney(value, "BDT", 0)}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        type === "tour" ? "bg-blue-500" : type === "hotel" ? "bg-violet-500" : type === "visa" ? "bg-amber-500" : "bg-emerald-500",
                      )}
                      style={{ width: `${Math.min(100, (rows.length / Math.max(1, monthBookings.length)) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="border-t border-line pt-3 text-[10.5px] leading-5 text-muted">
              {monthBookings.length} services scheduled · {travellers} travellers · {formatMoney(revenue, "BDT", 0)} booked value.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
