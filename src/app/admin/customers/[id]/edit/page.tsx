import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/forms/customer-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Edit customer" };

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const customer = await getRepository().getCustomer(id);
  if (!customer) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Update contact details, tags, assignment and internal notes."
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Customers", href: "/admin/customers" },
          { label: customer.name, href: `/admin/customers/${customer.id}` },
          { label: "Edit" },
        ]}
        actions={
          <Link href={`/admin/customers/${customer.id}`} className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
          </Link>
        }
      />
      <Card>
        <CardContent>
          <CustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
