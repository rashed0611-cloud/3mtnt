-- ============================================================================
-- 3M Tours & Travels ERP — initial Supabase / PostgreSQL schema
-- Project: cekagddoithvlklhuosi
--
-- The application accesses these tables with the service-role key from server
-- components and server actions, so RLS stays enabled and the service role
-- bypasses it. Authenticated staff also get read/write policies for direct
-- Supabase-auth usage.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id text primary key,
  code text not null unique,
  name text not null,
  company text,
  email text not null default '',
  phone text not null default '',
  nationality text not null default 'Bangladeshi',
  status text not null default 'active' check (status in ('active', 'inactive')),
  tags jsonb not null default '[]'::jsonb,
  assigned_to text not null default 'Unassigned',
  notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tour packages
-- ---------------------------------------------------------------------------
create table if not exists public.tours (
  id text primary key,
  code text not null unique,
  title text not null,
  slug text not null,
  destination text not null,
  type text not null default 'custom' check (type in ('custom', 'fixed_departure', 'private', 'group')),
  duration_days integer not null default 1,
  duration_nights integer not null default 0,
  adult_price numeric(14, 2) not null default 0,
  child_price numeric(14, 2) not null default 0,
  currency text not null default 'BDT',
  capacity integer not null default 0,
  status text not null default 'active' check (status in ('active', 'draft', 'archived')),
  featured boolean not null default false,
  supplier text not null default 'Own inventory',
  description text not null default '',
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Hotel inventory
-- ---------------------------------------------------------------------------
create table if not exists public.hotels (
  id text primary key,
  name text not null,
  slug text not null,
  location text not null,
  star_rating integer not null default 3,
  price numeric(14, 2) not null default 0,
  currency text not null default 'BDT',
  rooms integer not null default 0,
  status text not null default 'draft' check (status in ('publish', 'draft', 'archived')),
  featured boolean not null default false,
  description text not null default '',
  amenities jsonb not null default '[]'::jsonb,
  supplier text not null default 'Own inventory'
);

-- ---------------------------------------------------------------------------
-- Visa products
-- ---------------------------------------------------------------------------
create table if not exists public.visa_packages (
  id text primary key,
  country text not null,
  visa_type text not null,
  processing_time text not null,
  price numeric(14, 2) not null default 0,
  currency text not null default 'BDT',
  status text not null default 'draft' check (status in ('active', 'draft')),
  required_documents jsonb not null default '[]'::jsonb,
  description text not null default ''
);

-- ---------------------------------------------------------------------------
-- Hajj & Umrah packages
-- ---------------------------------------------------------------------------
create table if not exists public.hajj_packages (
  id text primary key,
  title text not null,
  kind text not null check (kind in ('hajj', 'umrah', 'ramadan_umrah')),
  tier text not null,
  departure_date date not null,
  return_date date not null,
  price numeric(14, 2) not null default 0,
  currency text not null default 'BDT',
  capacity integer not null default 0,
  booked integer not null default 0,
  status text not null default 'draft' check (status in ('active', 'draft'))
);

-- ---------------------------------------------------------------------------
-- Unified bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id text primary key,
  ref text not null unique,
  service_type text not null check (service_type in ('tour', 'hotel', 'visa', 'hajj')),
  title text not null,
  customer_id text not null references public.customers (id) on delete restrict,
  customer_name text not null,
  customer_phone text not null default '',
  start_date date not null,
  end_date date not null,
  travelers integer not null default 1,
  adults integer not null default 1,
  children integer not null default 0,
  subtotal numeric(14, 2) not null default 0,
  discount numeric(14, 2) not null default 0,
  tax numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  paid numeric(14, 2) not null default 0,
  due numeric(14, 2) not null default 0,
  currency text not null default 'BDT',
  payment_status text not null default 'unpaid',
  status text not null default 'draft',
  assigned_to text not null default 'Unassigned',
  supplier text,
  source text not null default 'website',
  notes text,
  created_at timestamptz not null default now(),
  timeline jsonb not null default '[]'::jsonb
);

