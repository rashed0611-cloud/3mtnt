import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CalendarPlus, Download, Filter, Wallet } from "lucide-react";
import { BookingTable } from "@/components/bookings/booking-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { bookingSummary } from "@/lib/stats";
import { formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "All bookings" };

const PAGE_SIZE = 12;

export default async function AllBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    payment?: string;
    type?: string;
    assigned?: string;
    period?: string;
    page?: string;
  }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const summary = bookingSummary(db);
  const today = new Date().toISOString().slice(0, 10);
  const staff = Array.from(new Set(db.bookings.map((booking) => booking.assignedTo))).sort();

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = db.bookings.filter((booking) => {
    const haystack = [booking.ref, booking.customerName, booking.customerPhone, booking.title, booking.supplier, booking.assignedTo]
      .join(" ")
      .toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && booking.status !== params.status) return false;
    if (params.payment && booking.paymentStatus !== params.payment) return false;
    if (params.type && booking.serviceType !== params.type) return false;
    if (params.assigned && booking.assignedTo !== params.assigned) return false;
    if (params.period === "upcoming" && booking.startDate < today) return false;
    if (params.period === "past" && booking.endDate >= today) return false;
    if (params.period === "this_month" && !booking.startDate.startsWith(today.slice(0, 7))) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const cards = [
    { label: "Total bookings", value: String(summary.total), hint: "All services", tone: "text-slate-700 bg-slate-100", icon: CalendarDays },
    { label: "Needs attention", value: String(summary.needsAttention), hint: "Pending or processing", tone: "text-amber-700 bg-amber-50", icon: Filter },
    { label: "Upcoming services", value: String(summary.upcoming), hint: "Departing from today", tone: "text-blue-700 bg-blue-50", icon: CalendarPlus },
    { label: "Payment due", value: formatMoney(summary.dueValue, "BDT", 0), hint: `${summary.paymentDue} bookings with balance`, tone: "text-emerald-700 bg-emerald-50", icon: Wallet },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="All bookings"
        description="One unified ledger for tours, hotels, visas and Hajj. Search, filter and action any booking without leaving the workspace."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Booking management" }, { label: "All bookings" }]}
        actions={
          <>
            <a
              href="/admin/all-bookings/export"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </a>
            <Link
              href="/admin/create-booking"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> Create booking
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, hint, tone, icon: Icon }) => (
          <Card key={label} className="flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{label}</p>
              <p className="mt-1 truncate text-lg font-semibold tracking-tight text-ink">{value}</p>
              <p className="mt-0.5 truncate text-[10.5px] text-slate-400">{hint}</p>
            </div>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-control ${tone}`}>
              <Icon className="h-4 w-4" />
            </span>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Booking register</h2>
              <p className="text-[11px] text-muted">{filtered.length} bookings match your filters</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="green">{summary.confirmed} confirmed</Badge>
              <Badge tone="red">{summary.cancelled} cancelled</Badge>
            </div>
          </div>
          <FilterBar
            placeholder="Search reference, customer, service…"
            filters={[
              {
                name: "type",
                label: "All services",
                options: [
                  { value: "tour", label: "Tours" },
                  { value: "hotel", label: "Hotels" },
                  { value: "visa", label: "Visas" },
                  { value: "hajj", label: "Hajj & Umrah" },
                ],
              },
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
              { name: "assigned", label: "All staff", options: staff.map((value) => ({ value, label: value })) },
              {
                name: "period",
                label: "Any dates",
                options: [
                  { value: "upcoming", label: "Upcoming" },
                  { value: "this_month", label: "This month" },
                  { value: "past", label: "Past" },
                ],
              },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <BookingTable bookings={paged} />
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/all-bookings" />
          </>
        ) : (
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title="No bookings match those filters"
            description="Try a different reference, service or status. You can also create a new booking from scratch."
            action={
              <Link href="/admin/create-booking" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                <CalendarPlus className="h-3.5 w-3.5" /> Create booking
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}
