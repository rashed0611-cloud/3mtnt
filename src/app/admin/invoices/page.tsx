import type { Metadata } from "next";
import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Invoices" };

const PAGE_SIZE = 12;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; page?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const today = new Date().toISOString().slice(0, 10);

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = db.invoices.filter((invoice) => {
    const haystack = [invoice.number, invoice.bookingRef, invoice.customerName, invoice.type].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status === "overdue" && !(invoice.due > 0 && invoice.dueDate < today)) return false;
    if (params.status && params.status !== "overdue" && invoice.status !== params.status) return false;
    if (params.type && invoice.type !== params.type) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const totalInvoiced = db.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const collected = db.invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const outstanding = db.invoices.reduce((sum, invoice) => sum + invoice.due, 0);
  const overdue = db.invoices.filter((invoice) => invoice.due > 0 && invoice.dueDate < today).length;
  const types = Array.from(new Set(db.invoices.map((invoice) => invoice.type)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="Issue, track and reconcile invoices against the unified booking ledger. Overdue balances are flagged automatically."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Sales & Quotation" }, { label: "Invoices" }]}
        actions={
          <>
            <a href="/admin/invoices/export" className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </a>
            <Link href="/admin/create-booking" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong">
              <ReceiptText className="h-3.5 w-3.5" /> New booking invoice
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total invoiced", value: formatMoney(totalInvoiced, "BDT", 0), hint: `${db.invoices.length} invoices` },
          { label: "Collected", value: formatMoney(collected, "BDT", 0), hint: `${Math.round((collected / Math.max(1, totalInvoiced)) * 100)}% of invoiced` },
          { label: "Outstanding", value: formatMoney(outstanding, "BDT", 0), hint: "Across all bookings" },
          { label: "Overdue", value: String(overdue), hint: "Past the due date" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{stat.value}</p>
            <p className="mt-0.5 text-[10.5px] text-slate-400">{stat.hint}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-line px-4 py-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Invoice register</h2>
              <p className="text-[11px] text-muted">{filtered.length} invoices match your filters</p>
            </div>
            <div className="flex gap-2">
              <Badge tone="green">{db.invoices.filter((invoice) => invoice.status === "paid").length} paid</Badge>
              <Badge tone="amber">{db.invoices.filter((invoice) => invoice.status === "partial").length} partial</Badge>
            </div>
          </div>
          <FilterBar
            placeholder="Search invoice, booking or customer…"
            filters={[
              {
                name: "status",
                label: "All statuses",
                options: ["draft", "sent", "partial", "paid", "overdue", "void"].map((value) => ({ value, label: titleCase(value) })),
              },
              { name: "type", label: "All services", options: types.map((value) => ({ value, label: value })) },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[900px]">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Booking</th>
                    <th>Service</th>
                    <th>Issued</th>
                    <th>Due date</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Balance</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>
                        <Link href={`/admin/invoices/${invoice.id}`} className="font-mono text-[11.5px] font-medium text-primary hover:underline">
                          {invoice.number}
                        </Link>
                      </td>
                      <td className="max-w-[170px] truncate text-[12px] font-medium text-ink">{invoice.customerName}</td>
                      <td className="font-mono text-[11px] text-slate-500">{invoice.bookingRef}</td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">{invoice.type}</td>
                      <td className="whitespace-nowrap text-[11.5px]">{formatDate(invoice.issueDate)}</td>
                      <td className="whitespace-nowrap text-[11.5px]">
                        <span className={invoice.due > 0 && invoice.dueDate < today ? "font-medium text-danger" : ""}>{formatDate(invoice.dueDate)}</span>
                      </td>
                      <td className="whitespace-nowrap text-right text-[12px] font-medium text-ink">{formatMoney(invoice.total)}</td>
                      <td className="whitespace-nowrap text-right text-[12px]">{invoice.due > 0 ? <span className="font-medium text-amber-700">{formatMoney(invoice.due)}</span> : <span className="text-slate-400">—</span>}</td>
                      <td className="text-right"><StatusBadge status={invoice.due > 0 && invoice.dueDate < today && invoice.status !== "paid" ? "overdue" : invoice.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/invoices" />
          </>
        ) : (
          <EmptyState
            icon={<ReceiptText className="h-5 w-5" />}
            title="No invoices match those filters"
            description="Invoices are generated automatically when a booking is confirmed. Create a booking to issue the first invoice."
          />
        )}
      </Card>
    </div>
  );
}
