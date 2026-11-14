import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info } from "lucide-react";
import { PageSettingsForm } from "@/components/forms/page-settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { canWriteModule, normalizeRole } from "@/lib/access";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { isSitePageKey, pageContent, sitePageDefinition } from "@/lib/site-pages";

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }): Promise<Metadata> {
  const { page } = await params;
  return { title: isSitePageKey(page) ? `Edit ${sitePageDefinition(page).label}` : "Page" };
}

export default async function EditPageSettings({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageKey } = await params;
  if (!isSitePageKey(pageKey)) notFound();

  const user = await requireModuleAccess("settings", "view");
  const canEdit = canWriteModule(normalizeRole(user.role), "settings");
  const settings = await getRepository().getSettings();
  const definition = sitePageDefinition(pageKey);
  const saved = settings.pages[pageKey];
  const defaults = pageContent(pageKey, { ...saved, eyebrow: "", heading: "", subtitle: "" });

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Edit ${definition.label}`}
        description={definition.description}
        breadcrumb={[
          { label: "Workspace", href: "/admin" },
          { label: "Pages", href: "/admin/pages" },
          { label: definition.label },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/pages"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All pages
            </Link>
            <Link
              href={definition.path}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <ArrowUpRight className="h-3.5 w-3.5" /> View page
            </Link>
          </div>
        }
      />

      {!canEdit ? (
        <div className="flex items-start gap-2 rounded-control border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-5 text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Your role can view this page but not change it. Ask a super administrator or administrator to update it.
        </div>
      ) : null}

      <Card>
        <CardContent>
          <PageSettingsForm
            pageKey={pageKey}
            pageName={definition.label}
            path={definition.path}
            settings={saved}
            defaultEyebrow={defaults.eyebrow}
          />
        </CardContent>
      </Card>

      <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Fonts, logo and site-wide colours stay in the{" "}
        <Link href="/admin/homepage" className="font-semibold text-primary hover:underline">
          Website editor
        </Link>
        . This screen only changes {definition.label}.
      </p>
    </div>
  );
}
