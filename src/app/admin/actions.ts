"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import type { BookingInput, Lead, LeadStatus, TaskStatus, Tour } from "@/lib/types";
import { toNumber, toText } from "@/lib/utils";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  message?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/customers");
  revalidatePath("/admin/tours");
  revalidatePath("/admin/all-bookings");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/crm");
  revalidatePath("/admin/crm/leads");
  revalidatePath("/admin/accounts-dashboard");
  revalidatePath("/admin/activity-logs");
  revalidatePath("/admin/task-management/tasks");
}

function parseLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

export async function saveCustomerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("customers", "write");
  const id = toText(formData.get("id"));
  const name = toText(formData.get("name"));
  const email = toText(formData.get("email"));
  const phone = toText(formData.get("phone"));
  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) fieldErrors.name = "Enter the customer's full name.";
  if (!email) fieldErrors.email = "An email address is required for invoices and confirmations.";
  else if (!EMAIL.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (!phone) fieldErrors.phone = "A phone number is required for travel-day contact.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const input = {
    name,
    company: toText(formData.get("company")) || undefined,
    email,
    phone,
    nationality: toText(formData.get("nationality")) || "Bangladeshi",
    status: (toText(formData.get("status")) || "active") as "active" | "inactive",
    tags: parseLines(formData.get("tags")),
    assignedTo: toText(formData.get("assignedTo")) || "Unassigned",
    notes: toText(formData.get("notes")) || undefined,
  };

  let customerId = id;
  try {
    const repo = getRepository();
    const customer = id ? await repo.updateCustomer(id, input) : await repo.createCustomer(input);
    if (!customer) return { error: "That customer could not be found. It may have been removed." };
    customerId = customer.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the customer." };
  }

  refresh();
  redirect(`/admin/customers/${customerId}?saved=1`);
}

/* ------------------------------------------------------------------ */
/* Tours                                                               */
/* ------------------------------------------------------------------ */

export async function createTourAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("tours", "write");
  const settings = await getRepository().getSettings();
  const id = toText(formData.get("id"));
  const title = toText(formData.get("title"));
  const destination = toText(formData.get("destination"));
  const adultPrice = toNumber(formData.get("adultPrice"));
  const fieldErrors: Record<string, string> = {};

  if (title.length < 3) fieldErrors.title = "Give the tour a descriptive name.";
  if (!destination) fieldErrors.destination = "Choose or enter a destination.";
  if (adultPrice <= 0) fieldErrors.adultPrice = "The adult price must be greater than zero.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const dayTitles = formData.getAll("dayTitle").map(String);
  const dayDescriptions = formData.getAll("dayDescription").map(String);
  const itinerary = dayTitles
    .map((dayTitle, index) => ({
      day: index + 1,
      title: dayTitle.trim(),
      description: (dayDescriptions[index] ?? "").trim(),
    }))
    .filter((day) => day.title.length > 0);

  const durationDays = Math.max(1, toNumber(formData.get("durationDays"), itinerary.length || 1));

  const input: Partial<Tour> = {
    title,
    destination,
    type: (toText(formData.get("type")) || "custom") as Tour["type"],
    durationDays,
    durationNights: Math.max(0, toNumber(formData.get("durationNights"), Math.max(0, durationDays - 1))),
    adultPrice,
    childPrice: toNumber(formData.get("childPrice"), Math.round(adultPrice * 0.65)),
    currency: "BDT",
    capacity: Math.max(1, toNumber(formData.get("capacity"), 20)),
    status: (toText(formData.get("status")) || settings.tourDefaultStatus) as Tour["status"],
    featured: formData.get("featured") === "on",
    supplier: toText(formData.get("supplier")) || "Own inventory",
    description: toText(formData.get("description")),
    inclusions: parseLines(formData.get("inclusions")),
    exclusions: parseLines(formData.get("exclusions")),
    itinerary,
  };

  let tourId = "";
  try {
    const repo = getRepository();
    const tour = id ? await repo.updateTour(id, input) : await repo.createTour(input);
    if (!tour) return { error: "That tour could not be found. It may have been removed." };
    tourId = tour.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the tour." };
  }

  refresh();
  revalidatePath("/admin/tours");
  revalidatePath("/tours");
  redirect(`/admin/tours/${tourId}?${id ? "saved" : "created"}=1`);
}

/* ------------------------------------------------------------------ */
/* Hotel, visa and pilgrimage catalogues                               */
/* ------------------------------------------------------------------ */

