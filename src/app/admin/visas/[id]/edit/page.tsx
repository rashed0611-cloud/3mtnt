import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { VisaForm } from "@/components/forms/visa-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { listCatalogCovers, listImagesForProduct } from "@/lib/media";

export const metadata: Metadata = { title: "Edit visa product" };

export default async function EditVisaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const visa = db.visas.find((item) => item.id === id);
  if (!visa) notFound();
  const coverUrl = (await listCatalogCovers("visa")).get(visa.id);
  const relatedImages = await listImagesForProduct("visa", visa.id);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title={`Edit ${visa.country} ${visa.visaType}`}
        description="Update fees, processing time and the document checklist."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Visa list", href: "/admin/visas" }, { label: visa.country }]}
        actions={
          <Link href="/admin/visas" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to visas
          </Link>
        }
      />
      <Card>
        <CardContent>
          <VisaForm visa={visa} coverUrl={coverUrl} relatedImages={relatedImages} />
        </CardContent>
      </Card>
    </div>
  );
}
