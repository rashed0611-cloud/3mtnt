import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerForm } from "@/components/forms/customer-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Add customer" };

export default async function NewCustomerPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Add a customer"
        description="Create a traveller or corporate profile. Bookings, invoices and documents will attach to this record."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: "New" }]}
        actions={
          <Link href="/admin/customers" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
          </Link>
        }
      />
      <Card>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
