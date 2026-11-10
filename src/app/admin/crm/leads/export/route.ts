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
  const header = ["Name", "Company", "Phone", "Email", "Source", "Requirement", "Assigned To", "Priority", "Status", "Next Follow-up", "Last Contact", "Estimated Value", "Tags", "Created"];
  const body = db.leads.map((lead) =>
    [
      lead.name,
      lead.company,
      lead.phone,
      lead.email,
      lead.source,
      lead.requirement,
      lead.assignedTo,
      lead.priority,
      lead.status,
      lead.nextFollowUp,
      lead.lastContact,
      lead.estimatedValue,
      lead.tags.join("; "),
      lead.createdAt,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
