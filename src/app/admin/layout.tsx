import { AdminShell } from "@/components/layout/admin-shell";
import { requireUser } from "@/lib/auth";
import { getRepository } from "@/lib/db";
import { formatDateTime, titleCase } from "@/lib/utils";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  let notifications: { title: string; description: string; at: string; severity: "info" | "warning" | "critical" }[] = [];

  try {
    const activities = await getRepository().getActivities();
    notifications = activities.slice(0, 5).map((activity) => ({
      title: titleCase(activity.action),
      description: activity.description,
      at: formatDateTime(activity.createdAt),
      severity: activity.severity,
    }));
  } catch {
    notifications = [];
  }

  return (
    <AdminShell user={user} notifications={notifications}>
      {children}
    </AdminShell>
  );
}
