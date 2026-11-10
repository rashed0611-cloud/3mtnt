import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Tour settings" };

/**
 * `/admin/tours/settings` is a static route because `tours/[id]` would
 * otherwise capture "settings" as a tour id and return a 404.
 */
export default async function TourSettingsPage() {
  const user = await requireUser();

  return <ModulePlaceholder pathname="/admin/tours/settings" role={user.role} />;
}
