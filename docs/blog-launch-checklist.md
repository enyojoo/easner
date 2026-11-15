# Blog launch checklist

For the person launching the blog and the Easner Website Admin. Everything an agent can check is already enforced by
`npm run check:seo:fixtures` (in `website/`), `npm test -w admin`, `npm run test:db`, `npm run test:blog-content` and
`npm run e2e:renderer -w admin`. This list is what only a person can do: real keys, real domains, Google's own tools.

Plan: [`blog-and-admin-plan.md`](./blog-and-admin-plan.md). How the website reads the blog: [`../supabase/README.md`](../supabase/README.md).
Admin setup: [`../admin/README.md`](../admin/README.md).

## 1. Two Vercel projects

| | Website | Admin |
| --- | --- | --- |
| Domain | `www.easner.com` (already live) | `admin.easner.com` |
| Root directory | repo root (`vercel.json` runs `npm run build:website`) | `admin` |
| Include files outside the root directory | n/a | **On.** The admin imports `packages/blog-content` and `@easner/shared` |
| Framework preset | Next.js | Next.js |
| Build and install | from `vercel.json` | from `admin/vercel.json` (`npm run build`, `npm install`) |
| Node | 22 | 22 |

Steps for the admin project:

1. Create a new Vercel project from the same repository, root directory `admin`, include source files outside the root.
2. Add the environment variables below (Production, and Preview if you want preview deployments to work).
3. Add the domain `admin.easner.com` and the DNS record Vercel shows.
4. Deploy. Open `https://admin.easner.com/robots.txt` (must disallow everything) and
   `curl -sI https://admin.easner.com/overview | grep -i x-robots-tag` (must say `noindex, nofollow, noarchive`).
5. Confirm `https://admin.easner.com/dev/editor` answers 404 (the development harness never ships).

### Environment

Nothing below is needed to build. A missing optional value turns that feature off and the admin says so; it never
breaks a page. Server-only values are never `NEXT_PUBLIC_`.

| Variable | Project | Required for | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | admin | signing in | The `easner-website` project, never the banking one |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | admin | signing in | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | admin | cron jobs | `sb_secret_...`. Server only. Never in the website project |
| `CRON_SECRET` | admin | cron jobs | At least 16 characters (`openssl rand -hex 24`). Without it both cron routes answer 503 |
| `WEBSITE_URL` | admin | publish refreshing the site, preview | `https://www.easner.com` |
| `BLOG_REVALIDATE_SECRET` | admin and website | same value in both | Without it a publish still succeeds; the site refreshes within an hour |
| `BLOG_PREVIEW_SECRET` | admin and website | same value in both | Signs the 30 minute preview link |
| `INDEXNOW_KEY` | admin and website | IndexNow ping | Optional. Same value in both. See section 4 |
| `POSTHOG_PROJECT_ID`, `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_HOST` | admin | Analytics | Optional. Set the PostHog project timezone to UTC |
| `GSC_SITE_URL`, `GSC_SERVICE_ACCOUNT_JSON` | admin | Search Console numbers | Optional. Add the service account's `client_email` as a user on the property |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | website | reading posts | The same project. Without them the blog shows its empty state |
| `SUPABASE_SERVICE_ROLE_KEY` | website | draft preview, helpful votes | Server only. Without it preview and feedback answer 503 |
| `BLOG_FEEDBACK_SECRET` | website | optional salt for the helpful votes | Defaults to the service role key |
| `NEXT_PUBLIC_POSTHOG_KEY` | website | `post_shared` and read depth events | Already set for the marketing pages |

Never set `BLOG_FIXTURES` or `BLOG_FIXTURE_DOC` on Vercel.

### Cron

`admin/vercel.json` has two crons:

| Path | Schedule | What |
| --- | --- | --- |
| `/api/cron/analytics` | `30 2 * * *` (daily) | Nightly PostHog and Search Console rollup |
| `/api/cron/publish-scheduled` | `*/5 * * * *` (every 5 minutes) | Publishes scheduled posts that are due |

**Vercel Hobby only allows crons that run once a day.** A `*/5` schedule makes the deployment fail with a cron
validation error. Pick one:

1. **Vercel Pro** (recommended). Nothing to change; a scheduled post goes live within 5 minutes of its time.
2. **Stay on Hobby.** Change the publish job to a daily time in `admin/vercel.json` (for example `0 7 * * *`). A post
   scheduled for 09:30 then goes live at the next 07:00 UTC run, so tell writers to schedule for a time right after
   the daily run, or publish by hand.
