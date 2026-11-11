import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, GalleryHorizontalEnd, Globe2, ShieldCheck } from "lucide-react";
import { HomepageForm } from "@/components/forms/homepage-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requireModuleAccess } from "@/lib/auth";
import { getRepository } from "@/lib/db";

export const metadata: Metadata = { title: "Front page & gallery" };

export default async function HomepageEditorPage() {
  await requireModuleAccess("settings", "view");
  const settings = await getRepository().getSettings();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Front page & gallery"
        description="Edit the public home page hero, calls to action and gallery without touching code."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Front page & gallery" }]}
        actions={
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-2 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowUpRight className="h-3.5 w-3.5" /> View public site
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent>
            <HomepageForm settings={settings} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" /> What you control
                </CardTitle>
                <CardDescription>Everything here appears on the public site.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-[11.5px] leading-5 text-slate-600">
              <p>The hero badge, headline, highlighted phrase and introduction.</p>
              <p>Both hero buttons, including their labels and destination links.</p>
              <p>The gallery heading, introduction and image cards with captions and alt text.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GalleryHorizontalEnd className="h-4 w-4 text-primary" /> Gallery
                </CardTitle>
                <CardDescription>{settings.gallery.length} image{settings.gallery.length === 1 ? "" : "s"} published</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {settings.gallery.slice(0, 4).map((image) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={image.id}
                  src={image.url}
                  alt={image.alt || image.caption || "Gallery image"}
                  className="h-20 w-full rounded-control border border-line object-cover"
                />
              ))}
              {settings.gallery.length === 0 ? (
                <p className="col-span-2 rounded-control border border-dashed border-line px-3 py-4 text-center text-[11.5px] text-muted">
                  Upload your first image to start the gallery.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Admin only
                </CardTitle>
                <CardDescription>Content changes are restricted.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-[11.5px] leading-5 text-slate-600">
              Only super administrators and administrators can edit the public site. Changes are recorded in the activity log.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
