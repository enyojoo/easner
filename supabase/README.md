# Website Supabase project (`easner-website`)

The blog, the admin's team and the analytics rollups. Never the banking database. Plan:
[`docs/blog-and-admin-plan.md`](../docs/blog-and-admin-plan.md) §5.

- `migrations/`: the schema, applied with `supabase db push` (or `supabase start` locally).
- `seed.sql`: local only. Invites `owner@easner.test` as an owner.
- `tests/rls.test.sql`: who can read and write what. Run `npm run test:db` (PGlite, no Docker) or, against the local
  stack, `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql`.
- `apply-phase4b.sql`: the `20261118*` migrations (scheduling, revisions, edit lock, redirects) in one transaction, for a
  hosted project that already ran `apply-phase2.sql` (`node supabase/build-apply-phase4b.mjs` regenerates it).
- `templates/otp-code.html`: the sign-in code email.
- `apply-phase2.sql`: the `20261115*` migrations in one transaction, for a hosted project that already ran the earlier
  setup (`node supabase/build-apply-phase2.mjs` regenerates it). `hosted-setup.sql` and `fix-public-access.sql` are not
  regenerated: they carry the owner's email and are out of date by design.

## How the website reads the blog

There are no views. The website reads the tables directly, with the **anon** key, server-side. RLS returns only live
rows, and column grants allow only the published columns.

**Rule: always select explicit columns, never `*`.** anon has no grant on the hidden columns (`draft_content`, audit,
lock and admin fields). PostgREST rejects a request that names one, and `select=*` names all of them, so the whole
request fails.

| Table | anon sees these rows | Columns anon may select |
| --- | --- | --- |
| `blog_posts` | `status = 'published' and published_at <= now()` | `id, slug, status, title, excerpt, summary, cover_path, cover_alt, cover_focal_point, og_image_path, content, content_text, search, category_id, product_page, featured, featured_rank, seo_title, seo_description, canonical_url, noindex, focus_keyword, answers_section, word_count, reading_minutes, published_at, content_modified_at` |
| `blog_categories` | `archived_at is null` | `id, slug, name, description, intro, og_art_path, sort_order, seo_title, seo_description, archived_at` |
| `blog_authors` | authors with at least one live post | `id, slug, name, title, location, avatar_path, bio, x_url, linkedin_url, github_url, website_url` |
| `blog_post_authors` | rows whose post is live | `post_id, author_id, position` |
| `blog_redirects` | redirects whose target post is live | `from_slug, to_post_id, created_at` |

Everything else (`admin_members`, `admin_invites`, `admin_activity`, `blog_revisions`, `blog_media`, the stats tables,
`blog_feedback`) is closed to anon.

Never readable by anon: `draft_content`, `has_unpublished_changes`, `scheduled_for`, `created_at`/`updated_at`,
`created_by`, `updated_by`, `locked_by`, `locked_at` on posts; `member_id` and timestamps on authors; timestamps on
categories.

Examples (supabase-js):

```ts
// Index: newest live posts with category and authors.
supabase
  .from("blog_posts")
  .select("id, slug, title, excerpt, cover_path, cover_alt, published_at, reading_minutes, " +
          "blog_categories(slug, name), blog_post_authors(position, blog_authors(slug, name, avatar_path))")
  .order("published_at", { ascending: false })

// Old slug → new slug, for the 301 in proxy.ts.
supabase.from("blog_redirects").select("from_slug, blog_posts(slug)").eq("from_slug", slug).maybeSingle()
```

Things the old views did that the website now does itself: a category's post count and newest date (count the
category's live posts), and the redirect's target slug (embed `blog_posts(slug)` as above).

## Who else reads what

- **Admin members** (an `admin_members` row and an MFA-verified `aal2` session) read and write through the member
  policies. The `authenticated` role keeps full-column table grants for that, so the admin can select any column.
- **Signed-in non-members** match no policy and see nothing, public rows included. There is no public policy for
  `authenticated`: with full columns it would expose `draft_content` of live posts. Sign-ups are invite-only anyway
  (the `hook_before_user_created` auth hook).
- **Server jobs** (stats rollups, feedback) use the service role, which bypasses RLS. Never ship that key to a
  browser.

## Review workflow (Phase 2, `20261115120000_blog_review_workflow.sql`)

A Writer submits, an Editor approves or sends it back with comments, an Editor publishes. The database enforces it.

**Status only moves through functions.** The guard trigger refuses any direct change of `status` (every role, including
owners). All functions are `security definer`, need an `aal2` session, log to `admin_activity`, and return the post.

