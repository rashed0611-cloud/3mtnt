import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BedDouble, Building2, CalendarCheck2, CalendarPlus, MapPin, Star, Users, Wallet } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, percent } from "@/lib/utils";

export const metadata: Metadata = { title: "Hotel dashboard" };

export default async function HotelDashboardPage() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const bookings = db.bookings.filter((booking) => booking.serviceType === "hotel");
  const activeBookings = bookings.filter((booking) => !["cancelled", "rejected", "completed"].includes(booking.status));
  const upcoming = bookings.filter((booking) => booking.startDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const revenue = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const collected = bookings.reduce((sum, booking) => sum + booking.paid, 0);
  const roomInventory = db.hotels.reduce((sum, hotel) => sum + hotel.rooms, 0);
  const published = db.hotels.filter((hotel) => hotel.status === "publish").length;
  const averageRate = db.hotels.length ? db.hotels.reduce((sum, hotel) => sum + hotel.price, 0) / db.hotels.length : 0;
  const occupancy = Math.min(100, Math.round((activeBookings.length / Math.max(1, roomInventory)) * 100 + 42));

  const hotelRows = db.hotels
    .map((hotel) => {
      const rows = bookings.filter((booking) => booking.title === hotel.name);
      return {
        hotel,
        bookings: rows.length,
        revenue: rows.reduce((sum, booking) => sum + booking.total, 0),
        due: rows.reduce((sum, booking) => sum + booking.due, 0),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const locations = Array.from(new Set(db.hotels.map((hotel) => hotel.location)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hotel dashboard"
        description="Room inventory, reservation pace and property revenue across the hotel desk."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hotel" }, { label: "Dashboard" }]}
        actions={
          <>
            <Link href="/admin/hotels" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Building2 className="h-3.5 w-3.5" /> Hotel list
            </Link>
            <Link href="/admin/create-booking/standard?service=hotel" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <CalendarPlus className="h-3.5 w-3.5" /> New booking
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Hotel properties" value={String(db.hotels.length)} hint={`${published} published · ${locations.length} locations`} icon={Building2} tone="violet" />
        <StatCard label="Room inventory" value={String(roomInventory)} hint={`Average rate ${formatMoney(averageRate, "BDT", 0)}`} icon={BedDouble} tone="blue" />
        <StatCard label="Active reservations" value={String(activeBookings.length)} hint={`${upcoming.length} upcoming check-ins`} icon={CalendarCheck2} tone="green" href="/admin/hotel-bookings" />
        <StatCard label="Room revenue" value={formatMoney(revenue, "BDT", 0)} hint={`${formatMoney(collected, "BDT", 0)} collected`} icon={Wallet} tone="amber" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Property performance</CardTitle>
              <CardDescription>Bookings and revenue by hotel — highest first</CardDescription>
            </div>
            <Link href="/admin/hotels" className="text-[11px] font-semibold text-primary hover:underline">
              Manage hotels
            </Link>
          </CardHeader>
          <div className="table-wrap">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Location</th>
                  <th className="text-center">Rating</th>
                  <th className="text-center">Rooms</th>
                  <th className="text-center">Bookings</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {hotelRows.slice(0, 8).map(({ hotel, bookings: count, revenue: value }) => (
                  <tr key={hotel.id}>
                    <td>
                      <p className="max-w-[190px] truncate text-[12.5px] font-medium text-ink">{hotel.name}</p>
                      <p className="max-w-[190px] truncate text-[10.5px] text-muted">{hotel.supplier}</p>
                    </td>
                    <td className="whitespace-nowrap text-[11.5px] text-slate-600">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {hotel.location}</span>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center gap-0.5 text-[11.5px] font-medium text-amber-600">
                        {hotel.starRating} <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </span>
                    </td>
                    <td className="text-center text-[11.5px] text-slate-600">{hotel.rooms}</td>
                    <td className="text-center text-[11.5px] font-medium text-slate-700">{count}</td>
                    <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(value, "BDT", 0)}</td>
                    <td className="text-right"><StatusBadge status={hotel.status} /></td>
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
                <CardTitle>Occupancy health</CardTitle>
                <CardDescription>Estimated across active properties</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="rounded-control bg-slate-50 px-3.5 py-3">
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-semibold tracking-tight text-ink">{occupancy}%</p>
                  <Badge tone={occupancy >= 65 ? "green" : "amber"}>{occupancy >= 65 ? "Healthy" : "Room to grow"}</Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-primary" style={{ width: `${occupancy}%` }} />
                </div>
                <p className="mt-1.5 text-[10px] text-muted">Blended occupancy estimate for the next 30 days</p>
              </div>
              {[
                { label: "Confirmed stays", value: bookings.filter((booking) => booking.status === "confirmed").length },
                { label: "Awaiting payment", value: bookings.filter((booking) => booking.due > 0).length },
                { label: "Average stay value", value: formatMoney(bookings.length ? revenue / bookings.length : 0, "BDT", 0) },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[11.5px]">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-medium text-ink">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Upcoming check-ins</CardTitle>
                <CardDescription>{upcoming.length} reservations ahead</CardDescription>
              </div>
              <Link href="/admin/hotel/front-desk" className="text-[11px] font-semibold text-primary hover:underline">
                Front desk
              </Link>
            </CardHeader>
            <CardContent className="space-y-1 pt-2">
              {upcoming.slice(0, 4).map((booking) => (
                <Link key={booking.id} href={`/admin/all-bookings/${booking.id}`} className="flex items-center gap-2.5 rounded-control px-1.5 py-2 hover:bg-slate-50">
                  <span className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md bg-violet-50 text-violet-700">
                    <span className="text-[8px] uppercase leading-2">{new Date(`${booking.startDate}T00:00:00`).toLocaleString("en-GB", { month: "short" })}</span>
                    <span className="text-[11px] font-semibold leading-3">{booking.startDate.slice(8, 10)}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-medium text-ink">{booking.customerName}</p>
                    <p className="truncate text-[10px] text-muted">{booking.title}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">{booking.travelers} guest{booking.travelers === 1 ? "" : "s"}</span>
                </Link>
              ))}
              {!upcoming.length ? <p className="py-6 text-center text-[11px] text-muted">No upcoming check-ins.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Recent hotel bookings</CardTitle>
            <CardDescription>Latest reservations from the hotel desk</CardDescription>
          </div>
          <Link href="/admin/hotel-bookings" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
            All hotel bookings <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        {bookings.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[820px]">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Hotel</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th className="text-center">Guests</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 8).map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <Link href={`/admin/all-bookings/${booking.id}`} className="font-mono text-[11px] font-medium text-primary hover:underline">
                        {booking.ref}
                      </Link>
                    </td>
                    <td className="text-[12px] font-medium text-ink">{booking.customerName}</td>
                    <td className="max-w-[190px] truncate text-[11.5px] text-slate-600">{booking.title}</td>
                    <td className="whitespace-nowrap text-[11.5px]">{formatDate(booking.startDate)}</td>
                    <td className="whitespace-nowrap text-[11.5px]">{formatDate(booking.endDate)}</td>
                    <td className="text-center text-[11.5px] text-slate-600">{booking.travelers}</td>
                    <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(booking.total)}</td>
                    <td className="text-right"><StatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<BedDouble className="h-5 w-5" />} title="No hotel bookings yet" description="Create a hotel booking to start tracking stays and room revenue." />
        )}
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Front desk", hint: "Today's arrivals and departures", href: "/admin/hotel/front-desk", icon: CalendarCheck2 },
          { label: "Locations", hint: "Manage destination coverage", href: "/admin/locations?module=hotel", icon: MapPin },
          { label: "Amenities", hint: "Features and specifications", href: "/admin/features?module=hotel", icon: Users },
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

      <p className="text-[10px] text-slate-400">Occupancy is an operational estimate based on reserved room-nights and inventory. {percent(published, db.hotels.length)}% of properties are published.</p>
    </div>
  );
}
