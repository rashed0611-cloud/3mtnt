import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HajjPackageForm } from "@/components/forms/hajj-package-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Edit pilgrimage package" };

export default async function EditHajjPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const db = await getRepository().getDatabase();
  const pkg = db.hajjPackages.find((item) => item.id === id);
  if (!pkg) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title={`Edit ${pkg.title}`}
        description="Adjust departure dates, pricing and seat allocation."
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Hajj & Umrah", href: "/admin/hajj-umrah" },
          { label: "Packages", href: "/admin/hajj-umrah/packages" },
          { label: pkg.title },
        ]}
        actions={
          <Link href="/admin/hajj-umrah/packages" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to packages
          </Link>
        }
      />
      <Card>
        <CardContent>
          <HajjPackageForm pkg={pkg} />
        </CardContent>
      </Card>
    </div>
  );
}
