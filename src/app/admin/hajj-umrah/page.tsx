import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, CircleCheck, FileCheck2, Landmark, Plane, Users, Wallet } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Hajj & Umrah dashboard" };

export default async function HajjDashboardPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const bookings = db.bookings.filter((booking) => booking.serviceType === "hajj");
  const packages = db.hajjPackages;
  const pilgrims = packages.reduce((sum, pkg) => sum + pkg.booked, 0);
  const capacity = packages.reduce((sum, pkg) => sum + pkg.capacity, 0);
  const revenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const collected = bookings.reduce((sum, booking) => sum + booking.paid, 0);
  const upcoming = [...packages].filter((pkg) => pkg.departureDate >= today).sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  const utilisation = percent(pilgrims, capacity);
  const activeBookings = bookings.filter((booking) => !["cancelled", "rejected", "completed"].includes(booking.status));

  const readiness = [
    { label: "Passport verified", done: 92, tone: "bg-emerald-500" },
    { label: "Visa issued", done: 78, tone: "bg-blue-500" },
    { label: "Vaccination record", done: 86, tone: "bg-violet-500" },
    { label: "Flight ticket issued", done: 64, tone: "bg-amber-500" },
    { label: "Hotel & transport confirmed", done: 81, tone: "bg-cyan-500" },
  ];

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hajj & Umrah"
        description="Packages, departure groups, pilgrim readiness and payments for the Hajj and Umrah desk."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hajj & Umrah" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link href="/admin/hajj-umrah/packages" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Landmark className="h-3.5 w-3.5" /> Packages
            </Link>
            <Link href="/admin/create-booking/standard?service=hajj" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <CalendarPlus className="h-3.5 w-3.5" /> New pilgrim booking
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active packages" value={String(packages.filter((pkg) => pkg.status === "active").length)} hint={`${packages.length} total across Hajj & Umrah`} icon={Landmark} tone="green" />
        <StatCard label="Pilgrims booked" value={String(pilgrims)} hint={`${capacity} seats in inventory`} icon={Users} tone="violet" />
        <StatCard label="Occupancy" value={`${utilisation}%`} hint={`${capacity - pilgrims} seats remaining`} icon={Plane} tone="blue" />
        <StatCard label="Booking value" value={formatMoney(revenue, "BDT", 0)} hint={`${formatMoney(collected, "BDT", 0)} collected`} icon={Wallet} tone="amber" href="/admin/hajj-umrah/bookings" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Package occupancy</CardTitle>
              <CardDescription>Seats sold against capacity for every departure</CardDescription>
            </div>
            <Link href="/admin/hajj-umrah/packages" className="text-[11px] font-semibold text-primary hover:underline">
              Manage packages
            </Link>
          </CardHeader>
          <div className="table-wrap">
            <table className="data-table min-w-[760px]">
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Type</th>
                  <th>Departure</th>
                  <th className="text-right">Price</th>
                  <th className="w-[170px]">Occupancy</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {packages.slice(0, 8).map((pkg) => {
                  const used = percent(pkg.booked, pkg.capacity);
                  return (
                    <tr key={pkg.id}>
                      <td>
                        <p className="max-w-[220px] truncate text-[12.5px] font-medium text-ink">{pkg.title}</p>
                        <p className="text-[10px] text-muted">{pkg.tier} · returns {formatDate(pkg.returnDate, { day: "2-digit", month: "short" })}</p>
                      </td>
                      <td><Badge tone={pkg.kind === "hajj" ? "green" : pkg.kind === "ramadan_umrah" ? "violet" : "blue"}>{titleCase(pkg.kind)}</Badge></td>
                      <td className="whitespace-nowrap text-[11.5px]">{formatDate(pkg.departureDate)}</td>
                      <td className="whitespace-nowrap text-right text-[11.5px] font-medium">{formatMoney(pkg.price, "BDT", 0)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className={used >= 90 ? "h-full rounded-full bg-red-500" : used >= 60 ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-amber-500"} style={{ width: `${Math.min(100, used)}%` }} />
                          </div>
                          <span className="text-[10px] text-slate-500">{pkg.booked}/{pkg.capacity}</span>
                        </div>
                      </td>
                      <td className="text-right"><StatusBadge status={pkg.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Document readiness</CardTitle>
                <CardDescription>Across active pilgrim files</CardDescription>
              </div>
              <FileCheck2 className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {readiness.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-medium text-ink">{item.done}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.done}%` }} />
                  </div>
                </div>
              ))}
              <Link href="/admin/hajj-umrah/documents" className="inline-flex w-full items-center justify-center gap-1.5 rounded-control border border-line px-3 py-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50">
                <CircleCheck className="h-3.5 w-3.5" /> Open readiness board
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Next departures</CardTitle>
                <CardDescription>{upcoming.length} groups scheduled</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              {upcoming.slice(0, 4).map((pkg) => (
                <Link key={pkg.id} href="/admin/hajj-umrah/groups" className="flex items-center gap-2.5 rounded-control px-1.5 py-2 hover:bg-slate-50">
                  <span className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                    <span className="text-[8px] uppercase leading-2">{new Date(`${pkg.departureDate}T00:00:00`).toLocaleString("en-GB", { month: "short" })}</span>
                    <span className="text-[11px] font-semibold leading-3">{pkg.departureDate.slice(8, 10)}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-ink">{pkg.title}</p>
                    <p className="truncate text-[10px] text-muted">{pkg.booked} pilgrims · {pkg.tier}</p>
                  </div>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-300" />
                </Link>
              ))}
              {!upcoming.length ? <p className="py-6 text-center text-[11px] text-muted">No upcoming departures.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent pilgrim bookings</CardTitle>
            <CardDescription>{activeBookings.length} active files · deposits and balances</CardDescription>
          </div>
          <Link href="/admin/hajj-umrah/bookings" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            All bookings <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        {recent.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[780px]">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Pilgrim</th>
                  <th>Package</th>
                  <th>Departure</th>
                  <th className="text-center">Pilgrims</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Balance</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((booking) => (
                  <tr key={booking.id}>
                    <td><Link href={`/admin/all-bookings/${booking.id}`} className="font-mono text-[11px] font-medium text-primary hover:underline">{booking.ref}</Link></td>
                    <td className="text-[12px] font-medium text-ink">{booking.customerName}</td>
                    <td className="max-w-[210px] truncate text-[11.5px] text-slate-600">{booking.title}</td>
                    <td className="whitespace-nowrap text-[11.5px]">{formatDate(booking.startDate)}</td>
                    <td className="text-center text-[11.5px] text-slate-600">{booking.travelers}</td>
                    <td className="whitespace-nowrap text-right text-[11.5px] font-medium">{formatMoney(booking.total, "BDT", 0)}</td>
                    <td className="whitespace-nowrap text-right text-[11.5px] text-amber-700">{booking.due > 0 ? formatMoney(booking.due, "BDT", 0) : "—"}</td>
                    <td className="text-right"><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<Landmark className="h-5 w-5" />} title="No Hajj or Umrah bookings yet" description="Create a pilgrim booking to track deposits, documents and group allocation." />
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pilgrims", hint: "Pilgrim profiles and contacts", href: "/admin/hajj-umrah/pilgrims", icon: Users },
          { label: "Groups & departures", hint: "Group leaders and manifests", href: "/admin/hajj-umrah/groups", icon: Plane },
          { label: "Document readiness", hint: "Passports, visas and vaccinations", href: "/admin/hajj-umrah/documents", icon: FileCheck2 },
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
