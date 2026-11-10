import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New lead" };

export default async function NewLeadPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Create a lead"
        description="Capture the enquiry, assign an owner and set the next follow-up. Convert to a booking when the customer is ready."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "CRM", href: "/admin/crm" }, { label: "Leads", href: "/admin/crm/leads" }, { label: "New" }]}
        actions={
          <Link href="/admin/crm/leads" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to leads
          </Link>
        }
      />
      <Card>
        <CardContent>
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
