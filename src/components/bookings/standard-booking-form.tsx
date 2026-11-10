"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Minus, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/field";
import { createBookingAction } from "@/app/admin/actions";
import type { BookingStatus, Customer } from "@/lib/types";
import { cn, formatMoney } from "@/lib/utils";

export interface StandardProduct {
  id: string;
  label: string;
  meta: string;
  unitPrice: number;
}

interface Props {
  service: "hotel" | "visa" | "hajj";
  serviceLabel: string;
  customers: Customer[];
  products: StandardProduct[];
  staff: string[];
  preselectedCustomerId?: string;
}

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function StandardBookingForm({ service, serviceLabel, customers, products, staff, preselectedCustomerId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [customerMode, setCustomerMode] = useState<"existing" | "new">(preselectedCustomerId ? "existing" : "existing");
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? customers[0]?.id ?? "");
  const [customerSearch, setCustomerSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [productSearch, setProductSearch] = useState("");
  const [unitPrice, setUnitPrice] = useState(products[0]?.unitPrice ?? 0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [startDate, setStartDate] = useState(localDate(7));
  const [endDate, setEndDate] = useState(localDate(10));
  const [discount, setDiscount] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [source, setSource] = useState("Direct Booking");
  const [assignedTo, setAssignedTo] = useState(staff[0] ?? "Unassigned");
  const [notes, setNotes] = useState("");

  const product = products.find((item) => item.id === productId);
  const customer = customers.find((item) => item.id === customerId);
  const travellers = adults + children;
  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((item) => `${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(term));
  }, [customers, customerSearch]);
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((item) => `${item.label} ${item.meta}`.toLowerCase().includes(term));
  }, [products, productSearch]);

  const subtotal = unitPrice * travellers;
  const safeDiscount = Math.min(Math.max(0, discount), subtotal);
  const tax = Math.round((subtotal - safeDiscount) * 0.05);
  const total = subtotal - safeDiscount + tax;
  const safeAdvance = Math.min(Math.max(0, advance), total);
  const due = total - safeAdvance;

  function pickProduct(id: string) {
    setProductId(id);
    const next = products.find((item) => item.id === id);
    if (next) setUnitPrice(next.unitPrice);
  }

  function submit() {
    if (customerMode === "existing" && !customer) return setError("Select a customer first.");
    if (customerMode === "new" && (!newCustomer.name.trim() || !newCustomer.phone.trim())) return setError("Enter the customer's name and phone.");
    if (!product) return setError("Select a service to book.");
    if (endDate < startDate) return setError("The end date cannot be before the start date.");
    if (total <= 0) return setError("The booking total must be greater than zero.");
    if (safeAdvance > total) return setError("The advance cannot exceed the total.");
    setError("");

    startTransition(async () => {
      const response = await createBookingAction({
        serviceType: service,
        title: product.label,
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
        paymentMethod: "Bank transfer",
        status,
        priority: "medium",
        source,
        assignedTo,
        notes,
      });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      router.push(`/admin/all-bookings/${response.bookingId}`);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        {error ? (
          <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12px] font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="card-surface p-5">
          <h2 className="text-[13px] font-semibold text-ink">1. Customer</h2>
          <div className="mt-3 flex gap-1 rounded-control border border-line p-0.5">
            {(["existing", "new"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCustomerMode(mode)}
                className={cn("flex-1 rounded-[6px] px-2.5 py-1.5 text-[11px] font-medium transition", customerMode === mode ? "bg-primary text-white" : "text-slate-500 hover:text-slate-700")}
              >
                {mode === "existing" ? "Existing customer" : "New customer"}
              </button>
            ))}
          </div>

          {customerMode === "existing" ? (
            <div className="mt-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} placeholder="Search customers…" className="input-base h-9 pl-8 text-[12px]" />
              </div>
              <div className="mt-2 max-h-[190px] space-y-0.5 overflow-y-auto rounded-control border border-line p-1">
                {filteredCustomers.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCustomerId(item.id)}
                    className={cn("flex w-full items-center justify-between gap-2 rounded-control px-2.5 py-1.5 text-left hover:bg-slate-50", item.id === customerId && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium text-ink">{item.name}</span>
                      <span className="block truncate text-[10px] text-muted">{item.phone} · {item.email}</span>
                    </span>
                    {item.id === customerId ? <span className="text-[10px] font-semibold text-primary">Selected</span> : null}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-base">Full name *</label>
                <Input value={newCustomer.name} onChange={(event) => setNewCustomer({ ...newCustomer, name: event.target.value })} />
              </div>
              <div>
                <label className="label-base">Phone *</label>
                <Input value={newCustomer.phone} onChange={(event) => setNewCustomer({ ...newCustomer, phone: event.target.value })} />
              </div>
              <div>
                <label className="label-base">Email</label>
                <Input type="email" value={newCustomer.email} onChange={(event) => setNewCustomer({ ...newCustomer, email: event.target.value })} />
              </div>
            </div>
          )}
        </div>

        <div className="card-surface p-5">
          <h2 className="text-[13px] font-semibold text-ink">2. Service &amp; dates</h2>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder={`Search ${serviceLabel.toLowerCase()}…`} className="input-base h-9 pl-8 text-[12px]" />
          </div>
          <div className="mt-2 max-h-[190px] space-y-0.5 overflow-y-auto rounded-control border border-line p-1">
            {filteredProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => pickProduct(item.id)}
                className={cn("flex w-full items-center justify-between gap-3 rounded-control px-2.5 py-2 text-left hover:bg-slate-50", item.id === productId && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-medium text-ink">{item.label}</span>
                  <span className="block truncate text-[10px] text-muted">{item.meta}</span>
                </span>
                <span className="shrink-0 text-[11px] font-semibold text-ink">{formatMoney(item.unitPrice, "BDT", 0)}</span>
              </button>
            ))}
            {!filteredProducts.length ? <p className="px-2 py-5 text-center text-[11.5px] text-muted">No matching records.</p> : null}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-base">Start date *</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div>
              <label className="label-base">End date *</label>
              <Input type="date" value={endDate} min={startDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-[13px] font-semibold text-ink">3. Travellers &amp; pricing</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-control border border-line p-3">
              <p className="text-[11.5px] font-medium text-ink">Travellers</p>
              <div className="mt-2 flex items-center justify-between">
                <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="flex h-7 w-7 items-center justify-center rounded-control border border-line hover:bg-slate-50" aria-label="Fewer adults">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-[13px] font-semibold">{adults} adult{adults === 1 ? "" : "s"}</span>
                <button type="button" onClick={() => setAdults(adults + 1)} className="flex h-7 w-7 items-center justify-center rounded-control border border-line hover:bg-slate-50" aria-label="More adults">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="flex h-7 w-7 items-center justify-center rounded-control border border-line hover:bg-slate-50" aria-label="Fewer children">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-[13px] font-semibold">{children} child{children === 1 ? "" : "ren"}</span>
                <button type="button" onClick={() => setChildren(children + 1)} className="flex h-7 w-7 items-center justify-center rounded-control border border-line hover:bg-slate-50" aria-label="More children">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-base">Unit price (৳) × {travellers} travellers</label>
                <Input type="number" min={0} step="100" value={unitPrice} onChange={(event) => setUnitPrice(Number(event.target.value) || 0)} />
              </div>
              <div>
                <label className="label-base">Discount (৳)</label>
                <Input type="number" min={0} step="500" value={discount || ""} onChange={(event) => setDiscount(Number(event.target.value) || 0)} placeholder="0" />
              </div>
            </div>
            <div>
              <label className="label-base">Advance collected (৳)</label>
              <Input
                type="number"
                min={0}
                max={total}
                step="500"
                value={advance || ""}
                onChange={(event) => setAdvance(Number(event.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="label-base">Status</label>
              <Select value={status} onChange={(event) => setStatus(event.target.value as BookingStatus)}>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="reserved">Reserved</option>
                <option value="confirmed">Confirmed</option>
                <option value="draft">Draft</option>
              </Select>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label-base">Source</label>
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
                {staff.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <label className="label-base">Internal notes</label>
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Supplier preferences, special handling, document notes…" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/admin/create-booking" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Change service
          </Link>
          <Button type="button" onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {pending ? "Creating booking…" : "Create booking"}
          </Button>
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-[80px] card-surface overflow-hidden">
          <div className="border-b border-line bg-gradient-to-br from-primary/[0.07] to-white px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">Booking summary</p>
            <p className="mt-1 text-[12.5px] font-semibold text-ink">{product?.label ?? "Select a service"}</p>
            <p className="text-[10.5px] text-muted">{product?.meta ?? serviceLabel}</p>
          </div>
          <div className="space-y-2 px-4 py-3 text-[11.5px]">
            <div className="flex justify-between"><span className="text-slate-500">Customer</span><span className="max-w-[170px] truncate text-right font-medium">{customerMode === "existing" ? customer?.name ?? "—" : newCustomer.name || "—"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Travellers</span><span className="font-medium">{travellers}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{formatMoney(subtotal, "BDT", 0)}</span></div>
            {safeDiscount > 0 ? <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-medium text-emerald-700">− {formatMoney(safeDiscount, "BDT", 0)}</span></div> : null}
            <div className="flex justify-between"><span className="text-slate-500">Tax (5%)</span><span className="font-medium">{formatMoney(tax, "BDT", 0)}</span></div>
            <div className="flex justify-between border-t border-line pt-2 text-[13px]"><span className="font-semibold text-ink">Total</span><span className="font-semibold text-ink">{formatMoney(total, "BDT", 0)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Advance</span><span className="font-medium text-emerald-700">{formatMoney(safeAdvance, "BDT", 0)}</span></div>
            <div className="flex justify-between rounded-control bg-amber-50 px-2 py-1.5"><span className="font-medium text-amber-800">Balance due</span><span className="font-semibold text-amber-800">{formatMoney(due, "BDT", 0)}</span></div>
          </div>
          <p className="border-t border-line px-4 py-2.5 text-[10px] leading-4 text-muted">An invoice is generated automatically for non-draft bookings.</p>
        </div>
      </aside>
    </div>
  );
}
