-- Full site appearance: brand assets, banner, colours, fonts, announcements,
-- section visibility and SEO. Stored as one JSONB document.
alter table public.app_settings
  add column if not exists appearance jsonb not null default '{}'::jsonb;
