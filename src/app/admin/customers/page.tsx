import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Download, UserPlus, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { customerRows } from "@/lib/stats";
import { formatDate, formatMoney, titleCase } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

const PAGE_SIZE = 10;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; assigned?: string; tag?: string; page?: string }>;
}) {
  await requireUser();
  const params = await searchParams;
  const db = await getRepository().getDatabase();
  const rows = customerRows(db);
  const staff = Array.from(new Set(db.customers.map((customer) => customer.assignedTo))).sort();
  const tags = Array.from(new Set(db.customers.flatMap((customer) => customer.tags))).sort();

  const term = (params.q ?? "").trim().toLowerCase();
  const filtered = rows.filter(({ customer, lastServiceType }) => {
    const haystack = [customer.name, customer.email, customer.phone, customer.company, customer.code].join(" ").toLowerCase();
    if (term && !haystack.includes(term)) return false;
    if (params.status && customer.status !== params.status) return false;
    if (params.assigned && customer.assignedTo !== params.assigned) return false;
    if (params.tag && !customer.tags.includes(params.tag)) return false;
    if (params.tag === "service" && !lastServiceType) return false;
    return true;
  });

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const stats = [
    { label: "Total customers", value: db.customers.length },
    { label: "Active", value: db.customers.filter((customer) => customer.status === "active").length },
    { label: "Corporate accounts", value: db.customers.filter((customer) => Boolean(customer.company)).length },
    { label: "Outstanding balance", value: formatMoney(db.bookings.reduce((sum, booking) => sum + booking.due, 0), "BDT", 0) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        description="A single record for every traveller and corporate account, linked to bookings, invoices and support history."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Sales & Quotation" }, { label: "Customers" }]}
        actions={
          <>
            <a
              href="/admin/customers/export"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </a>
            <Link
              href="/admin/customers/new"
              className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm hover:bg-primary-strong"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add customer
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-wide text-muted">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-ink">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink">Customer directory</h2>
              <p className="text-[11px] text-muted">{filtered.length} records match your filters</p>
            </div>
            <Badge tone="blue">{db.customers.length} total</Badge>
          </div>
          <FilterBar
            placeholder="Search name, email, phone or code…"
            filters={[
              {
                name: "status",
                label: "All statuses",
                options: [
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
              { name: "assigned", label: "All staff", options: staff.map((item) => ({ value: item, label: item })) },
              { name: "tag", label: "All tags", options: tags.map((item) => ({ value: item, label: item })) },
            ]}
          />
        </div>

        {paged.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table min-w-[940px]">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Nationality</th>
                    <th>Tags</th>
                    <th className="text-center">Bookings</th>
                    <th className="text-right">Outstanding</th>
                    <th>Last service</th>
                    <th>Assigned</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(({ customer, bookings, due, lastService }) => (
                    <tr key={customer.id}>
                      <td>
                        <Link href={`/admin/customers/${customer.id}`} className="group flex items-center gap-2.5">
                          <Avatar name={customer.name} size="md" />
                          <span className="min-w-0">
                            <span className="block truncate text-[12.5px] font-medium text-ink group-hover:text-primary">{customer.name}</span>
                            <span className="block truncate text-[10.5px] text-muted">
                              {customer.company ?? customer.code}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <p className="text-[11.5px] text-slate-600">{customer.phone}</p>
                        <p className="max-w-[170px] truncate text-[10.5px] text-muted">{customer.email}</p>
                      </td>
                      <td className="whitespace-nowrap text-[12px]">{customer.nationality}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.length ? (
                            customer.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} tone={tag === "VIP" ? "amber" : tag === "Corporate" ? "violet" : "neutral"} className="px-1.5 py-0 text-[9.5px]">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center text-[12px] font-medium text-slate-700">{bookings}</td>
                      <td className="whitespace-nowrap text-right text-[12px]">
                        {due > 0 ? <span className="font-medium text-amber-700">{formatMoney(due, "BDT", 0)}</span> : <span className="text-slate-400">Clear</span>}
                      </td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">{lastService ? formatDate(lastService) : "—"}</td>
                      <td className="whitespace-nowrap text-[11.5px] text-slate-600">{customer.assignedTo}</td>
                      <td className="text-right">
                        <StatusBadge status={customer.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={current} pageSize={PAGE_SIZE} total={filtered.length} params={params} basePath="/admin/customers" />
          </>
        ) : (
          <EmptyState
            icon={<Users className="h-5 w-5" />}
            title="No customers match those filters"
            description="Try a different search term or reset the filters. You can also add a new customer record."
            action={
              <Link href="/admin/customers/new" className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[12px] font-semibold text-white">
                <UserPlus className="h-3.5 w-3.5" /> Add customer
              </Link>
            }
          />
        )}
      </Card>

      <div className="flex items-center justify-between rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-[11.5px] text-slate-500">
        <p>Customers can also be created automatically during booking checkout.</p>
        <Link href="/admin/create-booking" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
          Start a booking <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
