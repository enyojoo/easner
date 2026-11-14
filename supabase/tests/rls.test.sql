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
grant usage on schema tests to anon, authenticated, service_role;

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
  not exists (select 1 from pg_class where relnamespace = 'public'::regnamespace and relkind in ('v', 'm')),
  'there are no public views: the website reads the tables');
select tests.ok(
  (select bool_and(relrowsecurity) and count(*) = 21 from pg_class
   where relnamespace = 'public'::regnamespace and relkind = 'r'),
  'RLS is on for all 21 tables');
select tests.ok(not has_column_privilege('anon', 'public.blog_posts', 'draft_content', 'select'),
  'anon has no grant on blog_posts.draft_content');
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

-- The website's reads: explicit columns, straight from the tables.
select tests.ok(tests.count('select id, slug, title, content from public.blog_posts') = 1, 'anon: reads exactly the one live post');
select tests.ok((select slug from public.blog_posts) = 'live-post', 'anon: the live post is the one returned');
select tests.ok(position('SECRET' in (select content::text from public.blog_posts)) = 0,
  'anon: the live content is the published doc, not the draft');
select tests.ok(tests.count($q$select id from public.blog_posts where slug in ('scheduled-post', 'future-post', 'writer-draft', 'writer-in-review')$q$) = 0,
  'anon: drafts, in-review, scheduled and future posts are invisible');
select tests.ok(tests.count($q$select id from public.blog_posts where status <> 'published' or published_at > now()$q$) = 0,
  'anon: no row that isn''t live, whatever the filter');
select tests.ok(tests.count('select id, slug, name, description, sort_order from public.blog_categories') = 5,
  'anon: reads the five active categories');
select tests.ok(tests.count('select id, slug, name, title, bio from public.blog_authors') = 1,
  'anon: reads only authors with a live post');
select tests.ok(tests.count('select post_id, author_id, position from public.blog_post_authors') = 1,
  'anon: reads author links for live posts only');
select tests.ok(tests.count('select from_slug, to_post_id from public.blog_redirects') = 0,
  'anon: a redirect to a draft is hidden');
select tests.ok(
  (select count(*) from public.blog_posts p where p.category_id = (select id from public.blog_categories where slug = 'business')) = 1
  and (select count(*) from public.blog_posts p where p.category_id = (select id from public.blog_categories where slug = 'company')) = 0,
  'anon: per-category counts see live posts only (a future post doesn''t count)');

-- Hidden columns can't be selected at all.
select tests.ok(tests.throws('select draft_content from public.blog_posts'), 'anon: draft_content is not readable');
select tests.ok(tests.throws('select * from public.blog_posts'), 'anon: select * on posts is refused (hidden columns)');
select tests.ok(tests.throws('select created_by from public.blog_posts'), 'anon: created_by is not readable');
select tests.ok(tests.throws('select updated_by from public.blog_posts'), 'anon: updated_by is not readable');
select tests.ok(tests.throws('select locked_by from public.blog_posts'), 'anon: locked_by is not readable');
select tests.ok(tests.throws('select locked_at from public.blog_posts'), 'anon: locked_at is not readable');
select tests.ok(tests.throws('select has_unpublished_changes from public.blog_posts'), 'anon: has_unpublished_changes is not readable');
select tests.ok(tests.throws('select scheduled_for from public.blog_posts'), 'anon: scheduled_for is not readable');
select tests.ok(tests.throws('select member_id from public.blog_authors'), 'anon: author member_id is not readable');
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
select tests.ok(tests.count('select * from public.blog_categories') = 0,
  'outsider: a signed-in non-member gets no public rows either (the website reads as anon)');
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
select tests.ok(tests.throws($q$update public.blog_posts set status = 'in_review' where slug = 'writer-new'$q$),
  'writer: cannot move the status directly, not even to in_review');
select tests.ok(tests.throws($q$insert into public.blog_posts (slug, title, status) values ('writer-direct-review', 'x', 'in_review')$q$),
  'writer: cannot create a post already in review');
select tests.ok(tests.throws($q$select public.submit_for_review(tests.post('writer-new'))$q$),
  'writer: cannot submit a post with no content');
