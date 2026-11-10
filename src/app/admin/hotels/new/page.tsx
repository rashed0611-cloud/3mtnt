import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HotelForm } from "@/components/forms/hotel-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add hotel" };

export default async function NewHotelPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Add a hotel"
        description="Publish a property to the hotel inventory so it can be quoted and booked."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hotels", href: "/admin/hotels" }, { label: "New" }]}
        actions={
          <Link href="/admin/hotels" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to hotels
          </Link>
        }
      />
      <Card>
        <CardContent>
          <HotelForm />
        </CardContent>
      </Card>
    </div>
  );
}
