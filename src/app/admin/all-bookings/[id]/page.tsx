import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CircleCheck,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Plane,
  ReceiptText,
  Sparkles,
  UserRound,
} from "lucide-react";
import { BookingActions } from "@/components/bookings/booking-actions";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking detail" };

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const repo = getRepository();
  const db = await repo.getDatabase();
  const booking = db.bookings.find((item) => item.id === id);
  if (!booking) notFound();

  const customer = db.customers.find((item) => item.id === booking.customerId);
  const invoice = db.invoices.find((item) => item.bookingRef === booking.ref);
  const paidPercent = percent(booking.paid, booking.total);
  const isCancelled = ["cancelled", "rejected"].includes(booking.status);

  return (
    <div className="space-y-4">
      <PageHeader
        title={booking.ref}
        description={`${titleCase(booking.serviceType)} · ${booking.title}`}
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "All bookings", href: "/admin/all-bookings" },
          { label: booking.ref },
        ]}
        actions={
          <>
            <Link href="/admin/all-bookings" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <div className="flex flex-wrap gap-2">
              <BookingActions booking={booking} />
            </div>
          </>
        }
      />

      {isCancelled ? (
        <div className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          This booking is {titleCase(booking.status).toLowerCase()}. Payments and documents remain visible for audit and refund handling.
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <div className="flex flex-col gap-3 border-b border-line bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-control bg-white/10 ring-1 ring-white/15">
                  {booking.serviceType === "hotel" ? <MapPin className="h-5 w-5" /> : booking.serviceType === "visa" ? <FileText className="h-5 w-5" /> : booking.serviceType === "hajj" ? <Sparkles className="h-5 w-5" /> : <Plane className="h-5 w-5" />}
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">{titleCase(booking.serviceType)} booking</p>
                  <p className="text-[14px] font-semibold">{booking.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} />
                <StatusBadge status={booking.paymentStatus} />
              </div>
            </div>

            <div className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
              {[
                { label: "Travel dates", value: `${formatDate(booking.startDate)} → ${formatDate(booking.endDate)}` },
                { label: "Travellers", value: `${booking.travelers} (${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children ? `, ${booking.children} child` : ""})` },
                { label: "Assigned to", value: booking.assignedTo },
                { label: "Source", value: booking.source },
              ].map((item) => (
                <div key={item.label} className="px-4 py-3">
                  <p className="text-[9.5px] font-medium uppercase tracking-wide text-muted">{item.label}</p>
                  <p className="mt-0.5 text-[11.5px] font-medium leading-4 text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment summary</CardTitle>
                <CardDescription>Pricing breakdown, collected amount and outstanding balance</CardDescription>
              </div>
              {invoice ? (
                <Link href={`/admin/invoices/${invoice.id}`} className="text-[11px] font-semibold text-primary hover:underline">
                  View invoice
                </Link>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-control border border-line p-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-600">Collected {paidPercent}%</span>
                  <span className="text-muted">{formatMoney(booking.paid)} of {formatMoney(booking.total)}</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${paidPercent}%` }} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">Total</p>
                    <p className="text-[12px] font-semibold text-ink">{formatMoney(booking.total, "BDT", 0)}</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">Paid</p>
                    <p className="text-[12px] font-semibold text-emerald-700">{formatMoney(booking.paid, "BDT", 0)}</p>
                  </div>
                  <div>
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">Due</p>
                    <p className={`text-[12px] font-semibold ${booking.due > 0 ? "text-amber-700" : "text-slate-400"}`}>{formatMoney(booking.due, "BDT", 0)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { label: "Subtotal", value: formatMoney(booking.subtotal) },
                  { label: "Discount", value: booking.discount ? `− ${formatMoney(booking.discount)}` : "—" },
                  { label: "Tax", value: formatMoney(booking.tax) },
                  { label: "Supplier", value: booking.supplier ?? "Own inventory" },
                  { label: "Created", value: formatDateTime(booking.createdAt) },
                  { label: "Currency", value: booking.currency },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-control bg-slate-50 px-3 py-2 text-[11.5px]">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="truncate pl-2 font-medium text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Timeline & audit trail</CardTitle>
                <CardDescription>Every status change and payment is recorded</CardDescription>
              </div>
              <span className="text-[10.5px] text-muted">{booking.timeline.length} events</span>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-4 border-l border-line pl-5">
                {booking.timeline.map((event, index) => (
                  <div key={`${event.at}-${index}`} className="relative">
                    <span className="absolute -left-[27px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-primary">
                      <span className="h-1 w-1 rounded-full bg-white" />
                    </span>
                    <p className="text-[12px] font-medium text-ink">{event.label}</p>
                    {event.note ? <p className="text-[11px] text-muted">{event.note}</p> : null}
                    <p className="mt-0.5 text-[10px] text-slate-400">{formatDateTime(event.at)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Customer</CardTitle>
                <CardDescription>Primary traveller / booker</CardDescription>
              </div>
              <Link href={`/admin/customers/${booking.customerId}`} className="text-[11px] font-semibold text-primary hover:underline">
                Profile
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Avatar name={booking.customerName} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{booking.customerName}</p>
                  <p className="truncate text-[11px] text-muted">{customer?.email ?? "No email on record"}</p>
                  <p className="text-[11px] text-muted">{booking.customerPhone}</p>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-line pt-3">
                {[
                  { icon: UserRound, label: "Nationality", value: customer?.nationality ?? "—" },
                  { icon: CalendarDays, label: "Customer since", value: customer ? formatDate(customer.createdAt) : "—" },
                  { icon: FileText, label: "Documents", value: "Passport on file" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-[11.5px]">
                    <span className="flex items-center gap-1.5 text-slate-500"><Icon className="h-3 w-3" /> {label}</span>
                    <span className="font-medium text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Issued for this booking</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Booking confirmation", ready: true },
                { label: "Payment receipt", ready: booking.paid > 0 },
                { label: "Travel voucher", ready: ["confirmed", "ready_to_travel", "departed", "completed"].includes(booking.status) },
                { label: "Invoice", ready: Boolean(invoice) },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center justify-between rounded-control border border-line px-2.5 py-2">
                  <span className="flex items-center gap-1.5 text-[11.5px] text-slate-600">
                    <FileText className="h-3.5 w-3.5 text-slate-400" /> {doc.label}
                  </span>
                  {doc.ready ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700"><CircleCheck className="h-3 w-3" /> Ready</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400"><Clock className="h-3 w-3" /> Pending</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {invoice ? (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Linked invoice</CardTitle>
                  <CardDescription>{invoice.number}</CardDescription>
                </div>
                <StatusBadge status={invoice.status} />
              </CardHeader>
              <CardContent className="space-y-2 text-[11.5px]">
                <div className="flex justify-between"><span className="text-muted">Issued</span><span className="font-medium">{formatDate(invoice.issueDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Due</span><span className="font-medium">{formatDate(invoice.dueDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold text-ink">{formatMoney(invoice.total)}</span></div>
                <Link href={`/admin/invoices/${invoice.id}`} className="mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50">
                  <ReceiptText className="h-3.5 w-3.5" /> Open invoice
                </Link>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Internal notes</CardTitle>
                <CardDescription>Visible to staff only</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[11.5px] leading-5 text-slate-600">
                {booking.notes || "No internal notes have been added to this booking yet."}
              </p>
              <div className="mt-3 flex items-center gap-2 rounded-control bg-slate-50 px-3 py-2 text-[10.5px] text-slate-500">
                <CreditCard className="h-3.5 w-3.5" />
                Balance reminders are sent automatically 7 days before departure.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
