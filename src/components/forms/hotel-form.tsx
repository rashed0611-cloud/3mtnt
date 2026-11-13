"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ProductImageField } from "@/components/forms/product-image-field";
import { saveHotelAction, type FormState } from "@/app/admin/actions";
import type { Hotel } from "@/lib/types";

export function HotelForm({ hotel, coverUrl }: { hotel?: Hotel; coverUrl?: string }) {
  const [state, formAction, pending] = useActionState(saveHotelAction, {} as FormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {hotel ? <input type="hidden" name="id" value={hotel.id} /> : null}

      <section className="space-y-4 rounded-control border border-line bg-slate-50/40 p-4">
        <ProductImageField kind="hotel" id={hotel?.id} url={coverUrl} />
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Property details</h3>
          <p className="text-[11px] text-muted">This information appears on the public hotel pages and in quotes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property name" required error={errors.name} className="sm:col-span-2">
            <Input name="name" defaultValue={hotel?.name} placeholder="e.g. Banani Lakeview Hotel" required />
          </Field>
          <Field label="Location" required error={errors.location}>
            <Input name="location" defaultValue={hotel?.location} placeholder="e.g. Dhaka" required />
          </Field>
          <Field label="Star rating">
            <Select name="starRating" defaultValue={String(hotel?.starRating ?? 3)}>
              {[5, 4, 3, 2, 1].map((stars) => (
                <option key={stars} value={stars}>{stars} star</option>
              ))}
            </Select>
          </Field>
          <Field label="Nightly rate (৳)" required error={errors.price}>
            <Input name="price" type="number" min={0} step="100" defaultValue={hotel?.price} placeholder="8500" required />
          </Field>
          <Field label="Rooms in inventory">
            <Input name="rooms" type="number" min={0} defaultValue={hotel?.rooms ?? 20} />
          </Field>
          <Field label="Supplier">
            <Input name="supplier" defaultValue={hotel?.supplier ?? "Own inventory"} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={hotel?.status ?? "draft"}>
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="URL slug" hint="Leave blank to generate it from the name.">
            <Input name="slug" defaultValue={hotel?.slug} placeholder="banani-lakeview-hotel" />
          </Field>
          <Field label="Amenities" hint="One per line." className="sm:col-span-2">
            <Textarea
              name="amenities"
              rows={4}
              defaultValue={(hotel?.amenities ?? ["Free Wi-Fi", "Breakfast", "Airport transfer", "Fitness centre"]).join("\n")}
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea
              name="description"
              rows={3}
              defaultValue={hotel?.description}
              placeholder="What makes this property a good stay — location, rooms and service."
            />
          </Field>
          <label className="flex items-center gap-2 rounded-control border border-line px-3 py-2.5 text-[12px] text-slate-600 sm:col-span-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={hotel?.featured}
              className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
            />
            Feature this property on the storefront
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/hotels">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : hotel ? "Save changes" : "Add hotel"}
        </Button>
      </div>
    </form>
  );
}
