-- RLS and permission tests for the blog + admin schema.
--
-- Plain SQL in one transaction that is rolled back, so it leaves nothing behind. Each check prints
-- "ok - …" as a NOTICE; the first failure raises and stops the run.
--
-- Run against the local Supabase stack (after `supabase start` / `supabase db reset`):
--   psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
-- Or without Docker (PGlite + Supabase auth/storage stubs):
--   npm run test:db

begin;

create schema tests;
grant usage on schema tests to anon, authenticated;

create function tests.ok(cond boolean, description text) returns void language plpgsql as $$
begin
  if cond is distinct from true then
    raise exception 'not ok - %', description;
  end if;
  raise notice 'ok - %', description;
end
$$;

-- True when the statement errors (permission denied, RLS violation, check, raise …).
create function tests.throws(q text) returns boolean language plpgsql as $$
begin
  execute q;
  return false;
exception when others then
  return true;
end
$$;

-- Rows touched by an INSERT/UPDATE/DELETE (RLS filters silently, so 0 means "not allowed").
create function tests.affected(q text) returns integer language plpgsql as $$
declare n integer;
begin
  execute q;
  get diagnostics n = row_count;
  return n;
end
$$;

create function tests.count(q text) returns integer language plpgsql as $$
declare n integer;
begin
  execute format('select count(*) from (%s) t', q) into n;
  return n;
end
$$;

-- Sets the JWT claims Supabase would set for this user. Call with the role reset, then `set local role authenticated`.
create function tests.login(p_email text, p_aal text default 'aal2') returns void language plpgsql as $$
declare uid uuid;
begin
  select u.id into uid from auth.users u where u.email = p_email;
  if uid is null then
    raise exception 'no test user %', p_email;
  end if;
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated', 'aal', p_aal, 'email', p_email)::text, true);
end
$$;

create function tests.anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end
$$;

create function tests.uid(p_email text) returns uuid language sql as $$
  select id from auth.users where email = p_email
$$;

create function tests.post(p_slug text) returns uuid language sql security definer as $$
  select id from public.blog_posts where slug = p_slug
$$;

grant execute on all functions in schema tests to anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- Fixtures (as postgres)
-- ---------------------------------------------------------------------------------------------------------------

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-4000-8000-000000000001', 'owner@rls.test', now()),
  ('00000000-0000-4000-8000-000000000002', 'editor@rls.test', now()),
  ('00000000-0000-4000-8000-000000000003', 'writer@rls.test', now()),
  ('00000000-0000-4000-8000-000000000004', 'writer2@rls.test', now()),
  ('00000000-0000-4000-8000-000000000005', 'outsider@rls.test', now()),
  ('00000000-0000-4000-8000-000000000006', 'invitee@rls.test', now());

insert into public.admin_members (user_id, role, name, email) values
  (tests.uid('owner@rls.test'), 'owner', 'Owner', 'owner@rls.test'),
  (tests.uid('editor@rls.test'), 'editor', 'Editor', 'editor@rls.test'),
  (tests.uid('writer@rls.test'), 'writer', 'Writer', 'writer@rls.test'),
  (tests.uid('writer2@rls.test'), 'writer', 'Writer Two', 'writer2@rls.test');

insert into public.admin_invites (email, role, name) values ('invitee@rls.test', 'editor', 'Invitee');

insert into public.blog_posts
  (slug, status, title, content, draft_content, content_text, category_id, cover_path, cover_alt, published_at, created_by)
values
  ('live-post', 'published', 'Live post', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Public words"}]}]}',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"SECRET draft"}]}]}', 'Public words',
   (select id from public.blog_categories where slug = 'business'), 'posts/live/cover.webp', 'Cover', now() - interval '1 day',
   tests.uid('editor@rls.test')),
  ('future-post', 'published', 'Future post', '{"type":"doc"}', null, '',
   (select id from public.blog_categories where slug = 'company'), 'posts/future/cover.webp', 'Cover', now() + interval '1 day',
   tests.uid('editor@rls.test'));

insert into public.blog_posts (slug, status, title, draft_content, created_by) values
  ('writer-draft', 'draft', 'Writer draft',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"One two three four"}]}]}',
   tests.uid('writer@rls.test')),
  ('writer2-draft', 'draft', 'Writer two draft', '{"type":"doc"}', tests.uid('writer2@rls.test')),
  ('writer-in-review', 'in_review', 'In review', '{"type":"doc"}', tests.uid('writer@rls.test'));

