"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { updateSettingsAction, type FormState } from "@/app/admin/actions";
import type { AppSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <div className="flex items-center gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> {state.message}
        </div>
      ) : null}
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">{state.error}</div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Business identity</h2>
          <p className="text-[11px] text-muted">Shown on invoices, vouchers and the customer-facing website.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Workspace name" required error={errors.siteName}>
            <Input name="siteName" defaultValue={settings.siteName} required />
          </Field>
          <Field label="Legal entity name">
            <Input name="legalName" defaultValue={settings.legalName} />
          </Field>
          <Field label="Tagline" className="sm:col-span-2">
            <Input name="tagline" defaultValue={settings.tagline} />
          </Field>
          <Field label="Logo monogram" hint="Used in compact spaces and documents.">
            <Input name="logoText" defaultValue={settings.logoText} maxLength={12} />
          </Field>
          <Field label="Default currency">
            <Select name="defaultCurrency" defaultValue={settings.defaultCurrency}>
              <option value="BDT">BDT — Bangladeshi Taka (৳)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="EUR">EUR — Euro (€)</option>
              <option value="GBP">GBP — Pound Sterling (£)</option>
              <option value="AED">AED — UAE Dirham</option>
            </Select>
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Contact & billing</h2>
          <p className="text-[11px] text-muted">These details appear in the invoice footer.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact email">
            <Input name="email" type="email" defaultValue={settings.email} />
          </Field>
          <Field label="Contact phone">
            <Input name="phone" defaultValue={settings.phone} />
          </Field>
          <Field label="Registered address" className="sm:col-span-2">
            <Textarea name="address" rows={2} defaultValue={settings.address} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">Localisation & invoicing</h2>
          <p className="text-[11px] text-muted">Defaults applied to new bookings and generated documents.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Timezone">
            <Select name="timezone" defaultValue={settings.timezone}>
              <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
              <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="UTC">UTC</option>
            </Select>
          </Field>
          <Field label="Invoice prefix">
            <Input name="invoicePrefix" defaultValue={settings.invoicePrefix} maxLength={8} />
          </Field>
          <Field label="Default tax rate (%)">
            <Input name="taxRate" type="number" min={0} max={100} step="0.5" defaultValue={settings.taxRate} />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
        <Button type="reset" variant="outline" size="sm">
          <RotateCcw className="h-3.5 w-3.5" /> Discard changes
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
