"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { updateTourSettingsAction, type FormState } from "@/app/admin/actions";
import type { AppSettings } from "@/lib/types";

export function TourSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateTourSettingsAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div className="flex items-center gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {state.message}
        </div>
      ) : null}
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Tour defaults</h2>
          <p className="text-[11px] text-muted">Applied to new tour packages and shown on tour detail pages.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Default status for new tours" hint="Can still be changed per tour." error={errors.tourDefaultStatus}>
            <Select name="tourDefaultStatus" defaultValue={settings.tourDefaultStatus}>
              <option value="active">Active — publish immediately</option>
              <option value="draft">Draft — review before publishing</option>
            </Select>
          </Field>
          <Field label="Cancellation window" hint="Days before departure." error={errors.tourCancellationDays}>
            <Input
              name="tourCancellationDays"
              type="number"
              min={0}
              max={365}
              step={1}
              defaultValue={settings.tourCancellationDays}
            />
          </Field>
          <Field label="Deposit per person (%)" hint="Used for quotes and booking payments." error={errors.tourDepositPercent}>
            <Input
              name="tourDepositPercent"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={settings.tourDepositPercent}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Document defaults</h2>
          <p className="text-[11px] text-muted">Shared with workspace settings and used on tour invoices.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Invoice prefix" required error={errors.invoicePrefix}>
            <Input name="invoicePrefix" defaultValue={settings.invoicePrefix} maxLength={8} required />
          </Field>
          <Field label="Tax rate (%)" error={errors.taxRate}>
            <Input name="taxRate" type="number" min={0} max={100} step={0.01} defaultValue={settings.taxRate} />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" disabled={pending} className="h-10">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save tour settings"}
        </Button>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Changes apply to new quotes and tour pages immediately.
        </span>
      </div>
    </form>
  );
}
