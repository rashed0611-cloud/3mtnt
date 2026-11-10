"use client";

import { useActionState, useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState(state.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state.email) setEmail(state.email);
  }, [state.email]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? "/admin"} />
      {state.error ? (
        <div role="alert" className="rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700">
          {state.error}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="label-base">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@agency.com"
            className="input-base pl-9"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="label-base">
          Password
        </label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="input-base px-9"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" name="remember" defaultChecked className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/30" />
        Keep me signed in for 7 days
      </label>

      <Button type="submit" disabled={pending} className="h-11 w-full">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? "Signing in…" : "Sign in to workspace"}
        {!pending ? <ArrowRight className="h-4 w-4" /> : null}
      </Button>

      <p className="flex items-start gap-2 rounded-control border border-line bg-slate-50 px-3 py-2.5 text-[11.5px] leading-5 text-muted">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        Access is managed by your workspace administrator. Ask them to create an account or reset your password.
      </p>
    </form>
  );
}
