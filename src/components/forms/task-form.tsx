"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { createTaskAction, type FormState } from "@/app/admin/actions";

const STAFF = ["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", "Travalsuiteerp"];

export function TaskForm() {
  const [state, formAction, pending] = useActionState(createTaskAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">{state.error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Task title" required error={errors.title} className="sm:col-span-2">
          <Input name="title" placeholder="e.g. Collect Singapore visa documents" required />
        </Field>
        <Field label="Related to" hint="Booking reference, lead or customer">
          <Input name="relatedTo" placeholder="VB-000003" />
        </Field>
        <Field label="Assigned to">
          <Select name="assignedTo" defaultValue={STAFF[0]}>
            {STAFF.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select name="priority" defaultValue="medium">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
        <Field label="Due date">
          <Input name="dueDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/task-management/tasks">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
