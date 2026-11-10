import Link from "next/link";
import { CalendarPlus, Download, Users, Wallet } from "lucide-react";
import { BookingTable } from "@/components/bookings/booking-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import type { Booking, ServiceType } from "@/lib/types";
import { formatMoney, titleCase } from "@/lib/utils";

const PAGE_SIZE = 12;

interface ServiceConfig {
  title: string;
  description: string;
  breadcrumb: { label: string; href?: string }[];
  createHref: string;
  createLabel: string;
  basePath: string;
  emptyTitle: string;
  emptyDescription: string;
}

const CONFIG: Record<ServiceType, ServiceConfig> = {
  tour: {
    title: "Tour bookings",
    description: "All tour reservations with travellers, departure dates, payment position and confirmation status.",
    breadcrumb: [{ label: "Workspace", href: "/admin" }, { label: "Tour package" }, { label: "Tour bookings" }],
    createHref: "/admin/create-booking/tour",
    createLabel: "Tour booking wizard",
    basePath: "/admin/tour-bookings",
    emptyTitle: "No tour bookings yet",
    emptyDescription: "Create a tour booking with the six-step wizard to see it here.",
  },
  hotel: {
    title: "Hotel bookings",
    description: "Reservations across the hotel inventory — check-in, check-out, guests, supplier and balance.",
    breadcrumb: [{ label: "Workspace", href: "/admin" }, { label: "Hotel" }, { label: "Hotel bookings" }],
    createHref: "/admin/create-booking/standard?service=hotel",
    createLabel: "New hotel booking",
    basePath: "/admin/hotel-bookings",
    emptyTitle: "No hotel bookings yet",
    emptyDescription: "Book a hotel stay to start tracking check-ins and room revenue.",
  },
  visa: {
    title: "Visa applications",
    description: "Every visa file and its progress from document collection through to embassy decision.",
    breadcrumb: [{ label: "Workspace", href: "/admin" }, { label: "Visa processing" }, { label: "Visa process" }],
    createHref: "/admin/create-booking/standard?service=visa",
    createLabel: "New visa file",
    basePath: "/admin/visa-bookings",
    emptyTitle: "No visa applications yet",
    emptyDescription: "Open a visa file to track documents, embassy timing and the service fee.",
  },
  hajj: {
    title: "Hajj & Umrah bookings",
    description: "Pilgrim bookings by package and departure group, with payments and document readiness.",
    breadcrumb: [{ label: "Workspace", href: "/admin" }, { label: "Hajj & Umrah" }, { label: "Bookings" }],
    createHref: "/admin/create-booking/standard?service=hajj",
    createLabel: "New pilgrim booking",
    basePath: "/admin/hajj-umrah/bookings",
    emptyTitle: "No Hajj or Umrah bookings yet",
    emptyDescription: "Create a pilgrim booking to track deposits, documents and group allocation.",
  },
};

export async function ServiceBookingsView({
  serviceType,
  searchParams,
}: {
  serviceType: ServiceType;
  searchParams: Promise<{ q?: string; status?: string; payment?: string; period?: string; page?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const config = CONFIG[serviceType];
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const serviceBookings = db.bookings.filter((booking) => booking.serviceType === serviceType);
  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = serviceBookings.filter((booking: Booking) => {
    const haystack = [booking.ref, booking.customerName, booking.customerPhone, booking.title, booking.supplier, booking.assignedTo]
      .join(" ")
      .toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && booking.status !== params.status) return false;
    if (params.payment && booking.paymentStatus !== params.payment) return false;
    if (params.period === "upcoming" && booking.startDate < today) return false;
    if (params.period === "past" && booking.endDate >= today) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const revenue = serviceBookings.reduce((sum, booking) => sum + booking.total, 0);
  const due = serviceBookings.reduce((sum, booking) => sum + booking.due, 0);
  const travellers = serviceBookings.reduce((sum, booking) => sum + booking.travelers, 0);
  const upcoming = serviceBookings.filter((booking) => booking.startDate >= today).length;

  const cards = [
    { label: "Total bookings", value: String(serviceBookings.length), hint: `${filtered.length} match filters`, tone: "text-slate-700 bg-slate-100" },
    { label: "Upcoming services", value: String(upcoming), hint: "Departing from today", tone: "text-blue-700 bg-blue-50" },
    { label: "Travellers", value: String(travellers), hint: "Across all bookings", tone: "text-violet-700 bg-violet-50" },
    { label: "Balance due", value: formatMoney(due, "BDT", 0), hint: `${formatMoney(revenue, "BDT", 0)} booked value`, tone: "text-amber-700 bg-amber-50" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={config.title}
        description={config.description}
        breadcrumb={config.breadcrumb}
        actions={
          <>
            <Link
              href="/admin/all-bookings"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Unified ledger
            </Link>
            <Link
              href={config.createHref}
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> {config.createLabel}
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, hint, tone }) => (
          <Card key={label} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-1 truncate text-lg font-semibold tracking-tight text-ink">{value}</p>
              <p className="mt-0.5 truncate text-[10.5px] text-slate-400">{hint}</p>
            </div>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${tone}`}>
              {label === "Travellers" ? <Users className="h-4 w-4" /> : label === "Balance due" ? <Wallet className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
            </span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">{titleCase(serviceType)} register</h2>
              <p className="text-[11px] text-muted">{filtered.length} bookings match your filters</p>
            </div>
            <div className="flex gap-2">
              <Badge tone="green">{serviceBookings.filter((booking) => ["confirmed", "approved", "ready_to_travel", "completed"].includes(booking.status)).length} confirmed</Badge>
              <Badge tone="red">{serviceBookings.filter((booking) => ["cancelled", "rejected"].includes(booking.status)).length} cancelled</Badge>
            </div>
          </div>
          <FilterBar
            placeholder="Search reference, customer or package…"
            filters={[
              {
                name: "status",
                label: "All statuses",
                options: ["draft", "pending", "processing", "reserved", "confirmed", "approved", "ready_to_travel", "departed", "completed", "cancelled", "on_hold"].map((value) => ({
                  value,
                  label: titleCase(value),
                })),
              },
              {
                name: "payment",
                label: "All payments",
                options: [
                  { value: "unpaid", label: "Unpaid" },
                  { value: "partial", label: "Partial" },
                  { value: "paid", label: "Paid" },
                ],
              },
              {
                name: "period",
                label: "Any dates",
                options: [
                  { value: "upcoming", label: "Upcoming" },
                  { value: "past", label: "Past" },
                ],
              },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <BookingTable bookings={paged} />
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath={config.basePath} />
          </>
        ) : (
          <EmptyState
            icon={<CalendarPlus className="h-5 w-5" />}
            title={config.emptyTitle}
            description={config.emptyDescription}
            action={
              <Link href={config.createHref} className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                <CalendarPlus className="h-3.5 w-3.5" /> {config.createLabel}
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
