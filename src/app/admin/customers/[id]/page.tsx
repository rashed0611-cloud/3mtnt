import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarPlus,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatDateTime, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer profile" };

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const { saved } = await searchParams;
  const repo = getRepository();
  const [customer, db] = await Promise.all([repo.getCustomer(id), repo.getDatabase()]);
  if (!customer) notFound();

  const bookings = db.bookings.filter((booking) => booking.customerId === customer.id || booking.customerName === customer.name);
  const invoices = db.invoices.filter((invoice) => invoice.customerName === customer.name);
  const lifetime = bookings.reduce((sum, booking) => sum + booking.paid, 0);
  const outstanding = bookings.reduce((sum, booking) => sum + booking.due, 0);
  const activities = db.activities.filter((activity) => activity.description.toLowerCase().includes(customer.name.toLowerCase())).slice(0, 5);

  return (
    <div className="space-y-4">
      <PageHeader
        title={customer.name}
        description={customer.company ? `${customer.company} · ${customer.code}` : customer.code}
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.name },
        ]}
        actions={
          <>
            <Link href="/admin/customers" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <Link href={`/admin/customers/${customer.id}/edit`} className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Link>
            <Link
              href={`/admin/create-booking/tour?customerId=${customer.id}`}
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> New booking
            </Link>
          </>
        }
      />

      {saved ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          Customer profile saved successfully.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total bookings" value={String(bookings.length)} icon={CalendarPlus} tone="blue" />
        <StatCard label="Lifetime paid" value={formatMoney(lifetime, "BDT", 0)} icon={ReceiptText} tone="green" />
        <StatCard label="Outstanding" value={formatMoney(outstanding, "BDT", 0)} icon={FileText} tone={outstanding > 0 ? "amber" : "slate"} />
        <StatCard label="Invoices" value={String(invoices.length)} icon={ReceiptText} tone="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Contact details and travel preferences</CardDescription>
            </div>
            <StatusBadge status={customer.status} />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Avatar name={customer.name} size="lg" />
              <div className="min-w-0">
                <p className="text-base font-semibold text-ink">{customer.name}</p>
                <p className="text-[12px] text-muted">{customer.company ?? "Individual traveller"}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {customer.tags.length ? customer.tags.map((tag) => <Badge key={tag} tone={tag === "VIP" ? "amber" : "violet"}>{tag}</Badge>) : <Badge>No tags</Badge>}
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              {[
                { icon: Mail, label: "Email", value: customer.email },
                { icon: Phone, label: "Phone", value: customer.phone },
                { icon: UserRound, label: "Assigned to", value: customer.assignedTo },
                { icon: MapPin, label: "Nationality", value: customer.nationality },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
                    <p className="truncate text-[12.5px] font-medium text-slate-700">{value || "—"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-control bg-slate-50 p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Internal notes</p>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">{customer.notes || "No notes yet. Add preferences, passport reminders or special handling instructions."}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Account timeline</CardTitle>
              <CardDescription>Created {formatDate(customer.createdAt)}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative space-y-3 border-l border-line pl-4">
              <div className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary" />
                <p className="text-[12px] font-medium text-ink">Customer profile created</p>
                <p className="text-[10.5px] text-muted">{formatDateTime(customer.createdAt)}</p>
              </div>
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300" />
                  <p className="text-[12px] font-medium text-ink">{booking.ref} · {titleCase(booking.serviceType)}</p>
                  <p className="text-[10.5px] text-muted">{formatDate(booking.startDate)} · {formatMoney(booking.total)}</p>
                </div>
              ))}
            </div>
            {activities.length ? (
              <div className="border-t border-line pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Recent activity</p>
                {activities.map((activity) => (
                  <p key={activity.id} className="border-b border-line/60 py-1.5 text-[11px] text-slate-600 last:border-0">
                    <span className="font-medium text-ink">{titleCase(activity.action)}</span> · {formatDate(activity.createdAt, { day: "2-digit", month: "short" })}
                  </p>
                ))}
              </div>
            ) : null}
            <Link href="/admin/conversations/inbox" className="inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50">
              <MessageSquare className="h-3.5 w-3.5" /> Message customer
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Bookings</CardTitle>
            <CardDescription>All services linked to this customer</CardDescription>
          </div>
          <Link href={`/admin/create-booking/tour?customerId=${customer.id}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            <Plus className="h-3 w-3" /> New booking
          </Link>
        </CardHeader>
        {bookings.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Service</th>
                  <th>Travel dates</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Due</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <Link href={`/admin/all-bookings/${booking.id}`} className="font-mono text-[11.5px] font-medium text-primary hover:underline">
                        {booking.ref}
                      </Link>
                    </td>
                    <td>
                      <p className="max-w-[220px] truncate text-[12px] font-medium text-ink">{booking.title}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted">{booking.serviceType}</p>
                    </td>
                    <td className="whitespace-nowrap text-[11.5px]">{formatDate(booking.startDate)} → {formatDate(booking.endDate)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td><StatusBadge status={booking.paymentStatus} /></td>
                    <td className="whitespace-nowrap text-right text-[12px] font-medium">{formatMoney(booking.total)}</td>
                    <td className="whitespace-nowrap text-right text-[12px]">{booking.due > 0 ? formatMoney(booking.due) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarPlus className="h-5 w-5" />}
            title="No bookings yet"
            description="Create the first booking for this customer to start tracking travel dates, payments and documents."
            action={
              <Link href={`/admin/create-booking/tour?customerId=${customer.id}`} className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                Create booking <ArrowUpRight className="h-3 w-3" />
              </Link>
            }
          />
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Billing documents for this customer</CardDescription>
            </div>
            <Link href="/admin/invoices" className="text-[11px] font-semibold text-primary hover:underline">All invoices</Link>
          </CardHeader>
          {invoices.length ? (
            <div className="divide-y divide-line">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div>
                    <p className="font-mono text-[11px] font-medium text-primary">{invoice.number}</p>
                    <p className="text-[10.5px] text-muted">{invoice.bookingRef} · due {formatDate(invoice.dueDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium">{formatMoney(invoice.total)}</p>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No invoices" description="Invoices generated for this customer will appear here." className="py-8" />
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Documents & support</CardTitle>
              <CardDescription>Passports, tickets and open requests</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Passport copy", hint: "Not uploaded", href: "/admin/crm/documents" },
              { label: "Travel insurance", hint: "View documents", href: "/admin/crm/documents" },
              { label: "Support requests", hint: "0 open tickets", href: "/admin/support-tickets" },
              { label: "Conversations", hint: "Email & WhatsApp", href: "/admin/conversations/inbox" },
            ].map((item) => (
              <Link key={item.label} href={item.href} className="rounded-control border border-line p-3 hover:border-primary/30 hover:bg-primary/[0.02]">
                <p className="text-[12px] font-medium text-ink">{item.label}</p>
                <p className="mt-0.5 text-[10.5px] text-muted">{item.hint}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
