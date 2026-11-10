import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, CalendarPlus, FileCheck2, FileSearch, Globe2, Plane, Timer, Wallet } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "Visa dashboard" };

const STAGES = ["draft", "pending", "processing", "approved", "ready_to_travel", "completed", "cancelled"];

export default async function VisaDashboardPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const bookings = db.bookings.filter((booking) => booking.serviceType === "visa");
  const active = bookings.filter((booking) => !["cancelled", "rejected", "completed"].includes(booking.status));
  const approved = bookings.filter((booking) => ["confirmed", "approved", "ready_to_travel", "completed"].includes(booking.status));
  const revenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const countries = Array.from(new Set(db.visas.map((visa) => visa.country)));
  const averageFee = db.visas.length ? db.visas.reduce((sum, visa) => sum + visa.price, 0) / db.visas.length : 0;
  const approvalRate = percent(approved.length, bookings.length);

  const countryRows = Array.from(
    db.visas.reduce<Map<string, { country: string; types: number; price: number; processing: string; applications: number }>>((map, visa) => {
      const current = map.get(visa.country) ?? { country: visa.country, types: 0, price: 0, processing: visa.processingTime, applications: 0 };
      current.types += 1;
      current.price += visa.price;
      map.set(visa.country, current);
      return map;
    }, new Map()),
  )
    .map(([, value]) => ({
      ...value,
      averagePrice: value.price / Math.max(1, value.types),
      applications: bookings.filter((booking) => booking.title.toLowerCase().includes(value.country.toLowerCase())).length,
    }))
    .sort((a, b) => b.applications - a.applications || b.averagePrice - a.averagePrice);

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Visa processing"
        description="Embassy-ready visa files, document checklists and application status across every destination."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Visa processing" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link href="/admin/visas" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <FileSearch className="h-3.5 w-3.5" /> Visa list
            </Link>
            <Link href="/admin/create-booking/standard?service=visa" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <CalendarPlus className="h-3.5 w-3.5" /> New application
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Visa products" value={String(db.visas.length)} hint={`${countries.length} destination countries`} icon={Globe2} tone="amber" />
        <StatCard label="Active applications" value={String(active.length)} hint={`${bookings.length} files in total`} icon={FileSearch} tone="blue" href="/admin/visa-bookings" />
        <StatCard label="Approved files" value={String(approved.length)} hint={`${approvalRate}% approval rate`} icon={FileCheck2} tone="green" />
        <StatCard label="Service revenue" value={formatMoney(revenue, "BDT", 0)} hint={`Average fee ${formatMoney(averageFee, "BDT", 0)}`} icon={Wallet} tone="violet" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Application pipeline</CardTitle>
              <CardDescription>Visa files by operational stage</CardDescription>
            </div>
            <Link href="/admin/visa-bookings" className="text-[11px] font-semibold text-primary hover:underline">
              Open register
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {STAGES.map((stage) => {
              const rows = bookings.filter((booking) => booking.status === stage);
              return (
                <div key={stage}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-600">{stage.replace(/_/g, " ")}</span>
                    <span className="font-medium text-ink">{rows.length} file{rows.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={stage === "cancelled" ? "h-full rounded-full bg-red-400" : stage === "approved" || stage === "completed" ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-500"}
                      style={{ width: `${percent(rows.length, Math.max(1, bookings.length))}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-muted">Avg. fee</p>
                <p className="text-[12px] font-semibold text-ink">{formatMoney(averageFee, "BDT", 0)}</p>
              </div>
              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-muted">In progress</p>
                <p className="text-[12px] font-semibold text-ink">{active.length}</p>
              </div>
              <div>
                <p className="text-[9.5px] uppercase tracking-wide text-muted">Balance due</p>
                <p className="text-[12px] font-semibold text-amber-700">{formatMoney(bookings.reduce((sum, booking) => sum + booking.due, 0), "BDT", 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Country demand</CardTitle>
                <CardDescription>Applications by destination</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-2">
              {countryRows.slice(0, 6).map((row) => (
                <div key={row.country}>
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="text-slate-600">{row.country}</span>
                    <span className="font-medium text-ink">{row.applications} file{row.applications === 1 ? "" : "s"}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${percent(row.applications, Math.max(1, bookings.length))}%` }} />
                  </div>
                </div>
              ))}
              {!countryRows.length ? <p className="py-6 text-center text-[11px] text-muted">No visa inventory yet.</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Embassy watch</CardTitle>
                <CardDescription>Upcoming appointments</CardDescription>
              </div>
              <Timer className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              {active
                .filter((booking) => booking.startDate >= today)
                .sort((a, b) => a.startDate.localeCompare(b.startDate))
                .slice(0, 4)
                .map((booking) => (
                  <Link key={booking.id} href={`/admin/all-bookings/${booking.id}`} className="flex items-center justify-between gap-2 rounded-control px-1.5 py-1.5 hover:bg-slate-50">
                    <div className="min-w-0">
                      <p className="truncate text-[11.5px] font-medium text-ink">{booking.title}</p>
                      <p className="truncate text-[10px] text-muted">{booking.customerName}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-medium text-slate-500">{formatDate(booking.startDate, { day: "2-digit", month: "short" })}</span>
                  </Link>
                ))}
              <Link href="/admin/visa/appointments" className="inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50">
                <CalendarClock className="h-3.5 w-3.5" /> Manage appointments
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Recent applications</CardTitle>
              <CardDescription>Latest visa files across all countries</CardDescription>
            </div>
            <Link href="/admin/visa-bookings" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
              All files <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          {recent.length ? (
            <div className="table-wrap">
              <table className="data-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Applicant</th>
                    <th>Visa</th>
                    <th>Submitted</th>
                    <th className="text-right">Fee</th>
                    <th className="text-right">Balance</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((booking) => (
                    <tr key={booking.id}>
                      <td><Link href={`/admin/all-bookings/${booking.id}`} className="font-mono text-[11px] font-medium text-primary hover:underline">{booking.ref}</Link></td>
                      <td className="text-[12px] font-medium text-ink">{booking.customerName}</td>
                      <td className="max-w-[200px] truncate text-[11.5px] text-slate-600">{booking.title}</td>
                      <td className="whitespace-nowrap text-[11.5px]">{formatDate(booking.createdAt)}</td>
                      <td className="whitespace-nowrap text-right text-[11.5px] font-medium">{formatMoney(booking.total, "BDT", 0)}</td>
                      <td className="whitespace-nowrap text-right text-[11.5px] text-amber-700">{booking.due > 0 ? formatMoney(booking.due, "BDT", 0) : "—"}</td>
                      <td className="text-right"><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<FileSearch className="h-5 w-5" />} title="No visa applications yet" description="Open a visa file to start tracking documents and embassy timing." />
          )}
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Visa catalogue</CardTitle>
              <CardDescription>Fees and processing times</CardDescription>
            </div>
            <Link href="/admin/visas" className="text-[11px] font-semibold text-primary hover:underline">All</Link>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {db.visas.slice(0, 6).map((visa) => (
              <div key={visa.id} className="flex items-center justify-between gap-2 border-b border-line/60 py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-ink">{visa.country}</p>
                  <p className="truncate text-[10px] text-muted">{visa.visaType} · {visa.processingTime}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-semibold text-ink">{formatMoney(visa.price, "BDT", 0)}</p>
                  <Badge tone="amber" className="px-1.5 py-0 text-[8.5px]">{visa.requiredDocuments.length} docs</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Appointments", hint: "Embassy slots and interviews", href: "/admin/visa/appointments", icon: CalendarClock },
          { label: "Embassies", hint: "Contacts, hours and requirements", href: "/admin/visa/embassies", icon: Globe2 },
          { label: "Visa reports", hint: "Approval rates and turnaround", href: "/admin/visa/reports", icon: Plane },
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
    </div>
  );
}
