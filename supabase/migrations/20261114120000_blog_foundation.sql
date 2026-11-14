-- Easner website: blog + admin foundation (docs/blog-and-admin-plan.md §5).
--
-- This is the `easner-website` Supabase project, never the banking database.
--
-- Access model
--   * anon (the public website) reads ONLY the *_public views at the bottom of this file. It has no grant on any
--     base table, so draft_content, drafts, future posts and admin data are unreachable.
--   * Every admin permission needs an admin_members row AND an aal2 (MFA-verified) session.
--   * Roles: owner (team, settings), editor (publish, categories, authors, media, redirects), writer (own drafts).
--   * Publish, unpublish and revision restore only happen through the security definer functions below. A guard
--     trigger stops anyone writing the published fields (content, status published/scheduled/archived,
--     published_at …) directly, whatever their role.
--   * Stats and feedback tables are written by server jobs with the service role (which bypasses RLS).

-- ---------------------------------------------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------------------------------------------

create type public.admin_role as enum ('owner', 'editor', 'writer');

-- changes_requested: an editor sent a writer's draft back (plan §8 decision 2).
create type public.blog_post_status as enum ('draft', 'in_review', 'changes_requested', 'scheduled', 'published', 'archived');

create type public.blog_revision_kind as enum ('autosave', 'publish', 'restore');

-- ---------------------------------------------------------------------------------------------------------------
-- Slugs
-- ---------------------------------------------------------------------------------------------------------------

-- Sections that share /blog/[slug] with posts. A post may never take one of these.
create function public.blog_reserved_slugs()
returns text[]
language sql
immutable
set search_path = ''
as $$
  select array['categories', 'authors', 'feed.xml', 'feed', 'page', 'search']::text[]
$$;