select tests.ok(tests.affected($q$update public.blog_posts set draft_content = '{"type":"doc","content":[{"type":"paragraph"}]}' where slug = 'writer-new'$q$) = 1,
  'writer: saves content into the draft');
select tests.ok((select (public.submit_for_review(tests.post('writer-new'))).status) = 'in_review',
  'writer: submits own draft for review');
select tests.ok(tests.throws($q$select public.submit_for_review(tests.post('writer2-draft'))$q$),
  'writer: cannot submit another writer''s draft');
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
select tests.ok(tests.throws($q$update public.blog_posts set status = 'changes_requested' where slug = 'writer-in-review'$q$),
  'editor: cannot move the status directly either');
select tests.ok((select (public.request_changes(tests.post('writer-in-review'), 'Please cite the source.')).status) = 'changes_requested',
  'editor: requests changes on a post in review, with a comment');
select tests.ok(exists (select 1 from public.blog_post_comments where post_id = tests.post('writer-in-review') and kind = 'change_request'
                          and author_id = auth.uid() and body = 'Please cite the source.'),
  'editor: the request is recorded as a comment on the draft');
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
select tests.ok(tests.throws($q$update public.blog_posts set slug = 'writer-draft-renamed' where slug = 'writer-draft'$q$),
  'editor: cannot change a published post''s slug (owners only)');
reset role;
select tests.login('owner@rls.test');
set local role authenticated;
select tests.ok(tests.affected($q$update public.blog_posts set slug = 'writer-draft-renamed' where slug = 'writer-draft'$q$) = 1,
  'owner: renames a published post''s slug');
reset role;
select tests.login('editor@rls.test');
set local role authenticated;
select tests.ok((select to_post_id from public.blog_redirects where from_slug = 'writer-draft') = tests.post('writer-draft-renamed'),
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
  (select array_agg(slug order by slug) from public.blog_posts) = array['writer-draft-renamed'],
  'anon: sees the post the editor published and not the one they unpublished');
select tests.ok(
  (select array_agg(r.from_slug order by r.from_slug) from public.blog_redirects r join public.blog_posts p on p.id = r.to_post_id
   where p.slug = 'writer-draft-renamed') = array['old-draft-slug', 'writer-draft'],
  'anon: reads the redirect from the old slug and resolves it to the live post');
reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Review workflow: claims check, second approval, comments, slug lock, archive, my profile, media usage
-- ---------------------------------------------------------------------------------------------------------------

-- Fixtures (as postgres)
insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-4000-8000-000000000007', 'editor2@rls.test', now());
insert into public.admin_members (user_id, role, name, email) values
  (tests.uid('editor2@rls.test'), 'editor', 'Editor Two', 'editor2@rls.test');

insert into public.blog_posts (slug, status, title, draft_content, category_id, cover_path, cover_alt, created_by) values
  -- Written by an editor, makes a fee claim.
  ('ed-flagged', 'draft', 'Sending money home',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Easner has no fees on transfers."}]}]}',
   (select id from public.blog_categories where slug = 'personal'), 'posts/ed/cover.webp', 'Cover', tests.uid('editor@rls.test')),
  -- Written by a writer, in review, makes a regulatory claim.
  ('w-flagged', 'in_review', 'Why we are licensed',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Easner is fully licensed in the US."}]}]}',
   (select id from public.blog_categories where slug = 'business'), 'posts/wf/cover.webp', 'Cover', tests.uid('writer@rls.test')),
  ('w-flagged-2', 'in_review', 'Rates explained',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Balances may earn 4% APY."}]}]}',
   (select id from public.blog_categories where slug = 'business'), 'posts/wf2/cover.webp', 'Cover', tests.uid('writer@rls.test')),
  ('w-clean', 'in_review', 'Plain launch note',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"We shipped a new settings page."}]}]}',
   (select id from public.blog_categories where slug = 'company'), 'posts/wc/cover.webp', 'Cover', tests.uid('writer@rls.test')),
  ('w-own-flagged', 'draft', 'Draft with a claim',
   '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Cheaper than Wise."}]}]}',
   null, null, null, tests.uid('writer@rls.test'));

