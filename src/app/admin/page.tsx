import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarCheck2,
  CalendarPlus,
  CircleAlert,
  ClipboardList,
  Contact,
  Download,
  FileText,
  Headphones,
  Landmark,
  Plane,
  ReceiptText,
  Store,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { BookingMomentumChart, BookingStatusChart } from "@/components/charts/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { computeDashboardStats, bookingSummary } from "@/lib/stats";
import { quickActions } from "@/lib/nav";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const serviceTone: Record<string, "blue" | "violet" | "amber" | "green"> = {
  tour: "blue",
  hotel: "violet",
  visa: "amber",
  hajj: "green",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const db = await getRepository().getDatabase();
  const stats = computeDashboardStats(db);
  const summary = bookingSummary(db);
  const pipelineValue = db.leads
    .filter((lead) => !["converted", "lost"].includes(lead.status))
    .reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const firstName = user.name.split(" ")[0];
  const openTasks = db.tasks
    .filter((task) => !["completed", "cancelled"].includes(task.status))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const operations = [
    {
      title: "Task delivery",
      icon: ClipboardList,
      href: "/admin/task-management/tasks",
      value: stats.operations.tasks.open,
      label: "open tasks",
      detail: `${stats.operations.tasks.overdue} overdue · ${stats.operations.tasks.inProgress} in progress`,
      tone: "text-blue-600 bg-blue-50",
    },
    {
      title: "CRM pipeline",
      icon: Contact,
      href: "/admin/crm/leads",
      value: stats.operations.leads.active,
      label: "active leads",
      detail: `${formatMoney(pipelineValue, "BDT", 0)} estimated value`,
      tone: "text-violet-600 bg-violet-50",
    },
    {
      title: "Agent network",
      icon: Store,
      href: "/admin/agent-management",
      value: stats.operations.agents.active,
      label: "active agents",
      detail: `${stats.operations.agents.bookings} bookings through agents`,
      tone: "text-amber-600 bg-amber-50",
    },
    {
      title: "Team attendance",
      icon: Users,
      href: "/admin/hrm/attendance",
      value: 4,
      label: "on duty today",
      detail: "No unplanned absences recorded",
      tone: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Support desk",
      icon: Headphones,
      href: "/admin/support-tickets",
      value: stats.operations.support.open,
      label: "open tickets",
      detail: "Average first reply under 2 hours",
      tone: "text-slate-600 bg-slate-100",
    },
    {
      title: "Supplier operations",
      icon: Landmark,
      href: "/admin/suppliers",
      value: stats.operations.suppliers.active,
      label: "active suppliers",
      detail: "No pending supplier invoices",
      tone: "text-cyan-600 bg-cyan-50",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Assalamu Alaikum, ${firstName}`}
        description="Here is the pulse of your agency today — bookings, cash flow and work that needs a decision."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Dashboard" }]}
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 sm:inline-flex">
              <CalendarCheck2 className="h-3.5 w-3.5 text-slate-400" /> This month
            </span>
            <Link
              href="/admin/profit-loss-report"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Reports
            </Link>
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
        <StatCard
          label="Income this month"
          value={formatMoney(stats.incomeThisMonth)}
          hint={`${stats.finance.transactions} payments recorded`}
          icon={Banknote}
          tone="green"
          trend="+12.4% vs last month"
        />
        <StatCard
          label="Bookings this month"
          value={String(stats.bookingsThisMonth)}
          hint={`${stats.openBookings} open across all services`}
          icon={CalendarCheck2}
          tone="blue"
          href="/admin/all-bookings"
        />
        <StatCard
          label="Total customers"
          value={String(stats.totalCustomers)}
          hint={`+${stats.newCustomersThisMonth} new this month`}
          icon={Users}
          tone="violet"
          href="/admin/customers"
        />
        <StatCard
          label="Receivables"
          value={formatMoney(stats.receivables)}
          hint={`${stats.overdueInvoices} invoices overdue`}
          icon={Wallet}
          tone="amber"
          href="/admin/invoices?status=overdue"
        />
        <StatCard
          label="Active leads"
          value={String(stats.operations.leads.active)}
          hint={`${formatMoney(pipelineValue, "BDT", 0)} pipeline value`}
          icon={Contact}
          tone="blue"
          href="/admin/crm/leads"
        />
        <StatCard
          label="Active suppliers"
          value={String(stats.operations.suppliers.active)}
          hint={`${db.suppliers.length} suppliers in directory`}
          icon={Landmark}
          tone="violet"
          href="/admin/suppliers"
        />
        <StatCard
          label="Outstanding payments"
          value={formatMoney(summary.dueValue)}
          hint={`${summary.paymentDue} bookings with a balance`}
          icon={CircleAlert}
          tone="red"
          href="/admin/all-bookings?payment=partial"
        />
        <StatCard
          label="Open support tickets"
          value={String(stats.operations.support.open)}
          hint="First response under 2 hours"
          icon={Headphones}
          tone="slate"
          href="/admin/support-tickets"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Booking momentum</CardTitle>
              <CardDescription>Volume and gross value over the last six months</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-primary" /> Gross value
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 rounded bg-slate-900" /> Bookings
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <BookingMomentumChart data={stats.bookingMomentum} />
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 sm:grid-cols-4">
              <Link href="/admin/all-bookings?status=processing" className="rounded-control px-2 py-1.5 hover:bg-slate-50">
                <p className="text-[10px] uppercase tracking-wide text-muted">Needs attention</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{summary.needsAttention}</p>
              </Link>
              <Link href="/admin/booking-calendar" className="rounded-control px-2 py-1.5 hover:bg-slate-50">
                <p className="text-[10px] uppercase tracking-wide text-muted">Upcoming services</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{summary.upcoming}</p>
              </Link>
              <Link href="/admin/all-bookings?status=confirmed" className="rounded-control px-2 py-1.5 hover:bg-slate-50">
                <p className="text-[10px] uppercase tracking-wide text-muted">Confirmed</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{summary.confirmed}</p>
              </Link>
              <Link href="/admin/all-bookings?status=cancelled" className="rounded-control px-2 py-1.5 hover:bg-slate-50">
                <p className="text-[10px] uppercase tracking-wide text-muted">Cancelled</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{summary.cancelled}</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Booking status</CardTitle>
              <CardDescription>All services, by operational stage</CardDescription>
            </div>
            <Link href="/admin/all-bookings" className="text-[11px] font-semibold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="pt-3">
            <BookingStatusChart data={stats.bookingsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>Latest activity from tour, hotel, visa and Hajj desks</CardDescription>
            </div>
            <Link href="/admin/all-bookings" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
              All bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {stats.recentBookings.length ? (
            <div className="table-wrap">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Booking</th>
                    <th>Customer</th>
                    <th>Service date</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <Link href={`/admin/all-bookings/${booking.id}`} className="group block">
                          <span className="block font-mono text-[11.5px] font-medium text-primary group-hover:underline">{booking.ref}</span>
                          <span className="mt-0.5 flex items-center gap-1.5">
                            <Badge tone={serviceTone[booking.serviceType]} className="px-1.5 py-0 text-[9.5px] uppercase">
                              {booking.serviceType}
                            </Badge>
                            <span className="max-w-[190px] truncate text-[11px] text-muted">{booking.title}</span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <p className="text-[12.5px] font-medium text-ink">{booking.customerName}</p>
                        <p className="text-[10.5px] text-muted">{booking.customerPhone}</p>
                      </td>
                      <td className="whitespace-nowrap text-[12px]">{formatDate(booking.startDate)}</td>
                      <td>
                        <StatusBadge status={booking.paymentStatus} />
                      </td>
                      <td>
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(booking.total)}</td>
                      <td className="whitespace-nowrap text-right text-[12px] font-medium text-slate-600">
                        {booking.due > 0 ? formatMoney(booking.due) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No bookings yet" description="Create your first booking to see it appear here." />
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Jump straight into the work</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-3">
              {quickActions.slice(0, 6).map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex items-start gap-2 rounded-control border border-line px-2.5 py-2.5 transition hover:border-primary/30 hover:bg-primary/[0.03]"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11.5px] font-medium leading-4 text-slate-600 group-hover:text-ink">{label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div>
                <CardTitle>My tasks</CardTitle>
                <CardDescription>{stats.operations.tasks.overdue} overdue · {openTasks.length} shown</CardDescription>
              </div>
              <Link href="/admin/task-management/tasks" className="text-[11px] font-semibold text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              {openTasks.length ? (
                openTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5 rounded-control px-1.5 py-2 hover:bg-slate-50">
                    <span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border border-slate-300" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-[12px] font-medium text-ink">{task.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-muted">
                        <span>{task.relatedTo}</span>
                        <span className="text-slate-300">·</span>
                        <span className={task.dueDate < new Date().toISOString().slice(0, 10) ? "font-medium text-danger" : ""}>
                          Due {formatDate(task.dueDate, { day: "2-digit", month: "short" })}
                        </span>
                      </p>
                    </div>
                    <Badge tone={task.priority === "urgent" ? "red" : task.priority === "high" ? "amber" : "neutral"} className="mt-0.5 px-1.5 py-0 text-[9.5px] uppercase">
                      {task.priority}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-xs text-muted">Nothing due — the queue is clear.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Sales &amp; finance</CardTitle>
            <CardDescription>Documents and cash position across the workspace</CardDescription>
          </div>
          <Link href="/admin/accounts-dashboard" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            Finance dashboard <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x lg:grid-cols-7">
          {[
            { label: "Proposals", value: String(stats.documents.proposals), hint: "Drafts in pipeline" },
            { label: "Quotations", value: String(stats.documents.quotations), hint: "Awaiting response" },
            { label: "Invoices", value: String(stats.documents.invoices), hint: formatMoney(stats.documents.invoiceValue, "BDT", 0) },
            { label: "Income", value: formatMoney(stats.finance.income, "BDT", 0), hint: "All recorded payments" },
            { label: "Expenses", value: formatMoney(stats.finance.expenses, "BDT", 0), hint: "Supplier & overheads" },
            { label: "Net profit", value: formatMoney(stats.finance.netProfit, "BDT", 0), hint: "Before tax" },
            { label: "Refunds", value: formatMoney(stats.finance.refunds, "BDT", 0), hint: "No open refund requests" },
          ].map((metric) => (
            <div key={metric.label} className="px-1 py-2 sm:px-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted">{metric.label}</p>
              <p className="mt-1 truncate text-[15px] font-semibold tracking-tight text-ink">{metric.value}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">{metric.hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-ink">Live operations</h2>
          <p className="text-[10.5px] text-muted">Updated just now</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {operations.map(({ title, icon: Icon, href, value, label, detail, tone }) => (
            <Link key={title} href={href} className="card-surface group p-3.5 transition hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className={`flex h-8 w-8 items-center justify-center rounded-control ${tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:text-primary" />
              </div>
              <p className="mt-2.5 text-lg font-semibold tracking-tight text-ink">{value}</p>
              <p className="text-[11px] font-medium text-slate-600">{label}</p>
              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-400">{title} · {detail}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink">Conversion rate is up this month</p>
              <p className="text-[11px] text-muted">
                {percent(stats.operations.leads.converted, stats.operations.leads.total)}% of leads converted · {stats.bookingsByStatus.completed ?? 0} trips completed
              </p>
            </div>
          </div>
          <Link href="/admin/crm/reports" className="hidden shrink-0 text-[11px] font-semibold text-primary hover:underline sm:block">
            See report
          </Link>
        </Card>
        <Card className="flex items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-amber-50 text-amber-600">
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12.5px] font-semibold text-ink">{summary.upcoming} travellers departing soon</p>
              <p className="text-[11px] text-muted">Review documents, supplier confirmations and balances.</p>
            </div>
          </div>
          <Link href="/admin/booking-calendar" className="hidden shrink-0 text-[11px] font-semibold text-primary hover:underline sm:block">
            Open calendar
          </Link>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: UserPlus, label: "Add a customer", href: "/admin/customers?new=1" },
          { icon: ReceiptText, label: "Review quotations", href: "/admin/quotations" },
          { icon: FileText, label: "Generate an invoice", href: "/admin/invoices" },
        ].map(({ icon: Icon, label, href }) => (
          <Link key={label} href={href} className="flex items-center justify-between rounded-control border border-dashed border-slate-300 bg-white/60 px-3.5 py-2.5 text-[12px] font-medium text-slate-600 hover:border-primary/40 hover:text-primary">
            <span className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-slate-400" /> {label}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
