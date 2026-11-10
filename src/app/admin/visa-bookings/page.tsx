import type { Metadata } from "next";
import { ServiceBookingsView } from "@/components/bookings/service-bookings-view";

export const metadata: Metadata = { title: "Visa applications" };

export default function VisaBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; period?: string; page?: string }>;
}) {
  return <ServiceBookingsView serviceType="visa" searchParams={searchParams} />;
}
