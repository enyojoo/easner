# Website Supabase project (`easner-website`)

The blog, the admin's team and the analytics rollups. Never the banking database. Plan:
[`docs/blog-and-admin-plan.md`](../docs/blog-and-admin-plan.md) §5.

- `migrations/`: the schema, applied with `supabase db push` (or `supabase start` locally).
- `seed.sql`: local only. Invites `owner@easner.test` as an owner.
- `tests/rls.test.sql`: who can read and write what. Run `npm run test:db` (PGlite, no Docker) or, against the local
  stack, `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql`.
- `templates/otp-code.html`: the sign-in code email.

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