insert into public.blog_media (id, path, mime, size, created_by) values
  ('00000000-0000-4000-8000-0000000000a1', 'posts/ed/cover.webp', 'image/webp', 10, tests.uid('editor@rls.test')),
  ('00000000-0000-4000-8000-0000000000a2', 'posts/inline/chart.webp', 'image/webp', 10, tests.uid('editor@rls.test')),
  ('00000000-0000-4000-8000-0000000000a3', 'posts/unused/none.webp', 'image/webp', 10, tests.uid('editor@rls.test'));
update public.blog_posts set draft_content = '{"type":"doc","content":[{"type":"image","attrs":{"src":"https://x.supabase.co/storage/v1/object/public/blog/posts/inline/chart.webp","alt":"","width":"column"}}]}'
  where slug = 'w-clean';

select tests.ok((select claims_flagged and claims_matches = array['fees-none'] from public.blog_posts where slug = 'ed-flagged'),
  'claims: "no fees" flags the post and records the pattern');
select tests.ok((select not claims_flagged and claims_matches = '{}' from public.blog_posts where slug = 'w-clean'),
  'claims: a plain post is not flagged');
select tests.ok((select claims_flagged from public.blog_posts where slug = 'w-flagged'), 'claims: a licensing statement flags the post');
select tests.ok((select claims_matches @> array['competitor-compare', 'competitor-name'] from public.blog_posts where slug = 'w-own-flagged'),
  'claims: a competitor comparison flags the post');
select tests.ok(public.blog_claims_scan('We charge a 1.5% fee') = array['fees-amount'], 'claims: a fee amount is found');
select tests.ok(public.blog_claims_scan('Otherwise, we wrote a guide to payroll.') = '{}', 'claims: "otherwise" is not "Wise"');

-- Anonymous callers see none of it.
select tests.anon();
set local role anon;
select tests.ok(tests.throws('select claims_flagged from public.blog_posts'), 'anon: claims_flagged is not readable');
select tests.ok(tests.throws('select claims_matches from public.blog_posts'), 'anon: claims_matches is not readable');
select tests.ok(tests.throws('select * from public.blog_post_comments'), 'anon: no access to comments');
select tests.ok(tests.throws('select * from public.blog_post_approvals'), 'anon: no access to approvals');
select tests.ok(tests.throws('select * from public.blog_claim_patterns'), 'anon: no access to claim patterns');
select tests.ok(tests.throws($q$select public.submit_for_review(tests.post('w-own-flagged'))$q$), 'anon: cannot submit for review');
select tests.ok(tests.throws($q$select public.approve_post(tests.post('w-flagged'))$q$), 'anon: cannot approve');
select tests.ok(tests.throws($q$select public.archive_post(tests.post('w-flagged'))$q$), 'anon: cannot archive');
select tests.ok(tests.throws('select public.blog_media_usage()'), 'anon: cannot read media usage');
reset role;

-- Writer
select tests.login('writer@rls.test');
set local role authenticated;
select tests.ok(tests.throws($q$select public.approve_post(tests.post('w-flagged'))$q$), 'writer: cannot approve');
select tests.ok(tests.throws($q$select public.request_changes(tests.post('w-flagged'), 'no')$q$), 'writer: cannot request changes');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('w-clean'))$q$), 'writer: cannot publish their own post in review');
select tests.ok(tests.throws($q$select public.archive_post(tests.post('w-clean'))$q$), 'writer: cannot archive');
select tests.ok((select (public.withdraw_submission(tests.post('w-clean'))).status) = 'draft', 'writer: withdraws a submission');
select tests.ok((select (public.submit_for_review(tests.post('w-clean'))).status) = 'in_review', 'writer: submits again');
select tests.ok(tests.affected($q$update public.blog_posts set claims_flagged = false, claims_matches = '{}' where slug = 'w-own-flagged'$q$) = 1,
  'writer: writing the claims columns is accepted but ignored…');
select tests.ok((select claims_flagged from public.blog_posts where slug = 'w-own-flagged'), '…the database keeps the flag');
select tests.ok(tests.affected($q$insert into public.blog_posts (slug, title, claims_flagged) values ('w-forged-flag', 'Zero fees everywhere', false)$q$) = 1,
  'writer: creates a post that says "zero fees"');
