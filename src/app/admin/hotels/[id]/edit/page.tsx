import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HotelForm } from "@/components/forms/hotel-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Edit hotel" };

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const hotel = db.hotels.find((item) => item.id === id);
  if (!hotel) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title={`Edit ${hotel.name}`}
        description="Update rates, availability and the details shown to travellers."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hotels", href: "/admin/hotels" }, { label: hotel.name }]}
        actions={
          <Link href="/admin/hotels" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to hotels
          </Link>
        }
      />
      <Card>
        <CardContent>
          <HotelForm hotel={hotel} />
        </CardContent>
      </Card>
    </div>
  );
}