insert into public.blog_posts (slug, status, title, draft_content, category_id, scheduled_for, created_by) values
  ('scheduled-post', 'scheduled', 'Scheduled post', '{"type":"doc"}',
   (select id from public.blog_categories where slug = 'company'), now() + interval '2 days', tests.uid('editor@rls.test'));

-- A redirect to a post that isn't live must stay hidden.
insert into public.blog_redirects (from_slug, to_post_id) values ('old-draft-slug', tests.post('writer-draft'));

insert into public.blog_authors (slug, name, member_id) values
  ('editor', 'Editor', tests.uid('editor@rls.test')),
  ('writer', 'Writer', tests.uid('writer@rls.test'));
insert into public.blog_post_authors (post_id, author_id) values
  (tests.post('live-post'), (select id from public.blog_authors where slug = 'editor')),
  (tests.post('future-post'), (select id from public.blog_authors where slug = 'writer'));

insert into public.blog_revisions (post_id, content, title, kind, created_by) values
  (tests.post('writer-draft'), '{"type":"doc","content":[{"type":"text","text":"older"}]}', 'Older title', 'autosave', tests.uid('writer@rls.test')),
  (tests.post('writer2-draft'), '{"type":"doc"}', 'W2 older', 'autosave', tests.uid('writer2@rls.test'));

-- ---------------------------------------------------------------------------------------------------------------
-- Schema shape
-- ---------------------------------------------------------------------------------------------------------------

select tests.ok(
  not exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'blog_posts_public' and column_name = 'draft_content'),
  'blog_posts_public has no draft_content column');
select tests.ok((select count(*) from public.blog_categories) = 5, 'five default categories are seeded');
select tests.ok(
  (select array_agg(slug order by sort_order) from public.blog_categories)
    = array['product-updates', 'business', 'personal', 'global-money', 'company'],
  'default category slugs and order');
select tests.ok(
  not exists (select 1 from information_schema.columns where table_schema = 'public' and column_name ilike '%tag%'),
  'there are no tag columns');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, created_by) values ('categories', '00000000-0000-4000-8000-000000000002')$q$),
  'reserved slug "categories" is refused');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, created_by) values ('search', '00000000-0000-4000-8000-000000000002')$q$),
  'reserved slug "search" is refused');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, created_by) values ('feed.xml', '00000000-0000-4000-8000-000000000002')$q$),
  'reserved slug "feed.xml" is refused');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, created_by) values ('Bad Slug', '00000000-0000-4000-8000-000000000002')$q$),
  'malformed slug is refused');
select tests.ok(public.blog_doc_text('{"content":[{"text":"a"},{"content":[{"text":"b"}]}]}') = 'a b',
  'blog_doc_text collects text nodes');
select tests.ok(public.hook_before_user_created('{"user":{"email":"Stranger@Example.com"}}') ? 'error',
  'signup hook refuses an email with no invite');
select tests.ok(public.hook_before_user_created('{"user":{"email":"INVITEE@rls.test"}}') = '{}'::jsonb,
  'signup hook allows an invited email (any case)');

-- ---------------------------------------------------------------------------------------------------------------
-- anon (the public website)
-- ---------------------------------------------------------------------------------------------------------------

select tests.anon();
set local role anon;

select tests.ok(tests.count('select * from public.blog_posts_public') = 1, 'anon: sees exactly the one live post');
select tests.ok((select slug from public.blog_posts_public) = 'live-post', 'anon: future-dated and draft posts are hidden');
select tests.ok(position('SECRET' in (select content::text from public.blog_posts_public)) = 0,
  'anon: the live content is the published doc, not the draft');
select tests.ok(tests.throws('select draft_content from public.blog_posts_public'), 'anon: draft_content cannot be selected');
select tests.ok(
  (select array_agg(c.relname::text order by c.relname) from pg_class c
   where c.relnamespace = 'public'::regnamespace and c.relkind = 'v'
     and coalesce(c.reloptions::text, '') like '%security_invoker=true%')
  = array['blog_authors_public', 'blog_categories_public', 'blog_post_authors_public', 'blog_posts_public', 'blog_redirects_public'],
  'anon: all five public views run as the caller (security_invoker)');

