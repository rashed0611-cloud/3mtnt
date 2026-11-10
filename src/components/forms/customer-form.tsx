"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { saveCustomerAction, type FormState } from "@/app/admin/actions";
import type { Customer } from "@/lib/types";

const STAFF = ["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", "Travalsuiteerp"];

export function CustomerForm({ customer }: { customer?: Customer }) {
  const [state, formAction, pending] = useActionState(saveCustomerAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={customer?.id ?? ""} />

      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          <Input name="name" defaultValue={customer?.name} placeholder="e.g. Neyamul Kobir" required />
        </Field>
        <Field label="Company" hint="Optional. Leave blank for individual travellers.">
          <Input name="company" defaultValue={customer?.company} placeholder="e.g. Naveen Imports Ltd." />
        </Field>
        <Field label="Email address" required error={errors.email}>
          <Input name="email" type="email" defaultValue={customer?.email} placeholder="name@example.com" required />
        </Field>
        <Field label="Phone number" required error={errors.phone}>
          <Input name="phone" defaultValue={customer?.phone} placeholder="+880 17xx xxx xxx" required />
        </Field>
        <Field label="Nationality">
          <Select name="nationality" defaultValue={customer?.nationality ?? "Bangladeshi"}>
            {["Bangladeshi", "Indian", "British", "American", "Canadian", "Emirati", "Malaysian", "Singaporean"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="Assigned staff">
          <Select name="assignedTo" defaultValue={customer?.assignedTo ?? STAFF[0]}>
            {STAFF.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={customer?.status ?? "active"}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        <Field label="Tags" hint="Comma separated, e.g. VIP, Repeat, Corporate">
          <Input name="tags" defaultValue={customer?.tags.join(", ")} placeholder="VIP, Repeat" />
        </Field>
      </div>

      <Field label="Internal notes" hint="Visible to staff only. Preferences, passport reminders, special handling.">
        <Textarea name="notes" defaultValue={customer?.notes} placeholder="Prefers WhatsApp updates. Passport expires in 2028." rows={4} />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href={customer ? `/admin/customers/${customer.id}` : "/admin/customers"}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : customer ? "Save changes" : "Create customer"}
        </Button>
      </div>
    </form>
  );
}
