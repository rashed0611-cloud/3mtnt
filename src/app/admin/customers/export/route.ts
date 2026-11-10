import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { customerRows } from "@/lib/stats";

function escapeCsv(value: string | number | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  await requireUser();
  const db = await getRepository().getDatabase();
  const rows = customerRows(db);
  const header = ["Code", "Name", "Company", "Email", "Phone", "Nationality", "Status", "Tags", "Assigned To", "Bookings", "Outstanding", "Created"];
  const body = rows.map(({ customer, bookings, due }) =>
    [
      customer.code,
      customer.name,
      customer.company ?? "",
      customer.email,
      customer.phone,
      customer.nationality,
      customer.status,
      customer.tags.join("|"),
      customer.assignedTo,
      bookings,
      due,
      customer.createdAt.slice(0, 10),
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
