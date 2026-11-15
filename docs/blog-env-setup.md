# Blog and Easner Website Admin: environment setup

Two Vercel projects, one Supabase project (`easner-website`). Set every value in Vercel (Production), and for local
runs in the git-ignored `admin/.env.local` and `website/.env.local`. Never prefix a secret with `NEXT_PUBLIC_`.

## Shared secrets (same value in both projects)

Generate each once and paste the same value into the admin and the website.

```bash
openssl rand -hex 32   # BLOG_REVALIDATE_SECRET
openssl rand -hex 32   # BLOG_PREVIEW_SECRET
```

## Admin project (root directory `admin`, domain `admin.easner.com`)

| Variable | Required | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase, Settings, API: project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Supabase, Settings, API Keys: publishable key (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | yes | Supabase, Settings, API Keys: secret key (`sb_secret_...`). Server only: bypasses RLS |
| `WEBSITE_URL` | yes | `https://www.easner.com` (local: `http://localhost:3000`) |
| `BLOG_REVALIDATE_SECRET` | yes | The shared secret above |
| `BLOG_PREVIEW_SECRET` | yes | The shared secret above |
| `CRON_SECRET` | yes | `openssl rand -hex 24`. Vercel sends it to cron routes as a Bearer token. Without it the cron routes refuse |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | for invite emails | IAM keys allowed `ses:SendEmail` (the same ones easnerbanking uses). Without them an invite is saved but no email goes out; Resend on the Team list retries |
| `SES_REGION` | optional | `eu-west-2` (default) |
| `ADMIN_EMAIL_FROM` / `ADMIN_EMAIL_FROM_NAME` | optional | `noreply@easner.com` / `Easner Website Admin` (default). Must be on the verified `easner.com` identity |
| `ADMIN_URL` | optional | `https://admin.easner.com` (default). The sign-in link in the invite email |
| `INDEXNOW_KEY` | optional | The same key the website already serves at `/api/indexnow-key`. Pings search engines on publish |
| `POSTHOG_PROJECT_ID` | for Analytics | PostHog, Project settings: Project ID (a number) |
| `POSTHOG_PERSONAL_API_KEY` | for Analytics | PostHog, your avatar, Personal API keys, Create: scope **Query: read** (and Project: read if offered), limited to the Easner project |
| `POSTHOG_HOST` | optional | `https://us.posthog.com` (default) or `https://eu.posthog.com`. The app host, not the ingest host |
| `GSC_SITE_URL` | for search data | The Search Console property exactly as listed, e.g. `sc-domain:easner.com` or `https://www.easner.com/` |
| `GSC_SERVICE_ACCOUNT_JSON` | for search data | The whole service account key JSON, see below |

Without the PostHog and Search Console values the app still works: Analytics shows "Connect PostHog" and the nightly job
does nothing.

### PostHog

1. Open the PostHog project that the website sends events to (the one whose key is `NEXT_PUBLIC_POSTHOG_KEY`).
2. Project settings: copy the **Project ID**. Set the project timezone to **UTC** (days are cut in the project's timezone).
3. Personal API keys: create a key with the **Query: read** scope. Copy it once; PostHog shows it only on creation.
4. Put the id and key into the admin's Vercel env. Check `POSTHOG_HOST` matches the region of your PostHog account.

### Search Console

1. Google Cloud console: create (or pick) a project, enable the **Google Search Console API**.
2. IAM, Service accounts: create one (no roles needed), then Keys, Add key, JSON. Download it.
3. Search Console, Settings, Users and permissions: add the service account's `client_email` as a **Restricted** user
   (read only) on the same property as `GSC_SITE_URL`.
4. Paste the whole JSON into `GSC_SERVICE_ACCOUNT_JSON` (Vercel accepts multi line values).

### Vercel cron

`admin/vercel.json` defines two jobs. Cron runs only on **Production** deployments and calls the routes with
`Authorization: Bearer <CRON_SECRET>`.

| Route | Schedule | What it does |
| --- | --- | --- |
| `/api/cron/analytics` | daily 02:30 UTC | Pulls PostHog and Search Console into the rollup tables |
| `/api/cron/publish-scheduled` | every 5 minutes | Publishes posts whose scheduled time has come |

Vercel's **Hobby** plan only allows daily crons: a `*/5` schedule fails the deploy there. Use **Pro**, or change the
publish job to daily and accept that scheduled posts go live once a day.

After the first deploy, backfill analytics once:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://admin.easner.com/api/cron/analytics?days=30"
```

## Website project (root directory `website`)

Keep the existing website variables and add:

| Variable | Required | Where to get it |
| --- | --- | --- |
| `SUPABASE_URL` | yes | Same project URL |
| `SUPABASE_PUBLISHABLE_KEY` | yes | Same publishable key. Public reads only, explicit columns |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | The secret key (`sb_secret_...`). Server only: draft preview and the "helpful" route |
| `BLOG_REVALIDATE_SECRET` | yes | The shared secret above |
| `BLOG_PREVIEW_SECRET` | yes | The shared secret above |
| `BLOG_FEEDBACK_SECRET` | optional | Any random string. Salts the anonymous helpful vote. Falls back to the secret key |

With `SUPABASE_URL` or the publishable key missing, the blog shows its empty state; it never shows test posts in
production.

## Supabase dashboard (once)

- Authentication, Hooks, Before user created: `public.hook_before_user_created`.
- Authentication, Multi-factor: TOTP on.
- Authentication, Email templates: paste `supabase/templates/otp-code.html` into **Magic link** and **Confirm signup**,
  subject `Your Easner Website Admin sign-in code`.
- Authentication, Sign in / Providers, Email: OTP expiration `600`.
- Authentication, SMTP settings: custom SMTP on AWS SES, `email-smtp.eu-west-2.amazonaws.com`, port 587, sender
  `noreply@easner.com`. Without this only your own project-team address receives codes.
- Authentication, URL configuration: site URL `https://admin.easner.com`.

## Domains

- `admin.easner.com`: add as a domain on the admin Vercel project and create the DNS record Vercel shows.
- `www.easner.com`: already the website.
