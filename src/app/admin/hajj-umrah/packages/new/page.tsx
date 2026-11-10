import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HajjPackageForm } from "@/components/forms/hajj-package-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add pilgrimage package" };

export default async function NewHajjPackagePage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Add a pilgrimage package"
        description="Create departure inventory for Hajj, Umrah or Ramadan Umrah."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Hajj & Umrah", href: "/admin/hajj-umrah" }, { label: "Packages", href: "/admin/hajj-umrah/packages" }, { label: "New" }]}
        actions={
          <Link href="/admin/hajj-umrah/packages" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to packages
          </Link>
        }
      />
      <Card>
        <CardContent>
          <HajjPackageForm />
        </CardContent>
      </Card>
    </div>
  );
}
