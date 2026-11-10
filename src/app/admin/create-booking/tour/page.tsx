import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { TourBookingWizard } from "@/components/bookings/tour-booking-wizard";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Tour booking wizard" };

export default async function TourBookingWizardPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string; tourId?: string }>;
}) {
  const user = await requireUser();
  const { customerId, tourId } = await searchParams;
  const db = await getRepository().getDatabase();
  const staff = Array.from(new Set(["Sam Rahman", "Neyamul Kobir", "Md Rohim Mia", ...db.bookings.map((booking) => booking.assignedTo)])).filter(
    (name) => name && name !== "-",
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tour booking wizard"
        description="A guided six-step flow from customer selection to confirmation — with a sticky summary and validation at every step."
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Create booking", href: "/admin/create-booking" },
          { label: "Tour" },
        ]}
        actions={
          <Link href="/admin/create-booking" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Change service
          </Link>
        }
      />
      <div className="flex items-start gap-2 rounded-control border border-primary/15 bg-primary/[0.04] px-3.5 py-2.5 text-[11.5px] text-slate-600">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          <span className="font-semibold text-ink">Tip:</span> select the customer and tour first — dates, pricing, tax and the deposit are
          calculated automatically. Nothing is saved until you confirm on step 6.
        </p>
      </div>
      <TourBookingWizard
        customers={db.customers}
        tours={db.tours.filter((tour) => tour.status !== "archived")}
        staff={staff}
        preselectedCustomerId={customerId}
        preselectedTourId={tourId}
      />
    </div>
  );
}
