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
  const header = ["Code", "Title", "Destination", "Type", "Days", "Nights", "Adult Price", "Child Price", "Capacity", "Status", "Featured", "Supplier"];
  const body = db.tours.map((tour) =>
    [
      tour.code,
      tour.title,
      tour.destination,
      tour.type,
      tour.durationDays,
      tour.durationNights,
      tour.adultPrice,
      tour.childPrice,
      tour.capacity,
      tour.status,
      tour.featured ? "yes" : "no",
      tour.supplier,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-tours-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
