import type { Metadata } from "next";
import { KeyRound, ShieldCheck } from "lucide-react";
import { PasswordForm } from "@/app/admin/account/password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { roleLabel } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Account & security" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Account & security"
        description="Manage the password for your workspace account."
        breadcrumb={[{ label: "Workspace", href: "/admin" }, { label: "Account & security" }]}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Change password
              </CardTitle>
              <CardDescription>Confirm your current password before setting a new one.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="max-w-md">
            <PasswordForm />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Signed in as
              </CardTitle>
              <CardDescription>Your account details and access level.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[12px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Name</p>
              <p className="mt-0.5 font-medium text-ink">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Email</p>
              <p className="mt-0.5 break-all font-medium text-ink">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Role</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold text-primary">
                <ShieldCheck className="h-2.5 w-2.5" /> {roleLabel(user.role)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