-- Lower-case words joined by single hyphens, 1–120 characters.
create function public.blog_slug_format_ok(slug text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select slug is not null
    and char_length(slug) between 1 and 120
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
$$;

create function public.blog_post_slug_ok(slug text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select public.blog_slug_format_ok(slug) and not (slug = any (public.blog_reserved_slugs()))
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Team
-- ---------------------------------------------------------------------------------------------------------------

create table public.admin_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.admin_role not null,
  name text not null default '' check (char_length(name) <= 120),
  email text not null check (email = lower(email)),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.admin_members is 'The admin allowlist. Anyone signed in without a row here sees "No access".';

-- An owner invites an email with a role; the person becomes a member the first time they sign in with it.
create table public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role public.admin_role not null,
  name text not null default '' check (char_length(name) <= 120),
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz
);

create unique index admin_invites_one_pending_per_email
  on public.admin_invites (email)
  where accepted_at is null and revoked_at is null;

create table public.admin_activity (
  id bigint generated always as identity primary key,
  actor uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_activity_entity_idx on public.admin_activity (entity, entity_id, created_at desc);
create index admin_activity_created_idx on public.admin_activity (created_at desc);

-- ---------------------------------------------------------------------------------------------------------------
-- Role helpers (used by every policy)
-- ---------------------------------------------------------------------------------------------------------------

-- The caller's role, with no MFA requirement. Lets the admin tell "not a member" from "member, needs MFA".
create function public.current_admin_role()
returns public.admin_role
language sql
stable
security definer
set search_path = ''
as $$
  select m.role from public.admin_members m where m.user_id = auth.uid()
$$;

-- True when the caller is a member with one of `roles` AND the session is MFA-verified (aal2).
create function public.has_admin_role(variadic roles public.admin_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1 from public.admin_members m
      where m.user_id = auth.uid() and m.role = any (roles)
    )
$$;

create function public.is_admin_member()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.has_admin_role('owner', 'editor', 'writer')
$$;

create function public.is_blog_editor()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.has_admin_role('owner', 'editor')
$$;

create function public.is_admin_owner()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.has_admin_role('owner')
$$;

-- Internal: written by the security definer functions so the activity log can't be forged from the client.
create function public.log_admin_activity(p_action text, p_entity text, p_entity_id text, p_meta jsonb default '{}'::jsonb)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.admin_activity (actor, action, entity, entity_id, meta)
  values (auth.uid(), p_action, p_entity, p_entity_id, coalesce(p_meta, '{}'::jsonb))
$$;

create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------------------------------------------

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (public.blog_slug_format_ok(slug)),
  name text not null check (char_length(name) between 1 and 60),
  description text not null default '' check (char_length(description) <= 300),
  intro jsonb,
  og_art_path text,
  sort_order integer not null default 0,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 300),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (public.blog_slug_format_ok(slug)),
  name text not null check (char_length(name) between 1 and 120),
  title text check (char_length(title) <= 120),
  location text check (char_length(location) <= 120),
  avatar_path text,
  bio jsonb,
  x_url text check (x_url ~ '^https://'),
  linkedin_url text check (linkedin_url ~ '^https://'),
  github_url text check (github_url ~ '^https://'),
  website_url text check (website_url ~ '^https://'),
  -- Null for guest authors (no login).
  member_id uuid unique references public.admin_members (user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (public.blog_post_slug_ok(slug)),
  status public.blog_post_status not null default 'draft',
  title text not null default '' check (char_length(title) <= 200),
  excerpt text check (char_length(excerpt) <= 400),
  cover_path text,
  cover_alt text check (char_length(cover_alt) <= 300),
  -- {"x": 0..1, "y": 0..1}: the point every crop keeps in frame.
  cover_focal_point jsonb check (
    cover_focal_point is null
    or (
      jsonb_typeof(cover_focal_point -> 'x') = 'number'
      and jsonb_typeof(cover_focal_point -> 'y') = 'number'
      and (cover_focal_point ->> 'x')::numeric between 0 and 1
      and (cover_focal_point ->> 'y')::numeric between 0 and 1
    )
  ),
  -- Optional social override (1200×630). The cover is the share image otherwise.
  og_image_path text,
  -- Published Tiptap/ProseMirror doc. Only publish_post writes it.
  content jsonb,
  -- Working doc. Null when there are no pending changes. Never exposed publicly.
  draft_content jsonb,
  -- Lets lists show "Changes not published" without reading the draft doc.
  has_unpublished_changes boolean generated always as (draft_content is not null) stored,
  -- Plain text of `content`, for search, read time and llms.txt. Set by publish_post.
  content_text text,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(summary, '') || ' ' || coalesce(excerpt, '')), 'B')
    || setweight(to_tsvector('english', coalesce(content_text, '')), 'C')
  ) stored,
  category_id uuid references public.blog_categories (id) on delete restrict,
  -- The product page this post supports, e.g. /business/payroll (Related reading).
  product_page text check (product_page ~ '^/[a-z0-9/-]*$'),
  featured boolean not null default false,
  featured_rank integer,
  seo_title text check (char_length(seo_title) <= 120),
  seo_description text check (char_length(seo_description) <= 300),
  canonical_url text check (canonical_url ~ '^https://'),
  noindex boolean not null default false,
  focus_keyword text check (char_length(focus_keyword) <= 120),
  -- Summary block text: AEO answer, speakable, llms.txt line, meta description fallback.
  summary text check (char_length(summary) <= 600),
  -- Drives dateModified and sitemap lastmod. Only a real (significant) content change moves it.
  content_modified_at timestamptz,
  -- Pinned /answers section.
  answers_section text,
  word_count integer not null default 0,
  reading_minutes integer not null default 0,
  published_at timestamptz,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  updated_by uuid references auth.users (id) on delete set null,
  locked_by uuid references auth.users (id) on delete set null,
  locked_at timestamptz
);

create index blog_posts_live_idx on public.blog_posts (published_at desc) where status = 'published';
create index blog_posts_category_idx on public.blog_posts (category_id);
create index blog_posts_status_idx on public.blog_posts (status, updated_at desc);
create index blog_posts_created_by_idx on public.blog_posts (created_by);
create index blog_posts_search_idx on public.blog_posts using gin (search);
create index blog_posts_featured_idx on public.blog_posts (featured_rank) where featured;

create table public.blog_post_authors (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  author_id uuid not null references public.blog_authors (id) on delete restrict,
  position smallint not null default 0,
  primary key (post_id, author_id)
);

create index blog_post_authors_author_idx on public.blog_post_authors (author_id);

create table public.blog_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  content jsonb,
  title text,
  excerpt text,
  kind public.blog_revision_kind not null,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index blog_revisions_post_idx on public.blog_revisions (post_id, created_at desc);