export async function saveHotelAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("hotels", "write");
  const id = toText(formData.get("id"));
  const name = toText(formData.get("name"));
  const location = toText(formData.get("location"));
  const price = toNumber(formData.get("price"));
  const fieldErrors: Record<string, string> = {};

  if (name.length < 3) fieldErrors.name = "Enter the property name.";
  if (location.length < 2) fieldErrors.location = "Enter the city, area or destination.";
  if (!price || price < 0) fieldErrors.price = "Enter a valid nightly rate.";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const input = {
    name,
    slug: toText(formData.get("slug")) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    location,
    starRating: Math.min(5, Math.max(1, toNumber(formData.get("starRating")) || 3)),
    price,
    currency: toText(formData.get("currency")) || "BDT",
    rooms: toNumber(formData.get("rooms")) || 0,
    status: (toText(formData.get("status")) || "draft") as "publish" | "draft" | "archived",
    featured: formData.get("featured") === "on",
    description: toText(formData.get("description")),
    amenities: parseLines(formData.get("amenities")),
    supplier: toText(formData.get("supplier")) || "Own inventory",
  };

  try {
    const repo = getRepository();
    const hotel = id ? await repo.updateHotel(id, input) : await repo.createHotel(input);
    if (!hotel) return { error: "That property could not be found. It may have been removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the hotel." };
  }

  refresh();
  revalidatePath("/admin/hotels");
  revalidatePath("/admin/hotel");
  revalidatePath("/hotels");
  redirect("/admin/hotels?saved=1");
}

export async function saveVisaAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("visas", "write");
  const id = toText(formData.get("id"));
  const country = toText(formData.get("country"));
  const visaType = toText(formData.get("visaType"));
  const price = toNumber(formData.get("price"));
  const fieldErrors: Record<string, string> = {};

  if (country.length < 2) fieldErrors.country = "Enter the destination country.";
  if (visaType.length < 2) fieldErrors.visaType = "Enter the visa type.";
  if (!price || price < 0) fieldErrors.price = "Enter a valid service fee.";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const input = {
    country,
    visaType,
    processingTime: toText(formData.get("processingTime")) || "5–7 working days",
    price,
    currency: toText(formData.get("currency")) || "BDT",
    status: (toText(formData.get("status")) || "draft") as "active" | "draft",
    requiredDocuments: parseLines(formData.get("requiredDocuments")),
    description: toText(formData.get("description")),
  };

  try {
    const repo = getRepository();
    const visa = id ? await repo.updateVisa(id, input) : await repo.createVisa(input);
    if (!visa) return { error: "That visa product could not be found. It may have been removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the visa product." };
  }

  refresh();
  revalidatePath("/admin/visas");
  revalidatePath("/admin/visa");
  revalidatePath("/visas");
  redirect("/admin/visas?saved=1");
}