create index if not exists bookings_service_type_idx on public.bookings (service_type);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_start_date_idx on public.bookings (start_date);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id text primary key,
  number text not null unique,
  booking_ref text not null default '',
  customer_name text not null,
  issue_date date not null,
  due_date date not null,
  total numeric(14, 2) not null default 0,
  paid numeric(14, 2) not null default 0,
  due numeric(14, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'partial', 'paid', 'overdue', 'void')),
  type text not null default 'Booking',
  currency text not null default 'BDT'
);

create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_booking_ref_idx on public.invoices (booking_ref);

-- ---------------------------------------------------------------------------
-- CRM leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id text primary key,
  name text not null,
  company text,
  phone text not null default '',
  email text not null default '',
  source text not null default 'website',
  requirement text not null default '',
  assigned_to text not null default 'Unassigned',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  tags jsonb not null default '[]'::jsonb,
  status text not null default 'new',
  next_follow_up date,
  last_contact date,
  estimated_value numeric(14, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists leads_status_idx on public.leads (status);

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id text primary key,
  title text not null,
  related_to text not null default 'General',
  assigned_to text not null default 'Unassigned',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null default 'to_do',
  start_date date not null default current_date,
  due_date date not null default current_date,
  subtasks jsonb not null default '{"done":0,"total":0}'::jsonb,
  checklist jsonb not null default '{"done":0,"total":0}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Activity / audit log
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id text primary key,
  actor text not null default 'Administrator',
  action text not null,
  module text not null default 'Workspace',
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  description text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists activities_created_at_idx on public.activities (created_at desc);

-- ---------------------------------------------------------------------------
-- Suppliers
-- ---------------------------------------------------------------------------
create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  service text not null,
  contact text not null default '',
  phone text not null default '',
  balance numeric(14, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

-- ---------------------------------------------------------------------------
-- B2B agents
-- ---------------------------------------------------------------------------
create table if not exists public.agents (
  id text primary key,
  code text not null unique,
  name text not null,
  contact text not null default '',
  phone text not null default '',
  type text not null default 'agency' check (type in ('agency', 'individual')),
  commission numeric(6, 2) not null default 0,
  bookings integer not null default 0,
  sales numeric(14, 2) not null default 0,
  available numeric(14, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive'))
);

-- ---------------------------------------------------------------------------
-- Workspace settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  site_name text not null default '3M Tours & Travels ERP',
  tagline text not null default 'Travel operations, without the friction',
  legal_name text not null default '3M Tours & Travels Limited',
  email text not null default 'hello@3mtnt.com',
  phone text not null default '+880 1700 000 000',
  address text not null default 'Dhaka, Bangladesh',
  default_currency text not null default 'BDT',
  timezone text not null default 'Asia/Dhaka',
  invoice_prefix text not null default 'INV',
  tax_rate numeric(6, 2) not null default 0,
  logo_text text not null default '3M'
);

-- ---------------------------------------------------------------------------
-- Row level security
-- Service role bypasses RLS. These policies allow signed-in staff sessions
-- (Supabase Auth) to work with the same tables when the anon key is used.
-- ---------------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'customers', 'tours', 'hotels', 'visa_packages', 'hajj_packages', 'bookings',
    'invoices', 'leads', 'tasks', 'activities', 'suppliers', 'agents', 'app_settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format('drop policy if exists "staff read %1$s" on public.%1$I', tbl);
    execute format('drop policy if exists "staff write %1$s" on public.%1$I', tbl);
    execute format(
      'create policy "staff read %1$s" on public.%1$I for select to authenticated using (true)',
      tbl
    );
    execute format(
      'create policy "staff write %1$s" on public.%1$I for all to authenticated using (true) with check (true)',
      tbl
    );
  end loop;
end
$$;

-- Keep grants explicit for the standard Supabase roles.
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
