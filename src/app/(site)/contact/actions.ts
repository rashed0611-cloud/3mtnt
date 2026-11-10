"use server";

import { getRepository } from "@/lib/db";

export interface InquiryState {
  ok?: boolean;
  name?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function publicInquiryAction(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never fill this hidden field.
  if (text(formData, "website")) {
    return { ok: true, name: text(formData, "name") || "traveller" };
  }

  const name = text(formData, "name");
  const email = text(formData, "email");
  const phone = text(formData, "phone");
  const interest = text(formData, "interest") || "General travel enquiry";
  const message = text(formData, "message");
  const travelDate = text(formData, "travelDate");
  const travellers = text(formData, "travellers");
  const reference = text(formData, "reference");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = "Please tell us your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (phone.replace(/\D/g, "").length < 6) fieldErrors.phone = "Enter a phone or WhatsApp number.";
  if (message.length < 10) fieldErrors.message = "A sentence or two about your trip helps us respond properly.";

  if (Object.keys(fieldErrors).length) {
    return { error: "Please check the highlighted fields and try again.", fieldErrors };
  }

  const requirementParts = [interest];
  if (travelDate) requirementParts.push(`Travel window: ${travelDate}`);
  if (travellers) requirementParts.push(`Travellers: ${travellers}`);

  const noteParts = [message];
  if (reference) noteParts.push(`Came from: ${reference}`);

  try {
    await getRepository().createLead({
      name,
      phone,
      email,
      source: "website",
      requirement: requirementParts.join(" · "),
      assignedTo: "Website inbox",
      priority: "medium",
      tags: ["Website enquiry"],
      status: "new",
      estimatedValue: 0,
      notes: noteParts.join("\n"),
      nextFollowUp: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
      lastContact: new Date().toISOString().slice(0, 10),
    });
  } catch {
    return { error: "We couldn't submit your enquiry just now. Please email us directly and we'll pick it up." };
  }

  return { ok: true, name: name.split(/\s+/)[0] };
}
