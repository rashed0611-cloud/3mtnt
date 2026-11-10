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
  const header = ["Country", "Visa Type", "Processing Time", "Fee", "Currency", "Documents", "Status", "Description"];
  const body = db.visas.map((visa) =>
    [
      visa.country,
      visa.visaType,
      visa.processingTime,
      visa.price,
      visa.currency,
      visa.requiredDocuments.join("; "),
      visa.status,
      visa.description,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-visas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
