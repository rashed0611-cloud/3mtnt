import type { Metadata } from "next";
import { ServiceBookingsView } from "@/components/bookings/service-bookings-view";

export const metadata: Metadata = { title: "Hajj & Umrah bookings" };

export default function HajjBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; payment?: string; period?: string; page?: string }>;
}) {
  return <ServiceBookingsView serviceType="hajj" searchParams={searchParams} />;
}
