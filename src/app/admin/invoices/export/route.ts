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
  const header = ["Invoice", "Booking", "Customer", "Type", "Issued", "Due Date", "Total", "Paid", "Balance", "Status", "Currency"];
  const body = db.invoices.map((invoice) =>
    [invoice.number, invoice.bookingRef, invoice.customerName, invoice.type, invoice.issueDate, invoice.dueDate, invoice.total, invoice.paid, invoice.due, invoice.status, invoice.currency]
      .map(escapeCsv)
      .join(","),
  );
  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
