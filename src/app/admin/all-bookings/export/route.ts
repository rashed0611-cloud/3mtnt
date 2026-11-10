import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

function escapeCsv(value: string | number | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const header = ["Reference", "Service", "Title", "Customer", "Phone", "Start", "End", "Adults", "Children", "Status", "Payment", "Total", "Paid", "Due", "Assigned", "Source"];
  const body = db.bookings.map((booking) =>
    [
      booking.ref,
      booking.serviceType,
      booking.title,
      booking.customerName,
      booking.customerPhone,
      booking.startDate,
      booking.endDate,
      booking.adults,
      booking.children,
      booking.status,
      booking.paymentStatus,
      booking.total,
      booking.paid,
      booking.due,
      booking.assignedTo,
      booking.source,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
