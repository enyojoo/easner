# @easner/blog-content

The blog post document format, and the contract between the admin (admin.easner.com, writes posts) and the website
(easner.com, renders them). Plan: `docs/blog-and-admin-plan.md`.

- `blog_posts.content` (published) and `blog_posts.draft_content` (working copy) hold a `DocNode`: ProseMirror / Tiptap
  JSON. No stored HTML, ever. Node and mark names in `src/index.ts` are the Tiptap extension names; the editor registers
  extensions with exactly these names and attrs.
- The admin runs `validateDoc` on every save and in the pre-publish checklist. The website runs it before rendering and
  renders nothing it rejects (the post 404s and the error is logged).
- Derived fields are computed here by both sides: `plainText` (`content_text`), `wordCount`, `readingMinutes`,
  `extractSummary` (`summary`), `extractFaq` / `extractSteps` / `extractDefinitions` (schema), `headings` (table of
  contents and anchors), `internalLinks` / `linkedProductPages` (checklist).

Add a node: change `src/index.ts` (type, `SPEC`, `TOP_BLOCKS`), add a test, then add the editor extension in `admin/` and
the renderer in `website/` in the same change. Unknown nodes are errors on purpose.

## Contract: admin ↔ website

Environment variables. Same value on both sides where the name matches.

| Variable | Where | Purpose |
| --- | --- | --- |
| `WEBSITE_URL` | admin | Base URL of the site (`https://www.easner.com`, local `http://localhost:3000`) |
| `BLOG_REVALIDATE_SECRET` | admin + website | Shared secret for `/api/revalidate` |
| `BLOG_PREVIEW_SECRET` | admin + website | HMAC key for preview tokens |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | website (server only) | Public reads, explicit columns (`supabase/README.md`) |
| `SUPABASE_SERVICE_ROLE_KEY` | website (server only) | Draft preview and the feedback route **only**. Never imported by a page that renders live posts. |
| `INDEXNOW_KEY` | admin | Optional. Pinged on publish when set. |

### Revalidation

After publish, unpublish, update, slug change, category or author edit, the admin calls:

```
POST {WEBSITE_URL}/api/revalidate
x-revalidate-secret: {BLOG_REVALIDATE_SECRET}
content-type: application/json

{ "tags": ["blog", "blog:post:<slug>", "blog:category:<slug>", "blog:author:<slug>"], "paths": ["/blog"] }
```

`200 {"revalidated": true}`, `401` on a wrong secret, `400` on a bad body. The website tags every blog fetch with `blog`
plus `blog:post:<slug>`, `blog:category:<slug>` or `blog:author:<slug>` as appropriate, so a tag call refreshes exactly
the pages that show that record. A published slug change sends the old and the new slug.

### Draft preview

The admin opens `{WEBSITE_URL}/api/blog/preview?token=<token>` in a new tab.

```
payload = base64url(JSON.stringify({ postId: "<uuid>", exp: <unix seconds, now + 1800> }))
token   = payload + "." + base64url(HMAC_SHA256(payload, BLOG_PREVIEW_SECRET))
```

The website verifies the signature (constant-time) and `exp`, enables Next `draftMode()`, looks up the post's slug with
the service role and redirects to `/blog/<slug>`. In draft mode `/blog/[slug]` reads `draft_content ?? content` with the
service role, shows a "Preview, not published" banner, sends `noindex` and `Cache-Control: no-store`, and is never
cached or put in the sitemap. `/api/blog/preview?exit=1` leaves draft mode.

### Cover and share image

`cover_path` is the storage path in the `blog` bucket; the website builds the public URL and serves the share image
from `/blog/[slug]/opengraph-image` (cover, cropped to 1200×630 around `cover_focal_point`; `OgCard` text layout only if
there is no cover; `og_image_path` overrides when set).
