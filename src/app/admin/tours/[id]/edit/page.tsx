import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TourForm } from "@/components/forms/tour-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { listCatalogCovers } from "@/lib/media";

export const metadata: Metadata = { title: "Edit tour" };

export default async function EditTourPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const tour = db.tours.find((item) => item.id === id);
  if (!tour) notFound();
  const coverUrl = (await listCatalogCovers("tour")).get(tour.id);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title={`Edit ${tour.title}`}
        description="Update pricing, availability, itinerary and the inclusions shown to travellers."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Tours", href: "/admin/tours" }, { label: tour.code, href: `/admin/tours/${tour.id}` }, { label: "Edit" }]}
        actions={
          <Link href={`/admin/tours/${tour.id}`} className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tour
          </Link>
        }
      />
      <Card>
        <CardContent>
          <TourForm tour={tour} coverUrl={coverUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
