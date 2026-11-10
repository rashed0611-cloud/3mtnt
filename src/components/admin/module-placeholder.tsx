import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  LifeBuoy,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { canAccessPath, canViewModule, canWriteModule, moduleForPath, normalizeRole } from "@/lib/access";
import { navigation, type NavGroup, type NavItem, type NavSection } from "@/lib/nav";
import { titleCase } from "@/lib/utils";

interface Match {
  section?: NavSection;
  group: NavGroup;
  item: NavItem;
}

function findMatch(pathname: string): Match | null {
  const clean = pathname.replace(/\/+$/, "") || "/admin";
  let fallback: Match | null = null;

  for (const section of navigation) {
    for (const group of section.groups) {
      for (const item of group.items) {
        const href = item.href.split("?")[0].replace(/\/+$/, "");
        if (href === clean) return { section, group, item };
        if (!fallback && clean.startsWith(`${href}/`)) {
          fallback = { section, group, item };
        }
      }
    }
  }

  return fallback;
}

const CORE_LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Bookings", href: "/admin/all-bookings" },
  { label: "Tours", href: "/admin/tours" },
  { label: "Invoices", href: "/admin/invoices" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Accounts", href: "/admin/accounts-dashboard" },
  { label: "Settings", href: "/admin/settings" },
];

/**
 * Scaffold screen for module routes that are registered in the navigation but
 * do not have a dedicated workflow yet. Shared by the `[...slug]` catch-all and
 * by static routes that would otherwise be swallowed by a sibling `[id]` route
 * (for example `/admin/tours/settings`).
 */
export function ModulePlaceholder({ pathname, role }: { pathname: string; role: string }) {
  const normalizedRole = normalizeRole(role);
  const canBook = canWriteModule(normalizedRole, "bookings");
  const canSeeSettings = canViewModule(normalizedRole, "settings");
  const match = findMatch(pathname);
  const label = match?.item.label ?? titleCase(pathname.split("/").at(-1) ?? "Module");
  const groupLabel = match?.group.label ?? "Workspace";
  const sectionLabel = match?.section?.label || "Workspace";
  const siblings = (match?.group.items ?? []).filter(
    (item) => item.href.split("?")[0] !== match?.item.href.split("?")[0] && canAccessPath(normalizedRole, item.href),
  );
  const coreLinks = CORE_LINKS.filter((link) => canViewModule(normalizedRole, moduleForPath(link.href)));
  const GroupIcon = match?.group.icon ?? Blocks;

  const capabilities = match
    ? [
        `Create and manage ${label.toLowerCase()} records with validation and audit trails`,
        `Search, filter and export ${groupLabel.toLowerCase()} data to CSV`,
        `Role-aware access so operations, finance and management see the right fields`,
        `Linked records across customers, bookings, invoices and activity logs`,
      ]
    : [
        "Records linked to the unified booking, customer and finance ledgers",
        "Filters, bulk actions and exports following the 3M Tours design system",
        "Role-based permissions and activity logging",
        "Supabase-ready schema with seed data for evaluation",
      ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={label}
        description={`The ${label} workspace inside ${groupLabel}. This module is scaffolded and wired into the ERP navigation while its detailed workflow is being completed.`}
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: sectionLabel === "Workspace" ? groupLabel : sectionLabel },
          { label },
        ]}
        actions={
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back to dashboard
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                <GroupIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[15px] font-semibold text-ink">{groupLabel}</h2>
                  <Badge tone="amber">Module scaffold</Badge>
                </div>
                <p className="mt-1 max-w-xl text-[12px] leading-5 text-muted">
                  This route resolves through the 3M Tours module registry. The navigation entry, breadcrumb, permissions boundary and
                  design language are in place; the data workflow can be layered in without changing the rest of the ERP.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10.5px] font-medium text-slate-500">
              <CircleDashed className="h-3 w-3" /> In progress
            </span>
          </div>

          <div className="border-t border-line px-5 py-4">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <ListChecks className="h-3.5 w-3.5 text-slate-400" /> What this module will cover
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-2 rounded-control border border-line/70 bg-slate-50/60 px-3 py-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="text-[11.5px] leading-5 text-slate-600">{capability}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3.5">
            {canBook ? (
              <Link
                href="/admin/create-booking"
                className="inline-flex items-center gap-1.5 rounded-control bg-primary px-3 py-2 text-[11.5px] font-semibold text-white hover:bg-primary-strong"
              >
                <CalendarDays className="h-3.5 w-3.5" /> Create a booking
              </Link>
            ) : null}
            <Link
              href="/admin/all-bookings"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
            >
              Open booking ledger
            </Link>
            {canSeeSettings ? (
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[11.5px] font-medium text-slate-600 hover:bg-slate-50"
              >
                Workspace settings
              </Link>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <Blocks className="h-3.5 w-3.5 text-slate-400" /> Module details
            </h3>
            <dl className="mt-3 space-y-2 text-[11.5px]">
              {[
                ["Section", sectionLabel],
                ["Group", groupLabel],
                ["Route", pathname],
                ["Status", "Scaffolded"],
                ["Data source", "Supabase / local JSON store"],
              ].map(([term, value]) => (
                <div key={term} className="flex items-start justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0">
                  <dt className="text-slate-500">{term}</dt>
                  <dd className="max-w-[65%] truncate text-right font-medium text-slate-700">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {siblings.length ? (
            <Card className="p-4">
              <h3 className="text-[12px] font-semibold text-ink">Related pages in {groupLabel}</h3>
              <div className="mt-2.5 space-y-1">
                {siblings.slice(0, 5).map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="group flex items-center justify-between gap-2 rounded-control px-1.5 py-1.5 text-[11.5px] text-slate-600 hover:bg-slate-50 hover:text-primary"
                  >
                    <span className="truncate">{item.label}</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          <Card className="p-4">
            <h3 className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Jump to a live module
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {coreLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-[10.5px] font-medium text-slate-600 hover:border-primary/30 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-dashed border-slate-300 bg-white/60 px-4 py-3.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
          <LifeBuoy className="h-4 w-4 text-slate-400" />
          <p>Need this workflow prioritised? The ERP core is live — bookings, customers, tours, invoices, CRM and finance.</p>
        </div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline">
          Return to dashboard <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
