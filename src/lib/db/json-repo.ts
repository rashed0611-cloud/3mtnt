import { randomUUID } from "node:crypto";
import { getDb, saveDb } from "@/lib/db/json-store";
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
  Supplier,
  Task,
  TaskStatus,
  Tour,
  VisaPackage,
} from "@/lib/types";
import type { Repository } from "@/lib/db/types";

function nowIso() {
  return new Date().toISOString();
}

function sequence(list: { code?: string }[], prefix: string) {
  let max = 0;
  for (const row of list) {
    const match = row.code?.match(/(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

function logActivity(db: Database, action: string, module: string, description: string, severity: Activity["severity"] = "info") {
  db.activities.unshift({
    id: `act_${randomUUID()}`,
    actor: "Administrator",
    action,
    module,
    severity,
    description,
    createdAt: nowIso(),
  });
}

export class JsonRepository implements Repository {
  async getDatabase(): Promise<Database> {
    return getDb();
  }

  async getCustomers() {
    const db = await getDb();
    return [...db.customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getCustomer(id: string) {
    const db = await getDb();
    return db.customers.find((c) => c.id === id) ?? null;
  }

  async createCustomer(input: Partial<Customer>) {
    const db = await getDb();
    const codeNumber = sequence(db.customers.map((c) => ({ code: c.code })), "CUS");
    const customer: Customer = {
      id: `cus_${randomUUID()}`,
      code: `CUS-${String(codeNumber).padStart(6, "0")}`,
      name: input.name?.trim() || "Unnamed customer",
      company: input.company?.trim() || undefined,
      email: input.email?.trim() || "",
      phone: input.phone?.trim() || "",
      nationality: input.nationality?.trim() || "Bangladeshi",
      status: input.status ?? "active",
      tags: input.tags ?? [],
      assignedTo: input.assignedTo?.trim() || "Unassigned",
      notes: input.notes?.trim() || undefined,
      createdAt: nowIso(),
    };
    db.customers.unshift(customer);
    logActivity(db, "Customer Created", "Customers", `${customer.code} · ${customer.name} added to the customer list`);
    await saveDb(db);
    return customer;
  }

  async updateCustomer(id: string, input: Partial<Customer>) {
    const db = await getDb();
    const index = db.customers.findIndex((c) => c.id === id);
    if (index < 0) return null;
    db.customers[index] = { ...db.customers[index], ...input, id };
    logActivity(db, "Customer Updated", "Customers", `${db.customers[index].code} · ${db.customers[index].name} updated`);
    await saveDb(db);
    return db.customers[index];
  }

  async getTours() {
    const db = await getDb();
    return [...db.tours].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateTour(id: string, input: Partial<Tour>) {
    const db = await getDb();
    const index = db.tours.findIndex((tour) => tour.id === id);
    if (index < 0) return null;
    db.tours[index] = { ...db.tours[index], ...input, id };
    logActivity(db, "Tour Updated", "Tour Package", `${db.tours[index].code} · ${db.tours[index].title} updated`);
    await saveDb(db);
    return db.tours[index];
  }

  async createTour(input: Partial<Tour>) {
    const db = await getDb();
    const codeNumber = sequence(db.tours.map((t) => ({ code: t.code })), "TOUR");
    const title = input.title?.trim() || "Untitled tour";
    const tour: Tour = {
      id: `tour_${randomUUID()}`,
      code: `TOUR-${String(codeNumber).padStart(3, "0")}`,
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
      createdAt: nowIso(),
    };
    db.tours.unshift(tour);
    logActivity(db, "Tour Created", "Tour Package", `${tour.code} · ${tour.title} published`);
    await saveDb(db);
    return tour;
  }

  async getHotels() {
    const db = await getDb();
    return db.hotels;
  }

  async createHotel(input: Partial<Hotel>) {
    const db = await getDb();
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
    db.hotels.unshift(hotel);
    logActivity(db, "Hotel Created", "Hotel", `${hotel.name} added to hotel inventory`);
    await saveDb(db);
    return hotel;
  }

  async updateHotel(id: string, input: Partial<Hotel>) {
    const db = await getDb();
    const index = db.hotels.findIndex((hotel) => hotel.id === id);
    if (index < 0) return null;
    db.hotels[index] = { ...db.hotels[index], ...input, id };
    logActivity(db, "Hotel Updated", "Hotel", `${db.hotels[index].name} updated`);
    await saveDb(db);
    return db.hotels[index];
  }

  async getVisas() {
    const db = await getDb();
    return db.visas;
  }

  async createVisa(input: Partial<VisaPackage>) {
    const db = await getDb();
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
    db.visas.unshift(visa);
    logActivity(db, "Visa Product Created", "Visa Processing", `${visa.country} · ${visa.visaType} added`);
    await saveDb(db);
    return visa;
  }

  async updateVisa(id: string, input: Partial<VisaPackage>) {
    const db = await getDb();
    const index = db.visas.findIndex((visa) => visa.id === id);
    if (index < 0) return null;
    db.visas[index] = { ...db.visas[index], ...input, id };
    logActivity(db, "Visa Product Updated", "Visa Processing", `${db.visas[index].country} · ${db.visas[index].visaType} updated`);
    await saveDb(db);
    return db.visas[index];
  }

  async getHajjPackages() {
    const db = await getDb();
    return db.hajjPackages;
  }

  async createHajjPackage(input: Partial<HajjPackage>) {
    const db = await getDb();
    const pkg: HajjPackage = {
      id: `hajj_${randomUUID()}`,
      title: input.title?.trim() || "Untitled pilgrimage package",
      kind: input.kind ?? "umrah",
      tier: input.tier?.trim() || "Standard",
      departureDate: input.departureDate ?? nowIso().slice(0, 10),
      returnDate: input.returnDate ?? nowIso().slice(0, 10),
      price: input.price ?? 0,
      currency: input.currency ?? "BDT",
      capacity: input.capacity ?? 20,
      booked: input.booked ?? 0,
      status: input.status ?? "draft",
    };
    db.hajjPackages.unshift(pkg);
    logActivity(db, "Pilgrimage Package Created", "Hajj & Umrah", `${pkg.title} added to the pilgrimage catalogue`);
    await saveDb(db);
    return pkg;
  }

  async updateHajjPackage(id: string, input: Partial<HajjPackage>) {
    const db = await getDb();
    const index = db.hajjPackages.findIndex((pkg) => pkg.id === id);
    if (index < 0) return null;
    db.hajjPackages[index] = { ...db.hajjPackages[index], ...input, id };
    logActivity(db, "Pilgrimage Package Updated", "Hajj & Umrah", `${db.hajjPackages[index].title} updated`);
    await saveDb(db);
    return db.hajjPackages[index];
  }

  async getBookings() {
    const db = await getDb();
    return [...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getBooking(id: string) {
    const db = await getDb();
    return db.bookings.find((b) => b.id === id) ?? null;
  }

  async createBooking(input: BookingInput) {
    const db = await getDb();
    let customer =
      (input.customerId ? db.customers.find((c) => c.id === input.customerId) : undefined) ??
      db.customers.find((c) => c.name.toLowerCase() === (input.customerName ?? "").toLowerCase());

    if (!customer && input.customerName) {
      customer = await this.createCustomer({
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
        assignedTo: input.assignedTo,
      });
    }

    if (!customer) throw new Error("A customer is required to create a booking.");

    const prefix = input.serviceType === "tour" ? "TB" : input.serviceType === "hotel" ? "HB" : input.serviceType === "visa" ? "VB" : "HU";
    const existing = db.bookings.filter((b) => b.ref.startsWith(prefix)).length;
    const ref = `${prefix}-${String(existing + 1).padStart(6, "0")}`;
    const subtotal = Math.max(0, input.subtotal);
    const discount = Math.max(0, Math.min(input.discount, subtotal));
    const tax = Math.max(0, input.tax);
    const total = subtotal - discount + tax;
    const paid = Math.max(0, Math.min(input.advance, total));
    const due = total - paid;
    const createdAt = nowIso();

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
      currency: db.settings.defaultCurrency,
      paymentStatus: paid <= 0 ? "unpaid" : paid >= total ? "paid" : "partial",
      status: input.status,
      assignedTo: input.assignedTo || "Unassigned",
      source: input.source,
      notes: input.notes,
      createdAt,
      timeline: [
        { at: createdAt, label: "Booking created", note: `${ref} created in the admin workspace` },
        { at: createdAt, label: `Status set to ${input.status.replace(/_/g, " ")}` },
        ...(paid > 0 ? [{ at: createdAt, label: "Advance payment recorded", note: `${input.paymentMethod} · ${paid}` }] : []),
      ],
    };

    db.bookings.unshift(booking);

    if (input.status !== "draft") {
      const invoiceNumber = `INV-2026-${String(db.invoices.length + 1).padStart(5, "0")}`;
      const issue = new Date();
      const dueDate = new Date(issue.getTime() + 7 * 86_400_000);
      const invoice: Invoice = {
        id: `inv_${randomUUID()}`,
        number: invoiceNumber,
        bookingRef: booking.ref,
        customerName: booking.customerName,
        issueDate: issue.toISOString().slice(0, 10),
        dueDate: dueDate.toISOString().slice(0, 10),
        total,
        paid,
        due,
        status: due <= 0 ? "paid" : paid > 0 ? "partial" : "sent",
        type: `${input.serviceType[0].toUpperCase()}${input.serviceType.slice(1)} booking`,
        currency: db.settings.defaultCurrency,
      };
      db.invoices.unshift(invoice);
    }

    logActivity(db, "Booking Created", "Booking", `${booking.ref} created for ${customer.name}`, "info");
    await saveDb(db);
    return booking;
  }

  async updateBookingStatus(id: string, status: Booking["status"]) {
    const db = await getDb();
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) return;
    booking.status = status;
    booking.timeline.push({ at: nowIso(), label: `Status set to ${status.replace(/_/g, " ")}` });
    logActivity(db, "Status Updated", "Booking", `${booking.ref} moved to ${status.replace(/_/g, " ")}`);
    await saveDb(db);
  }

  async addBookingPayment(id: string, amount: number) {
    const db = await getDb();
    const booking = db.bookings.find((b) => b.id === id);
    if (!booking) return;
    booking.paid = Math.min(booking.total, booking.paid + Math.max(0, amount));
    booking.due = booking.total - booking.paid;
    booking.paymentStatus = booking.paid <= 0 ? "unpaid" : booking.paid >= booking.total ? "paid" : "partial";
    booking.timeline.push({ at: nowIso(), label: "Payment recorded", note: `${amount}` });
    const invoice = db.invoices.find((i) => i.bookingRef === booking.ref);
    if (invoice) {
      invoice.paid = booking.paid;
      invoice.due = booking.due;
      invoice.status = booking.due <= 0 ? "paid" : booking.paid > 0 ? "partial" : invoice.status;
    }
    logActivity(db, "Payment Recorded", "Finance", `Payment of ${amount} recorded on ${booking.ref}`);
    await saveDb(db);
  }

  async getInvoices() {
    const db = await getDb();
    return [...db.invoices].sort((a, b) => b.number.localeCompare(a.number));
  }

  async getLeads() {
    const db = await getDb();
    return [...db.leads].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createLead(input: Partial<Lead>) {
    const db = await getDb();
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
      createdAt: nowIso(),
    };
    db.leads.unshift(lead);
    logActivity(db, "Lead Created", "Crm", `${lead.name} added to the pipeline`);
    await saveDb(db);
    return lead;
  }

  async updateLeadStatus(id: string, status: LeadStatus) {
    const db = await getDb();
    const lead = db.leads.find((l) => l.id === id);
    if (!lead) return;
    lead.status = status;
    logActivity(db, "Status Updated", "Crm", `${lead.name} moved to ${status.replace(/_/g, " ")}`);
    await saveDb(db);
  }

  async getTasks() {
    const db = await getDb();
    return db.tasks;
  }

  async createTask(input: Partial<Task>) {
    const db = await getDb();
    const task: Task = {
      id: `task_${randomUUID()}`,
      title: input.title?.trim() || "Untitled task",
      relatedTo: input.relatedTo?.trim() || "General",
      assignedTo: input.assignedTo?.trim() || "Unassigned",
      priority: input.priority ?? "medium",
      status: input.status ?? "to_do",
      startDate: input.startDate ?? nowIso().slice(0, 10),
      dueDate: input.dueDate ?? nowIso().slice(0, 10),
      subtasks: input.subtasks ?? { done: 0, total: 0 },
      checklist: input.checklist ?? { done: 0, total: 0 },
    };
    db.tasks.unshift(task);
    logActivity(db, "Task Created", "Task Management", task.title);
    await saveDb(db);
    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus) {
    const db = await getDb();
    const task = db.tasks.find((t) => t.id === id);
    if (!task) return;
    task.status = status;
    logActivity(db, "Task Updated", "Task Management", `${task.title} marked ${status.replace(/_/g, " ")}`);
    await saveDb(db);
  }

  async getActivities() {
    const db = await getDb();
    return [...db.activities].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getSuppliers() {
    const db = await getDb();
    return db.suppliers;
  }

  async getAgents() {
    const db = await getDb();
    return db.agents;
  }

  async getSettings() {
    const db = await getDb();
    return db.settings;
  }

  async updateSettings(input: Partial<AppSettings>) {
    const db = await getDb();
    db.settings = { ...db.settings, ...input };
    logActivity(db, "Settings Updated", "Settings", "General business settings were updated");
    await saveDb(db);
    return db.settings;
  }
}
