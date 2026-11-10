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
  const header = ["Title", "Kind", "Tier", "Departure", "Return", "Price", "Currency", "Capacity", "Booked", "Occupancy %", "Status"];
  const body = db.hajjPackages.map((pkg) =>
    [
      pkg.title,
      pkg.kind,
      pkg.tier,
      pkg.departureDate,
      pkg.returnDate,
      pkg.price,
      pkg.currency,
      pkg.capacity,
      pkg.booked,
      Math.round((pkg.booked / Math.max(1, pkg.capacity)) * 100),
      pkg.status,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-hajj-packages-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