3. **Call the route from outside Vercel every 5 minutes** (free). Keep the daily analytics cron in `vercel.json`,
   delete the `publish-scheduled` entry, and add a GitHub Actions workflow in the repository. Store `CRON_SECRET` as a
   repository secret named `ADMIN_CRON_SECRET`:

   ```yaml
   name: publish-scheduled
   on:
     schedule:
       - cron: "*/5 * * * *"
     workflow_dispatch:
   jobs:
     run:
       runs-on: ubuntu-latest
       steps:
         - run: >
             curl --fail --silent --show-error --max-time 60
             -H "Authorization: Bearer ${{ secrets.ADMIN_CRON_SECRET }}"
             https://admin.easner.com/api/cron/publish-scheduled
   ```

   GitHub may delay scheduled runs by several minutes under load and pauses them after 60 days without repository
   activity. The route is safe to call any number of times: `publish_post` refuses anything that is not scheduled and due.

Check a cron by hand (a wrong secret must answer 401, a right one 200):

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" https://admin.easner.com/api/cron/publish-scheduled
```

## 2. Supabase (the `easner-website` project)

1. Schema applied. If the project predates the newest migrations, run `supabase/apply-phase4.sql` once in the SQL editor
   (see `supabase/README.md` for which file covers what).
2. Authentication: email OTP on, signup restricted by the `hook_before_user_created` hook, the sign-in email uses
   `supabase/templates/otp-code.html`, MFA (TOTP) enabled.
3. Storage: a public `blog` bucket exists.
4. First owner invited (the SQL snippet in `admin/README.md`, "Bootstrapping production"). Sign in at
   `https://admin.easner.com`, scan the QR code with an authenticator app, invite the rest of the team in Settings.
5. Run `npm run test:db` before and after any schema change.

## 3. First post

1. In the admin: Authors, give every author a photo, a title and a short bio. A post cannot publish without them.
2. Categories: check the five (Product updates, Business, Personal, Global money, Company) and their descriptions.
3. Write a real post. Add a cover of at least 1600 by 900 with alt text, a Summary block, a category, an author, a
   product page if it supports one, and sources for any claim about money.
4. Preview (button in the editor). Check it as a reader on a phone width. Preview is `noindex` and never cached.
5. Publish. Within a minute check that `https://www.easner.com/blog/<slug>` loads, the post is on `/blog`, in its
   category, on the author page, in `https://www.easner.com/sitemap.xml`, `llms.txt`, and that
   `https://www.easner.com/blog/<slug>.md` returns Markdown.
6. Thin archives: a category with fewer than 3 posts is `noindex` and absent from the sitemap on purpose. It becomes
   indexable by itself when the third post publishes.

## 4. IndexNow

1. Generate a key: `openssl rand -hex 16`.
2. Set `INDEXNOW_KEY` to that value in **both** Vercel projects and redeploy.
3. Check `https://www.easner.com/<key>.txt` returns the key as plain text (IndexNow fetches exactly this URL; any other
   `.txt` name answers 404). `https://www.easner.com/api/indexnow-key` returns it too.
4. Publish a post. The admin pings IndexNow with the post URL and the key location. A failure never blocks a publish.
5. Bing Webmaster Tools: add `www.easner.com`, import from Search Console, and check the IndexNow submissions list.

## 5. Manual SEO and answer-engine checks (agents cannot run these)

Do them once on launch day with the first real post and again after any change to templates or structured data.
Use the live URLs. `<slug>` is the first post.

### Google Rich Results Test (https://search.google.com/test/rich-results)

| URL | Expect |
| --- | --- |
| `/blog/<slug>` | Detected items include **Breadcrumbs** and **Article** (BlogPosting), no errors, no critical warnings. FAQ and HowTo are valid markup but Google shows no rich result for most sites; that is fine. Warnings about recommended fields are worth reading, not blocking |
| `/blog` | **Breadcrumbs**, no errors |
| `/blog/categories/business` | **Breadcrumbs**, no errors |
| `/blog/authors/<author>` | **Breadcrumbs** and **Profile page**, no errors. The author's name, image and `sameAs` links are present |
| `/` | **Organization** still valid after the blog launch |

Also paste each URL into https://validator.schema.org and confirm zero errors and no node reported twice.

### Google Search Console

1. Property `sc-domain:easner.com`. Sitemaps: submit `https://www.easner.com/sitemap.xml`. Status must be Success, with
   the discovered page count equal to the number of pages in the sitemap.
2. URL Inspection for `/blog`, `/blog/<slug>`, `/blog/authors/<author>` and a category. Each must say "URL is on Google" after
   indexing (or "can be indexed" before), **User-declared canonical equals Google-selected canonical**, and the page is
   fetched without blocked resources. Click "Request indexing" for the first post.
3. After a few days: Indexing, Pages. The reasons list must not contain "Duplicate without user-selected canonical",
   "Crawled, currently not indexed" for the post, or "Excluded by noindex" for a page that should rank. Thin category
   archives appearing under "Excluded by noindex" is expected.
