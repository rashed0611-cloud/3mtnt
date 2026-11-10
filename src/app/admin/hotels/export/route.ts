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
  const header = ["Name", "Location", "Stars", "Rate", "Currency", "Rooms", "Status", "Featured", "Supplier", "Amenities", "Description"];
  const body = db.hotels.map((hotel) =>
    [
      hotel.name,
      hotel.location,
      hotel.starRating,
      hotel.price,
      hotel.currency,
      hotel.rooms,
      hotel.status,
      hotel.featured ? "yes" : "no",
      hotel.supplier,
      hotel.amenities.join("; "),
      hotel.description,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-hotels-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
