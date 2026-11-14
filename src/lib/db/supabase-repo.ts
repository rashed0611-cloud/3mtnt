import { randomUUID } from "node:crypto";
import { buildSeedData } from "@/lib/seed-data";
import { normalizeSettings } from "@/lib/settings-defaults";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type {
  Activity,
  Agent,
  AppSettings,
  Booking,
  BookingInput,
  Customer,
  Database,
  HajjPackage,
  Hotel,
  Invoice,
  Lead,
  LeadStatus,
  SiteAppearance,
  Supplier,
  Task,
  TaskStatus,
  Tour,
  VisaPackage,
} from "@/lib/types";
import type { Repository } from "@/lib/db/types";

type Json = Record<string, unknown>;

export function camelize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelize);
  if (value && typeof value === "object") {
    const out: Json = {};
    for (const [key, val] of Object.entries(value as Json)) {
      out[key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())] = camelize(val);
    }
    return out;
  }
  return value;
}

export function snakeize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(snakeize);
  if (value && typeof value === "object") {
    const out: Json = {};
    for (const [key, val] of Object.entries(value as Json)) {
      out[key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = snakeize(val);
    }
    return out;
  }
  return value;
}

function now() {
  return new Date().toISOString();
}

async function retry<T>(task: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }
  throw lastError;
}

