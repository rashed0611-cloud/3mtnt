"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ProductImageField } from "@/components/forms/product-image-field";
import { ProductGalleryField, type ProductGalleryImage } from "@/components/forms/product-gallery-field";
import { saveVisaAction, type FormState } from "@/app/admin/actions";
import type { VisaPackage } from "@/lib/types";

export function VisaForm({
  visa,
  coverUrl,
  relatedImages = [],
}: {
  visa?: VisaPackage;
  coverUrl?: string;
  relatedImages?: ProductGalleryImage[];
}) {
  const [state, formAction, pending] = useActionState(saveVisaAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {visa ? <input type="hidden" name="id" value={visa.id} /> : null}

      <section className="space-y-4 rounded-control border border-line bg-slate-50/40 p-4">
        <ProductImageField
          kind="visa"
          id={visa?.id}
          url={coverUrl}
          hint="Shown on the visa card and detail page. JPG, PNG, WebP or AVIF up to 4 MB."
        />
        <div className="border-t border-line pt-3">
          <ProductGalleryField kind="visa" id={visa?.id} images={relatedImages} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Visa product</h3>
          <p className="text-[11px] text-muted">Destination, processing window and the documents travellers must prepare.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" required error={errors.country}>
            <Input name="country" defaultValue={visa?.country} placeholder="e.g. United Arab Emirates" required />
          </Field>
          <Field label="Visa type" required error={errors.visaType}>
            <Input name="visaType" defaultValue={visa?.visaType} placeholder="e.g. Tourist visa" required />
          </Field>
          <Field label="Processing time">
            <Input name="processingTime" defaultValue={visa?.processingTime ?? "5–7 working days"} placeholder="5–7 working days" />
          </Field>
          <Field label="Service fee (৳)" required error={errors.price}>
            <Input name="price" type="number" min={0} step="100" defaultValue={visa?.price} placeholder="6500" required />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={visa?.status ?? "draft"}>
              <option value="active">Published</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
          <Field label="Currency">
            <Select name="currency" defaultValue={visa?.currency ?? "BDT"}>
              {["BDT", "USD", "EUR", "GBP", "AED", "SAR"].map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </Select>
          </Field>
          <Field label="Required documents" hint="One per line. Shown on the public checklist." className="sm:col-span-2">
            <Textarea
              name="requiredDocuments"
              rows={5}
              defaultValue={(visa?.requiredDocuments ?? [
                "Passport with 6 months validity",
                "Recent passport-size photograph",
                "Bank statement (last 3 months)",
                "Confirmed hotel booking",
                "Return flight reservation",
              ]).join("\n")}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              name="description"
              rows={3}
              defaultValue={visa?.description}
              placeholder="Who this visa suits, entry conditions and anything travellers should know."
            />
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/visas">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : visa ? "Save changes" : "Add visa product"}
        </Button>
      </div>
    </form>
  );
}
