"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changePasswordAction, type PasswordState } from "@/app/admin/account/actions";

const initialState: PasswordState = {};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label-base">
        {label}
      </label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className="input-base px-9"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-[12.5px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}
      {state.message ? (
        <div role="status" className="flex items-start gap-2 rounded-control border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[12.5px] font-medium text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      ) : null}

      <PasswordField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password" />
      <PasswordField id="newPassword" name="newPassword" label="New password" autoComplete="new-password" />
      <PasswordField id="confirmPassword" name="confirmPassword" label="Confirm new password" autoComplete="new-password" />

      <p className="text-[11px] leading-5 text-muted">
        Use at least 8 characters with one letter and one number. Changing your password signs out other devices at the next
        refresh.
      </p>

      <Button type="submit" disabled={pending} className="h-10">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
