"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Printer,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { createBookingAction } from "@/app/admin/actions";
import type { Booking, BookingStatus, Customer, Tour } from "@/lib/types";
import { cn, formatMoney, titleCase } from "@/lib/utils";

interface WizardProps {
  customers: Customer[];
  tours: Tour[];
  staff: string[];
  preselectedCustomerId?: string;
  preselectedTourId?: string;
}

const STEPS = [
  { id: 1, label: "Customer & tour", hint: "Who is travelling, and what are they booking?" },
  { id: 2, label: "Travellers", hint: "Adults, children and special requirements" },
  { id: 3, label: "Schedule & options", hint: "Travel dates, add-ons and pickup" },
  { id: 4, label: "Pricing & payment", hint: "Discounts, tax and the payment schedule" },
  { id: 5, label: "Documents & notes", hint: "Checklist, internal notes and terms" },
  { id: 6, label: "Review & confirm", hint: "Final check before creating the booking" },
];

const ADDONS = [
  { id: "transfer", label: "Private airport transfer", price: 2500, per: "booking" },
  { id: "insurance", label: "Travel insurance", price: 1800, per: "traveller" },
  { id: "guide", label: "Dedicated private guide", price: 6500, per: "booking" },
  { id: "extra-night", label: "Extra hotel night", price: 7500, per: "booking" },
];

const DOCUMENTS = [
  { id: "passport", label: "Passport copy (valid 6+ months)" },
  { id: "photo", label: "Recent passport-size photo" },
  { id: "visa", label: "Visa application form" },
  { id: "insurance-doc", label: "Travel insurance certificate" },
  { id: "bank", label: "Bank statement (last 3 months)" },
];

const WAIVER = "I confirm traveller details are correct and the customer has accepted the deposit, cancellation and refund terms.";

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

function today() {
  return isoDate(new Date());
}

