import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowUpRight, BadgeCheck, ChartNoAxesCombined, Globe2, ShieldCheck, Sparkles } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { demoCredentials, getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

const highlights = [
  { icon: Globe2, title: "One booking model", text: "Tours, hotels, visas, flights, Hajj and Umrah in a single ledger." },
  { icon: ChartNoAxesCombined, title: "Live operations", text: "Cash flow, pipelines and departures without spreadsheet chasing." },
  { icon: ShieldCheck, title: "Permission-aware", text: "Role-based access and a complete audit trail on every record." },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  const { next } = await searchParams;
  const demo = demoCredentials();

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute inset-0 opacity-90">
          <div className="absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/40 blur-3xl" />
          <div className="absolute -bottom-40 right-0 h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%)]" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight">3M Tours</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">&amp; Travels</p>
            </div>
          </div>
        </div>

        <div className="relative mt-16 max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-cyan-100 backdrop-blur">
            <Sparkles className="h-3 w-3" /> Built for modern travel teams
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
            Run every journey from one calm, connected workspace.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
            From the first enquiry to the final invoice — bookings, suppliers, finance and travellers stay in sync across your
            entire agency.
          </p>

          <div className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/55">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-end justify-between gap-6 text-[11px] text-white/45">
          <p>© {new Date().getFullYear()} 3M Tours & Travels Ltd. · Dhaka, Bangladesh</p>
          <a href="https://supabase.com" className="inline-flex items-center gap-1 hover:text-white/80" target="_blank" rel="noreferrer">
            Supabase-ready <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-semibold tracking-tight">3M Tours & Travels ERP</p>
              <p className="text-[11px] text-muted">Operations workspace</p>
            </div>
          </div>

          <div className="mb-7">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <BadgeCheck className="h-3 w-3" /> Secure admin access
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted">Sign in to your agency workspace to pick up where you left off.</p>
          </div>

          <LoginForm next={next} demo={{ email: demo.email, password: demo.password }} />

          <p className="mt-7 text-center text-[11px] leading-5 text-muted">
            Protected by role-based access control. All actions in this workspace are recorded in the audit log.
          </p>
        </div>
      </section>
    </main>
  );
}
