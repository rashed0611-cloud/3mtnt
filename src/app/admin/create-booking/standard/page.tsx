import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { StandardBookingForm, type StandardProduct } from "@/components/bookings/standard-booking-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Quick booking" };

const LABELS = {
  hotel: "Hotel stay",
  visa: "Visa processing",
  hajj: "Hajj & Umrah",
} as const;

export default async function StandardBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; customerId?: string }>;
}) {
  await requireUser();
  const { service: raw, customerId } = await searchParams;
  const service = raw === "visa" || raw === "hajj" || raw === "hotel" ? raw : "hotel";
  const db = await getRepository().getDatabase();

  let products: StandardProduct[] = [];
  if (service === "hotel") {
    products = db.hotels.map((hotel) => ({
      id: hotel.id,
      label: hotel.name,
      meta: `${hotel.location} · ${hotel.starRating}-star · ${hotel.rooms} rooms`,
      unitPrice: hotel.price,
    }));
  } else if (service === "visa") {
    products = db.visas.map((visa) => ({
      id: visa.id,
      label: `${visa.country} ${visa.visaType} visa`,
      meta: visa.processingTime,
      unitPrice: visa.price,
    }));
  } else {
    products = db.hajjPackages.map((pkg) => ({
      id: pkg.id,
      label: pkg.title,
      meta: `${pkg.tier} · departs ${pkg.departureDate}`,
      unitPrice: pkg.price,
    }));
  }

  if (!products.length) notFound();

  const staff = Array.from(new Set(["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", ...db.bookings.map((booking) => booking.assignedTo)])).filter(
    (name) => name && name !== "-",
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title={`New ${LABELS[service]} booking`}
        description="Record the commercial details now; documents, supplier confirmation and payment follow-ups stay linked to the booking."
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Create booking", href: "/admin/create-booking" },
          { label: LABELS[service] },
        ]}
        actions={
          <Link href="/admin/create-booking" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Change service
          </Link>
        }
      />
      <StandardBookingForm
        service={service}
        serviceLabel={LABELS[service]}
        customers={db.customers}
        products={products}
        staff={staff}
        preselectedCustomerId={customerId}
      />
    </div>
  );
}