function sequence(rows: { code?: string }[]) {
  let max = 0;
  for (const row of rows) {
    const match = row.code?.match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

export class SupabaseRepository implements Repository {
  private client = createSupabaseAdminClient();
  private databaseCache: { at: number; promise: Promise<Database> } | null = null;

  private async select<T>(table: string): Promise<T[]> {
    return retry(async () => {
      const { data, error } = await this.client.from(table).select("*");
      if (error) throw new Error(`${table}: ${error.message}`);
      return (data ?? []).map((row) => camelize(row) as T);
    });
  }

  private async insert<T>(table: string, row: Json): Promise<T> {
    return retry(async () => {
      const { data, error } = await this.client.from(table).insert(snakeize(row)).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return camelize(data) as T;
    });
  }

  private async upsert<T>(table: string, row: Json, onConflict = "id"): Promise<T> {
    return retry(async () => {
      const { data, error } = await this.client.from(table).upsert(snakeize(row), { onConflict }).select("*").single();
      if (error) throw new Error(`${table}: ${error.message}`);
      return camelize(data) as T;
    });
  }

  private async log(action: string, module: string, description: string, severity: Activity["severity"] = "info") {
    await retry(async () => {
      await this.client.from("activities").insert({
        id: `act_${randomUUID()}`,
        actor: "Administrator",
        action,
        module,
        severity,
        description,
        createdAt: now(),
      });
    });
  }

  getDatabase(): Promise<Database> {
    // Layouts and pages often request the same snapshot within one render.
    // A short-lived cache avoids duplicate query bursts against Supabase.
    const now = Date.now();
    if (this.databaseCache && now - this.databaseCache.at < 2000) {
      return this.databaseCache.promise;
    }
    const promise = this.loadDatabase();
    this.databaseCache = { at: now, promise };
    return promise;
  }

  private async loadDatabase(): Promise<Database> {
    // Small waves keep the number of concurrent connections predictable while
    // still loading the whole snapshot quickly.
    const [customers, tours, hotels, settings] = await Promise.all([
      this.select<Customer>("customers"),
      this.select<Tour>("tours"),
      this.select<Hotel>("hotels"),
      this.getSettings(),
    ]);
    const [visas, hajjPackages, bookings, invoices] = await Promise.all([
      this.select<VisaPackage>("visa_packages"),
      this.select<HajjPackage>("hajj_packages"),
      this.select<Booking>("bookings"),
      this.select<Invoice>("invoices"),
    ]);
    const [leads, tasks, activities, suppliers] = await Promise.all([
      this.select<Lead>("leads"),
      this.select<Task>("tasks"),
      this.select<Activity>("activities"),
      this.select<Supplier>("suppliers"),
    ]);
    const [agents] = await Promise.all([this.select<Agent>("agents")]);
    return { customers, tours, hotels, visas, hajjPackages, bookings, invoices, leads, tasks, activities, suppliers, agents, settings };
  }

  async getCustomers() {
    const rows = await this.select<Customer>("customers");
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getCustomer(id: string) {
    const { data, error } = await this.client.from("customers").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as Customer) : null;
  }

  async createCustomer(input: Partial<Customer>) {
    const rows = await this.select<Customer>("customers");
    const number = sequence(rows);
    const customer: Customer = {
      id: `cus_${randomUUID()}`,
      code: `CUS-${String(number).padStart(6, "0")}`,
      name: input.name?.trim() || "Unnamed customer",
      company: input.company?.trim() || undefined,
      email: input.email?.trim() || "",
      phone: input.phone?.trim() || "",
      nationality: input.nationality?.trim() || "Bangladeshi",
      status: input.status ?? "active",
      tags: input.tags ?? [],
      assignedTo: input.assignedTo?.trim() || "Unassigned",
      notes: input.notes?.trim() || undefined,
      createdAt: now(),
    };
    const created = await this.insert<Customer>("customers", customer as unknown as Json);
    await this.log("Customer Created", "Customers", `${created.code} · ${created.name} added to the customer list`);
    return created;
  }

  async updateCustomer(id: string, input: Partial<Customer>) {
    const { data, error } = await this.client.from("customers").update(snakeize(input)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as Customer) : null;
  }

  async getTours() {
    const rows = await this.select<Tour>("tours");
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createTour(input: Partial<Tour>) {
    const rows = await this.select<Tour>("tours");
    const number = sequence(rows);
    const title = input.title?.trim() || "Untitled tour";
    const tour: Tour = {
      id: `tour_${randomUUID()}`,
      code: `TOUR-${String(number).padStart(3, "0")}`,
      title,
      slug: input.slug?.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      destination: input.destination?.trim() || "Unassigned",
      type: input.type ?? "custom",
      durationDays: input.durationDays ?? 3,
      durationNights: input.durationNights ?? 2,
      adultPrice: input.adultPrice ?? 0,
      childPrice: input.childPrice ?? Math.round((input.adultPrice ?? 0) * 0.65),
      currency: input.currency ?? "BDT",
      capacity: input.capacity ?? 20,
      status: input.status ?? "active",
      featured: input.featured ?? false,
      supplier: input.supplier?.trim() || "Own inventory",
      description: input.description?.trim() || "",
      inclusions: input.inclusions ?? ["Accommodation with breakfast", "Airport transfers"],
      exclusions: input.exclusions ?? ["International flights", "Visa fees", "Personal expenses"],
      itinerary: input.itinerary ?? [],
      createdAt: now(),
    };
    const created = await this.insert<Tour>("tours", tour as unknown as Json);
    await this.log("Tour Created", "Tour Package", `${created.code} · ${created.title} published`);
    return created;
  }

  async updateTour(id: string, input: Partial<Tour>) {
    const { data, error } = await this.client.from("tours").update(snakeize(input)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as Tour) : null;
  }

  async getHotels() {
    return this.select<Hotel>("hotels");
  }

  async createHotel(input: Partial<Hotel>) {
    const name = input.name?.trim() || "Untitled property";
    const hotel: Hotel = {
      id: `hotel_${randomUUID()}`,
      name,
      slug: input.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      location: input.location?.trim() || "Unassigned",
      starRating: input.starRating ?? 3,
      price: input.price ?? 0,
      currency: input.currency ?? "BDT",
      rooms: input.rooms ?? 10,
      status: input.status ?? "draft",
      featured: input.featured ?? false,
      description: input.description?.trim() || "",
      amenities: input.amenities ?? ["Free Wi-Fi", "Breakfast"],
      supplier: input.supplier?.trim() || "Own inventory",
    };
    const created = await this.insert<Hotel>("hotels", hotel as unknown as Json);
    await this.log("Hotel Created", "Hotel", `${hotel.name} added to hotel inventory`);
    return created;
  }

  async updateHotel(id: string, input: Partial<Hotel>) {
    const { data, error } = await this.client.from("hotels").update(snakeize(input)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as Hotel) : null;
  }

  async getVisas() {
    return this.select<VisaPackage>("visa_packages");
  }

  async createVisa(input: Partial<VisaPackage>) {
    const visa: VisaPackage = {
      id: `visa_${randomUUID()}`,
      country: input.country?.trim() || "Unassigned",
      visaType: input.visaType?.trim() || "Tourist visa",
      processingTime: input.processingTime?.trim() || "5–7 working days",
      price: input.price ?? 0,
      currency: input.currency ?? "BDT",
      status: input.status ?? "draft",
      requiredDocuments: input.requiredDocuments ?? ["Passport copy", "Photo"],
      description: input.description?.trim() || "",
    };
    const created = await this.insert<VisaPackage>("visa_packages", visa as unknown as Json);
    await this.log("Visa Product Created", "Visa Processing", `${visa.country} · ${visa.visaType} added`);
    return created;
  }

  async updateVisa(id: string, input: Partial<VisaPackage>) {
    const { data, error } = await this.client.from("visa_packages").update(snakeize(input)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as VisaPackage) : null;
  }

  async getHajjPackages() {
    return this.select<HajjPackage>("hajj_packages");
  }

  async createHajjPackage(input: Partial<HajjPackage>) {
    const pkg: HajjPackage = {
      id: `hajj_${randomUUID()}`,
      title: input.title?.trim() || "Untitled pilgrimage package",
      kind: input.kind ?? "umrah",
      tier: input.tier?.trim() || "Standard",
      departureDate: input.departureDate ?? now().slice(0, 10),
      returnDate: input.returnDate ?? now().slice(0, 10),
      price: input.price ?? 0,
      currency: input.currency ?? "BDT",
      capacity: input.capacity ?? 20,
      booked: input.booked ?? 0,
      status: input.status ?? "draft",
    };
    const created = await this.insert<HajjPackage>("hajj_packages", pkg as unknown as Json);
    await this.log("Pilgrimage Package Created", "Hajj & Umrah", `${pkg.title} added to the pilgrimage catalogue`);
    return created;
  }

  async updateHajjPackage(id: string, input: Partial<HajjPackage>) {
    const { data, error } = await this.client.from("hajj_packages").update(snakeize(input)).eq("id", id).select("*").maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as HajjPackage) : null;
  }

  async getBookings() {
    const rows = await this.select<Booking>("bookings");
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getBooking(id: string) {
    const { data, error } = await this.client.from("bookings").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? (camelize(data) as Booking) : null;
  }

  async createBooking(input: BookingInput) {
    let customer =
      (input.customerId ? await this.getCustomer(input.customerId) : null) ??
      (await this.getCustomers()).find((c) => c.name.toLowerCase() === (input.customerName ?? "").toLowerCase());

    if (!customer && input.customerName) {
      customer = await this.createCustomer({
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
        assignedTo: input.assignedTo,
      });
    }
    if (!customer) throw new Error("A customer is required to create a booking.");

    const rows = await this.select<Booking>("bookings");
    const prefix = input.serviceType === "tour" ? "TB" : input.serviceType === "hotel" ? "HB" : input.serviceType === "visa" ? "VB" : "HU";
    const ref = `${prefix}-${String(rows.filter((b) => b.ref.startsWith(prefix)).length + 1).padStart(6, "0")}`;
    const subtotal = Math.max(0, input.subtotal);
    const discount = Math.max(0, Math.min(input.discount, subtotal));
    const tax = Math.max(0, input.tax);
    const total = subtotal - discount + tax;
    const paid = Math.max(0, Math.min(input.advance, total));
    const due = total - paid;
    const createdAt = now();

    const booking: Booking = {
      id: `bk_${randomUUID()}`,
      ref,
      serviceType: input.serviceType,
      title: input.title,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      startDate: input.startDate,
      endDate: input.endDate,
      travelers: input.adults + input.children,
      adults: input.adults,
      children: input.children,
      subtotal,
      discount,
      tax,
      total,
      paid,
      due,
      currency: "BDT",
      paymentStatus: paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial",
      status: input.status,
      assignedTo: input.assignedTo || "Unassigned",
      source: input.source,
      notes: input.notes,
      createdAt,
      timeline: [
        { at: createdAt, label: "Booking created", note: `${ref} created in the admin workspace` },
        { at: createdAt, label: `Status set to ${input.status.replace(/_/g, " ")}` },
      ],
    };

    const created = await this.insert<Booking>("bookings", booking as unknown as Json);

    if (input.status !== "draft") {
      const invoice: Invoice = {
        id: `inv_${randomUUID()}`,
        number: `INV-2026-${String(rows.length + 1).padStart(5, "0")}`,
        bookingRef: ref,
        customerName: customer.name,
        issueDate: createdAt.slice(0, 10),
        dueDate: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
        total,
        paid,
        due,
        status: due <= 0 ? "paid" : paid > 0 ? "partial" : "sent",
        type: `${input.serviceType[0].toUpperCase()}${input.serviceType.slice(1)} booking`,
        currency: "BDT",
      };
      await this.insert<Invoice>("invoices", invoice as unknown as Json);
    }

    await this.log("Booking Created", "Booking", `${ref} created for ${customer.name}`);
    return created;
  }

  async updateBookingStatus(id: string, status: Booking["status"]) {
    const booking = await this.getBooking(id);
    if (!booking) return;
    const timeline = [...booking.timeline, { at: now(), label: `Status set to ${status.replace(/_/g, " ")}` }];
    await this.client.from("bookings").update({ status, timeline }).eq("id", id);
    await this.log("Status Updated", "Booking", `${booking.ref} moved to ${status.replace(/_/g, " ")}`);
  }

  async addBookingPayment(id: string, amount: number) {
    const booking = await this.getBooking(id);
    if (!booking) return;
    const paid = Math.min(booking.total, booking.paid + Math.max(0, amount));
    const due = booking.total - paid;
    const paymentStatus = paid <= 0 ? "unpaid" : paid >= booking.total ? "paid" : "partial";
    const timeline = [...booking.timeline, { at: now(), label: "Payment recorded", note: String(amount) }];
    await this.client.from("bookings").update({ paid, due, payment_status: paymentStatus, timeline }).eq("id", id);
    const invoice = (await this.select<Invoice>("invoices")).find((i) => i.bookingRef === booking.ref);
    if (invoice) {
      await this.client
        .from("invoices")
        .update({ paid, due, status: due <= 0 ? "paid" : paid > 0 ? "partial" : invoice.status })
        .eq("id", invoice.id);
    }
    await this.log("Payment Recorded", "Finance", `Payment of ${amount} recorded on ${booking.ref}`);
  }

  async getInvoices() {
    const rows = await this.select<Invoice>("invoices");
    return rows.sort((a, b) => b.number.localeCompare(a.number));
  }

  async getLeads() {
    const rows = await this.select<Lead>("leads");
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createLead(input: Partial<Lead>) {
    const lead: Lead = {
      id: `lead_${randomUUID()}`,
      name: input.name?.trim() || "Unnamed lead",
      company: input.company?.trim() || undefined,
      phone: input.phone?.trim() || "",
      email: input.email?.trim() || "",
      source: input.source ?? "website",
      requirement: input.requirement?.trim() || "",
      assignedTo: input.assignedTo?.trim() || "Unassigned",
      priority: input.priority ?? "medium",
      tags: input.tags ?? [],
      status: input.status ?? "new",
      nextFollowUp: input.nextFollowUp,
      lastContact: input.lastContact,
      estimatedValue: input.estimatedValue ?? 0,
      notes: input.notes,
      createdAt: now(),
    };
    const created = await this.insert<Lead>("leads", lead as unknown as Json);
    await this.log("Lead Created", "Crm", `${created.name} added to the pipeline`);
    return created;
  }

  async updateLeadStatus(id: string, status: LeadStatus) {
    await this.client.from("leads").update({ status }).eq("id", id);
    await this.log("Status Updated", "Crm", `Lead moved to ${status.replace(/_/g, " ")}`);
  }

  async getTasks() {
    return this.select<Task>("tasks");
  }

  async createTask(input: Partial<Task>) {
    const task: Task = {
      id: `task_${randomUUID()}`,
      title: input.title?.trim() || "Untitled task",
      relatedTo: input.relatedTo?.trim() || "General",
      assignedTo: input.assignedTo?.trim() || "Unassigned",
      priority: input.priority ?? "medium",
      status: input.status ?? "to_do",
      startDate: input.startDate ?? now().slice(0, 10),
      dueDate: input.dueDate ?? now().slice(0, 10),
      subtasks: input.subtasks ?? { done: 0, total: 0 },
      checklist: input.checklist ?? { done: 0, total: 0 },
    };
    const created = await this.insert<Task>("tasks", task as unknown as Json);
    await this.log("Task Created", "Task Management", task.title);
    return created;
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    await this.client.from("tasks").update({ status }).eq("id", id);
    await this.log("Task Updated", "Task Management", `Task marked ${status.replace(/_/g, " ")}`);
  }

  async getActivities() {
    const rows = await this.select<Activity>("activities");
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getSuppliers() {
    return this.select<Supplier>("suppliers");
  }

  async getAgents() {
    return this.select<Agent>("agents");
  }

  async getSettings() {
    return retry(async () => {
      const { data, error } = await this.client.from("app_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return normalizeSettings(buildSeedData().settings);

      const raw = camelize(data) as Partial<AppSettings> & {
        appearance?: Partial<SiteAppearance> & { pages?: unknown };
      };

      // Page settings ride inside the existing appearance JSONB column so the
      // production table does not need a schema change.
      if (raw.appearance && "pages" in raw.appearance) {
        raw.pages = raw.appearance.pages as AppSettings["pages"];
        delete (raw.appearance as unknown as Record<string, unknown>).pages;
      }

      return normalizeSettings(raw);
    });
  }

  async updateSettings(input: Partial<AppSettings>) {
    this.databaseCache = null;
    const current = await this.getSettings();
    const settings = normalizeSettings({ ...current, ...input });
    const { pages, ...columns } = settings;
    const saved = await this.upsert<AppSettings>("app_settings", {
      id: 1,
      ...columns,
      appearance: { ...settings.appearance, pages },
    } as unknown as Json);
    await this.log("Settings Updated", "Settings", "General business settings were updated");
    return normalizeSettings(saved);
  }
}
