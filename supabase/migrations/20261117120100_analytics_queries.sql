-- Phase 4A: aggregate reads for the analytics dashboard.
--
-- security invoker: they run as the signed-in member, so the RLS on the rollup tables decides what comes back (members
-- only, aal2 only). They exist so the browser reads a few hundred summed rows instead of paging thousands of daily rows.

create or replace function public.analytics_pages(p_from date, p_to date)
returns table (path text, views bigint, visitors bigint, avg_time_s numeric, bounces bigint, exits bigint, entries bigint, conversions bigint)
language sql stable security invoker set search_path = public as $$
  select s.path,
    sum(s.views)::bigint,
    sum(s.visitors)::bigint,
    case when sum(s.views) filter (where s.avg_time_s is not null) > 0
      then round(sum(s.avg_time_s * s.views) / sum(s.views) filter (where s.avg_time_s is not null), 1) end,
    sum(s.bounces)::bigint, sum(s.exits)::bigint, sum(s.entries)::bigint, sum(s.conversions)::bigint
  from public.site_stats_daily s
  where s.date between p_from and p_to and s.path not in ('*', '/blog/*')
  group by s.path
  order by sum(s.views) desc
  limit 500
$$;

create or replace function public.analytics_breakdown(p_from date, p_to date, p_path text, p_dimension text)
returns table (value text, visitors bigint, views bigint)
language sql stable security invoker set search_path = public as $$
  select b.value, sum(b.visitors)::bigint, sum(b.views)::bigint
  from public.site_breakdown_daily b
  where b.date between p_from and p_to and b.path = p_path and b.dimension = p_dimension
  group by b.value
  order by sum(b.visitors) desc, b.value
  limit 1000
$$;

-- Search Console queries. p_post null = the whole blog; p_scope 'site' = every page.
create or replace function public.analytics_search(p_from date, p_to date, p_scope text, p_post uuid default null)
returns table (query text, impressions bigint, clicks bigint, avg_position numeric)
language sql stable security invoker set search_path = public as $$
  select q.query, sum(q.impressions)::bigint, sum(q.clicks)::bigint,
    case when sum(q.impressions) > 0 then round(sum(q.position * q.impressions) / sum(q.impressions), 1) end
  from (
    select s.query, s.impressions, s.clicks, s.position
    from public.site_search_daily s
    where p_scope = 'site' and s.date between p_from and p_to
    union all
    select b.query, b.impressions, b.clicks, b.position
    from public.blog_search_daily b
    where p_scope = 'blog' and b.date between p_from and p_to and (p_post is null or b.post_id = p_post)
  ) q
  group by q.query
  order by sum(q.clicks) desc, sum(q.impressions) desc
  limit 200
$$;

create or replace function public.analytics_top_posts(p_from date, p_to date, p_limit integer default 20)
returns table (
  post_id uuid, slug text, title text, category_name text, published_at timestamptz,
  views bigint, readers bigint, depth_25 bigint, depth_50 bigint, depth_75 bigint, depth_100 bigint, cta_clicks bigint, signups bigint, share_clicks bigint, share_visits bigint
)
language sql stable security invoker set search_path = public as $$
  select p.id, p.slug, p.title, c.name, p.published_at,
    sum(s.views)::bigint, sum(s.readers)::bigint, sum(s.depth_25)::bigint, sum(s.depth_50)::bigint, sum(s.depth_75)::bigint, sum(s.depth_100)::bigint,
    sum(s.cta_clicks)::bigint, sum(s.signups)::bigint, sum(s.share_clicks)::bigint, sum(s.share_visits)::bigint
  from public.blog_stats_daily s
  join public.blog_posts p on p.id = s.post_id
  left join public.blog_categories c on c.id = p.category_id
  where s.date between p_from and p_to
  group by p.id, p.slug, p.title, c.name, p.published_at
  order by sum(s.views) desc
  limit greatest(1, least(p_limit, 200))
$$;

-- Helpful votes: counts per post (or for one post), with the reasons given on "No".
create or replace function public.analytics_feedback(p_post uuid default null)
returns table (post_id uuid, helpful boolean, reason text, votes bigint)
language sql stable security invoker set search_path = public as $$
  select f.post_id, f.helpful, f.reason, count(*)::bigint
  from public.blog_feedback f
  where p_post is null or f.post_id = p_post
  group by f.post_id, f.helpful, f.reason
$$;

-- Core Web Vitals: sample-weighted p75 per page and metric.
create or replace function public.analytics_vitals(p_from date, p_to date)
returns table (path text, metric text, p75 numeric, samples bigint)
language sql stable security invoker set search_path = public as $$
  select v.path, v.metric, round(sum(v.p75 * v.samples) / nullif(sum(v.samples), 0), 3), sum(v.samples)::bigint
  from public.site_vitals_daily v
  where v.date between p_from and p_to
  group by v.path, v.metric
  having sum(v.samples) >= 5 or v.path = '*'
  order by sum(v.samples) desc
  limit 400
$$;

revoke execute on function
  public.analytics_pages(date, date),
  public.analytics_breakdown(date, date, text, text),
  public.analytics_search(date, date, text, uuid),
  public.analytics_top_posts(date, date, integer),
  public.analytics_feedback(uuid),
  public.analytics_vitals(date, date)
  from public, anon;
grant execute on function
  public.analytics_pages(date, date),
  public.analytics_breakdown(date, date, text, text),
  public.analytics_search(date, date, text, uuid),
  public.analytics_top_posts(date, date, integer),
  public.analytics_feedback(uuid),
  public.analytics_vitals(date, date)
  to authenticated, service_role;
