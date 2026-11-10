import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TaskForm } from "@/components/forms/task-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New task" };

export default async function NewTaskPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title="Create a task"
        description="Assign operational work with a due date and clear ownership."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Task management" }, { label: "All tasks", href: "/admin/task-management/tasks" }, { label: "New" }]}
        actions={
          <Link href="/admin/task-management/tasks" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tasks
          </Link>
        }
      />
      <Card>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </div>
  );
}