-- Straight at the tables: only live rows and only the published columns.
select tests.ok(tests.count('select id, slug, title, content from public.blog_posts') = 1,
  'anon: the posts table itself returns only the live post');
select tests.ok(tests.count($q$select id from public.blog_posts where status <> 'published' or published_at > now()$q$) = 0,
  'anon: drafts, in-review, scheduled and future posts are invisible in the table');
select tests.ok(tests.count($q$select id from public.blog_posts_public where slug in ('scheduled-post', 'future-post', 'writer-draft', 'writer-in-review')$q$) = 0,
  'anon: drafts, in-review, scheduled and future posts are invisible in the view');
select tests.ok(tests.throws('select draft_content from public.blog_posts'), 'anon: draft_content cannot be selected from the table');
select tests.ok(tests.throws('select * from public.blog_posts'), 'anon: select * on posts is refused (admin columns)');
select tests.ok(tests.throws('select created_by from public.blog_posts'), 'anon: created_by is not readable');
select tests.ok(tests.throws('select updated_by from public.blog_posts'), 'anon: updated_by is not readable');
select tests.ok(tests.throws('select locked_by from public.blog_posts'), 'anon: locked_by is not readable');
select tests.ok(tests.throws('select has_unpublished_changes from public.blog_posts'), 'anon: has_unpublished_changes is not readable');
select tests.ok(tests.throws('select scheduled_for from public.blog_posts'), 'anon: scheduled_for is not readable');
select tests.ok(tests.throws('select member_id from public.blog_authors'), 'anon: author member_id is not readable');
select tests.ok(tests.count('select id from public.blog_authors') = 1, 'anon: the authors table returns only authors with a live post');
select tests.ok(tests.count('select post_id from public.blog_post_authors') = 1, 'anon: post_authors returns only rows for live posts');
select tests.ok(tests.count('select from_slug from public.blog_redirects') = 0, 'anon: a redirect to a draft is hidden (table)');
select tests.ok(tests.count('select * from public.blog_redirects_public') = 0, 'anon: a redirect to a draft is hidden (view)');
select tests.ok(tests.count('select id, slug from public.blog_categories') = 5, 'anon: the categories table returns the active categories');
select tests.ok(tests.throws('select created_at from public.blog_categories'), 'anon: category admin columns are not readable');

-- Admin data: nothing.
select tests.ok(tests.throws('select * from public.admin_members'), 'anon: no access to admin_members');
select tests.ok(tests.throws('select * from public.admin_invites'), 'anon: no access to admin_invites');
select tests.ok(tests.throws('select * from public.admin_activity'), 'anon: no access to admin_activity');
select tests.ok(tests.throws('select * from public.blog_revisions'), 'anon: no access to revisions');
select tests.ok(tests.throws('select * from public.blog_media'), 'anon: no access to media records');
select tests.ok(tests.throws('select * from public.blog_stats_daily'), 'anon: no access to blog stats');
select tests.ok(tests.throws('select * from public.blog_search_daily'), 'anon: no access to search stats');
select tests.ok(tests.throws('select * from public.site_stats_daily'), 'anon: no access to site stats');
select tests.ok(tests.throws('select * from public.site_breakdown_daily'), 'anon: no access to site breakdowns');
select tests.ok(tests.throws('select * from public.blog_feedback'), 'anon: no access to feedback');
select tests.ok(tests.throws($q$update public.blog_posts set title = 'x' where slug = 'live-post'$q$), 'anon: cannot update posts');
select tests.ok(tests.throws($q$delete from public.blog_redirects$q$), 'anon: cannot delete redirects');
select tests.ok(tests.count('select * from public.blog_categories_public') = 5, 'anon: reads the five categories');
select tests.ok((select post_count from public.blog_categories_public where slug = 'business') = 1,
  'anon: category post_count counts live posts only');
select tests.ok((select post_count from public.blog_categories_public where slug = 'company') = 0,
  'anon: a future post does not count');
select tests.ok(tests.count('select * from public.blog_authors_public') = 1, 'anon: only authors with a live post');
select tests.ok(tests.throws('select member_id from public.blog_authors_public'), 'anon: author login link is not exposed');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug) values ('x')$q$), 'anon: cannot insert posts');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('writer-draft'))$q$), 'anon: cannot call publish_post');
select tests.ok(tests.throws('select public.accept_admin_invite()'), 'anon: cannot call accept_admin_invite');

reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Signed in, not a member
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('outsider@rls.test');
set local role authenticated;

select tests.ok(public.current_admin_role() is null, 'outsider: has no role');
select tests.ok(tests.count('select * from public.blog_posts') = 0, 'outsider: sees no posts in the table');
select tests.ok(tests.count('select * from public.blog_posts_public') = 0,
  'outsider: the views run as the caller, so a signed-in non-member sees nothing (the website reads as anon)');
select tests.ok(tests.count('select * from public.admin_members') = 0, 'outsider: sees no team');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, title) values ('outsider-post', 'x')$q$),
  'outsider: cannot create a post');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('writer-draft'))$q$), 'outsider: cannot publish');
select tests.ok(public.accept_admin_invite() is null, 'outsider: no invite, no membership');
select tests.ok(tests.throws($q$insert into storage.objects (bucket_id, name) values ('blog', 'posts/x/outsider.webp')$q$),
  'outsider: cannot upload to the blog bucket');

reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Writer before MFA (aal1): membership alone grants nothing
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('writer@rls.test', 'aal1');
set local role authenticated;

select tests.ok(public.current_admin_role() = 'writer', 'writer aal1: current_admin_role still answers (for the MFA step)');
select tests.ok(tests.count('select * from public.blog_posts') = 0, 'writer aal1: no posts without MFA');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, title) values ('aal1-post', 'x')$q$),
  'writer aal1: cannot create without MFA');

reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Writer (aal2)
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('writer@rls.test');
set local role authenticated;

select tests.ok(tests.count('select * from public.blog_posts') = 6, 'writer: reads every post in the admin');
select tests.ok(tests.count('select * from public.blog_categories') = 5, 'writer: reads categories');
select tests.ok(tests.count('select * from public.admin_members') = 4, 'writer: reads the team');
select tests.ok(tests.affected($q$insert into public.blog_posts (slug, title) values ('writer-new', 'New')$q$) = 1,
  'writer: creates a draft');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, title, created_by) values ('writer-forged', 'x', '00000000-0000-4000-8000-000000000004')$q$),
  'writer: cannot create a post as someone else');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, title, status) values ('writer-pub', 'x', 'published')$q$),
  'writer: cannot create a published post');
select tests.ok(tests.affected($q$update public.blog_posts set title = 'Edited' where slug = 'writer-draft'$q$) = 1,
  'writer: edits own draft');
select tests.ok(tests.affected($q$update public.blog_posts set title = 'Hijack' where slug = 'writer2-draft'$q$) = 0,
  'writer: cannot edit another writer''s draft');
select tests.ok(tests.affected($q$update public.blog_posts set title = 'Hijack' where slug = 'live-post'$q$) = 0,
  'writer: cannot edit a published post');
select tests.ok(tests.affected($q$update public.blog_posts set title = 'Hijack' where slug = 'writer-in-review'$q$) = 0,
  'writer: cannot edit own post while it is in review');
select tests.ok(tests.affected($q$update public.blog_posts set status = 'in_review' where slug = 'writer-new'$q$) = 1,
  'writer: submits own draft for review');
select tests.ok(tests.throws($q$update public.blog_posts set content = '{"type":"doc"}' where slug = 'writer-draft'$q$),
  'writer: cannot write the published content directly');
select tests.ok(tests.throws($q$update public.blog_posts set status = 'published' where slug = 'writer-draft'$q$),
  'writer: cannot set status published directly');
select tests.ok(tests.throws($q$update public.blog_posts set status = 'changes_requested' where slug = 'writer-draft'$q$),
  'writer: cannot request changes');
select tests.ok(tests.throws($q$update public.blog_posts set featured = true where slug = 'writer-draft'$q$),
  'writer: cannot feature a post');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('writer-draft'))$q$), 'writer: cannot publish');
select tests.ok(tests.throws($q$select public.unpublish_post(tests.post('live-post'))$q$), 'writer: cannot unpublish');
select tests.ok(tests.affected($q$delete from public.blog_posts where slug = 'writer-draft'$q$) = 0,
  'writer: cannot delete posts');
select tests.ok(tests.throws($q$insert into public.blog_categories (slug, name) values ('writer-cat', 'X')$q$),
  'writer: cannot create categories');