| Function | Who | Does |
| --- | --- | --- |
| `submit_for_review(post)` | the creator, or an editor | draft or changes requested → in review (needs a title and content) |
| `withdraw_submission(post)` | the creator, or an editor | in review → draft |
| `request_changes(post, comment?)` | editor | in review → changes requested; adds a `change_request` comment |
| `approve_post(post)` | editor who is not the creator | records an approval of the current version; status unchanged |
| `publish_post(post, significant?, content_text?, word_count?, reading_minutes?, summary?)` | editor | publishes (or updates) the post. The app passes the computed fields from `@easner/blog-content`; without them the database computes text and counts itself. Writes the `publish` revision. |
| `unpublish_post(post)` | editor | published or scheduled → draft, keeping a working copy |
| `archive_post(post)` / `unarchive_post(post)` | editor | → archived / archived → draft |
| `blog_post_review_state(post)` | any member | `{flagged, matches, version_hash, creator, creator_is_editor, approvals[], needed, have}` |
| `ensure_my_author()` | any member | the author profile linked to the caller, created if missing (for My profile) |
| `blog_media_usage()` | any member (invoker) | `(media_id, post_id, in_cover, in_content)` for every upload a post uses |

**Claims check.** `blog_claim_patterns` (fees, rates, yields, FX margins, "insured"/FDIC, regulatory statements,
competitor comparisons) is matched against title, excerpt and the working or published text by a trigger, which sets
`claims_flagged` and `claims_matches` (pattern ids) on every change to those fields. Clients can't set them. The same
list lives in `admin/lib/blog/claims-patterns.json` for the editor's banner; a unit test keeps the two equal. A flagged
post can only be published when the post's creator is not the one publishing and at least two different editors or
owners stand behind the current version: current approvers, plus the creator when the creator is an editor, plus the
publisher (publishing records their own approval). Approvals are tied to `blog_post_version_hash()` (title, excerpt and
the working doc), so any edit after an approval voids it.

**Comments** (`blog_post_comments`): members read; an editor, or the post's creator on their own post, can comment
(as themselves); editors and the creator can resolve; only `resolved_at` and `resolved_by` are updatable.
`blog_post_approvals` is written only by `approve_post` and `publish_post`.

**Other rules.** After first publish only an owner can change a post's `slug` (the old slug still gets its 301).
`summary` is a published field like `content`: it changes only through `publish_post`, because anon can read it on live
rows. Title, excerpt, SEO fields and cover are single-copy: edits to them on a live post are live as soon as the website
revalidates (only the body has a draft copy).

## Member author profiles

`accept_admin_invite()` creates the member's `blog_authors` row in the same transaction as their `admin_members` row
(name from the invite, else the email's local part; slug from the name with `-2`, `-3` on collision; every other field
empty). `20261115130000_member_author_profiles.sql` backfills members who signed in earlier and is safe to re-run.
`ensure_my_author()` stays as a safety net for "My profile". Guest authors (editors insert them, `member_id` null) are
unchanged, and the public side is unchanged: anon only reads authors with a live post, so an empty profile is invisible.

## Content lifecycle (Phase 4B, `20261118120000_blog_lifecycle.sql`)

- **Scheduling.** `schedule_post(post, at)` (editors and owners; also reschedules) puts a post that is not live yet into
  `scheduled` with `scheduled_for` (UTC), `scheduled_by` and `scheduled_from` (where `unschedule_post` returns it). It runs
  the same rules as publishing, including the second Editor for flagged posts. The slug locks for editors. The admin's
  cron route (`/api/cron/publish-scheduled`, every 5 minutes) calls `publish_post` with the **secret key**: with no user and
  the `service_role` claim, `publish_post` only publishes a post that is `scheduled` and due, as the Editor who scheduled
  it, dated to its scheduled time. A second run, or a post that is not due, is refused, so the job is idempotent.
- **Revisions.** `blog_revisions` rows: `autosave` (written by a trigger, at most one per 5 minutes per post, never the same
  text twice, newest 40 kept), `submit`, `publish` and `restore` milestones (never pruned). Each has a `word_count`.
  `restore_revision` copies into the draft only, keeps the draft it replaced as a checkpoint, and clears the draft when the
  version equals what is live.
- **Edit lock.** `claim_post_lock(post, take_over)` takes or refreshes the lock (the browser calls it every 30 seconds; a
  lock not refreshed for 2 minutes is free). Editors and owners may take over. It writes only `locked_by` and `locked_at` and
  does not move `updated_at`. `release_post_lock`, `touch_post_presence` and `blog_post_viewers` back the avatars in the top
  bar. All plain polling: nothing needs Realtime.
- **Redirects.** Add with `add_blog_redirect(from, to_post)`: the URL must be valid and not belong to any post, the target
  must be published, and one URL redirects once. Direct inserts and updates are closed; removing is a plain delete. A
  published post's slug change creates its redirect, and any post that takes a URL clears a redirect from it.
