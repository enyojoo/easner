-- No public views: the website reads the blog tables directly, with the anon key.
--
-- Replaces the *_public views (and 20261114130000's security_invoker version of them).
--   * RLS stays on every table. anon gets one narrow SELECT policy per public table, with the predicates the views
--     had: live posts, active categories, authors with a live post, author links and redirects for live posts.
--   * Column grants: anon can select only the published columns (listed in supabase/README.md). draft_content,
--     audit, lock and admin fields can't be selected at all. The website must name its columns, never `*`.
--   * authenticated keeps its full-column table grants. Members (admin_members + aal2) read everything through the
--     member policies from 20261114120000; a signed-in non-member matches no policy and sees nothing. There is no
--     public policy for authenticated, because with full columns it would expose draft_content of live posts.
-- Safe to re-run, and safe on a project that did or didn't run 20261114130000.

drop view if exists public.blog_redirects_public;
drop view if exists public.blog_post_authors_public;
drop view if exists public.blog_authors_public;
drop view if exists public.blog_categories_public;
drop view if exists public.blog_posts_public;

-- Live = published and not future-dated. Security definer so policies can ask it without the caller reading
-- blog_posts rows they can't see (and without a policy loop between posts, links and authors).
create or replace function public.blog_post_is_live(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blog_posts p
    where p.id = p_post_id and p.status = 'published' and p.published_at <= now()
  )
$$;

create or replace function public.blog_author_has_live_post(p_author_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blog_post_authors pa
    join public.blog_posts p on p.id = pa.post_id
    where pa.author_id = p_author_id and p.status = 'published' and p.published_at <= now()
  )
$$;

revoke execute on function public.blog_post_is_live(uuid), public.blog_author_has_live_post(uuid) from public;
grant execute on function public.blog_post_is_live(uuid), public.blog_author_has_live_post(uuid)
  to anon, authenticated;

-- Column grants for anon. Revoke everything first so a table-level grant can't widen them.
revoke all on public.blog_posts, public.blog_categories, public.blog_authors, public.blog_post_authors,
  public.blog_redirects from anon;

grant select (
  id, slug, status, title, excerpt, summary,
  cover_path, cover_alt, cover_focal_point, og_image_path,
  content, content_text, search,
  category_id, product_page, featured, featured_rank,
  seo_title, seo_description, canonical_url, noindex, focus_keyword,
  answers_section, word_count, reading_minutes,
  published_at, content_modified_at
) on public.blog_posts to anon;

grant select (
  id, slug, name, description, intro, og_art_path, sort_order, seo_title, seo_description, archived_at
) on public.blog_categories to anon;

grant select (
  id, slug, name, title, location, avatar_path, bio, x_url, linkedin_url, github_url, website_url
) on public.blog_authors to anon;

grant select (post_id, author_id, position) on public.blog_post_authors to anon;

grant select (from_slug, to_post_id, created_at) on public.blog_redirects to anon;

-- Row policies for anon.
drop policy if exists "Anyone reads live posts" on public.blog_posts;
create policy "Anyone reads live posts" on public.blog_posts
  for select to anon
  using (status = 'published' and published_at <= now());

drop policy if exists "Anyone reads active categories" on public.blog_categories;
create policy "Anyone reads active categories" on public.blog_categories
  for select to anon
  using (archived_at is null);

drop policy if exists "Anyone reads authors with a live post" on public.blog_authors;
create policy "Anyone reads authors with a live post" on public.blog_authors
  for select to anon
  using (public.blog_author_has_live_post(id));

drop policy if exists "Anyone reads authors of live posts" on public.blog_post_authors;
create policy "Anyone reads authors of live posts" on public.blog_post_authors
  for select to anon
  using (public.blog_post_is_live(post_id));

drop policy if exists "Anyone reads redirects to live posts" on public.blog_redirects;
create policy "Anyone reads redirects to live posts" on public.blog_redirects
  for select to anon
  using (public.blog_post_is_live(to_post_id));
