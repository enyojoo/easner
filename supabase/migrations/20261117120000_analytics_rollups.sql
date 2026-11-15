-- Phase 4A: analytics rollups beyond the foundation tables.
--
-- The nightly job (admin/app/api/cron/analytics) reads PostHog and Search Console and writes these with the service
-- role. Members read; nobody writes from a session.
--
-- Row conventions the admin relies on:
--   site_stats_daily / site_breakdown_daily  path '*'        = whole site (unique visitors across every page)
--                                            path '/blog/*'  = the whole blog
--                                            any other path  = that page
--   site_breakdown_daily.dimension 'share_click' = share button clicks by network (value = network)
--   site_breakdown_daily.dimension 'share_visit' = visits that arrived with utm_medium=share (value = utm_source)

-- Share, time and entry counts the first cut of the tables left out.
alter table public.blog_stats_daily
  add column share_clicks integer not null default 0,
  add column share_visits integer not null default 0,
  add column avg_time_s numeric(10, 2),
  add column shares jsonb not null default '{}'::jsonb;

alter table public.site_stats_daily
  add column entries integer not null default 0;

-- Shares by network and the visits they brought back live in the breakdown table.
alter table public.site_breakdown_daily drop constraint site_breakdown_daily_dimension_check;
alter table public.site_breakdown_daily add constraint site_breakdown_daily_dimension_check check (
  dimension in (
    'country', 'region', 'city', 'device', 'browser', 'os', 'source', 'referrer', 'utm_campaign',
    'share_click', 'share_visit'
  )
);

-- Core Web Vitals at the 75th percentile of real visits, per page and day.
create table public.site_vitals_daily (
  date date not null,
  path text not null,
  metric text not null check (metric in ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')),
  p75 numeric(12, 3) not null,
  samples integer not null default 0,
  primary key (date, path, metric)
);

-- Search Console queries for every page, not only the blog (blog_search_daily keeps the per-post copy).
create table public.site_search_daily (
  date date not null,
  path text not null,
  query text not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  position numeric(6, 2),
  primary key (date, path, query)
);

-- One row per source and day the job has handled. The job reads it to know which days are left to fetch.
create table public.analytics_sync_log (
  source text not null check (source in ('posthog', 'gsc')),
  day date not null,
  status text not null check (status in ('ok', 'error', 'skipped')),
  rows_written integer not null default 0,
  error text,
  finished_at timestamptz not null default now(),
  primary key (source, day)
);

alter table public.site_vitals_daily enable row level security;
alter table public.site_search_daily enable row level security;
alter table public.analytics_sync_log enable row level security;

create policy "Members read site vitals" on public.site_vitals_daily
  for select to authenticated using (public.is_admin_member());
create policy "Members read site search" on public.site_search_daily
  for select to authenticated using (public.is_admin_member());
create policy "Members read sync log" on public.analytics_sync_log
  for select to authenticated using (public.is_admin_member());

revoke all on public.site_vitals_daily, public.site_search_daily, public.analytics_sync_log from anon;
revoke insert, update, delete, truncate on public.site_vitals_daily, public.site_search_daily, public.analytics_sync_log
  from authenticated;

-- Per-day lookups for the dashboard (range scans by date, per path).
create index site_breakdown_daily_dim_idx on public.site_breakdown_daily (dimension, date);
create index blog_search_daily_date_idx on public.blog_search_daily (date);
create index site_search_daily_date_idx on public.site_search_daily (date);
