# 3M Tours & Travels ERP

A production-shaped travel-agency ERP built with Next.js App Router, TypeScript, Tailwind CSS and Supabase. It unifies tour, hotel, visa and Hajj/Umrah bookings with customers, invoices, CRM, tasks and finance in a single responsive admin workspace.

> All brands, copy, imagery and seed records are original to this project. The fictional agency **3M Tours & Travels** and BDT (`৳`) pricing are used throughout.

## Project links

- **Repository:** <https://github.com/rashed0611-cloud/3mtnt>
- **Database:** Supabase project `cekagddoithvlklhuosi` (PostgreSQL 17, `ap-south-1`) — schema applied and seeded with the fictional dataset.
- **Super-admin sign-in:** `superadmin@3mtnt.com` / `Welcome@3M2026`
- **Workspace accounts:** five role-based accounts — see [Users & roles](#users--roles).

---

## Highlights

- **Dense operations dashboard** — revenue, bookings, receivables, momentum chart, status mix, recent bookings, tasks and live operations.
- **Unified booking ledger** — one register for tours, hotels, visas and Hajj/Umrah with bulk status updates, payments, invoices, timelines and CSV export.
- **Six-step tour booking wizard** — customer & tour → travellers → schedule & options → pricing & payment → documents & notes → review & confirm.
- **Service workspaces** — dedicated dashboards and registers for tour, hotel, visa and Hajj/Umrah desks.
- **Booking calendar** — month grid across every service type with departure density and month-at-a-glance mix.
- **CRM** — pipeline dashboard, leads with inline stage changes, follow-ups and conversion value.
- **Finance** — income, cost, profit, receivables, cash-flow chart, aging, transactions, suppliers and document counts.
- **Customers & tours** — searchable lists, create/edit flows, itineraries, inclusions/exclusions and linked bookings/invoices.
- **Tasks, activity log, global search, notifications and settings**.
- **Responsive shell** — collapsible icon rail, mobile drawer, expandable nav groups, command palette and user menu.
- **Role-ready foundation** — middleware-protected `/admin`, server-side session checks, service-role data access and Supabase Auth support.
- **Public travel website** — original home page, tour/hotel/visa/pilgrimage catalogues, detail pages, enquiry form that creates a CRM lead, and a customer-portal placeholder.
- **SEO basics** — per-page metadata, Open Graph/Twitter tags, `sitemap.xml` generated from live inventory, and `robots.txt` that keeps `/admin` private.
- **Graceful module scaffolds** — unbuilt navigation entries resolve to a polished in-app module preview instead of a 404.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15.5 (App Router, Server Components, Server Actions) |
| UI | React 19, Tailwind CSS 3.4, lucide-react, recharts |
| Language | TypeScript 5.7 |
| Validation | zod |
| Backend | Supabase (PostgreSQL + Auth) or local JSON store |
| Auth | Supabase Auth when configured; signed session cookie for local development |

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment defaults
cp .env.example .env.local

# 3. Run the app
npm run dev
```

Open <http://localhost:3000>. You will be redirected to `/login`.

**Local development sign-in** (only when Supabase is not configured)

```
Email:    superadmin@3mtnt.com
Password: Welcome@3M2026
```

The local file store lives in `.data/db.json` and is generated automatically on first access from `src/lib/seed-data.ts`. Delete `.data/` to reseed.

### Useful scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # run the production build
npm run typecheck  # tsc --noEmit
npm run db:seed    # push seed data to Supabase (needs service key)
```

---

## Supabase setup

The hosted project in the links above is already migrated and seeded. Follow these steps to stand up a fresh environment of your own.

1. Create or open a Supabase project.
2. Run `supabase/migrations/20261110000000_init.sql` in the **SQL Editor** (or with the Supabase CLI).
   It creates all ERP tables, indexes, row-level security and staff policies.
3. Copy the project URL and keys into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://your-public-domain.example
```

4. Seed realistic fictional data:

```bash
npm run db:seed
```

5. Create the five staff accounts in **Authentication → Users** (or with the Admin API) and set each user's `user_metadata.role` to one of `superadmin`, `admin`, `manager`, `account` or `guest`. When Supabase env vars are present the app authenticates with Supabase.

> The service-role key is used only in server components, server actions and route handlers. Never expose it to the browser.

### Switching data sources

`src/lib/db/index.ts` chooses the repository automatically:

- **Supabase configured** (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`) → `SupabaseRepository`
- **Otherwise** → `JsonRepository` backed by `.data/db.json`

The `Repository` contract in `src/lib/db/types.ts` keeps both implementations interchangeable.

---

## Users & roles

The workspace ships with five role-based accounts. Every account starts with the password `Welcome@3M2026`; users can change it from **User menu → Change password** (`/admin/account`).

