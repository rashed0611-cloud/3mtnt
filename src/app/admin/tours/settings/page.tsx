import type { Metadata } from "next";
import { Globe2, Info, ReceiptText } from "lucide-react";
import { TourSettingsForm } from "@/components/forms/tour-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { canWriteModule, normalizeRole } from "@/lib/access";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Tour settings" };

export default async function TourSettingsPage() {
  const user = await requireModuleAccess("tours", "view");
  const canEdit = canWriteModule(normalizeRole(user.role), "tours");
  const settings = await getRepository().getSettings();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tour settings"
        description="Defaults for tour packages, deposits and the documents generated from them."
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Tours", href: "/admin/tours" },
          { label: "Tour settings" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent>
            {canEdit ? (
              <TourSettingsForm settings={settings} />
            ) : (
              <div className="space-y-4">
                <p className="rounded-control border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11.5px] leading-5 text-amber-900">
                  Your role has view-only access to tour settings. Ask an administrator or operations manager to make changes.
                </p>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Default status for new tours", settings.tourDefaultStatus === "draft" ? "Draft" : "Active"],
                    ["Cancellation window", `${settings.tourCancellationDays} days before departure`],
                    ["Deposit per person", `${settings.tourDepositPercent}%`],
                    ["Invoice prefix", settings.invoicePrefix],
                    ["Tax rate", `${settings.taxRate}%`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-control border border-line px-3 py-2.5">
                      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                      <dd className="mt-0.5 text-[12.5px] font-medium text-ink">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" /> Where this is used
                </CardTitle>
                <CardDescription>What each default changes.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-[11.5px] leading-5 text-slate-600">
              <p>
                <span className="font-semibold text-ink">Default status</span> sets whether a newly created tour starts as a
                published package or a draft.
              </p>
              <p>
                <span className="font-semibold text-ink">Cancellation window</span> is shown as the free-cancellation period on
                the public tour page.
              </p>
              <p>
                <span className="font-semibold text-ink">Deposit percent</span> is used for the per-person deposit shown on tour
                details and in booking guidance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-primary" /> Shared with finance
                </CardTitle>
                <CardDescription>Invoice prefix and tax.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-start gap-2 text-[11.5px] leading-5 text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <p>
                Tax rate and invoice prefix also appear in General settings. Editing them here updates the same workspace
                values in one step.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