-- Old slug → post. Served as a 301 by the website's proxy.
create table public.blog_redirects (
  from_slug text primary key check (public.blog_post_slug_ok(from_slug)),
  to_post_id uuid not null references public.blog_posts (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.blog_media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  width integer check (width > 0),
  height integer check (height > 0),
  mime text not null,
  size bigint check (size >= 0),
  alt text check (char_length(alt) <= 300),
  caption text check (char_length(caption) <= 500),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------------------------
-- Analytics rollups and feedback (written by server jobs with the service role)
-- ---------------------------------------------------------------------------------------------------------------

create table public.blog_stats_daily (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  date date not null,
  views integer not null default 0,
  readers integer not null default 0,
  depth_25 integer not null default 0,
  depth_50 integer not null default 0,
  depth_75 integer not null default 0,
  depth_100 integer not null default 0,
  cta_clicks integer not null default 0,
  signups integer not null default 0,
  sources jsonb not null default '{}'::jsonb,
  primary key (post_id, date)
);

create table public.blog_search_daily (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  date date not null,
  query text not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  position numeric(6, 2),
  primary key (post_id, date, query)
);

create table public.blog_feedback (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  helpful boolean not null,
  reason text check (reason in ('out_of_date', 'not_what_i_was_looking_for', 'too_technical', 'missing_my_country')),
  -- Daily-salted hash; the IP itself is never stored.
  visitor_hash text not null,
  created_at timestamptz not null default now()
);

create index blog_feedback_post_idx on public.blog_feedback (post_id, created_at desc);

create table public.site_stats_daily (
  date date not null,
  path text not null,
  visitors integer not null default 0,
  views integer not null default 0,
  avg_time_s numeric(10, 2),
  bounces integer not null default 0,
  exits integer not null default 0,
  conversions integer not null default 0,
  primary key (date, path)
);

create table public.site_breakdown_daily (
  date date not null,
  path text not null,
  dimension text not null check (
    dimension in ('country', 'region', 'city', 'device', 'browser', 'os', 'source', 'referrer', 'utm_campaign')
  ),
  value text not null,
  visitors integer not null default 0,
  views integer not null default 0,
  primary key (date, path, dimension, value)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------------------------

create trigger admin_members_touch before update on public.admin_members
  for each row execute function public.touch_updated_at();
create trigger blog_categories_touch before update on public.blog_categories
  for each row execute function public.touch_updated_at();
create trigger blog_authors_touch before update on public.blog_authors
  for each row execute function public.touch_updated_at();

-- Never leave the team without an owner.
create function public.admin_members_keep_an_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and not exists (select 1 from public.admin_members m where m.role = 'owner' and m.user_id <> old.user_id) then
    raise exception 'The team needs at least one owner.' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end
$$;

create trigger admin_members_keep_an_owner before update of role or delete on public.admin_members
  for each row execute function public.admin_members_keep_an_owner();

create function public.admin_members_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.log_admin_activity('member.added', 'admin_member', new.user_id::text,
      jsonb_build_object('role', new.role, 'email', new.email));
  elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
    perform public.log_admin_activity('member.role_changed', 'admin_member', new.user_id::text,
      jsonb_build_object('from', old.role, 'to', new.role, 'email', new.email));
  elsif tg_op = 'DELETE' then
    perform public.log_admin_activity('member.removed', 'admin_member', old.user_id::text,
      jsonb_build_object('role', old.role, 'email', old.email));
  end if;
  return coalesce(new, old);
end
$$;

create trigger admin_members_log after insert or update or delete on public.admin_members
  for each row execute function public.admin_members_log();

-- Writers may edit their own author profile but not its slug or login link.
create function public.blog_authors_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.is_blog_editor() or auth.uid() is null then
    return new;
  end if;
  if new.slug is distinct from old.slug or new.member_id is distinct from old.member_id then
    raise exception 'Only an editor can change an author''s slug or login.' using errcode = 'insufficient_privilege';
  end if;
  return new;
end
$$;

create trigger blog_authors_guard before update on public.blog_authors
  for each row execute function public.blog_authors_guard();

-- Set by the security definer functions below so the guard lets their writes through.
create function public.blog_in_trusted_write()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(current_setting('easner.blog_trusted_write', true), '') = 'on'
$$;

-- Protects the published fields. Direct writes (any role) may only move a post between draft, in_review and
-- changes_requested, and never touch the published doc, its plain text or the publish dates.
create function public.blog_posts_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);

  -- Server jobs (service role, no user) and the trusted functions write freely.
  if public.blog_in_trusted_write() or auth.uid() is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.created_by is distinct from auth.uid() then
      raise exception 'A post is created by the person signed in.' using errcode = 'insufficient_privilege';
    end if;
    if new.status not in ('draft', 'in_review') then
      raise exception 'New posts start as drafts. Publish with publish_post().' using errcode = 'insufficient_privilege';
    end if;
    if new.content is not null or new.content_text is not null or new.published_at is not null
       or new.content_modified_at is not null then
      raise exception 'Published fields are set by publish_post().' using errcode = 'insufficient_privilege';
    end if;
    new.word_count := 0;
    new.reading_minutes := 0;
  else
    if new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at then
      raise exception 'A post''s creator can''t change.' using errcode = 'insufficient_privilege';
    end if;
    if new.status is distinct from old.status
       and (new.status not in ('draft', 'in_review', 'changes_requested')
            or old.status not in ('draft', 'in_review', 'changes_requested')) then
      raise exception 'Publish, unpublish and archive go through publish_post() and unpublish_post().'
        using errcode = 'insufficient_privilege';
    end if;
    if new.content is distinct from old.content
       or new.content_text is distinct from old.content_text
       or new.published_at is distinct from old.published_at
       or new.content_modified_at is distinct from old.content_modified_at
       or new.word_count is distinct from old.word_count
       or new.reading_minutes is distinct from old.reading_minutes then
      raise exception 'Published fields are set by publish_post().' using errcode = 'insufficient_privilege';
    end if;
    -- Only editors send a draft back with changes requested.
    if new.status = 'changes_requested' and old.status <> 'changes_requested' and not public.is_blog_editor() then
      raise exception 'Only an editor can request changes.' using errcode = 'insufficient_privilege';
    end if;
  end if;

  if not public.is_blog_editor() then
    if (tg_op = 'INSERT' and (new.featured or new.featured_rank is not null))
       or (tg_op = 'UPDATE' and (new.featured is distinct from old.featured
                                 or new.featured_rank is distinct from old.featured_rank)) then
      raise exception 'Only an editor can feature a post.' using errcode = 'insufficient_privilege';
    end if;
  end if;

  return new;
end
$$;

create trigger blog_posts_guard before insert or update on public.blog_posts
  for each row execute function public.blog_posts_guard();

-- A published post that changes slug keeps its old URL as a 301, and the change is logged.
create function public.blog_posts_slug_redirect()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.slug is distinct from old.slug and old.published_at is not null then
    insert into public.blog_redirects (from_slug, to_post_id)
    values (old.slug, new.id)
    on conflict (from_slug) do update set to_post_id = excluded.to_post_id, created_at = now();
    -- Old redirects keep pointing at the post; a redirect never shadows a live slug.
    delete from public.blog_redirects where from_slug = new.slug;
    perform public.log_admin_activity('post.slug_changed', 'blog_post', new.id::text,
      jsonb_build_object('from', old.slug, 'to', new.slug));
  end if;
  return new;
end
$$;

create trigger blog_posts_slug_redirect after update of slug on public.blog_posts
  for each row execute function public.blog_posts_slug_redirect();

-- ---------------------------------------------------------------------------------------------------------------
-- Functions the admin calls (security definer, role-checked)
-- ---------------------------------------------------------------------------------------------------------------

-- Who may edit this post's working copy: editors any post; writers their own while it is a draft.
create function public.can_edit_blog_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_blog_editor()
    or (
      public.has_admin_role('writer')
      and exists (
        select 1 from public.blog_posts p
        where p.id = p_post_id
          and p.created_by = auth.uid()
          and p.status in ('draft', 'changes_requested')
      )
    )
$$;

-- Plain text of a Tiptap doc: every "text" node, in order.
create function public.blog_doc_text(doc jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(string_agg(t #>> '{}', ' '), '')
  from jsonb_path_query(coalesce(doc, '{}'::jsonb), 'strict $.**.text') as t
  where jsonb_typeof(t) = 'string'
$$;

create function public.publish_post(p_post_id uuid, p_significant_update boolean default true)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  post public.blog_posts;
  doc jsonb;
  doc_text text;
  words integer;
  first_publish boolean;
begin
  if not public.is_blog_editor() then
    raise exception 'Only an editor or owner can publish.' using errcode = 'insufficient_privilege';
  end if;

  select * into post from public.blog_posts where id = p_post_id for update;
  if not found then
    raise exception 'Post not found.' using errcode = 'no_data_found';
  end if;
  if post.status = 'archived' then
    raise exception 'Restore an archived post before publishing it.' using errcode = 'check_violation';
  end if;

  doc := coalesce(post.draft_content, post.content);
  if doc is null then
    raise exception 'This post has no content yet.' using errcode = 'check_violation';
  end if;
  if char_length(btrim(post.title)) = 0 then
    raise exception 'Add a title before publishing.' using errcode = 'check_violation';
  end if;
  if post.category_id is null then
    raise exception 'Choose a category before publishing.' using errcode = 'check_violation';
  end if;
  if post.cover_path is null or char_length(btrim(coalesce(post.cover_alt, ''))) = 0 then
    raise exception 'Add a cover image with alt text before publishing.' using errcode = 'check_violation';
  end if;

  doc_text := public.blog_doc_text(doc);
  words := coalesce(array_length(regexp_split_to_array(btrim(doc_text), '\s+'), 1), 0);
  if btrim(doc_text) = '' then
    words := 0;
  end if;
  first_publish := post.published_at is null;

  perform set_config('easner.blog_trusted_write', 'on', true);
  update public.blog_posts p set
    content = doc,
    draft_content = null,
    content_text = doc_text,
    word_count = words,
    reading_minutes = greatest(1, ceil(words / 230.0)::integer),
    status = 'published',
    published_at = coalesce(p.published_at, now()),
    scheduled_for = null,
    content_modified_at = case
      when first_publish or p_significant_update then now()
      else p.content_modified_at
    end
  where p.id = p_post_id
  returning * into post;
  perform set_config('easner.blog_trusted_write', 'off', true);

  insert into public.blog_revisions (post_id, content, title, excerpt, kind)
  values (post.id, post.content, post.title, post.excerpt, 'publish');

  perform public.log_admin_activity(
    case when first_publish then 'post.published' else 'post.updated' end,
    'blog_post', post.id::text,
    jsonb_build_object('slug', post.slug, 'significant', p_significant_update));

  return post;
end
$$;

create function public.unpublish_post(p_post_id uuid)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  post public.blog_posts;
begin
  if not public.is_blog_editor() then
    raise exception 'Only an editor or owner can unpublish.' using errcode = 'insufficient_privilege';
  end if;

  select * into post from public.blog_posts where id = p_post_id for update;
  if not found then
    raise exception 'Post not found.' using errcode = 'no_data_found';
  end if;
  if post.status not in ('published', 'scheduled') then
    raise exception 'This post isn''t published.' using errcode = 'check_violation';
  end if;

  perform set_config('easner.blog_trusted_write', 'on', true);
  update public.blog_posts p set
    status = 'draft',
    draft_content = coalesce(p.draft_content, p.content),
    scheduled_for = null
  where p.id = p_post_id
  returning * into post;
  perform set_config('easner.blog_trusted_write', 'off', true);

  perform public.log_admin_activity('post.unpublished', 'blog_post', post.id::text,
    jsonb_build_object('slug', post.slug));

  return post;
end
$$;

-- Copies a revision into the working draft (never straight to live). Editors, or a writer on their own draft.
create function public.restore_revision(p_revision_id uuid)
returns public.blog_posts
language plpgsql
security definer
set search_path = ''
as $$
declare
  rev public.blog_revisions;
  post public.blog_posts;
begin
  select * into rev from public.blog_revisions where id = p_revision_id;
  if not found then
    raise exception 'Revision not found.' using errcode = 'no_data_found';
  end if;
  if not public.can_edit_blog_post(rev.post_id) then
    raise exception 'You can''t edit this post.' using errcode = 'insufficient_privilege';
  end if;

  update public.blog_posts p set
    draft_content = rev.content,
    title = coalesce(rev.title, p.title),
    excerpt = rev.excerpt
  where p.id = rev.post_id
  returning * into post;

  insert into public.blog_revisions (post_id, content, title, excerpt, kind)
  values (post.id, rev.content, rev.title, rev.excerpt, 'restore');

  perform public.log_admin_activity('post.revision_restored', 'blog_post', post.id::text,
    jsonb_build_object('revision_id', rev.id));

  return post;
end
$$;

-- Turns a pending invite for the caller's confirmed email into membership. Called right after sign-in.
-- Membership alone grants nothing until the session is MFA-verified (has_admin_role checks aal2).
create function public.accept_admin_invite()
returns public.admin_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  invite public.admin_invites;
  existing public.admin_role;
begin
  if uid is null then
    return null;
  end if;
  select m.role into existing from public.admin_members m where m.user_id = uid;
  if existing is not null then
    return existing;
  end if;

  select lower(u.email) into user_email
  from auth.users u
  where u.id = uid and u.email_confirmed_at is not null;
  if user_email is null then
    return null;
  end if;

  select * into invite from public.admin_invites i
  where i.email = user_email and i.accepted_at is null and i.revoked_at is null
  order by i.created_at desc
  limit 1
  for update;
  if not found then
    return null;
  end if;

  insert into public.admin_members (user_id, role, name, email, invited_by)
  values (uid, invite.role, invite.name, user_email, invite.invited_by);

  update public.admin_invites set accepted_at = now(), accepted_by = uid where id = invite.id;

  return invite.role;
end
$$;

-- Supabase Auth "before user created" hook (config.toml [auth.hook.before_user_created]).
-- Only an email with a pending invite (or an existing member) can become a user.
create function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  user_email text := lower(coalesce(event -> 'user' ->> 'email', ''));
begin
  if user_email <> '' and exists (
    select 1 from public.admin_invites i
    where i.email = user_email and i.accepted_at is null and i.revoked_at is null
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email doesn''t have access to Easner admin.'));
end
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------------------------------------------

alter table public.admin_members enable row level security;
alter table public.admin_invites enable row level security;
alter table public.admin_activity enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_authors enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_authors enable row level security;
alter table public.blog_revisions enable row level security;
alter table public.blog_redirects enable row level security;
alter table public.blog_media enable row level security;
alter table public.blog_stats_daily enable row level security;
alter table public.blog_search_daily enable row level security;
alter table public.blog_feedback enable row level security;
alter table public.site_stats_daily enable row level security;
alter table public.site_breakdown_daily enable row level security;

-- Team: every member reads; only the owner changes it.
create policy "Members read the team" on public.admin_members
  for select to authenticated using (public.is_admin_member());
create policy "Owner adds members" on public.admin_members
  for insert to authenticated with check (public.is_admin_owner());
create policy "Owner changes members" on public.admin_members
  for update to authenticated using (public.is_admin_owner()) with check (public.is_admin_owner());
create policy "Owner removes members" on public.admin_members
  for delete to authenticated using (public.is_admin_owner());

create policy "Members read invites" on public.admin_invites
  for select to authenticated using (public.is_admin_member());
create policy "Owner invites" on public.admin_invites
  for insert to authenticated with check (public.is_admin_owner() and invited_by = auth.uid() and accepted_at is null);
create policy "Owner changes invites" on public.admin_invites
  for update to authenticated using (public.is_admin_owner()) with check (public.is_admin_owner());
create policy "Owner deletes invites" on public.admin_invites
  for delete to authenticated using (public.is_admin_owner());

-- Activity: read-only for members; written only by security definer functions.
create policy "Members read activity" on public.admin_activity
  for select to authenticated using (public.is_admin_member());

-- Categories: members read; editors manage. Deleting a category with posts fails on the foreign key.
create policy "Members read categories" on public.blog_categories
  for select to authenticated using (public.is_admin_member());
create policy "Editors add categories" on public.blog_categories
  for insert to authenticated with check (public.is_blog_editor());
create policy "Editors change categories" on public.blog_categories
  for update to authenticated using (public.is_blog_editor()) with check (public.is_blog_editor());
create policy "Editors delete categories" on public.blog_categories
  for delete to authenticated using (public.is_blog_editor());

-- Authors: members read; editors manage; a member edits their own profile (slug and login stay editor-only).
create policy "Members read authors" on public.blog_authors
  for select to authenticated using (public.is_admin_member());
create policy "Editors add authors" on public.blog_authors
  for insert to authenticated with check (public.is_blog_editor());
create policy "Editors and the author change a profile" on public.blog_authors
  for update to authenticated
  using (public.is_blog_editor() or (public.is_admin_member() and member_id = auth.uid()))
  with check (public.is_blog_editor() or (public.is_admin_member() and member_id = auth.uid()));
create policy "Editors delete authors" on public.blog_authors
  for delete to authenticated using (public.is_blog_editor());

-- Posts: members read every post; writers create and edit their own drafts; editors edit any; only editors delete.
create policy "Members read posts" on public.blog_posts
  for select to authenticated using (public.is_admin_member());
create policy "Members create posts" on public.blog_posts
  for insert to authenticated with check (public.is_admin_member() and created_by = auth.uid());
create policy "Editors edit any post" on public.blog_posts
  for update to authenticated using (public.is_blog_editor()) with check (public.is_blog_editor());
create policy "Writers edit their own drafts" on public.blog_posts
  for update to authenticated
  using (
    public.has_admin_role('writer') and created_by = auth.uid() and status in ('draft', 'changes_requested')
  )
  with check (
    public.has_admin_role('writer') and created_by = auth.uid() and status in ('draft', 'in_review', 'changes_requested')
  );
create policy "Editors delete posts" on public.blog_posts
  for delete to authenticated using (public.is_blog_editor());

create policy "Members read post authors" on public.blog_post_authors
  for select to authenticated using (public.is_admin_member());
create policy "Editors of the post set its authors" on public.blog_post_authors
  for insert to authenticated with check (public.can_edit_blog_post(post_id));
create policy "Editors of the post reorder its authors" on public.blog_post_authors
  for update to authenticated using (public.can_edit_blog_post(post_id)) with check (public.can_edit_blog_post(post_id));
create policy "Editors of the post remove its authors" on public.blog_post_authors
  for delete to authenticated using (public.can_edit_blog_post(post_id));

-- Revisions: members read; autosave checkpoints by whoever can edit the post. Publish/restore rows come from the functions.
create policy "Members read revisions" on public.blog_revisions
  for select to authenticated using (public.is_admin_member());
create policy "Editors of the post save checkpoints" on public.blog_revisions
  for insert to authenticated
  with check (kind = 'autosave' and created_by = auth.uid() and public.can_edit_blog_post(post_id));

create policy "Members read redirects" on public.blog_redirects
  for select to authenticated using (public.is_admin_member());
create policy "Editors add redirects" on public.blog_redirects
  for insert to authenticated with check (public.is_blog_editor());
create policy "Editors change redirects" on public.blog_redirects
  for update to authenticated using (public.is_blog_editor()) with check (public.is_blog_editor());
create policy "Editors delete redirects" on public.blog_redirects
  for delete to authenticated using (public.is_blog_editor());

-- Media: members upload and describe their own; editors manage everything.
create policy "Members read media" on public.blog_media
  for select to authenticated using (public.is_admin_member());
create policy "Members add media" on public.blog_media
  for insert to authenticated with check (public.is_admin_member() and created_by = auth.uid());
create policy "Editors and the uploader describe media" on public.blog_media
  for update to authenticated
  using (public.is_blog_editor() or (public.is_admin_member() and created_by = auth.uid()))
  with check (public.is_blog_editor() or (public.is_admin_member() and created_by = auth.uid()));
create policy "Editors delete media" on public.blog_media
  for delete to authenticated using (public.is_blog_editor());

-- Rollups and feedback: members read; the service role writes.
create policy "Members read blog stats" on public.blog_stats_daily
  for select to authenticated using (public.is_admin_member());
create policy "Members read search stats" on public.blog_search_daily
  for select to authenticated using (public.is_admin_member());
create policy "Members read feedback" on public.blog_feedback
  for select to authenticated using (public.is_admin_member());
create policy "Members read site stats" on public.site_stats_daily
  for select to authenticated using (public.is_admin_member());
create policy "Members read site breakdowns" on public.site_breakdown_daily
  for select to authenticated using (public.is_admin_member());

-- ---------------------------------------------------------------------------------------------------------------
-- Public views (what the website reads with the anon key)
-- These run as their owner (security_invoker off) so anon needs no grant on the base tables; each view's WHERE is
-- the public contract. draft_content, drafts, scheduled and future posts never appear.
-- ---------------------------------------------------------------------------------------------------------------

create view public.blog_posts_public as
  select
    p.id, p.slug, p.title, p.excerpt, p.summary,
    p.cover_path, p.cover_alt, p.cover_focal_point, p.og_image_path,
    p.content, p.content_text, p.search,
    p.category_id, p.product_page, p.featured, p.featured_rank,
    p.seo_title, p.seo_description, p.canonical_url, p.noindex, p.focus_keyword,
    p.answers_section, p.word_count, p.reading_minutes,
    p.published_at, p.content_modified_at
  from public.blog_posts p
  where p.status = 'published' and p.published_at <= now();

comment on view public.blog_posts_public is 'Live posts only. Never exposes draft_content.';

create view public.blog_categories_public as
  select
    c.id, c.slug, c.name, c.description, c.intro, c.og_art_path, c.sort_order, c.seo_title, c.seo_description,
    (select count(*) from public.blog_posts_public p where p.category_id = c.id)::integer as post_count,
    (select max(coalesce(p.content_modified_at, p.published_at)) from public.blog_posts_public p
      where p.category_id = c.id) as last_modified_at
  from public.blog_categories c
  where c.archived_at is null;

-- Authors appear once they have a live post (unfinished profiles stay private). No login link.
create view public.blog_authors_public as
  select a.id, a.slug, a.name, a.title, a.location, a.avatar_path, a.bio,
    a.x_url, a.linkedin_url, a.github_url, a.website_url
  from public.blog_authors a
  where exists (
    select 1 from public.blog_post_authors pa
    join public.blog_posts_public p on p.id = pa.post_id
    where pa.author_id = a.id
  );

create view public.blog_post_authors_public as
  select pa.post_id, pa.author_id, pa.position
  from public.blog_post_authors pa
  join public.blog_posts_public p on p.id = pa.post_id;

create view public.blog_redirects_public as
  select r.from_slug, p.slug as to_slug
  from public.blog_redirects r
  join public.blog_posts_public p on p.id = r.to_post_id;

-- ---------------------------------------------------------------------------------------------------------------
-- Grants
-- Supabase grants anon/authenticated everything on new objects by default. Take it all back from anon, then open
-- only the public views. Authenticated keeps table grants; RLS above decides.
-- ---------------------------------------------------------------------------------------------------------------

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon, public;

grant select on public.blog_posts_public, public.blog_categories_public, public.blog_authors_public,
  public.blog_post_authors_public, public.blog_redirects_public to anon, authenticated;

-- Views are read-only for everyone.
revoke insert, update, delete, truncate on public.blog_posts_public, public.blog_categories_public,
  public.blog_authors_public, public.blog_post_authors_public, public.blog_redirects_public from authenticated;

-- Stats, feedback and the activity log are never written from a session (service role and definer functions only).
revoke insert, update, delete, truncate on public.blog_stats_daily, public.blog_search_daily, public.blog_feedback,
  public.site_stats_daily, public.site_breakdown_daily, public.admin_activity from authenticated;

grant execute on function
  public.current_admin_role(),
  public.has_admin_role(public.admin_role[]),
  public.is_admin_member(),
  public.is_blog_editor(),
  public.is_admin_owner(),
  public.can_edit_blog_post(uuid),
  public.blog_in_trusted_write(),
  public.publish_post(uuid, boolean),
  public.unpublish_post(uuid),
  public.restore_revision(uuid),
  public.accept_admin_invite(),
  public.blog_reserved_slugs(),
  public.blog_slug_format_ok(text),
  public.blog_post_slug_ok(text),
  public.blog_doc_text(jsonb)
to authenticated;

-- Slug checks run inside the public views' base-table constraints only; anon doesn't call functions.
-- Internal helpers: not callable from a session.
revoke execute on function public.log_admin_activity(text, text, text, jsonb) from authenticated;
revoke execute on function public.hook_before_user_created(jsonb) from authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
grant select on public.admin_invites to supabase_auth_admin;