| Account | Role | Access |
| --- | --- | --- |
| `superadmin@3mtnt.com` | Super Administrator | Everything, including settings and staff |
| `admin@3mtnt.com` | Administrator | Everything, including settings and staff |
| `manager@3mtnt.com` | Operations Manager | Bookings, tours, hotels, visas, Hajj, customers, CRM, tasks, B2B and communication |
| `account@3mtnt.com` | Accounts Officer | Finance, invoices, payments, suppliers and reports, plus booking and customer overview |
| `guest@3mtnt.com` | Guest | View-only across the workspace; cannot create, edit or delete records |

Access is enforced in three places: the sidebar only lists permitted modules, `middleware.ts` blocks disallowed URLs, and every server action re-checks write permission before touching data. Guests additionally see a view-only banner.

The role is read from `user_metadata.role` on the Supabase user. Change a user's role in **Authentication → Users** (or with the Admin API); the next sign-in applies it.

---

## Project structure

```
src/
├─ app/
│  ├─ (site)/                   # public travel website
│  │  ├─ page.tsx               # home
│  │  ├─ tours/                 # catalogue + detail
│  │  ├─ hotels/                # catalogue + detail
│  │  ├─ visas/                 # catalogue + detail
│  │  ├─ hajj-umrah/            # packages + detail
│  │  ├─ contact/               # enquiry form -> CRM lead
│  │  └─ portal/                # customer portal placeholder
│  ├─ admin/                    # protected ERP workspace
│  │  ├─ page.tsx               # operations dashboard
│  │  ├─ all-bookings/          # unified ledger, detail, CSV export
│  │  ├─ create-booking/        # service chooser + six-step tour wizard
│  │  ├─ tour-bookings/         # service registers
│  │  ├─ hotel-bookings/
│  │  ├─ visa-bookings/
│  │  ├─ hajj-umrah/bookings/
│  │  ├─ booking-calendar/
│  │  ├─ customers/             # list, create, detail, edit, export
│  │  ├─ tours/                 # list, create, detail, export
│  │  ├─ hotels/  hotel/        # inventory + hotel dashboard
│  │  ├─ visas/   visa/         # catalogue + visa dashboard
│  │  ├─ hajj-umrah/            # dashboard + packages
│  │  ├─ invoices/              # aging register + printable invoice
│  │  ├─ crm/                   # dashboard, leads, follow-ups
│  │  ├─ task-management/       # tasks + create
│  │  ├─ accounts-dashboard/    # finance overview
│  │  ├─ activity-logs/  search/  notifications/  settings/
│  │  └─ [...slug]/             # polished module scaffolds
│  ├─ login/                    # Supabase / local sign-in
│  ├─ sitemap.ts  robots.ts     # SEO routes
│  └─ layout.tsx  globals.css
├─ components/
│  ├─ layout/                   # shell, sidebar, header
│  ├─ public/                   # site header/footer, cards, hero search, enquiry form
│  ├─ bookings/                 # table, wizard, standard form, actions
│  ├─ charts/  crm/  forms/  tasks/
│  └─ ui/                       # design-system primitives
├─ lib/
│  ├─ db/                       # Repository + JSON/Supabase adapters
│  ├─ seed-data.ts              # deterministic fictional dataset
│  ├─ stats.ts                  # dashboard/customer/booking aggregates
│  ├─ nav.ts                    # navigation + module registry
│  ├─ auth.ts                   # session helpers
│  ├─ supabase/                 # browser/server clients
│  ├─ types.ts  utils.ts
└─ middleware.ts                # protects /admin
supabase/migrations/            # PostgreSQL schema
scripts/seed.mjs                # Supabase seed script
```

---

## Booking references

| Service | Prefix | Example |
| --- | --- | --- |
| Tour | `TB` | `TB-000001` |
| Hotel | `HB` | `HB-000001` |
| Visa | `VB` | `VB-000001` |
| Hajj & Umrah | `HU` | `HU-000001` |

Invoices use `INV-<year>-<sequence>`.

---

## Design system

- Primary blue `#0b74de`, page background `#f5f7fb`, white card surfaces.
- 12 px card radius, 8 px control radius, subtle card shadow.
- Dense 11–13 px operational typography, tabular data tables, status pills.
- Reusable primitives in `src/components/ui`.
- BDT (`৳`) is the default currency; `formatMoney` supports BDT, USD, EUR, GBP, AED, SAR and INR.

---

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel (or any Next.js host).
3. Add the environment variables from `.env.example` in the hosting dashboard.
4. Run the Supabase migration and seed script once.
5. Deploy. `middleware.ts` protects `/admin` and enforces module access; server actions and the repository guards enforce write permissions.

---

## Notes

- Seed data is fictional and deterministic (fixed RNG seed) so screenshots and walkthroughs are repeatable.
- The local JSON repository logs activity and generates invoices/payments just like the Supabase adapter.
- Expense estimates are derived from booking margins so finance dashboards have meaningful cost and profit figures.
- Navigation entries without a dedicated workflow resolve to `/admin/[...slug]`, which renders module metadata and links to live modules.
