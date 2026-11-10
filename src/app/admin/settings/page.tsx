import type { Metadata } from "next";
import { Database, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { SettingsForm } from "@/components/forms/settings-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "General settings" };

export default async function SettingsPage() {
  await requireUser();
  const settings = await getRepository().getSettings();
  const supabase = isSupabaseConfigured();

  return (
    <div className="space-y-4">
      <PageHeader
        title="General settings"
        description="Workspace identity, billing defaults and localisation. Changes apply to new documents immediately."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Settings" }, { label: "General" }]}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent>
            <SettingsForm settings={settings} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Workspace status</CardTitle>
                <CardDescription>Runtime configuration</CardDescription>
              </div>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2.5">
                <span className={`flex h-8 w-8 items-center justify-center rounded-control ${supabase ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                  <Database className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-ink">{supabase ? "Supabase connected" : "Local database"}</p>
                  <p className="text-[10px] text-muted">{supabase ? "Postgres · row-level security ready" : "File-backed workspace · .data/db.json"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-control bg-slate-100 text-slate-600">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-ink">Role-based access</p>
                  <p className="text-[10px] text-muted">Five roles · superadmin, admin, manager, account and guest</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-control border border-line px-3 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-control bg-slate-100 text-slate-600">
                  <Globe2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-ink">Currency & locale</p>
                  <p className="text-[10px] text-muted">{settings.defaultCurrency} · {settings.timezone} · English</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Connected modules</CardTitle>
                <CardDescription>Add-ons available to this tenant</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[
                ["Tour packages", true],
                ["Hotel inventory", true],
                ["Visa processing", true],
                ["Hajj & Umrah", true],
                ["CRM & tasks", true],
                ["Flight provider API", false],
                ["Document intelligence", false],
                ["Google Sheets sync", false],
              ].map(([label, enabled]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-control px-2 py-1.5 text-[11.5px] hover:bg-slate-50">
                  <span className="text-slate-600">{label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {enabled ? "Enabled" : "Available"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="rounded-card border border-dashed border-slate-300 bg-white/60 p-3.5 text-[10.5px] leading-5 text-slate-500">
            <strong className="font-semibold text-slate-700">Production note:</strong> add Supabase keys to <code className="rounded bg-slate-100 px-1 py-0.5">.env.local</code> and run the
            migration in <code className="rounded bg-slate-100 px-1 py-0.5">supabase/migrations</code> to switch from the local file store.
          </div>
        </div>
      </div>
    </div>
  );
}
