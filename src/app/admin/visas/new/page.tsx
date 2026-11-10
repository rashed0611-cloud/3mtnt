import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VisaForm } from "@/components/forms/visa-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add visa product" };

export default async function NewVisaPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Add a visa product"
        description="Define a destination, processing window, fee and document checklist."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Visa list", href: "/admin/visas" }, { label: "New" }]}
        actions={
          <Link href="/admin/visas" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to visas
          </Link>
        }
      />
      <Card>
        <CardContent>
          <VisaForm />
        </CardContent>
      </Card>
    </div>
  );
}
