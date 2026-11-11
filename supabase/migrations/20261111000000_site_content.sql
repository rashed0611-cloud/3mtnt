-- Tour defaults and editable front-page content with a managed gallery.
alter table public.app_settings
  add column if not exists tour_default_status text not null default 'active',
  add column if not exists tour_cancellation_days integer not null default 7,
  add column if not exists tour_deposit_percent numeric(5, 2) not null default 30,
  add column if not exists homepage jsonb not null default '{}'::jsonb,
  add column if not exists gallery jsonb not null default '[]'::jsonb;
