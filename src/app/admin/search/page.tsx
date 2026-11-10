import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Contact, FileSearch, Globe2, ReceiptText, Search, Users } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/utils";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const db = await getRepository().getDatabase();
  const needle = term.toLowerCase();

  const customers = needle ? db.customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone} ${customer.company ?? ""} ${customer.code}`.toLowerCase().includes(needle)).slice(0, 8) : [];
  const bookings = needle ? db.bookings.filter((booking) => `${booking.ref} ${booking.customerName} ${booking.title}`.toLowerCase().includes(needle)).slice(0, 8) : [];
  const tours = needle ? db.tours.filter((tour) => `${tour.title} ${tour.destination} ${tour.code}`.toLowerCase().includes(needle)).slice(0, 6) : [];
  const invoices = needle ? db.invoices.filter((invoice) => `${invoice.number} ${invoice.bookingRef} ${invoice.customerName}`.toLowerCase().includes(needle)).slice(0, 6) : [];
  const leads = needle ? db.leads.filter((lead) => `${lead.name} ${lead.company ?? ""} ${lead.requirement} ${lead.phone}`.toLowerCase().includes(needle)).slice(0, 6) : [];

  const total = customers.length + bookings.length + tours.length + invoices.length + leads.length;

  return (
    <div className="space-y-4">
      <PageHeader
        title={term ? `Search results for “${term}”` : "Search the workspace"}
        description={term ? `${total} records found across customers, bookings, tours, invoices and leads.` : "Find any record by name, reference, phone number or destination."}
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Search" }]}
      />

      <Card className="p-4">
        <form action="/admin/search" className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={term}
              autoFocus
              placeholder="Try a booking reference, customer name or destination…"
              className="input-base pl-9"
            />
          </div>
          <button type="submit" className="h-10 rounded-control bg-primary px-4 text-[12px] font-semibold text-white hover:bg-primary-strong">
            Search
          </button>
        </form>
      </Card>

      {!term ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Customers", href: "/admin/customers", icon: Users, hint: "Name, email or phone" },
            { label: "Bookings", href: "/admin/all-bookings", icon: CalendarDays, hint: "Reference or traveller" },
            { label: "Tours", href: "/admin/tours", icon: Globe2, hint: "Destination or package" },
            { label: "Invoices", href: "/admin/invoices", icon: ReceiptText, hint: "Invoice or booking ref" },
          ].map(({ label, href, icon: Icon, hint }) => (
            <Link key={label} href={href} className="card-surface p-4 transition hover:border-primary/30">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-[12.5px] font-semibold text-ink">{label}</p>
              <p className="text-[10.5px] text-muted">{hint}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink"><CalendarDays className="h-4 w-4 text-primary" /> Bookings</p>
              <Badge tone="blue">{bookings.length}</Badge>
            </div>
            {bookings.length ? bookings.map((booking) => (
              <Link key={booking.id} href={`/admin/all-bookings/${booking.id}`} className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-medium text-primary">{booking.ref}</p>
                  <p className="truncate text-[11.5px] text-slate-600">{booking.customerName} · {booking.title}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[11px] font-medium">{formatMoney(booking.total, "BDT", 0)}</span>
                  <StatusBadge status={booking.status} />
                </div>
              </Link>
            )) : <p className="px-4 py-8 text-center text-[11px] text-muted">No bookings found.</p>}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink"><Users className="h-4 w-4 text-primary" /> Customers</p>
              <Badge tone="violet">{customers.length}</Badge>
            </div>
            {customers.length ? customers.map((customer) => (
              <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-ink">{customer.name}</p>
                  <p className="truncate text-[10.5px] text-muted">{customer.phone} · {customer.email}</p>
                </div>
                <span className="text-[10px] text-slate-400">{customer.code}</span>
              </Link>
            )) : <p className="px-4 py-8 text-center text-[11px] text-muted">No customers found.</p>}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink"><Globe2 className="h-4 w-4 text-primary" /> Tours</p>
              <Badge tone="blue">{tours.length}</Badge>
            </div>
            {tours.length ? tours.map((tour) => (
              <Link key={tour.id} href={`/admin/tours/${tour.id}`} className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-ink">{tour.title}</p>
                  <p className="text-[10.5px] text-muted">{tour.destination} · {tour.durationDays} days</p>
                </div>
                <span className="shrink-0 text-[11px] font-medium">{formatMoney(tour.adultPrice, "BDT", 0)}</span>
              </Link>
            )) : <p className="px-4 py-8 text-center text-[11px] text-muted">No tours found.</p>}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink"><Contact className="h-4 w-4 text-primary" /> Leads & invoices</p>
              <Badge tone="amber">{leads.length + invoices.length}</Badge>
            </div>
            {leads.map((lead) => (
              <Link key={lead.id} href={`/admin/crm/leads?q=${encodeURIComponent(lead.name)}`} className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-ink">{lead.name}</p>
                  <p className="truncate text-[10.5px] text-muted">Lead · {lead.requirement}</p>
                </div>
                <Badge tone="amber">{lead.status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
            {invoices.map((invoice) => (
              <Link key={invoice.id} href={`/admin/invoices/${invoice.id}`} className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-2.5 last:border-0 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] font-medium text-primary">{invoice.number}</p>
                  <p className="truncate text-[10.5px] text-muted">{invoice.customerName} · {formatDate(invoice.issueDate)}</p>
                </div>
                <StatusBadge status={invoice.status} />
              </Link>
            ))}
            {!leads.length && !invoices.length ? <p className="px-4 py-8 text-center text-[11px] text-muted">No leads or invoices found.</p> : null}
          </Card>
        </div>
      )}

      {term && total === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <FileSearch className="h-8 w-8 text-slate-300" />
          <p className="text-[13px] font-semibold text-ink">No records found</p>
          <p className="max-w-sm text-[11.5px] text-muted">Check the spelling, try a partial reference such as “TB-000”, or search by phone number.</p>
          <Link href="/admin/all-bookings" className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline">
            Browse all bookings <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      ) : null}
    </div>
  );
}