export function TourBookingWizard({ customers, tours, staff, preselectedCustomerId, preselectedTourId }: WizardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const defaultTour = tours.find((tour) => tour.id === preselectedTourId) ?? tours[0];
  const defaultStart = addDays(today(), 14);

  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [error, setError] = useState("");

  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    preselectedCustomerId ? "existing" : customers.length ? "existing" : "new",
  );
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? customers[0]?.id ?? "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });

  const [tourId, setTourId] = useState(defaultTour?.id ?? "");
  const [tourSearch, setTourSearch] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(addDays(defaultStart, defaultTour?.durationDays ?? 3));
  const [pickup, setPickup] = useState("Hazrat Shahjalal International Airport (DAC)");
  const [addons, setAddons] = useState<string[]>(["insurance"]);
  const [requests, setRequests] = useState("");

  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [advanceTouched, setAdvanceTouched] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [source, setSource] = useState("Direct Booking");
  const [assignedTo, setAssignedTo] = useState(staff[0] ?? "Unassigned");

  const [documents, setDocuments] = useState<string[]>(["passport", "photo"]);
  const [notes, setNotes] = useState("");
  const [waiver, setWaiver] = useState(false);

  const [result, setResult] = useState<{ bookingId: string; ref: string; total: number; paid: number; due: number } | null>(null);

  const tour = tours.find((item) => item.id === tourId);
  const customer = customers.find((item) => item.id === customerId);
  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((item) => `${item.name} ${item.phone} ${item.email} ${item.company ?? ""}`.toLowerCase().includes(term));
  }, [customers, customerSearch]);
  const filteredTours = useMemo(() => {
    const term = tourSearch.trim().toLowerCase();
    if (!term) return tours;
    return tours.filter((item) => `${item.title} ${item.destination} ${item.type}`.toLowerCase().includes(term));
  }, [tours, tourSearch]);

  const travellers = adults + children;
  const adultPrice = tour?.adultPrice ?? 0;
  const childPrice = tour?.childPrice ?? 0;
  const addonTotal = addons.reduce((sum, id) => {
    const addon = ADDONS.find((item) => item.id === id);
    if (!addon) return sum;
    return sum + (addon.per === "traveller" ? addon.price * travellers : addon.price);
  }, 0);
  const subtotal = adultPrice * adults + childPrice * children + addonTotal;
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const tax = Math.round((subtotal - safeDiscount) * 0.05);
  const total = subtotal - safeDiscount + tax;
  const safeAdvance = Math.min(Math.max(0, advance), total);
  const due = total - safeAdvance;

  const selectedDocs = DOCUMENTS.filter((doc) => documents.includes(doc.id)).map((doc) => doc.label);
  const selectedAddons = ADDONS.filter((addon) => addons.includes(addon.id)).map((addon) => addon.label);

  function toggle<T>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function selectTour(nextId: string) {
    setTourId(nextId);
    const next = tours.find((item) => item.id === nextId);
    if (next) setEndDate(addDays(startDate, next.durationDays));
  }

  function validate(target: number): string {
    if (target > 1) {
      if (!tour) return "Choose a tour package to continue.";
      if (customerMode === "existing" && !customer) return "Select a customer, or switch to a new customer.";
      if (customerMode === "new" && (!newCustomer.name.trim() || !newCustomer.phone.trim())) return "Enter the new customer's name and phone number.";
    }
    if (target > 2 && adults < 1) return "At least one adult traveller is required.";
    if (target > 3) {
      if (!startDate) return "Choose a departure date.";
      if (!endDate || endDate < startDate) return "The return date must be after the departure date.";
    }
    if (target > 4) {
      if (total <= 0) return "The booking total must be greater than zero.";
      if (advance > total) return "The advance cannot exceed the booking total.";
    }
    return "";
  }

  function goTo(target: number) {
    if (target > step) {
      const message = validate(target);
      if (message) {
        setError(message);
        return;
      }
    }
    if (step === 3 && target === 4 && !advanceTouched) {
      setAdvance(Math.round((total * 0.3) / 100) * 100);
    }
    if (step === 4 && target === 5 && !advanceTouched) {
      setAdvance(Math.round((total * 0.3) / 100) * 100);
    }
    setError("");
    setStep(Math.min(6, Math.max(1, target)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function confirm() {
    const message = validate(6);
    if (message) {
      setError(message);
      return;
    }
    if (!waiver) {
      setError("Please confirm the traveller and payment terms before creating the booking.");
      return;
    }
    setError("");

    const noteParts = [
      notes.trim(),
      selectedAddons.length ? `Add-ons: ${selectedAddons.join(", ")}.` : "",
      selectedDocs.length ? `Documents requested: ${selectedDocs.join(", ")}.` : "",
      requests.trim() ? `Special requests: ${requests.trim()}.` : "",
      `Pickup: ${pickup}.`,
      `Payment method: ${paymentMethod}.`,
    ].filter(Boolean);

    startTransition(async () => {
      const response = await createBookingAction({
        serviceType: "tour",
        title: tour?.title ?? "Tour booking",
        customerId: customerMode === "existing" ? customer?.id : undefined,
        customerName: customerMode === "new" ? newCustomer.name : undefined,
        customerPhone: customerMode === "new" ? newCustomer.phone : undefined,
        customerEmail: customerMode === "new" ? newCustomer.email : undefined,
        startDate,
        endDate,
        adults,
        children,
        subtotal,
        discount: safeDiscount,
        tax,
        advance: safeAdvance,
        paymentMethod,
        status,
        priority: "medium",
        source,
        assignedTo,
        notes: noteParts.join(" "),
      });

      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult({ bookingId: response.bookingId, ref: response.ref, total, paid: safeAdvance, due });
      setPhase("success");
      router.refresh();
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (phase === "success" && result) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="card-surface overflow-hidden">
          <div className="border-b border-line bg-gradient-to-br from-emerald-50 to-white px-6 py-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CircleCheck className="h-7 w-7" />
            </span>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink">Booking confirmed</h1>
            <p className="mt-1 text-sm text-muted">
              {result.ref} has been created for {customerMode === "existing" ? customer?.name : newCustomer.name}.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <Check className="h-3 w-3" /> Confirmation queued to customer email
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
            {[
              { label: "Booking total", value: formatMoney(result.total), tone: "text-ink" },
              { label: "Paid now", value: formatMoney(result.paid), tone: "text-emerald-700" },
              { label: "Balance due", value: formatMoney(result.due), tone: "text-amber-700" },
            ].map((item) => (
              <div key={item.label} className="px-4 py-4 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted">{item.label}</p>
                <p className={`mt-1 text-[14px] font-semibold ${item.tone}`}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 px-5 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Next steps</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Verify passport and visa documents",
                `Collect the balance of ${formatMoney(result.due)} before departure`,
                "Send supplier confirmation and travel voucher",
                "Assign a tour leader and share the emergency contact",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-control bg-slate-50 px-3 py-2 text-[11.5px] text-slate-600">
                  <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-slate-50/70 px-5 py-3">
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print voucher
            </Button>
            <Link href={`/admin/all-bookings/${result.bookingId}`}>
              <Button type="button" variant="outline" size="sm">
                Record a payment
              </Button>
            </Link>
            <Link href={`/admin/all-bookings/${result.bookingId}`}>
              <Button type="button" size="sm">
                View booking <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
          <p>Need to book another service for this customer?</p>
          <button
            onClick={() => {
              setPhase("form");
              setStep(1);
              setResult(null);
              setWaiver(false);
            }}
            className="font-semibold text-primary hover:underline"
          >
            Start another booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-4">
        <div className="card-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium text-muted">Step {step} of 6</p>
              <p className="text-[13px] font-semibold text-ink">{STEPS[step - 1].label}</p>
              <p className="mt-0.5 text-[11px] text-muted">{STEPS[step - 1].hint}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10.5px] font-semibold text-primary sm:inline-flex">
              <Sparkles className="h-3 w-3" /> Guided booking
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${(step / 6) * 100}%` }} />
          </div>

          <div className="mt-4 hidden items-start justify-between gap-1 lg:flex">
            {STEPS.map((item) => {
              const done = step > item.id;
              const active = step === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => (done ? goTo(item.id) : undefined)}
                  disabled={!done}
                  className={cn("flex flex-1 flex-col items-center gap-1.5 text-center", done && "cursor-pointer")}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                      done && "border-primary bg-primary text-white",
                      active && "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                      !done && !active && "border-line bg-white text-slate-400",
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : item.id}
                  </span>
                  <span className={cn("text-[10px] leading-3", active ? "font-semibold text-primary" : done ? "text-slate-600" : "text-slate-400")}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div role="alert" className="flex items-start gap-2 rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-200 text-[10px] font-bold text-red-700">!</span>
            {error}
          </div>
        ) : null}

        <div className="card-surface p-5">
          {step === 1 ? (
            <div className="space-y-5">
              <section>
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-ink">Tour package</h3>
                  {tour ? <span className="text-[10.5px] text-muted">{tour.durationDays} days · {tour.destination}</span> : null}
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={tourSearch}
                    onChange={(event) => setTourSearch(event.target.value)}
                    placeholder="Search tours by name or destination…"
                    className="input-base h-9 pl-8 text-[12px]"
                  />
                </div>
                <div className="mt-2 max-h-[240px] space-y-1 overflow-y-auto rounded-control border border-line p-1">
                  {filteredTours.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => selectTour(item.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-control px-2.5 py-2 text-left transition hover:bg-slate-50",
                        item.id === tourId && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20",
                      )}
                    >
                      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500", item.id === tourId && "bg-primary/15 text-primary")}>
                        <MapPin className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-ink">{item.title}</span>
                        <span className="block text-[10px] text-muted">{item.destination} · {item.durationDays}D/{item.durationNights}N · {titleCase(item.type)}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[11.5px] font-semibold text-ink">{formatMoney(item.adultPrice, "BDT", 0)}</span>
                        <span className="block text-[9px] text-muted">per adult</span>
                      </span>
                      {item.id === tourId ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
                    </button>
                  ))}
                  {!filteredTours.length ? <p className="px-2 py-6 text-center text-[11.5px] text-muted">No tours match that search.</p> : null}
                </div>
              </section>

              <section className="border-t border-line pt-5">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-ink">Customer</h3>
                  <div className="inline-flex rounded-control border border-line p-0.5">
                    {(["existing", "new"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setCustomerMode(mode)}
                        className={cn(
                          "rounded-[6px] px-2.5 py-1 text-[10.5px] font-medium transition",
                          customerMode === mode ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700",
                        )}
                      >
                        {mode === "existing" ? "Existing customer" : "New customer"}
                      </button>
                    ))}
                  </div>
                </div>

                {customerMode === "existing" ? (
                  <>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        value={customerSearch}
                        onChange={(event) => setCustomerSearch(event.target.value)}
                        placeholder="Search name, phone or email…"
                        className="input-base h-9 pl-8 text-[12px]"
                      />
                    </div>
                    <div className="mt-2 max-h-[180px] space-y-0.5 overflow-y-auto rounded-control border border-line p-1">
                      {filteredCustomers.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCustomerId(item.id)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-control px-2.5 py-1.5 text-left hover:bg-slate-50",
                            item.id === customerId && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[12px] font-medium text-ink">{item.name}</span>
                            <span className="block truncate text-[10px] text-muted">{item.phone} · {item.email}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            {item.tags.includes("VIP") ? <span className="rounded-full bg-amber-50 px-1.5 text-[9px] font-semibold text-amber-700">VIP</span> : null}
                            {item.id === customerId ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                          </span>
                        </button>
                      ))}
                      {!filteredCustomers.length ? <p className="px-2 py-5 text-center text-[11.5px] text-muted">No customers match that search.</p> : null}
                    </div>
                    {customer ? (
                      <div className="mt-2 flex items-center gap-2 rounded-control bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-ink">{customer.name}</span>
                        <span className="text-slate-300">·</span>
                        <span>{customer.phone}</span>
                        {customer.company ? <><span className="text-slate-300">·</span><span className="truncate">{customer.company}</span></> : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="label-base">Full name *</label>
                      <Input value={newCustomer.name} onChange={(event) => setNewCustomer({ ...newCustomer, name: event.target.value })} placeholder="e.g. Neyamul Kobir" />
                    </div>
                    <div>
                      <label className="label-base">Phone *</label>
                      <Input value={newCustomer.phone} onChange={(event) => setNewCustomer({ ...newCustomer, phone: event.target.value })} placeholder="+880 17xx xxx xxx" />
                    </div>
                    <div>
                      <label className="label-base">Email</label>
                      <Input type="email" value={newCustomer.email} onChange={(event) => setNewCustomer({ ...newCustomer, email: event.target.value })} placeholder="name@example.com" />
                    </div>
                    <p className="text-[10.5px] leading-4 text-muted sm:col-span-2">
                      A customer profile will be created automatically when the booking is confirmed.
                    </p>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Who is travelling?</h3>
                <p className="mt-0.5 text-[11px] text-muted">Children are priced at {formatMoney(tour?.childPrice ?? 0, "BDT", 0)} and must be aged 2–11 at departure.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Adults", hint: "Age 12+", value: adults, set: setAdults, min: 1 },
                  { label: "Children", hint: "Age 2–11", value: children, set: setChildren, min: 0 },
                ].map((item) => (
                  <div key={item.label} className="rounded-control border border-line p-4">
                    <p className="text-[12px] font-medium text-ink">{item.label}</p>
                    <p className="text-[10.5px] text-muted">{item.hint}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => item.set(Math.max(item.min, item.value - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-control border border-line text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                        disabled={item.value <= item.min}
                        aria-label={`Decrease ${item.label}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-xl font-semibold tabular-nums text-ink">{item.value}</span>
                      <button
                        type="button"
                        onClick={() => item.set(item.value + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-control border border-line text-slate-600 hover:bg-slate-50"
                        aria-label={`Increase ${item.label}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-control bg-primary/[0.04] px-3.5 py-3 text-[11.5px] text-slate-600">
                <span className="font-semibold text-ink">{travellers} traveller{travellers === 1 ? "" : "s"}</span> · {adults} adult{adults === 1 ? "" : "s"} · {children} child{children === 1 ? "" : "ren"}
                <span className="ml-2 text-slate-400">Seats remaining: {Math.max(0, (tour?.capacity ?? 0) - travellers)}</span>
              </div>
              <div>
                <label className="label-base">Special requirements</label>
                <Textarea
                  value={requests}
                  onChange={(event) => setRequests(event.target.value)}
                  placeholder="Dietary needs, mobility assistance, room preferences, celebrations…"
                  rows={3}
                />
                <p className="mt-1 text-[10.5px] text-muted">Shared with operations and the supplier. Stored on the booking record.</p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              {tour ? (
                <div className="flex items-center gap-3 rounded-control bg-slate-50 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary/10 text-primary">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium text-ink">{tour.title}</p>
                    <p className="text-[10.5px] text-muted">{tour.destination} · {tour.durationDays} days / {tour.durationNights} nights</p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-base">Departure date *</label>
                  <Input
                    type="date"
                    value={startDate}
                    min={today()}
                    onChange={(event) => {
                      const value = event.target.value;
                      setStartDate(value);
                      setEndDate(addDays(value, tour?.durationDays ?? 3));
                    }}
                  />
                </div>
                <div>
                  <label className="label-base">Return date *</label>
                  <Input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} />
                </div>
              </div>

              <div>
                <label className="label-base">Pickup / meeting point</label>
                <Select value={pickup} onChange={(event) => setPickup(event.target.value)}>
                  <option>Hazrat Shahjalal International Airport (DAC)</option>
                  <option>Dhaka office — Banani</option>
                  <option>Destination airport</option>
                  <option>Customer address</option>
                  <option>No pickup required</option>
                </Select>
              </div>

              <div>
                <p className="label-base">Optional extras</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ADDONS.map((addon) => {
                    const checked = addons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-control border p-3 transition",
                          checked ? "border-primary/30 bg-primary/[0.03]" : "border-line hover:bg-slate-50",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setAddons((current) => toggle(current, addon.id))}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11.5px] font-medium text-ink">{addon.label}</span>
                          <span className="block text-[10px] text-muted">
                            {formatMoney(addon.price, "BDT", 0)} {addon.per === "traveller" ? "per traveller" : "per booking"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-base">Adult price (৳)</label>
                  <Input value={adultPrice.toLocaleString()} readOnly className="bg-slate-50" />
                </div>
                <div>
                  <label className="label-base">Child price (৳)</label>
                  <Input value={childPrice.toLocaleString()} readOnly className="bg-slate-50" />
                </div>
              </div>

              <div className="rounded-control border border-line p-3.5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Price build-up</p>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-slate-500">{adults} adult × {formatMoney(adultPrice, "BDT", 0)}</span><span className="font-medium">{formatMoney(adultPrice * adults, "BDT", 0)}</span></div>
                  {children > 0 ? <div className="flex justify-between"><span className="text-slate-500">{children} child × {formatMoney(childPrice, "BDT", 0)}</span><span className="font-medium">{formatMoney(childPrice * children, "BDT", 0)}</span></div> : null}
                  {addonTotal > 0 ? <div className="flex justify-between"><span className="text-slate-500">Optional extras</span><span className="font-medium">{formatMoney(addonTotal, "BDT", 0)}</span></div> : null}
                  <div className="flex justify-between border-t border-line pt-1.5"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatMoney(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Tax (5%)</span><span className="font-medium">{formatMoney(tax)}</span></div>
                  <div className="flex justify-between border-t border-line pt-1.5 text-[13px]"><span className="font-semibold text-ink">Total</span><span className="font-semibold text-ink">{formatMoney(total)}</span></div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label-base">Discount (৳)</label>
                  <Input
                    type="number"
                    min={0}
                    max={subtotal}
                    step="500"
                    value={discount || ""}
                    onChange={(event) => setDiscount(Number(event.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label-base">Advance / deposit (৳)</label>
                  <Input
                    type="number"
                    min={0}
                    max={total}
                    step="500"
                    value={advance || ""}
                    onChange={(event) => {
                      setAdvance(Number(event.target.value) || 0);
                      setAdvanceTouched(true);
                    }}
                    placeholder="0"
                  />
                  <div className="mt-1.5 flex gap-1">
                    {[30, 50, 100].map((percentValue) => (
                      <button
                        key={percentValue}
                        type="button"
                        onClick={() => {
                          setAdvance(Math.round((total * percentValue) / 100 / 100) * 100);
                          setAdvanceTouched(true);
                        }}
                        className="rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:border-primary/30 hover:text-primary"
                      >
                        {percentValue}%
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-base">Payment method</label>
                  <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    <option>Bank transfer</option>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>bKash</option>
                    <option>Nagad</option>
                    <option>Cheque</option>
                    <option>Pay later</option>
                  </Select>
                </div>
                <div>
                  <label className="label-base">Booking status</label>
                  <Select value={status} onChange={(event) => setStatus(event.target.value as BookingStatus)}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="reserved">Reserved</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="draft">Draft</option>
                  </Select>
                </div>
                <div>
                  <label className="label-base">Booking source</label>
                  <Select value={source} onChange={(event) => setSource(event.target.value)}>
                    <option>Direct Booking</option>
                    <option>Website</option>
                    <option>Phone</option>
                    <option>Agent</option>
                    <option>Walk In</option>
                  </Select>
                </div>
                <div>
                  <label className="label-base">Assigned staff</label>
                  <Select value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)}>
                    {staff.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-control bg-slate-50 px-3.5 py-3 text-[12px]">
                <span className="text-slate-500">Balance due after advance</span>
                <span className="text-base font-semibold text-ink">{formatMoney(due)}</span>
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Document checklist</h3>
                <p className="mt-0.5 text-[11px] text-muted">Select what the customer needs to provide. This is attached to the booking notes.</p>
                <div className="mt-3 space-y-1.5">
                  {DOCUMENTS.map((doc) => {
                    const checked = documents.includes(doc.id);
                    return (
                      <label key={doc.id} className={cn("flex cursor-pointer items-center gap-2.5 rounded-control border px-3 py-2.5 text-[11.5px]", checked ? "border-primary/30 bg-primary/[0.03] text-ink" : "border-line text-slate-600 hover:bg-slate-50")}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setDocuments((current) => toggle(current, doc.id))}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
                        />
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {doc.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-line pt-5">
                <label className="label-base">Internal notes</label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Anything the operations team should know before departure…"
                  rows={4}
                />
              </div>

              <label className="flex items-start gap-2.5 rounded-control bg-slate-50 p-3.5 text-[11.5px] leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={waiver}
                  onChange={(event) => setWaiver(event.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30"
                />
                <span>{WAIVER}</span>
              </label>
            </div>
          ) : null}

          {step === 6 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-[13px] font-semibold text-ink">Review the booking</h3>
                <p className="mt-0.5 text-[11px] text-muted">Everything is editable — use the section links to go back.</p>
              </div>
              {[
                {
                  title: "Customer & tour",
                  step: 1,
                  rows: [
                    ["Customer", customerMode === "existing" ? customer?.name ?? "Not selected" : newCustomer.name || "Not entered"],
                    ["Contact", customerMode === "existing" ? `${customer?.phone ?? ""} · ${customer?.email ?? ""}` : `${newCustomer.phone} · ${newCustomer.email || "no email"}`],
                    ["Tour", tour?.title ?? "Not selected"],
                    ["Destination", tour?.destination ?? "—"],
                  ],
                },
                {
                  title: "Travellers & schedule",
                  step: 2,
                  rows: [
                    ["Travellers", `${adults} adults, ${children} children`],
                    ["Departure", `${startDate} → ${endDate}`],
                    ["Pickup", pickup],
                    ["Extras", selectedAddons.length ? selectedAddons.join(", ") : "None"],
                  ],
                },
                {
                  title: "Pricing & documents",
                  step: 4,
                  rows: [
                    ["Subtotal", formatMoney(subtotal)],
                    ["Discount / tax", `${formatMoney(safeDiscount)} / ${formatMoney(tax)}`],
                    ["Total", formatMoney(total)],
                    ["Advance", `${formatMoney(safeAdvance)} · ${paymentMethod}`],
                    ["Documents", selectedDocs.length ? `${selectedDocs.length} requested` : "None requested"],
                  ],
                },
              ].map((section) => (
                <div key={section.title} className="rounded-control border border-line">
                  <div className="flex items-center justify-between border-b border-line bg-slate-50/70 px-3.5 py-2">
                    <p className="text-[11.5px] font-semibold text-ink">{section.title}</p>
                    <button type="button" onClick={() => goTo(section.step)} className="text-[10.5px] font-medium text-primary hover:underline">
                      Edit
                    </button>
                  </div>
                  <div className="grid gap-x-4 gap-y-2 p-3.5 sm:grid-cols-2">
                    {section.rows.map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-2 text-[11px]">
                        <span className="shrink-0 text-slate-500">{label}</span>
                        <span className="truncate text-right font-medium text-slate-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {notes ? (
                <div className="rounded-control bg-slate-50 px-3.5 py-2.5 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Notes: </span>{notes}
                </div>
              ) : null}
              <div className="flex items-center gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[11.5px] font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Ready to create {formatMoney(total)} booking with {formatMoney(safeAdvance)} collected.
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-line pt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => goTo(step - 1)} disabled={step === 1}>
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden text-[10.5px] text-muted sm:block">Your progress is kept while you move between steps.</span>
              {step < 6 ? (
                <Button type="button" size="sm" onClick={() => goTo(step + 1)}>
                  Continue <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={confirm} disabled={pending}>
                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {pending ? "Creating booking…" : "Confirm booking"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-[80px] space-y-3">
          <div className="card-surface overflow-hidden">
            <div className="border-b border-line bg-gradient-to-br from-primary/[0.07] to-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Booking summary</p>
              <p className="mt-1 text-[12.5px] font-semibold text-ink">{tour?.title ?? "Select a tour"}</p>
              <p className="text-[10.5px] text-muted">
                {tour ? `${tour.destination} · ${tour.durationDays} days` : "No package selected"}
              </p>
            </div>
            <div className="space-y-2.5 px-4 py-3 text-[11.5px]">
              <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="max-w-[180px] truncate font-medium text-right">{customerMode === "existing" ? customer?.name ?? "—" : newCustomer.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Travellers</span><span className="font-medium">{adults} + {children}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Dates</span><span className="font-medium">{startDate.slice(5)} → {endDate.slice(5)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatMoney(subtotal, "BDT", 0)}</span></div>
              {safeDiscount > 0 ? <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium text-emerald-700">− {formatMoney(safeDiscount, "BDT", 0)}</span></div> : null}
              <div className="flex justify-between"><span className="text-slate-500">Tax (5%)</span><span className="font-medium">{formatMoney(tax, "BDT", 0)}</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-[13px]"><span className="font-semibold text-ink">Total</span><span className="font-semibold text-ink">{formatMoney(total, "BDT", 0)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Advance</span><span className="font-medium text-emerald-700">{formatMoney(safeAdvance, "BDT", 0)}</span></div>
              <div className="flex justify-between rounded-control bg-amber-50 px-2 py-1.5"><span className="font-medium text-amber-800">Balance due</span><span className="font-semibold text-amber-800">{formatMoney(due, "BDT", 0)}</span></div>
            </div>
            <div className="border-t border-line px-4 py-3 text-[10px] leading-4 text-muted">
              <CreditCard className="mb-1 h-3 w-3 text-slate-400" />
              A confirmation email and invoice are generated automatically when you confirm.
            </div>
          </div>

          <div className="rounded-card border border-dashed border-slate-300 bg-white/60 p-3">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-600">
              <CalendarDays className="h-3.5 w-3.5 text-primary" /> Departure in {Math.max(0, Math.ceil((new Date(startDate).getTime() - Date.now()) / 86_400_000))} days
            </p>
            <p className="mt-1 text-[10px] leading-4 text-muted">Seats are held when the booking status is confirmed or reserved.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
