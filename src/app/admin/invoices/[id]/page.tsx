import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, ReceiptText, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PrintButton } from "@/components/ui/print-button";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoice detail" };

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const invoice = db.invoices.find((item) => item.id === id);
  if (!invoice) notFound();

  const booking = db.bookings.find((item) => item.ref === invoice.bookingRef);
  const customer = db.customers.find((item) => item.name === invoice.customerName);
  const settings = db.settings;
  const quantity = booking?.travelers ?? 1;
  const unitPrice = booking ? booking.subtotal / Math.max(1, quantity) : invoice.total;
  const paidPercent = percent(invoice.paid, invoice.total);

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <PageHeader
          title={invoice.number}
          description={`${invoice.type} · issued ${formatDate(invoice.issueDate)}`}
          breadcrumb={[
            { label: "Workspace", href: "/admin" },
            { label: "Invoices", href: "/admin/invoices" },
            { label: invoice.number },
          ]}
          actions={
            <>
              <Link href="/admin/invoices" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Link>
              {booking ? (
                <Link href={`/admin/all-bookings/${booking.id}`} className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
                  Open booking
                </Link>
              ) : null}
              <PrintButton label="Print / PDF" variant="primary" />
            </>
          }
        />
      </div>

      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-line bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-5 text-white sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-control bg-white/10 text-cyan-200 ring-1 ring-white/15">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold tracking-tight">{settings.siteName}</p>
                <p className="text-[10.5px] text-white/55">{settings.legalName}</p>
                <p className="text-[10.5px] text-white/45">EIN / Trade licence on request</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Invoice</p>
              <p className="font-mono text-lg font-semibold">{invoice.number}</p>
              <div className="mt-1 flex sm:justify-end"><StatusBadge status={invoice.due > 0 && invoice.dueDate < new Date().toISOString().slice(0, 10) && invoice.status !== "paid" ? "overdue" : invoice.status} /></div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Billed to</p>
              <p className="mt-1.5 text-[13px] font-semibold text-ink">{invoice.customerName}</p>
              {customer?.company ? <p className="flex items-center gap-1 text-[11.5px] text-slate-500"><Building2 className="h-3 w-3" /> {customer.company}</p> : null}
              {customer?.email ? <p className="mt-1 flex items-center gap-1 text-[11.5px] text-slate-500"><Mail className="h-3 w-3" /> {customer.email}</p> : null}
              {customer?.phone ? <p className="flex items-center gap-1 text-[11.5px] text-slate-500"><Phone className="h-3 w-3" /> {customer.phone}</p> : null}
              {customer ? <p className="mt-1 flex items-start gap-1 text-[11px] leading-4 text-slate-500"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> {customer.nationality} · Customer {customer.code}</p> : null}
            </div>
            <div className="space-y-1.5 sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Issued by</p>
              <p className="text-[12px] font-medium text-ink">{settings.email || "hello@3mtours.com"}</p>
              <p className="text-[11px] text-slate-500">{settings.phone}</p>
              <p className="text-[11px] leading-5 text-slate-500">{settings.address}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:justify-end">
                <span className="text-slate-400">Issued <span className="font-medium text-slate-700">{formatDate(invoice.issueDate)}</span></span>
                <span className="text-slate-400">Due <span className="font-medium text-slate-700">{formatDate(invoice.dueDate)}</span></span>
              </div>
            </div>
          </div>

          <div className="border-t border-line px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Booking reference</p>
              {booking ? (
                <Link href={`/admin/all-bookings/${booking.id}`} className="print:hidden text-[11px] font-medium text-primary hover:underline">
                  View booking
                </Link>
              ) : null}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-600">
              <span className="font-mono font-medium text-ink">{invoice.bookingRef}</span>
              {booking ? (
                <>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3 text-slate-400" /> {formatDate(booking.startDate)} → {formatDate(booking.endDate)}</span>
                  <span>{booking.travelers} traveller{booking.travelers === 1 ? "" : "s"}</span>
                  <span>{booking.title}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[620px] text-left text-[12px]">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-2.5 font-semibold">Description</th>
                  <th className="px-3 py-2.5 font-semibold">Service</th>
                  <th className="px-3 py-2.5 text-center font-semibold">Qty</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Unit price</th>
                  <th className="px-6 py-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="px-6 py-4">
                    <p className="font-medium text-ink">{booking?.title ?? invoice.type}</p>
                    <p className="text-[10.5px] text-muted">{booking ? `${booking.ref} · ${titleCase(booking.serviceType)} booking` : invoice.type}</p>
                  </td>
                  <td className="px-3 py-4 text-slate-600">{invoice.type}</td>
                  <td className="px-3 py-4 text-center text-slate-600">{quantity}</td>
                  <td className="px-3 py-4 text-right text-slate-600">{formatMoney(unitPrice)}</td>
                  <td className="px-6 py-4 text-right font-medium text-ink">{formatMoney(booking?.subtotal ?? invoice.total)}</td>
                </tr>
                {booking && booking.discount > 0 ? (
                  <tr className="border-b border-line text-[11.5px]">
                    <td className="px-6 py-2.5 text-slate-500" colSpan={4}>Discount</td>
                    <td className="px-6 py-2.5 text-right text-emerald-700">− {formatMoney(booking.discount)}</td>
                  </tr>
                ) : null}
                {booking && booking.tax > 0 ? (
                  <tr className="border-b border-line text-[11.5px]">
                    <td className="px-6 py-2.5 text-slate-500" colSpan={4}>Tax / VAT (5%)</td>
                    <td className="px-6 py-2.5 text-right text-slate-600">{formatMoney(booking.tax)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-line px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs space-y-2 text-[10.5px] leading-4 text-slate-500">
              <p className="font-semibold text-slate-600">Payment instructions</p>
              <p>Bank transfer to 3M Tours & Travels Ltd., A/C 1042 5567 8901, City Bank, Banani branch. Reference the invoice number.</p>
              <p>{settings.tagline}</p>
              <div className="print:hidden">
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPercent}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-slate-500">{formatMoney(invoice.paid)} paid · {formatMoney(invoice.due)} outstanding</p>
              </div>
            </div>
            <div className="w-full max-w-[240px] space-y-1.5 text-[12px]">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatMoney(booking?.subtotal ?? invoice.total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium">{booking ? formatMoney(booking.discount) : formatMoney(0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-medium">{booking ? formatMoney(booking.tax) : formatMoney(0)}</span></div>
              <div className="flex justify-between border-t border-line pt-1.5 text-[13px]"><span className="font-semibold text-ink">Total</span><span className="font-semibold text-ink">{formatMoney(invoice.total)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="font-medium text-emerald-700">{formatMoney(invoice.paid)}</span></div>
              <div className="flex justify-between rounded-control bg-amber-50 px-2 py-1.5"><span className="font-medium text-amber-800">Balance due</span><span className="font-semibold text-amber-800">{formatMoney(invoice.due)}</span></div>
            </div>
          </div>

          <div className="border-t border-line bg-slate-50/70 px-6 py-3 text-center text-[10px] text-slate-400">
            Thank you for travelling with {settings.siteName}. This invoice was generated electronically and is valid without a signature.
          </div>
        </Card>

        {booking ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500 print:hidden">
            <p className="flex items-center gap-1.5"><ReceiptText className="h-3.5 w-3.5" /> Payments are recorded against the booking and reflected here.</p>
            <Link href={`/admin/all-bookings/${booking.id}`} className="font-semibold text-primary hover:underline">Record a payment</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