select tests.ok(tests.affected($q$update public.blog_categories set name = 'X' where slug = 'business'$q$) = 0,
  'writer: cannot rename categories');
select tests.ok(
  tests.affected($q$insert into public.blog_revisions (post_id, content, kind, created_by) values (tests.post('writer-draft'), '{}', 'autosave', auth.uid())$q$) = 1,
  'writer: saves an autosave checkpoint on own draft');
select tests.ok(
  tests.throws($q$insert into public.blog_revisions (post_id, content, kind, created_by) values (tests.post('live-post'), '{}', 'autosave', auth.uid())$q$),
  'writer: cannot checkpoint someone else''s post');
select tests.ok(
  tests.throws($q$insert into public.blog_revisions (post_id, content, kind, created_by) values (tests.post('writer-draft'), '{}', 'publish', auth.uid())$q$),
  'writer: cannot forge a publish revision');
select tests.ok(
  (select (public.restore_revision((select id from public.blog_revisions where title = 'Older title'))).title) = 'Older title',
  'writer: restores a revision of own draft');
select tests.ok(tests.throws($q$select public.restore_revision((select id from public.blog_revisions where title = 'W2 older'))$q$),
  'writer: cannot restore another writer''s revision');
select tests.ok(tests.throws($q$insert into public.admin_invites (email, role, invited_by) values ('x@y.test', 'owner', auth.uid())$q$),
  'writer: cannot invite');
select tests.ok(tests.affected($q$update public.admin_members set role = 'owner' where email = 'writer@rls.test'$q$) = 0,
  'writer: cannot promote themself');
select tests.ok(tests.throws($q$insert into public.admin_activity (action, entity) values ('fake', 'x')$q$),
  'writer: cannot write the activity log');
select tests.ok(tests.affected($q$update public.blog_authors set title = 'Writer at Easner' where slug = 'writer'$q$) = 1,
  'writer: edits own author profile');
select tests.ok(tests.throws($q$update public.blog_authors set slug = 'writer-renamed' where slug = 'writer'$q$),
  'writer: cannot change own author slug');
select tests.ok(tests.affected($q$update public.blog_authors set title = 'x' where slug = 'editor'$q$) = 0,
  'writer: cannot edit someone else''s profile');
select tests.ok(tests.affected($q$insert into storage.objects (bucket_id, name, owner_id) values ('blog', 'posts/x/writer.webp', auth.uid()::text)$q$) = 1,
  'writer: uploads to posts/ in the blog bucket');
select tests.ok(tests.throws($q$insert into storage.objects (bucket_id, name, owner_id) values ('blog', 'private/writer.webp', auth.uid()::text)$q$),
  'writer: cannot upload outside the allowed folders');
select tests.ok(tests.throws($q$insert into public.blog_stats_daily (post_id, date) values (tests.post('live-post'), current_date)$q$),
  'writer: cannot write stats');

reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Editor (aal2)
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('editor@rls.test');
set local role authenticated;

select tests.ok(tests.affected($q$update public.blog_posts set title = 'Live post, edited' where slug = 'live-post'$q$) = 1,
  'editor: edits a published post''s fields');
select tests.ok(tests.throws($q$update public.blog_posts set status = 'published' where slug = 'writer2-draft'$q$),
  'editor: cannot publish by setting status directly');
select tests.ok(tests.affected($q$update public.blog_posts set status = 'changes_requested' where slug = 'writer-in-review'$q$) = 1,
  'editor: requests changes on a post in review');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('writer-draft'))$q$),
  'editor: publish refuses a post with no category or cover');
select tests.ok(tests.affected($q$update public.blog_posts set category_id = (select id from public.blog_categories where slug = 'personal'), cover_path = 'posts/w/cover.webp', cover_alt = 'A cover' where slug = 'writer-draft'$q$) = 1,
  'editor: completes a writer''s draft');
select tests.ok((select (public.publish_post(tests.post('writer-draft'))).status) = 'published', 'editor: publishes it');
select tests.ok(
  (select draft_content is null and content is not null and content_text <> '' and word_count > 0 and published_at is not null
     and content_modified_at is not null
   from public.blog_posts where slug = 'writer-draft'),
  'editor: publish moves the draft live and fills text, word count and dates');
select tests.ok(exists (select 1 from public.blog_revisions where post_id = tests.post('writer-draft') and kind = 'publish'),
  'editor: publish writes a revision');
