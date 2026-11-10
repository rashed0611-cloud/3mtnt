import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Download, Plus } from "lucide-react";
import { TaskStatusControl } from "@/components/tasks/task-status-control";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { percent, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "All tasks" };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; priority?: string; assigned?: string; created?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const staff = Array.from(new Set(db.tasks.map((task) => task.assignedTo))).sort();

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = db.tasks.filter((task) => {
    if (term && !`${task.title} ${task.relatedTo} ${task.assignedTo}`.toLowerCase().includes(term)) return false;
    if (params.status && task.status !== params.status) return false;
    if (params.priority && task.priority !== params.priority) return false;
    if (params.assigned && task.assignedTo !== params.assigned) return false;
    return true;
  });

  const open = db.tasks.filter((task) => !["completed", "cancelled"].includes(task.status));
  const completed = db.tasks.filter((task) => task.status === "completed");
  const overdue = open.filter((task) => task.dueDate < today);

  return (
    <div className="space-y-4">
      <PageHeader
        title="All tasks"
        description="The operational to-do list across bookings, visas, Hajj groups and customer follow-ups."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Task management" }, { label: "All tasks" }]}
        actions={
          <>
            <a href="/admin/task-management/tasks/export" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export
            </a>
            <Link href="/admin/task-management/tasks/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <Plus className="h-3.5 w-3.5" /> New task
            </Link>
          </>
        }
      />

      {params.created ? (
        <div className="rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">Task created and added to the queue.</div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open tasks", value: String(open.length), hint: `${db.tasks.length} total` },
          { label: "In progress", value: String(db.tasks.filter((task) => task.status === "in_progress").length), hint: "Being worked on" },
          { label: "Overdue", value: String(overdue.length), hint: "Past the due date" },
          { label: "Completion rate", value: `${percent(completed.length, db.tasks.length)}%`, hint: `${completed.length} completed` },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{stat.value}</p>
            <p className="mt-0.5 text-[10.5px] text-slate-400">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Task queue</h2>
              <p className="text-[11px] text-muted">{filtered.length} tasks match your filters</p>
            </div>
            <Badge tone="amber">{overdue.length} overdue</Badge>
          </div>
          <FilterBar
            placeholder="Search task, booking or assignee…"
            filters={[
              { name: "status", label: "All statuses", options: ["to_do", "pending", "in_progress", "review", "completed", "blocked", "cancelled"].map((value) => ({ value, label: titleCase(value) })) },
              { name: "priority", label: "Any priority", options: ["low", "medium", "high", "urgent"].map((value) => ({ value, label: titleCase(value) })) },
              { name: "assigned", label: "All staff", options: staff.map((value) => ({ value, label: value })) },
            ]}
          />
        </div>

        {filtered.length ? (
          <div className="table-wrap">
            <table className="data-table min-w-[900px]">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Related to</th>
                  <th>Assigned</th>
                  <th>Start</th>
                  <th>Due</th>
                  <th>Progress</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const progress = task.subtasks.total ? percent(task.subtasks.done, task.subtasks.total) : 0;
                  return (
                    <tr key={task.id}>
                      <td className="max-w-[280px]">
                        <p className="truncate text-[12px] font-medium text-ink">{task.title}</p>
                        <p className="text-[10px] text-muted">{task.checklist.total ? `${task.checklist.done}/${task.checklist.total} checklist items` : "No checklist"}</p>
                      </td>
                      <td className="whitespace-nowrap font-mono text-[10.5px] text-slate-500">{task.relatedTo}</td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">{task.assignedTo}</td>
                      <td className="whitespace-nowrap text-[11px] text-slate-500">{task.startDate}</td>
                      <td className="whitespace-nowrap text-[11px]">
                        <span className={task.dueDate < today && !["completed", "cancelled"].includes(task.status) ? "font-medium text-danger" : "text-slate-600"}>{task.dueDate}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[9.5px] text-muted">{progress}%</span>
                        </div>
                      </td>
                      <td><Badge tone={task.priority === "urgent" ? "red" : task.priority === "high" ? "amber" : task.priority === "low" ? "neutral" : "blue"}>{titleCase(task.priority)}</Badge></td>
                      <td><TaskStatusControl id={task.id} status={task.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<ClipboardList className="h-5 w-5" />}
            title="No tasks match those filters"
            description="Clear the filters or create a task to keep the operation moving."
            action={<Link href="/admin/task-management/tasks/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white"><Plus className="h-3.5 w-3.5" /> New task</Link>}
          />
        )}
      </Card>
    </div>
  );
}
