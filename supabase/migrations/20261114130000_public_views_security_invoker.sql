-- Public views → Supabase's recommended pattern (security invoker + RLS + column grants).
--
-- Before: the five *_public views ran as their owner, so anon needed no table grants, but Supabase's Security Advisor
-- flags them as security-definer views and the Table Editor shows them as "Unrestricted".
-- After: each view runs as the caller (security_invoker). anon reads the base tables through narrow SELECT policies
-- (the same predicates the views use) and column-level grants (only the columns the views expose, plus the columns
-- the view and policy filters read). draft_content, created_by, updated_by, locked_by, has_unpublished_changes,
-- member_id and the other admin fields stay unreadable to anon, through the views or the tables directly.
--
-- Policies are for anon only: the website reads with the anon key. Signed-in members keep their own policies;
-- signed-in non-members (signups are invite-only) see nothing.
-- The website keeps reading the *_public views; nothing changes for callers.
-- Safe to re-run (drop … if exists).

-- Live = published and not future-dated. Security definer so policies can ask it without anon reading blog_posts.
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

-- Views run as the caller.
alter view public.blog_posts_public set (security_invoker = true);
alter view public.blog_categories_public set (security_invoker = true);
alter view public.blog_authors_public set (security_invoker = true);
alter view public.blog_post_authors_public set (security_invoker = true);
alter view public.blog_redirects_public set (security_invoker = true);

-- Column grants for anon: the view's columns plus what its filters read (status, published_at, archived_at …).
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

grant select (from_slug, to_post_id) on public.blog_redirects to anon;

-- Row policies for anon: the predicates the views use.
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

-- The views stay read-only and readable.
grant select on public.blog_posts_public, public.blog_categories_public, public.blog_authors_public,
  public.blog_post_authors_public, public.blog_redirects_public to anon, authenticated;