select tests.ok(exists (select 1 from public.admin_activity where entity_id = tests.post('writer-draft')::text and action = 'post.published'),
  'editor: publish is in the activity log');
select tests.ok(tests.affected($q$update public.blog_posts set slug = 'writer-draft-renamed' where slug = 'writer-draft'$q$) = 1,
  'editor: renames a published post''s slug');
select tests.ok((select to_slug from public.blog_redirects_public where from_slug = 'writer-draft') = 'writer-draft-renamed',
  'editor: the old slug now redirects (301)');
select tests.ok((select has_unpublished_changes from public.blog_posts where slug = 'live-post'),
  'editor: a published post with a working copy shows unpublished changes');
select tests.ok((select (public.unpublish_post(tests.post('live-post'))).status) = 'draft', 'editor: unpublishes');
select tests.ok((select draft_content is not null from public.blog_posts where slug = 'live-post'),
  'editor: unpublish keeps a working copy');
select tests.ok(tests.affected($q$insert into public.blog_categories (slug, name) values ('guides', 'Guides')$q$) = 1,
  'editor: creates a category');
select tests.ok(tests.throws($q$delete from public.blog_categories where slug = 'business'$q$),
  'editor: cannot delete a category that has posts');
select tests.ok(tests.affected($q$delete from public.blog_categories where slug = 'guides'$q$) = 1,
  'editor: deletes an empty category');
select tests.ok(tests.affected($q$delete from public.blog_posts where slug = 'writer2-draft'$q$) = 1, 'editor: deletes a post');
select tests.ok(tests.throws($q$insert into public.admin_invites (email, role, invited_by) values ('x@y.test', 'writer', auth.uid())$q$),
  'editor: cannot invite (owner only)');
select tests.ok(tests.affected($q$update public.admin_members set role = 'owner' where email = 'editor@rls.test'$q$) = 0,
  'editor: cannot change roles');
select tests.ok(tests.affected($q$update public.blog_authors set slug = 'writer-renamed' where slug = 'writer'$q$) = 1,
  'editor: changes an author slug');
select tests.ok(tests.affected($q$delete from storage.objects where bucket_id = 'blog' and name = 'posts/x/writer.webp'$q$) = 1,
  'editor: deletes any blog file');

reset role;

-- The website now sees the newly published post, under its new slug, and not the unpublished one.
select tests.anon();
set local role anon;
select tests.ok(
  (select array_agg(slug order by slug) from public.blog_posts_public) = array['writer-draft-renamed'],
  'anon: sees the post the editor published and not the one they unpublished');
reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Owner (aal2)
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('owner@rls.test');
set local role authenticated;

select tests.ok(tests.affected($q$insert into public.admin_invites (email, role, invited_by) values ('new@rls.test', 'writer', auth.uid())$q$) = 1,
  'owner: invites a member');
select tests.ok(tests.throws($q$insert into public.admin_invites (email, role, invited_by) values ('new@rls.test', 'editor', auth.uid())$q$),
  'owner: one pending invite per email');
select tests.ok(tests.affected($q$update public.admin_members set role = 'writer' where email = 'editor@rls.test'$q$) = 1,
  'owner: changes a member''s role');
select tests.ok(tests.throws($q$update public.admin_members set role = 'editor' where email = 'owner@rls.test'$q$),
  'owner: the last owner cannot step down');
select tests.ok(exists (select 1 from public.admin_activity where action = 'member.role_changed'),
  'owner: role changes are logged');
select tests.ok(tests.affected($q$delete from public.admin_members where email = 'writer2@rls.test'$q$) = 1,
  'owner: removes a member');

reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Invite acceptance
-- ---------------------------------------------------------------------------------------------------------------

select tests.login('invitee@rls.test', 'aal1');
set local role authenticated;
select tests.ok(public.accept_admin_invite() = 'editor', 'invitee: accepting the invite makes them an editor');
select tests.ok(public.current_admin_role() = 'editor', 'invitee: role is visible before MFA');
select tests.ok(tests.count('select * from public.blog_posts') = 0, 'invitee: still no access until MFA (aal2)');
reset role;
select tests.ok(
  (select accepted_at is not null from public.admin_invites where email = 'invitee@rls.test'),
  'invitee: the invite is marked accepted');

rollback;