select tests.ok((select claims_flagged from public.blog_posts where slug = 'w-forged-flag'), 'claims: a new post is flagged from its title');
select tests.ok(tests.throws($q$update public.blog_posts set summary = 'early summary' where slug = 'w-own-flagged'$q$),
  'writer: summary is a published field, not writable directly');
select tests.ok(tests.count('select id from public.blog_authors where member_id = auth.uid()') = 1, 'writer: has an author profile');
select tests.ok((select id from public.ensure_my_author()) = (select id from public.blog_authors where member_id = auth.uid()),
  'writer: ensure_my_author returns the existing profile');
-- Comments: the creator may comment and resolve on their own post; not on someone else's.
select tests.ok(tests.affected($q$insert into public.blog_post_comments (post_id, author_id, body, quote) values (tests.post('writer-in-review'), auth.uid(), 'Added the source.', 'cite')$q$) = 1,
  'writer: replies on their own post');
select tests.ok(tests.throws($q$insert into public.blog_post_comments (post_id, author_id, body) values (tests.post('ed-flagged'), auth.uid(), 'hi')$q$),
  'writer: cannot comment on someone else''s post');
select tests.ok(tests.throws($q$insert into public.blog_post_comments (post_id, author_id, body) values (tests.post('writer-in-review'), tests.uid('editor@rls.test'), 'forged')$q$),
  'writer: cannot comment as someone else');
select tests.ok(tests.affected($q$update public.blog_post_comments set resolved_at = now(), resolved_by = auth.uid() where post_id = tests.post('writer-in-review') and kind = 'change_request'$q$) = 1,
  'writer: resolves a change request on their own post');
select tests.ok(tests.throws($q$update public.blog_post_comments set body = 'rewritten' where post_id = tests.post('writer-in-review')$q$),
  'writer: cannot rewrite comment text');
select tests.ok((select (public.submit_for_review(tests.post('writer-in-review'))).status) = 'in_review',
  'writer: resubmits after changes were requested');
reset role;

-- Writer two has no author profile yet.
select tests.login('writer2@rls.test');
set local role authenticated;
select tests.ok(tests.throws($q$insert into public.blog_post_comments (post_id, author_id, body) values (tests.post('writer-in-review'), auth.uid(), 'x')$q$),
  'writer two: cannot comment on someone else''s post');
select tests.ok(tests.count('select id from public.blog_authors where member_id = auth.uid()') = 0, 'writer two: starts with no author profile');
select tests.ok((select slug from public.ensure_my_author()) = 'writer-two', 'writer two: ensure_my_author creates a profile with a slug from their name');
select tests.ok((select id from public.ensure_my_author()) = (select id from public.blog_authors where member_id = auth.uid()),
  'writer two: calling it again returns the same profile');
select tests.ok(tests.affected($q$update public.blog_authors set title = 'Writer', location = 'Lagos' where member_id = auth.uid()$q$) = 1,
  'writer two: edits their new profile');
reset role;

-- Editor one: flagged post written by an editor.
select tests.login('editor@rls.test');
set local role authenticated;
select tests.ok(tests.throws($q$select public.publish_post(tests.post('ed-flagged'))$q$),
  'claims: the author-editor cannot publish their own flagged post');
select tests.ok(tests.throws($q$select public.approve_post(tests.post('ed-flagged'))$q$),
  'claims: nobody approves their own post (and a draft isn''t in review)');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('w-flagged'))$q$),
  'claims: one editor alone cannot publish a writer''s flagged post');
select tests.ok((select (public.approve_post(tests.post('w-flagged'))).status) = 'in_review', 'claims: first editor approves, status stays in review');
select tests.ok(tests.count($q$select 1 from public.blog_post_approvals where post_id = tests.post('w-flagged')$q$) = 1, 'claims: the approval is recorded');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('w-flagged'))$q$),
  'claims: one approving editor is still not enough');
select tests.ok(
  (public.blog_post_review_state(tests.post('w-flagged')) ->> 'needed')::int = 2
  and (public.blog_post_review_state(tests.post('w-flagged')) ->> 'have')::int = 0
  and (public.blog_post_review_state(tests.post('w-flagged')) -> 'approvals') -> 0 ->> 'name' = 'Editor',
  'claims: review state says two are needed and, excluding me, none have approved');
