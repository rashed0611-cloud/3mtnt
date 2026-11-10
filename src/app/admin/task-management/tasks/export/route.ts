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
  const header = ["Title", "Related To", "Assigned To", "Priority", "Status", "Start Date", "Due Date", "Subtasks Done", "Subtasks Total", "Checklist Done", "Checklist Total"];
  const body = db.tasks.map((task) =>
    [
      task.title,
      task.relatedTo,
      task.assignedTo,
      task.priority,
      task.status,
      task.startDate,
      task.dueDate,
      task.subtasks.done,
      task.subtasks.total,
      task.checklist.done,
      task.checklist.total,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="3m-tours-tasks-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
