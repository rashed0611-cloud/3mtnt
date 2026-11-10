"use server";

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface PasswordState {
  error?: string;
  message?: string;
}

export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  if (!isSupabaseConfigured()) {
    return { error: "Password changes are available when Supabase Auth is configured." };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Enter your current password." };
  if (newPassword.length < 8) return { error: "Choose a password with at least 8 characters." };
  if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { error: "Include at least one letter and one number in the new password." };
  }
  if (newPassword !== confirmPassword) return { error: "The new passwords do not match." };
  if (newPassword === currentPassword) return { error: "Choose a password that is different from the current one." };

  const supabase = await createSupabaseServerClient();

  // Re-authenticate before changing the password so a borrowed session cannot
  // silently take over the account.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) return { error: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };

  return { message: "Password updated. Use the new password the next time you sign in." };
}