select tests.ok(tests.throws($q$update public.blog_posts set summary = 'early' where slug = 'w-flagged'$q$), 'editor: summary can''t be written directly');
-- Unflagged writer post: one editor is enough.
select tests.ok((select (public.publish_post(tests.post('w-clean'), true, 'We shipped a new settings page.', 6, 1, 'A settings page.')).status) = 'published',
  'editor: publishes a clean writer post alone');
select tests.ok((select summary = 'A settings page.' and word_count = 6 and reading_minutes = 1 and content_text = 'We shipped a new settings page.'
                 from public.blog_posts where slug = 'w-clean'),
  'editor: publish stores the computed fields and summary the app passed');
-- Edits after approval void it.
select tests.ok((select (public.approve_post(tests.post('w-flagged-2'))).status) = 'in_review', 'claims: approves the second flagged post');
reset role;
update public.blog_posts set draft_content = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Balances may earn 5% APY."}]}]}'
  where slug = 'w-flagged-2';
select tests.login('editor2@rls.test');
set local role authenticated;
select tests.ok(tests.throws($q$select public.publish_post(tests.post('w-flagged-2'))$q$),
  'claims: an edit after the first approval voids it');
select tests.ok((public.blog_post_review_state(tests.post('w-flagged-2')) ->> 'have')::int = 0 and
                jsonb_array_length(public.blog_post_review_state(tests.post('w-flagged-2')) -> 'approvals') = 0,
  'claims: the review state shows no current approvals after an edit');
-- Second editor completes a flagged post.
select tests.ok((select (public.publish_post(tests.post('ed-flagged'))).status) = 'published',
  'claims: a second editor publishes the editor-authored flagged post');
select tests.ok((select (public.approve_post(tests.post('w-flagged'))).status) = 'in_review', 'claims: the second editor approves the writer''s post');
select tests.ok((select (public.publish_post(tests.post('w-flagged'))).status) = 'published',
  'claims: two different editors let a writer''s flagged post go live');
select tests.ok(exists (select 1 from public.blog_post_approvals where post_id = tests.post('ed-flagged') and approver = auth.uid()),
  'claims: the publisher''s own approval is recorded');
select tests.ok(tests.throws($q$select public.approve_post(tests.post('writer-draft-renamed'))$q$),
  'editor: approving a live post with no pending changes is refused');
-- Request changes on a flagged post, archive and restore.
select tests.ok((select (public.archive_post(tests.post('ed-flagged'))).status) = 'archived', 'editor: archives a post');
select tests.ok(tests.throws($q$select public.publish_post(tests.post('ed-flagged'))$q$), 'editor: cannot publish an archived post');
select tests.ok(tests.throws($q$select public.archive_post(tests.post('ed-flagged'))$q$), 'editor: cannot archive twice');
select tests.ok((select (public.unarchive_post(tests.post('ed-flagged'))).status) = 'draft', 'editor: restores an archived post to draft');
select tests.ok((select draft_content is not null from public.blog_posts where slug = 'ed-flagged'), 'editor: the restored draft keeps its content');
-- Media usage.
select tests.ok(
  (select in_cover and not in_content from public.blog_media_usage() where media_id = '00000000-0000-4000-8000-0000000000a1' and post_id = tests.post('ed-flagged')),
  'media usage: a cover path is a cover use');
select tests.ok(
  (select in_content and not in_cover from public.blog_media_usage() where media_id = '00000000-0000-4000-8000-0000000000a2' and post_id = tests.post('w-clean')),
  'media usage: an image block is a content use (found by its src)');
select tests.ok(tests.count($q$select 1 from public.blog_media_usage() where media_id = '00000000-0000-4000-8000-0000000000a3'$q$) = 0,
  'media usage: an unused upload has no rows');
select tests.ok(tests.count('select 1 from public.blog_claim_patterns') = 14, 'editor: reads the claim patterns');
select tests.ok(tests.throws($q$insert into public.blog_claim_patterns (id, category, label, pattern) values ('x', 'x', 'x', 'x')$q$),
  'editor: cannot change the claim patterns');
select tests.ok(tests.throws($q$insert into public.blog_post_approvals (post_id, approver, version_hash) values (tests.post('w-flagged'), auth.uid(), 'x')$q$),
  'editor: cannot write approvals directly');
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

