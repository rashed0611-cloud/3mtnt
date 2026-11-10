"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createLeadAction, type FormState } from "@/app/admin/actions";

const STAFF = ["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", "Travalsuiteerp"];

export function LeadForm() {
  const [state, formAction, pending] = useActionState(createLeadAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">{state.error}</div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Lead or company name" required error={errors.name}>
          <Input name="name" placeholder="e.g. Skyline Travel Partner" required />
        </Field>
        <Field label="Company" hint="Optional for individual enquiries.">
          <Input name="company" placeholder="e.g. Naveen Imports Ltd." />
        </Field>
        <Field label="Phone" required error={errors.phone}>
          <Input name="phone" placeholder="+880 17xx xxx xxx" required />
        </Field>
        <Field label="Email">
          <Input name="email" type="email" placeholder="name@example.com" />
        </Field>
        <Field label="Source">
          <Select name="source" defaultValue="website">
            {["website", "facebook", "phone", "referral", "walk_in", "agent", "other"].map((item) => (
              <option key={item} value={item}>{item.replace(/_/g, " ")}</option>
            ))}
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
        <Field label="Requirement" required error={errors.requirement} className="sm:col-span-2">
          <Textarea name="requirement" rows={2} placeholder="e.g. Family Umrah for four pilgrims in Ramadan, 12 nights." required />
        </Field>
        <Field label="Estimated value (৳)">
          <Input name="estimatedValue" type="number" min={0} step="1000" placeholder="320000" />
        </Field>
        <Field label="Next follow-up">
          <Input name="nextFollowUp" type="date" />
        </Field>
        <Field label="Assigned to">
          <Select name="assignedTo" defaultValue={STAFF[0]}>
            {STAFF.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>
        <Field label="Pipeline stage">
          <Select name="status" defaultValue="new">
            {["new", "contacted", "qualified", "proposal_sent", "negotiation"].map((item) => (
              <option key={item} value={item}>{item.replace(/_/g, " ")}</option>
            ))}
          </Select>
        </Field>
        <Field label="Tags" hint="Comma separated, e.g. Hot Lead, Corporate">
          <Input name="tags" placeholder="Hot Lead, VIP" />
        </Field>
        <Field label="Notes">
          <Input name="notes" placeholder="Budget, travel window, decision maker…" />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/crm/leads">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Create lead"}
        </Button>
      </div>
    </form>
  );
}
