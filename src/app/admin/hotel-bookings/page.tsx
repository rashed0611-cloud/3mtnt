import type { Metadata } from "next";
import { ServiceBookingsView } from "@/components/bookings/service-bookings-view";

export const metadata: Metadata = { title: "Hotel bookings" };

export default function HotelBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; period?: string; page?: string }>;
}) {
  return <ServiceBookingsView serviceType="hotel" searchParams={searchParams} />;
}
