# The public blog (`app/(marketing)/blog`)

Plan: `docs/blog-and-admin-plan.md` §3 and §3a. The document format and the admin ↔ website contract are in
`packages/blog-content/README.md`; what the anon key may read is in `supabase/README.md`.

## Where things are

| | |
|---|---|
| Data layer | `lib/blog/` (server only): `queries.ts` (explicit column lists in `columns.ts`, every fetch tagged `blog`, `blog:post:<slug>`, `blog:category:<slug>`, `blog:author:<slug>`), `fixtures/`, `supabase.ts` (PostgREST over `fetch`) |
| Renderer | `components/blog/prose.tsx` maps every `@easner/blog-content` node to the WebProse design; client islands are small (copy, lightbox, embed facade, anchors, TOC spy, progress, share, helpful, search) |
| Routes | `/blog`, `/blog/[slug]`, `/blog/categories/[slug]`, `/blog/authors`, `/blog/authors/[slug]`, feeds (`feed.xml`, per category, per author), `/blog/[slug].md`, `/blog/[slug]/opengraph-image`, `/blog/[slug]/image/<16x9|4x3|1x1>` |
| Pagination | `?page=N` is a real, self-canonical URL. `proxy.ts` rewrites it to static ISR routes (`.../page/N`) so no page reads `searchParams`; a direct request to `.../page/N` 301s back to `?page=N` |
| `/blog/<slug>.md` | Next cannot use `[slug].md` as a segment: `next.config.mjs` rewrites `/blog/:slug.md` to the route handler `/api/blog/markdown/:slug` |
| Old slugs | `proxy.ts` 301s `blog_redirects` (one read per minute per instance) |
| Admin contract | `POST /api/revalidate`, `GET /api/blog/preview`, `GET /api/indexnow-key` |
| Reader features | `POST /api/blog/feedback`, `GET /api/blog/search`, `post_shared` and `blog_read_depth` PostHog events |

## Running it without a database

- `BLOG_FIXTURES=1` (or development with no `SUPABASE_URL`) reads `lib/blog/fixtures/`: 15 sample posts covering every node type.
- Production with no env at all builds and shows the empty states.
- Environment: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (reads), `SUPABASE_SERVICE_ROLE_KEY` (draft preview and feedback only),
  `BLOG_REVALIDATE_SECRET`, `BLOG_PREVIEW_SECRET`, `INDEXNOW_KEY` (optional), `BLOG_FEEDBACK_SECRET` (optional salt; defaults to the service key).

## `npm run check:seo`

`scripts/check-seo.py` checks the production build. It finds static pages from `app/(marketing)/**/page.tsx` and the blog's
dynamic pages from the prerendered HTML, so build with data first:

```bash
npm run check:seo:fixtures    # BLOG_FIXTURES=1 build, then the check (from website/)
# or: BLOG_FIXTURES=1 npm run build:website && npm run check:seo --workspace=website
```

Every existing per-page rule applies to blog pages. Blog rules added: `BlogPosting` fields and an author page that exists,
FAQ, HowTo and DefinedTerm text visible in the HTML, speakable selector, every `<img>` (outside the site header and
footer) with alt, width and height, thin archives `noindex` and absent from the sitemap, every indexable post in
`llms.txt`, every `/blog/<slug>.md` generated.
