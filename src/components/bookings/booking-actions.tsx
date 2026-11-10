"use client";

import { useState } from "react";
import { Check, CreditCard, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/field";
import { addPaymentAction, updateBookingStatusAction } from "@/app/admin/actions";
import type { Booking } from "@/lib/types";
import { formatMoney, titleCase } from "@/lib/utils";

const STATUSES: Booking["status"][] = [
  "draft",
  "pending",
  "processing",
  "reserved",
  "confirmed",
  "approved",
  "ready_to_travel",
  "departed",
  "completed",
  "cancelled",
  "on_hold",
];

export function BookingActions({ booking }: { booking: Booking }) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [status, setStatus] = useState<Booking["status"]>(booking.status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" /> Print
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => setPaymentOpen(true)} disabled={booking.due <= 0}>
        <CreditCard className="h-3.5 w-3.5" /> Record payment
      </Button>
      <form action={updateBookingStatusAction} className="flex items-center gap-1.5">
        <input type="hidden" name="id" value={booking.id} />
        <input type="hidden" name="returnTo" value={`/admin/all-bookings/${booking.id}`} />
        <Select name="status" value={status} onChange={(event) => setStatus(event.target.value as Booking["status"])} className="h-8 w-[150px] text-[11.5px]">
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {titleCase(item)}
            </option>
          ))}
        </Select>
        <Button type="submit" size="sm" variant="subtle" disabled={status === booking.status}>
          <Check className="h-3.5 w-3.5" /> Update
        </Button>
      </form>

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record a payment"
        description={`${booking.ref} · ${booking.customerName}`}
        size="sm"
        footer={
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" form="payment-form">
              Save payment
            </Button>
          </>
        }
      >
        <form id="payment-form" action={addPaymentAction} className="space-y-4">
          <input type="hidden" name="id" value={booking.id} />
          <input type="hidden" name="returnTo" value={`/admin/all-bookings/${booking.id}`} />
          <div className="grid grid-cols-2 gap-3 rounded-control bg-slate-50 p-3 text-[12px]">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Total</p>
              <p className="font-semibold text-ink">{formatMoney(booking.total)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">Balance due</p>
              <p className="font-semibold text-amber-700">{formatMoney(booking.due)}</p>
            </div>
          </div>
          <div>
            <label htmlFor="amount" className="label-base">Payment amount (৳)</label>
            <Input id="amount" name="amount" type="number" min={1} max={booking.due} step="100" defaultValue={booking.due} required />
          </div>
          <div>
            <label htmlFor="method" className="label-base">Payment method</label>
            <Select id="method" name="method" defaultValue="Bank transfer">
              <option>Bank transfer</option>
              <option>Cash</option>
              <option>Card</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Cheque</option>
            </Select>
          </div>
          <p className="text-[11px] leading-5 text-muted">
            Payments update the booking balance and linked invoice immediately, and are written to the activity log.
          </p>
        </form>
      </Modal>
    </div>
  );
}