-- ---------------------------------------------------------------------------------------------------------------
-- Member author profiles: created with the membership, never duplicated, invisible to the public until a live post
-- ---------------------------------------------------------------------------------------------------------------

select tests.ok(
  (select count(*) from public.blog_authors where member_id = tests.uid('invitee@rls.test')) = 1,
  'first sign-in: the membership and the author profile are created together');
select tests.ok(
  (select name = 'Invitee' and slug = 'invitee' and title is null and avatar_path is null and bio is null
     and x_url is null and linkedin_url is null and github_url is null and website_url is null and location is null
   from public.blog_authors where member_id = tests.uid('invitee@rls.test')),
  'first sign-in: the profile takes the invite name and leaves every other field empty');

select tests.login('invitee@rls.test', 'aal1');
set local role authenticated;
select tests.ok(public.accept_admin_invite() = 'editor', 'second sign-in: still an editor');
reset role;
select tests.ok(
  (select count(*) from public.blog_authors where member_id = tests.uid('invitee@rls.test')) = 1,
  'second sign-in: no duplicate author profile');

insert into auth.users (id, email, email_confirmed_at) values
  ('00000000-0000-4000-8000-00000000000a', 'dup@rls.test', now()),
  ('00000000-0000-4000-8000-00000000000b', 'no.name@rls.test', now()),
  ('00000000-0000-4000-8000-00000000000c', 'dup2@rls.test', now());
insert into public.admin_invites (email, role, name) values
  ('dup@rls.test', 'writer', 'Invitee'),
  ('dup2@rls.test', 'writer', 'Invitee'),
  ('no.name@rls.test', 'writer', '');

select tests.login('dup@rls.test', 'aal1');
set local role authenticated;
select public.accept_admin_invite();
reset role;
select tests.login('dup2@rls.test', 'aal1');
set local role authenticated;
select public.accept_admin_invite();
reset role;
select tests.login('no.name@rls.test', 'aal1');
set local role authenticated;
select public.accept_admin_invite();
reset role;
select tests.ok((select slug from public.blog_authors where member_id = tests.uid('dup@rls.test')) = 'invitee-2',
  'slug collision: the second Invitee becomes invitee-2');
select tests.ok((select slug from public.blog_authors where member_id = tests.uid('dup2@rls.test')) = 'invitee-3',
  'slug collision: the third becomes invitee-3');
select tests.ok(
  (select name = 'no.name' and slug = 'no-name' from public.blog_authors where member_id = tests.uid('no.name@rls.test')),
  'no invite name: the name falls back to the email local part');

-- Backfill: members with no profile get one, and running it again changes nothing.
select tests.ok(
  exists (select 1 from public.admin_members m where m.email = 'owner@rls.test'
          and not exists (select 1 from public.blog_authors a where a.member_id = m.user_id)),
  'backfill: the fixture owner has no profile yet');
do $$
declare m record;
begin
  for round in 1..2 loop
    for m in select user_id from public.admin_members x
             where not exists (select 1 from public.blog_authors a where a.member_id = x.user_id) loop
      perform public.blog_create_member_author(m.user_id);
    end loop;
  end loop;
end $$;
select tests.ok(
  (select count(*) from public.admin_members m where not exists (select 1 from public.blog_authors a where a.member_id = m.user_id)) = 0,
  'backfill: every member has a profile');
select tests.ok(
  (select count(*) from public.blog_authors where member_id = tests.uid('owner@rls.test')) = 1
  and (select slug from public.blog_authors where member_id = tests.uid('owner@rls.test')) = 'owner',
  'backfill: idempotent, one profile each, slugs from names');

-- A guest author (no login) is still an editor's to insert.
select tests.login('owner@rls.test');
set local role authenticated;
select tests.ok(tests.affected($q$insert into public.blog_authors (slug, name) values ('guest-one', 'Guest One')$q$) = 1,
  'owner (an editor too): still inserts a guest author with no login');
reset role;

-- The public sees none of the empty profiles (none of these authors has a live post).
set local role anon;
select tests.ok(tests.count('select id from public.blog_authors where slug in (''invitee'', ''invitee-2'', ''no-name'', ''guest-one'')') = 0,
  'anon: reads no author without a live post');
