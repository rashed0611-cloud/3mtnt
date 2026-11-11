"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createTourAction, type FormState } from "@/app/admin/actions";
import type { Tour } from "@/lib/types";

interface Day {
  title: string;
  description: string;
}

const DESTINATIONS = ["Bali", "Maldives", "Switzerland", "Dubai", "Bangkok", "Thailand", "Singapore", "Malaysia", "Turkey", "Japan", "Cox's Bazar", "Sylhet"];

export function TourForm({ tour, defaultStatus = "active" }: { tour?: Tour; defaultStatus?: Tour["status"] }) {
  const [state, formAction, pending] = useActionState(createTourAction, {} as FormState);
  const errors = state.fieldErrors ?? {};
  const [days, setDays] = useState<Day[]>(
    tour?.itinerary.length
      ? tour.itinerary.map((day) => ({ title: day.title, description: day.description }))
      : [
          { title: "Arrival & welcome", description: "Meet your guide, transfer to the hotel and settle in." },
          { title: "Guided discovery", description: "Highlights of the destination with time for photos and local food." },
          { title: "Free day", description: "Optional experiences or simply relax before departure." },
        ],
  );

  function updateDay(index: number, key: keyof Day, value: string) {
    setDays((current) => current.map((day, position) => (position === index ? { ...day, [key]: value } : day)));
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      {tour ? <input type="hidden" name="id" value={tour.id} /> : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">Package basics</h3>
          <p className="text-[11px] text-muted">This is what customers see on the website and what your team sells.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tour title" required error={errors.title} className="sm:col-span-2">
            <Input name="title" defaultValue={tour?.title} placeholder="e.g. Bali Temples & Sunset Coast" required />
          </Field>
          <Field label="Destination" required error={errors.destination}>
            <Input name="destination" list="destination-options" defaultValue={tour?.destination} placeholder="e.g. Bali" required />
            <datalist id="destination-options">
              {DESTINATIONS.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
          <Field label="Tour type">
            <Select name="type" defaultValue={tour?.type ?? "custom"}>
              <option value="custom">Custom itinerary</option>
              <option value="fixed_departure">Fixed departure</option>
              <option value="private">Private tour</option>
              <option value="group">Group tour</option>
            </Select>
          </Field>
          <Field label="Duration (days)">
            <Input name="durationDays" type="number" min={1} defaultValue={tour?.durationDays ?? days.length} />
          </Field>
          <Field label="Duration (nights)">
            <Input name="durationNights" type="number" min={0} defaultValue={tour?.durationNights ?? Math.max(0, days.length - 1)} />
          </Field>
          <Field label="Adult price (৳)" required error={errors.adultPrice}>
            <Input name="adultPrice" type="number" min={0} step="500" defaultValue={tour?.adultPrice} placeholder="37900" required />
          </Field>
          <Field label="Child price (৳)" hint="Defaults to 65% of the adult price.">
            <Input name="childPrice" type="number" min={0} step="500" defaultValue={tour?.childPrice} placeholder="24635" />
          </Field>
          <Field label="Capacity per departure">
            <Input name="capacity" type="number" min={1} defaultValue={tour?.capacity ?? 20} />
          </Field>
          <Field label="Supplier">
            <Input name="supplier" defaultValue={tour?.supplier ?? "Own inventory"} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={tour?.status ?? defaultStatus}>
              <option value="active">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <label className="flex items-center gap-2 rounded-control border border-line px-3 py-2.5 text-[12px] text-slate-600 sm:col-span-2">
            <input type="checkbox" name="featured" defaultChecked={tour?.featured} className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30" />
            Feature this tour on the storefront and dashboard
          </label>
          <Field label="Short description" className="sm:col-span-2">
            <Textarea name="description" rows={3} defaultValue={tour?.description} placeholder="A short, sales-focused description of the experience, pace and inclusions." />
          </Field>
        </div>
      </section>

      <section className="space-y-3 border-t border-line pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-semibold text-ink">Day-by-day itinerary</h3>
            <p className="text-[11px] text-muted">Add each day with a title and a short description.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setDays((current) => [...current, { title: "", description: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add day
          </Button>
        </div>
        <div className="space-y-2">
          {days.map((day, index) => (
            <div key={index} className="rounded-control border border-line bg-slate-50/50 p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {index + 1}
                </span>
                <Input
                  name="dayTitle"
                  value={day.title}
                  onChange={(event) => updateDay(index, "title", event.target.value)}
                  placeholder={`Day ${index + 1} title`}
                  className="h-8 text-[12px]"
                />
                <button
                  type="button"
                  onClick={() => setDays((current) => current.filter((_, position) => position !== index))}
                  className="rounded-control p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger"
                  aria-label={`Remove day ${index + 1}`}
                  disabled={days.length <= 1}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                name="dayDescription"
                value={day.description}
                onChange={(event) => updateDay(index, "description", event.target.value)}
                rows={2}
                placeholder="What happens on this day?"
                className="mt-2 w-full resize-y rounded-control border border-line bg-white px-3 py-2 text-[12px] outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
        <Field label="Inclusions" hint="One per line. Shown on the quote and voucher.">
          <Textarea
            name="inclusions"
            rows={4}
            defaultValue={(tour?.inclusions ?? ["Accommodation with breakfast", "Airport transfers", "English-speaking guide", "Entrance fees", "Travel insurance"]).join("\n")}
          />
        </Field>
        <Field label="Exclusions" hint="One per line.">
          <Textarea
            name="exclusions"
            rows={4}
            defaultValue={(tour?.exclusions ?? ["International flights", "Visa fees", "Personal expenses", "Optional activities"]).join("\n")}
          />
        </Field>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        <Link href="/admin/tours">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {pending ? "Saving…" : tour ? "Save changes" : "Publish tour"}
        </Button>
      </div>
    </form>
  );
}
