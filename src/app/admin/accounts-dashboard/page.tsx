import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Banknote, CreditCard, Landmark, ReceiptText, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { RevenueAreaChart } from "@/components/charts/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { computeDashboardStats } from "@/lib/stats";
import { formatDate, formatMoney, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "Finance dashboard" };

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AccountsDashboardPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const stats = computeDashboardStats(db);
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const costRate = { tour: 0.62, hotel: 0.58, visa: 0.28, hajj: 0.72 } as const;

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const key = monthKey(date);
    const rows = db.bookings.filter((booking) => monthKey(new Date(booking.createdAt)) === key && booking.paid > 0);
    const income = rows.reduce((sum, booking) => sum + booking.paid, 0);
    const expenses = rows.reduce((sum, booking) => sum + Math.round(booking.paid * costRate[booking.serviceType]), 0);
    return { month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date), income, expenses };
  });

  const aging = [
    { label: "Current", value: db.invoices.filter((invoice) => invoice.due > 0 && invoice.dueDate >= today).reduce((sum, invoice) => sum + invoice.due, 0), tone: "bg-emerald-500" },
    { label: "1–30 days", value: db.invoices.filter((invoice) => invoice.due > 0 && invoice.dueDate < today).reduce((sum, invoice) => sum + invoice.due, 0), tone: "bg-amber-500" },
    { label: "31–60 days", value: 0, tone: "bg-orange-500" },
    { label: "60+ days", value: 0, tone: "bg-red-500" },
  ];
  const agingTotal = Math.max(1, aging.reduce((sum, bucket) => sum + bucket.value, 0));
  const paidBookings = [...db.bookings].filter((booking) => booking.paid > 0).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Finance dashboard"
        description="Cash collected, supplier cost, receivables and invoice aging across every service line."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Accounts & finance" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link href="/admin/profit-loss-report" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <TrendingUp className="h-3.5 w-3.5" /> P&amp;L report
            </Link>
            <Link href="/admin/invoices" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <ReceiptText className="h-3.5 w-3.5" /> Invoices
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total income" value={formatMoney(stats.finance.income, "BDT", 0)} hint={`${stats.finance.transactions} payments`} icon={Banknote} tone="green" trend="+12.4% vs prior period" />
        <StatCard label="Supplier & direct cost" value={formatMoney(stats.finance.expenses, "BDT", 0)} hint="Estimated from booked services" icon={TrendingDown} tone="amber" />
        <StatCard label="Net profit" value={formatMoney(stats.finance.netProfit, "BDT", 0)} hint={`${percent(stats.finance.netProfit, Math.max(1, stats.finance.income))}% margin`} icon={TrendingUp} tone="blue" />
        <StatCard label="Receivables" value={formatMoney(stats.receivables, "BDT", 0)} hint={`${stats.overdueInvoices} invoices overdue`} icon={Wallet} tone="red" href="/admin/invoices?status=overdue" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Cash flow</CardTitle>
              <CardDescription>Collected income and estimated supplier cost, last six months</CardDescription>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Income</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Cost</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <RevenueAreaChart data={months} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoice aging</CardTitle>
              <CardDescription>Outstanding balance by bucket</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {aging.map((bucket) => (
              <div key={bucket.label}>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">{bucket.label}</span>
                  <span className="font-medium text-ink">{formatMoney(bucket.value, "BDT", 0)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${bucket.tone}`} style={{ width: `${percent(bucket.value, agingTotal)}%` }} />
                </div>
              </div>
            ))}
            <div className="border-t border-line pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Working capital</p>
              <p className="mt-1 text-lg font-semibold text-ink">{formatMoney(stats.receivables, "BDT", 0)}</p>
              <p className="text-[10.5px] text-muted">Expected within 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent transactions</CardTitle>
              <CardDescription>Payments recorded against bookings</CardDescription>
            </div>
            <Link href="/admin/transactions" className="text-[11px] font-semibold text-primary hover:underline">All transactions</Link>
          </CardHeader>
          <div className="table-wrap">
            <table className="data-table min-w-[620px]">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {paidBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><Link href={`/admin/all-bookings/${booking.id}`} className="font-mono text-[11px] font-medium text-primary hover:underline">{booking.ref}</Link></td>
                    <td className="max-w-[150px] truncate text-[11.5px] font-medium text-ink">{booking.customerName}</td>
                    <td className="text-[11.5px] capitalize text-slate-600">{booking.serviceType}</td>
                    <td><StatusBadge status={booking.paymentStatus} /></td>
                    <td className="whitespace-nowrap text-right text-[11.5px] font-medium text-emerald-700">{formatMoney(booking.paid)}</td>
                    <td className="whitespace-nowrap text-right text-[11.5px] text-amber-700">{booking.due > 0 ? formatMoney(booking.due) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Supplier position</CardTitle>
                <CardDescription>{db.suppliers.length} partners</CardDescription>
              </div>
              <Link href="/admin/suppliers" className="text-[11px] font-semibold text-primary hover:underline">Manage</Link>
            </CardHeader>
            <CardContent className="space-y-2 pt-1">
              {db.suppliers.slice(0, 5).map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between gap-2 border-b border-line/60 py-1.5 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-[11.5px] font-medium text-ink">{supplier.name}</p>
                    <p className="text-[10px] text-muted">{supplier.service}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-slate-500">{supplier.balance > 0 ? formatMoney(supplier.balance, "BDT", 0) : "Settled"}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Invoices issued this period</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Invoices", value: String(db.invoices.length) },
                { label: "Invoiced value", value: formatMoney(stats.documents.invoiceValue, "BDT", 0) },
                { label: "Paid", value: String(db.invoices.filter((invoice) => invoice.status === "paid").length) },
                { label: "Partial", value: String(db.invoices.filter((invoice) => invoice.status === "partial").length) },
              ].map((item) => (
                <div key={item.label} className="rounded-control bg-slate-50 px-3 py-2">
                  <p className="text-[9.5px] uppercase tracking-wide text-muted">{item.label}</p>
                  <p className="mt-0.5 truncate text-[12.5px] font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Expenses ledger", hint: "Record supplier invoices and overheads", href: "/admin/expenses", icon: CreditCard },
          { label: "Refunds", hint: "Track cancellations and refund status", href: "/admin/refunds", icon: ReceiptText },
          { label: "Supplier payments", hint: "Settle partner balances", href: "/admin/supplier-payments", icon: Landmark },
        ].map(({ label, hint, href, icon: Icon }) => (
          <Link key={label} href={href} className="card-surface group flex items-center justify-between gap-3 p-4 transition hover:border-primary/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-slate-100 text-slate-500"><Icon className="h-4 w-4" /></span>
              <div>
                <p className="text-[12px] font-semibold text-ink group-hover:text-primary">{label}</p>
                <p className="text-[10.5px] text-muted">{hint}</p>
              </div>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <p className="text-[10px] text-slate-400">
        Today is {formatDate(today)}. Cost figures are estimated from booked service margins; connect supplier invoices to reconcile actuals.
      </p>
    </div>
  );
}