select tests.ok(tests.throws('select member_id from public.blog_authors'), 'anon: still cannot select member_id');
reset role;

-- ---------------------------------------------------------------------------------------------------------------
-- Phase 4A: analytics rollups (members read, only the service role writes)
-- ---------------------------------------------------------------------------------------------------------------

insert into public.site_vitals_daily (date, path, metric, p75, samples) values (current_date, '*', 'LCP', 2100, 40);
insert into public.site_search_daily (date, path, query, impressions, clicks, position) values (current_date, '/blog/live-post', 'send money', 10, 1, 4.2);
insert into public.analytics_sync_log (source, day, status, rows_written) values ('posthog', current_date, 'ok', 3);
insert into public.site_breakdown_daily (date, path, dimension, value, visitors, views) values (current_date, '*', 'share_click', 'x', 2, 2);

set local role anon;
select tests.ok(tests.throws('select * from public.site_vitals_daily'), 'anon: no access to web vitals');
select tests.ok(tests.throws('select * from public.site_search_daily'), 'anon: no access to site search stats');
select tests.ok(tests.throws('select * from public.analytics_sync_log'), 'anon: no access to the sync log');
reset role;

select tests.login('outsider@rls.test');
set local role authenticated;
select tests.ok(tests.count('select * from public.site_vitals_daily') = 0, 'outsider: reads no web vitals');
select tests.ok(tests.count('select * from public.analytics_sync_log') = 0, 'outsider: reads no sync log');
reset role;

select tests.login('writer@rls.test');
set local role authenticated;
select tests.ok(tests.count('select * from public.site_vitals_daily') = 1, 'writer: reads web vitals');
select tests.ok(tests.count('select * from public.site_search_daily') = 1, 'writer: reads site search stats');
select tests.ok(tests.count('select * from public.analytics_sync_log') = 1, 'writer: reads the sync log');
select tests.ok(tests.throws($q$insert into public.site_vitals_daily (date, path, metric, p75) values (current_date, '/x', 'CLS', 0.1)$q$), 'writer: cannot write web vitals');
select tests.ok(tests.throws($q$insert into public.site_search_daily (date, path, query) values (current_date, '/x', 'q')$q$), 'writer: cannot write site search stats');
select tests.ok(tests.throws($q$insert into public.analytics_sync_log (source, day, status) values ('gsc', current_date, 'ok')$q$), 'writer: cannot write the sync log');
select tests.ok(tests.throws($q$update public.analytics_sync_log set status = 'error'$q$), 'writer: cannot change the sync log');
select tests.ok(tests.throws($q$insert into public.site_stats_daily (date, path) values (current_date, '/x')$q$), 'writer: cannot write site stats');
reset role;

select tests.login('editor@rls.test');
set local role authenticated;
select tests.ok(tests.throws($q$insert into public.site_breakdown_daily (date, path, dimension, value) values (current_date, '/x', 'city', 'Lagos')$q$), 'editor: cannot write breakdowns');
select tests.ok(tests.throws($q$delete from public.site_vitals_daily$q$), 'editor: cannot delete rollups');
reset role;

set local role service_role;
select tests.ok(tests.affected($q$insert into public.site_breakdown_daily (date, path, dimension, value, visitors, views) values (current_date, '*', 'share_visit', 'linkedin', 3, 3)$q$) = 1,
  'service role: writes breakdowns, including share visits');
select tests.ok(tests.affected($q$insert into public.analytics_sync_log (source, day, status) values ('gsc', current_date, 'ok')$q$) = 1,
  'service role: writes the sync log');
select tests.ok(tests.throws($q$insert into public.site_breakdown_daily (date, path, dimension, value) values (current_date, '*', 'nonsense', 'x')$q$),
  'breakdown dimensions are checked');
select tests.ok(tests.throws($q$insert into public.analytics_sync_log (source, day, status) values ('other', current_date, 'ok')$q$),
  'sync log sources are checked');
select tests.ok(tests.affected($q$insert into public.blog_stats_daily (post_id, date, share_clicks, shares) values (tests.post('live-post'), current_date, 4, '{"x":4}')$q$) = 1,
  'service role: writes blog stats with share counts');
reset role;

rollback;
