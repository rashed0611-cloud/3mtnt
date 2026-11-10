import type { Metadata } from "next";
import { ServiceBookingsView } from "@/components/bookings/service-bookings-view";

export const metadata: Metadata = { title: "Tour bookings" };

export default function TourBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; period?: string; page?: string }>;
}) {
  return <ServiceBookingsView serviceType="tour" searchParams={searchParams} />;
}