4. Enhancements: Breadcrumbs and Articles report no errors.
5. Experience, Core Web Vitals: wait for field data (28 days). Targets on mobile: LCP 2.5 s or less, INP 200 ms or
   less, CLS 0.1 or less.
6. Links, Performance: confirm queries start to appear for the post after a week; connect the same property to the
   admin Analytics (`GSC_SITE_URL`).

### Speed and layout

1. https://pagespeed.web.dev for `/blog` and `/blog/<slug>` on **mobile**. Look at LCP element (it must be the cover
   image, not a font or an embed), CLS (0), total blocking time, and "Properly size images". A cover that is far wider
   than 1680 px or served as PNG is the usual cause of a slow LCP; re-upload as JPG or WebP at 1600 to 2400 px wide.
2. In Chrome DevTools, throttle to Fast 4G, open the post, and confirm nothing jumps as fonts and images arrive.
3. Look at the post at 375, 768 and 1280 px wide: no sideways scroll, share rail does not cover text, table of contents
   highlights the right heading.

### Social cards

| Tool | URL | Expect |
| --- | --- | --- |
| LinkedIn Post Inspector (https://www.linkedin.com/post-inspector/) | `/blog/<slug>` | 1200 by 630 image, title and description from the post |
| Facebook Sharing Debugger (https://developers.facebook.com/tools/debug/) | `/blog/<slug>` | No warnings, image loads, canonical matches |
| X (compose a post with the URL, X has no public validator any more) | `/blog/<slug>` | Large image card |
| WhatsApp (send the link to yourself) | `/blog/<slug>` | Image, title, description |
| Same for a category and an author page | | Card shows the category or author name, not the site default |

Share images also exist at `/blog/<slug>/image/16x9`, `/4x3`, `/1x1`; open each and confirm the cover is cropped around
its focal point.

### Feeds, Markdown and machine files

1. https://validator.w3.org/feed/ for `/blog/feed.xml`, one category feed (`/blog/categories/business/feed.xml`) and one
   author feed. Expect "Valid RSS" (recommendations about `dc:creator` and `media:` namespaces are fine).
2. Add the main feed to a feed reader and confirm the full post body, cover and link render.
3. `curl -s https://www.easner.com/blog/<slug>.md | head` starts with `# <title>`, has the `Source:` line, and no raw HTML.
4. `https://www.easner.com/llms.txt` lists the post under `## Blog`; `https://www.easner.com/llms-full.txt` contains its text.
5. Ask an answer engine (ChatGPT search, Perplexity, Gemini) a question the first post answers, a week after indexing,
   and note whether easner.com is cited. Do not expect it in the first days.

### Noindex and redirects

```bash
# Preview must never be indexable or cached
curl -sI "https://www.easner.com/api/blog/preview?token=x" | grep -iE "x-robots-tag|cache-control"   # noindex, no-store (401 is expected for a bad token)
# A published post is indexable
curl -s https://www.easner.com/blog/<slug> | grep -io '<meta name="robots"[^>]*>'                    # index, follow, max-image-preview:large
# A thin category is not
curl -s https://www.easner.com/blog/categories/company | grep -io '<meta name="robots"[^>]*>'          # noindex while it has fewer than 3 posts
# An old slug redirects once, permanently
curl -sI https://www.easner.com/blog/<old-slug> | head -3                                             # 301, Location: /blog/<new-slug>
# An unknown slug is a real 404
curl -sI https://www.easner.com/blog/not-a-post | head -1                                             # 404
```

## 6. Launch day, in order

1. Both Vercel projects deployed from the same commit on `main`, environment set, cron decision made (section 1).
2. `https://admin.easner.com` signs in with email code and authenticator; the Overview and Posts pages load.
3. Write and publish the first post (section 3). Watch it appear on the site.
4. Rich Results Test, URL Inspection, Request indexing (section 5).
5. Submit the sitemap, set `INDEXNOW_KEY`, confirm the ping (section 4).
6. Post the link on LinkedIn and X from the Share row and confirm the preview cards (section 5).
7. Put the blog in the website footer and header navigation only after steps 1 to 6 pass.
8. Schedule the second post a day ahead to exercise the cron path, and check it published at its time.

## 7. First week

- Daily: Search Console, Pages and Sitemaps for errors; admin Analytics for the post's views and where they come from.
- After the first scheduled publish, read the Vercel cron log for `/api/cron/publish-scheduled` (status 200, nothing failed).
- After seven days, compare the post's LCP and CLS in the admin Performance tab with PageSpeed Insights.
- Anything that looks wrong in the live HTML: run `BLOG_FIXTURES=1 npm run check:seo:fixtures` in `website/` to see
  whether a template change broke an invariant, then fix and redeploy.
