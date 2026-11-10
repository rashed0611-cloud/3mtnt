"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CheckSquare, Download, Loader2, Square } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { bulkUpdateBookingStatusAction } from "@/app/admin/actions";
import type { Booking } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/utils";

const serviceTone: Record<string, "blue" | "violet" | "amber" | "green"> = {
  tour: "blue",
  hotel: "violet",
  visa: "amber",
  hajj: "green",
};

export function BookingTable({ bookings }: { bookings: Booking[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const allSelected = bookings.length > 0 && bookings.every((booking) => selected.has(booking.id));

  const selectedBookings = useMemo(() => bookings.filter((booking) => selected.has(booking.id)), [bookings, selected]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(bookings.map((booking) => booking.id)));
  }

  function bulkStatus(status: Booking["status"]) {
    startTransition(async () => {
      await bulkUpdateBookingStatusAction(Array.from(selected), status);
      setSelected(new Set());
    });
  }

  function exportSelected() {
    const header = ["Reference", "Service", "Title", "Customer", "Start", "End", "Status", "Payment", "Total", "Paid", "Due"];
    const rows = selectedBookings.map((booking) => [
      booking.ref,
      booking.serviceType,
      booking.title,
      booking.customerName,
      booking.startDate,
      booking.endDate,
      booking.status,
      booking.paymentStatus,
      booking.total,
      booking.paid,
      booking.due,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `3m-tours-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-primary/[0.04] px-4 py-2.5">
          <span className="text-[11.5px] font-medium text-primary">{selected.size} selected</span>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => bulkStatus("confirmed")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-control bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-line hover:bg-slate-50 disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Mark confirmed
          </button>
          <button
            onClick={() => bulkStatus("processing")}
            disabled={pending}
            className="rounded-control bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-line hover:bg-slate-50 disabled:opacity-50"
          >
            Mark processing
          </button>
          <button
            onClick={exportSelected}
            className="inline-flex items-center gap-1 rounded-control bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-line hover:bg-slate-50"
          >
            <Download className="h-3 w-3" /> Export selected
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[11px] font-medium text-slate-500 hover:text-slate-700">
            Clear
          </button>
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="data-table min-w-[1100px]">
          <thead>
            <tr>
              <th className="w-9">
                <button onClick={toggleAll} aria-label="Select all bookings" className="text-slate-400 hover:text-primary">
                  {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th>Booking</th>
              <th>Customer</th>
              <th>Travel dates</th>
              <th>Assigned</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-right">Total</th>
              <th className="text-right">Due</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className={selected.has(booking.id) ? "bg-primary/[0.03]" : undefined}>
                <td>
                  <button onClick={() => toggle(booking.id)} aria-label={`Select ${booking.ref}`} className="text-slate-400 hover:text-primary">
                    {selected.has(booking.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td>
                  <Link href={`/admin/all-bookings/${booking.id}`} className="group block">
                    <span className="block font-mono text-[11.5px] font-medium text-primary group-hover:underline">{booking.ref}</span>
                    <span className="mt-0.5 flex items-center gap-1.5">
                      <Badge tone={serviceTone[booking.serviceType]} className="px-1.5 py-0 text-[9.5px] uppercase">{booking.serviceType}</Badge>
                      <span className="max-w-[190px] truncate text-[11px] text-muted">{booking.title}</span>
                    </span>
                  </Link>
                </td>
                <td>
                  <p className="text-[12px] font-medium text-ink">{booking.customerName}</p>
                  <p className="text-[10.5px] text-muted">{booking.customerPhone}</p>
                </td>
                <td className="whitespace-nowrap text-[11.5px] text-slate-600">
                  {formatDate(booking.startDate)}
                  <span className="mx-1 text-slate-300">→</span>
                  {formatDate(booking.endDate)}
                </td>
                <td className="whitespace-nowrap text-[11.5px] text-slate-600">{booking.assignedTo}</td>
                <td><StatusBadge status={booking.paymentStatus} /></td>
                <td><StatusBadge status={booking.status} /></td>
                <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(booking.total)}</td>
                <td className="whitespace-nowrap text-right text-[12px]">{booking.due > 0 ? <span className="font-medium text-amber-700">{formatMoney(booking.due)}</span> : <span className="text-slate-400">—</span>}</td>
                <td className="text-right">
                  <Link href={`/admin/all-bookings/${booking.id}`} className="rounded-control border border-line px-2 py-1 text-[10.5px] font-medium text-slate-600 hover:bg-slate-50">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
