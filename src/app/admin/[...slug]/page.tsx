import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/admin/module-placeholder";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Module" };

export default async function ModulePlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const user = await requireUser();
  const { slug } = await params;

  return <ModulePlaceholder pathname={`/admin/${slug.join("/")}`} role={user.role} />;
}
