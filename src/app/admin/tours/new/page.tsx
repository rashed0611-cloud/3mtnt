import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TourForm } from "@/components/forms/tour-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add tour" };

export default async function NewTourPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <PageHeader
        title="Create a tour package"
        description="Publish a new experience to the catalogue. You can refine pricing and departures later."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Tours", href: "/admin/tours" }, { label: "New" }]}
        actions={
          <Link href="/admin/tours" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tours
          </Link>
        }
      />
      <Card>
        <CardContent>
          <TourForm />
        </CardContent>
      </Card>
    </div>
  );
}