export async function saveHajjPackageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("hajj", "write");
  const id = toText(formData.get("id"));
  const title = toText(formData.get("title"));
  const departureDate = toText(formData.get("departureDate"));
  const returnDate = toText(formData.get("returnDate"));
  const price = toNumber(formData.get("price"));
  const capacity = toNumber(formData.get("capacity"));
  const booked = toNumber(formData.get("booked"));
  const fieldErrors: Record<string, string> = {};

  if (title.length < 3) fieldErrors.title = "Give the package a descriptive name.";
  if (!departureDate) fieldErrors.departureDate = "Choose a departure date.";
  if (!returnDate) fieldErrors.returnDate = "Choose a return date.";
  if (departureDate && returnDate && returnDate < departureDate) fieldErrors.returnDate = "The return date must be after departure.";
  if (!price || price < 0) fieldErrors.price = "Enter a valid package price.";
  if (!capacity || capacity < 1) fieldErrors.capacity = "Capacity must be at least one seat.";
  if (booked > capacity) fieldErrors.booked = "Booked seats cannot exceed capacity.";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const input = {
    title,
    kind: (toText(formData.get("kind")) || "umrah") as "hajj" | "umrah" | "ramadan_umrah",
    tier: toText(formData.get("tier")) || "Standard",
    departureDate,
    returnDate,
    price,
    currency: toText(formData.get("currency")) || "BDT",
    capacity,
    booked,
    status: (toText(formData.get("status")) || "draft") as "active" | "draft",
  };

  try {
    const repo = getRepository();
    const pkg = id ? await repo.updateHajjPackage(id, input) : await repo.createHajjPackage(input);
    if (!pkg) return { error: "That package could not be found. It may have been removed." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save the package." };
  }

  refresh();
  revalidatePath("/admin/hajj-umrah/packages");
  revalidatePath("/admin/hajj-umrah");
  revalidatePath("/hajj-umrah");
  redirect("/admin/hajj-umrah/packages?saved=1");
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export type CreateBookingResult =
  | { ok: true; bookingId: string; ref: string }
  | { ok: false; error: string };

export async function createBookingAction(input: BookingInput): Promise<CreateBookingResult> {
  await requireModuleAccess("bookings", "write");
  if (!input.title?.trim()) return { ok: false, error: "Choose a service or package before confirming." };
  if (!input.customerId && !input.customerName?.trim()) return { ok: false, error: "Select an existing customer or enter a new one." };
  if (!input.startDate) return { ok: false, error: "A start date is required." };
  if (!input.endDate) return { ok: false, error: "An end date is required." };
  if (new Date(input.endDate) < new Date(input.startDate)) return { ok: false, error: "The end date cannot be before the start date." };
  if (input.subtotal <= 0) return { ok: false, error: "Add a valid price before confirming." };
  if (input.advance > input.subtotal - input.discount + input.tax) return { ok: false, error: "The advance cannot exceed the booking total." };

  try {
    const booking = await getRepository().createBooking(input);
    refresh();
    revalidatePath(`/admin/all-bookings/${booking.id}`);
    return { ok: true, bookingId: booking.id, ref: booking.ref };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not create the booking." };
  }
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireModuleAccess("bookings", "write");
  const id = toText(formData.get("id"));
  const status = toText(formData.get("status")) as BookingInput["status"];
  const returnTo = toText(formData.get("returnTo")) || `/admin/all-bookings/${id}`;
  if (id && status) {
    await getRepository().updateBookingStatus(id, status);
    refresh();
  }
  redirect(returnTo);
}

export async function bulkUpdateBookingStatusAction(ids: string[], status: BookingInput["status"]): Promise<{ updated: number }> {
  await requireModuleAccess("bookings", "write");
  if (!ids.length || !status) return { updated: 0 };
  const repo = getRepository();
  let updated = 0;
  for (const id of ids) {
    await repo.updateBookingStatus(id, status);
    updated += 1;
  }
  refresh();
  return { updated };
}

export async function addPaymentAction(formData: FormData) {
  await requireModuleAccess(["bookings", "finance"], "write");
  const id = toText(formData.get("id"));
  const amount = toNumber(formData.get("amount"));
  const returnTo = toText(formData.get("returnTo")) || `/admin/all-bookings/${id}`;
  if (id && amount > 0) {
    await getRepository().addBookingPayment(id, amount);
    refresh();
  }
  redirect(returnTo);
}

/* ------------------------------------------------------------------ */
/* CRM leads                                                           */
/* ------------------------------------------------------------------ */

export async function createLeadAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("crm", "write");
  const name = toText(formData.get("name"));
  const phone = toText(formData.get("phone"));
  const requirement = toText(formData.get("requirement"));
  const fieldErrors: Record<string, string> = {};

  if (name.length < 2) fieldErrors.name = "Enter the lead's name or company.";
  if (!phone) fieldErrors.phone = "A contact number is required.";
  if (!requirement) fieldErrors.requirement = "Describe what the lead is looking for.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  let createdName = name;
  try {
    const lead = await getRepository().createLead({
      name,
      company: toText(formData.get("company")) || undefined,
      phone,
      email: toText(formData.get("email")),
      source: (toText(formData.get("source")) || "website") as Lead["source"],
      requirement,
      assignedTo: toText(formData.get("assignedTo")) || "Unassigned",
      priority: (toText(formData.get("priority")) || "medium") as Lead["priority"],
      status: (toText(formData.get("status")) || "new") as LeadStatus,
      estimatedValue: toNumber(formData.get("estimatedValue")),
      nextFollowUp: toText(formData.get("nextFollowUp")) || undefined,
      notes: toText(formData.get("notes")) || undefined,
      tags: parseLines(formData.get("tags")),
    });
    createdName = lead.name;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the lead." };
  }

  refresh();
  redirect(`/admin/crm/leads?created=${encodeURIComponent(createdName)}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  await requireModuleAccess("crm", "write");
  const id = toText(formData.get("id"));
  const status = toText(formData.get("status")) as LeadStatus;
  const returnTo = toText(formData.get("returnTo")) || "/admin/crm/leads";
  if (id && status) {
    await getRepository().updateLeadStatus(id, status);
    refresh();
  }
  redirect(returnTo);
}

/* ------------------------------------------------------------------ */
/* Tasks                                                               */
/* ------------------------------------------------------------------ */

export async function createTaskAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("tasks", "write");
  const title = toText(formData.get("title"));
  if (!title) return { fieldErrors: { title: "Give the task a short, action-oriented title." } };

  try {
    await getRepository().createTask({
      title,
      relatedTo: toText(formData.get("relatedTo")) || "General",
      assignedTo: toText(formData.get("assignedTo")) || "Unassigned",
      priority: (toText(formData.get("priority")) || "medium") as "low" | "medium" | "high" | "urgent",
      status: "to_do",
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: toText(formData.get("dueDate")) || new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not create the task." };
  }

  refresh();
  redirect("/admin/task-management/tasks?created=1");
}

export async function updateTaskStatusAction(formData: FormData) {
  await requireModuleAccess("tasks", "write");
  const id = toText(formData.get("id"));
  const status = toText(formData.get("status")) as TaskStatus;
  const returnTo = toText(formData.get("returnTo")) || "/admin/task-management/tasks";
  if (id && status) {
    await getRepository().updateTaskStatus(id, status);
    refresh();
  }
  redirect(returnTo);
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function updateSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("settings", "write");
  const siteName = toText(formData.get("siteName"));
  if (!siteName) return { fieldErrors: { siteName: "The workspace name cannot be empty." } };
  const taxRate = toNumber(formData.get("taxRate"));

  try {
    await getRepository().updateSettings({
      siteName,
      tagline: toText(formData.get("tagline")),
      legalName: toText(formData.get("legalName")),
      email: toText(formData.get("email")),
      phone: toText(formData.get("phone")),
      address: toText(formData.get("address")),
      defaultCurrency: toText(formData.get("defaultCurrency")) || "BDT",
      timezone: toText(formData.get("timezone")) || "Asia/Dhaka",
      invoicePrefix: toText(formData.get("invoicePrefix")) || "INV",
      taxRate: Math.max(0, Math.min(100, taxRate)),
      logoText: toText(formData.get("logoText")) || "3M",
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { message: "Workspace settings saved. Changes apply immediately." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save settings." };
  }
}

/* ------------------------------------------------------------------ */
/* Tour settings                                                       */
/* ------------------------------------------------------------------ */

export async function updateTourSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireModuleAccess("tours", "write");

  const tourDefaultStatus = toText(formData.get("tourDefaultStatus")) === "draft" ? "draft" : "active";
  const tourCancellationDays = Math.round(toNumber(formData.get("tourCancellationDays"), 7));
  const tourDepositPercent = Math.round(toNumber(formData.get("tourDepositPercent"), 30));
  const taxRate = toNumber(formData.get("taxRate"), 5);
  const invoicePrefix = toText(formData.get("invoicePrefix")) || "INV";
  const fieldErrors: Record<string, string> = {};

  if (tourCancellationDays < 0 || tourCancellationDays > 365) {
    fieldErrors.tourCancellationDays = "Choose a window between 0 and 365 days.";
  }
  if (tourDepositPercent < 0 || tourDepositPercent > 100) {
    fieldErrors.tourDepositPercent = "The deposit must be between 0% and 100%.";
  }
  if (taxRate < 0 || taxRate > 100) fieldErrors.taxRate = "Tax must be between 0% and 100%.";
  if (invoicePrefix.length > 8) fieldErrors.invoicePrefix = "Use 8 characters or fewer.";

  if (Object.keys(fieldErrors).length) return { fieldErrors };

  try {
    await getRepository().updateSettings({
      tourDefaultStatus,
      tourCancellationDays,
      tourDepositPercent,
      taxRate: Math.max(0, Math.min(100, taxRate)),
      invoicePrefix,
    });
    revalidatePath("/admin/tours/settings");
    revalidatePath("/admin/tours");
    revalidatePath("/admin/settings");
    revalidatePath("/tours");
    revalidatePath("/admin");
    return { message: "Tour settings saved. New tours and tour pages use these defaults." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Could not save tour settings." };
  }
}
