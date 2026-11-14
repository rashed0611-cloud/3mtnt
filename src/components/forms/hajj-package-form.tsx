"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { ProductImageField } from "@/components/forms/product-image-field";
import { ProductGalleryField, type ProductGalleryImage } from "@/components/forms/product-gallery-field";
import { saveHajjPackageAction, type FormState } from "@/app/admin/actions";
import type { HajjPackage } from "@/lib/types";

export function HajjPackageForm({
  pkg,
  coverUrl,
  coverOverlay,
  relatedImages = [],
}: {
  pkg?: HajjPackage;
  coverUrl?: string;
  coverOverlay?: number;
  relatedImages?: ProductGalleryImage[];
}) {
  const [state, formAction, pending] = useActionState(saveHajjPackageAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {pkg ? <input type="hidden" name="id" value={pkg.id} /> : null}

      <section className="space-y-4 rounded-control border border-line bg-slate-50/40 p-4">
        <ProductImageField
          kind="hajj"
          id={pkg?.id}
          url={coverUrl}
          overlay={coverOverlay}
          hint="Shown on the pilgrimage card and detail page. JPG, PNG, WebP or AVIF up to 4 MB."
        />
        <div className="border-t border-line pt-3">
          <ProductGalleryField kind="hajj" id={pkg?.id} images={relatedImages} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Package details</h3>
          <p className="text-[11px] text-muted">Departure inventory, pricing and seat capacity for the pilgrimage desk.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Package title" required error={errors.title} className="sm:col-span-2">
            <Input name="title" defaultValue={pkg?.title} placeholder="e.g. Ramadan Umrah Family 12 Days" required />
          </Field>
          <Field label="Package type">
            <Select name="kind" defaultValue={pkg?.kind ?? "umrah"}>
              <option value="hajj">Hajj</option>
              <option value="umrah">Umrah</option>
              <option value="ramadan_umrah">Ramadan Umrah</option>
            </Select>
          </Field>
          <Field label="Tier">
            <Input name="tier" defaultValue={pkg?.tier ?? "Standard"} placeholder="Economy, Standard, Premium, VIP" />
          </Field>
          <Field label="Departure date" required error={errors.departureDate}>
            <Input name="departureDate" type="date" defaultValue={pkg?.departureDate} required />
          </Field>
          <Field label="Return date" required error={errors.returnDate}>
            <Input name="returnDate" type="date" defaultValue={pkg?.returnDate} required />
          </Field>
          <Field label="Price per pilgrim (৳)" required error={errors.price}>
            <Input name="price" type="number" min={0} step="1000" defaultValue={pkg?.price} placeholder="199000" required />
          </Field>
          <Field label="Currency">
            <Select name="currency" defaultValue={pkg?.currency ?? "BDT"}>
              {["BDT", "USD", "SAR", "AED"].map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </Select>
          </Field>
          <Field label="Seat capacity" required error={errors.capacity}>
            <Input name="capacity" type="number" min={1} defaultValue={pkg?.capacity ?? 25} required />
          </Field>
          <Field label="Seats booked" error={errors.booked}>
            <Input name="booked" type="number" min={0} defaultValue={pkg?.booked ?? 0} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={pkg?.status ?? "draft"}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </Select>
          </Field>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/hajj-umrah/packages">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : pkg ? "Save changes" : "Add package"}
        </Button>
      </div>
    </form>
  );
}
