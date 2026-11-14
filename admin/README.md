# Easner admin (admin.easner.com)

The website admin: blog posts, categories, authors, media, redirects, analytics and the team. Plan:
[`docs/blog-and-admin-plan.md`](../docs/blog-and-admin-plan.md). Phase 1 (this app's foundation) is done: sign-in, roles,
the Office shell, Posts, Categories and Settings → Team. The editor, the public blog and analytics come in later phases.

It looks and behaves like Office (`design-system/guides/25-office.md`) but is its own app with its own Supabase project
(`easner-website`), never the banking database.

## Where the UI comes from

The UI layer is copied from Easner Office, not imported:

| Source in `easnerbanking/office` | Here | Changes |
| --- | --- | --- |
| `components/ui/*` | `components/ui/*` | `amount`, `limit-meter`, `calendar` left out (no money, no date pickers yet). `status-badge` reads the admin's own status table (`lib/status.ts`). `copy-field` toasts directly. `input` uses `color-mix` instead of `hsl(var())`. |
| `components/layout/office-dashboard-layout.tsx` | `components/layout/admin-shell.tsx` | Flat nav (no groups), "New post" in the header, no approvals indicator, no activity dot. |
| `components/layout/office-shell-gate.tsx` | `components/layout/admin-shell-gate.tsx` | Gates on `access === "ready"` (member + MFA). |
| `components/layout/jump-to.tsx` | `components/layout/jump-to.tsx` | Pages, posts and categories from the cached lists. `g` then `o`/`p`/`c`/`s`. |
| `components/layout/desktop-min-viewport-gate.tsx` | same | Admin copy, one product. |
| `components/office-skeletons.tsx` | `components/admin-skeletons.tsx` | Posts and simple-table skeletons. |
| `components/providers.tsx`, `lib/query/*` | `components/providers.tsx`, `lib/query/*` | Same persisted TanStack Query cache (per-user key, `meta.webPersist: "reduced"`, 12h, cleared on sign-out). No realtime bridge or image warm-up. |
| `lib/auth-context.tsx` | `lib/auth-context.tsx` | Same shape and fast boot; access comes from `admin_members` + aal2 instead of `admin_users` + server elevation. |
| `components/auth/auth-card.tsx`, `otp-input.tsx` | same | Unchanged. |
| `app/globals.css` (base layer) | `app/globals.css` | Colours from the design system's `tokens.css` (below), not Office's HSL triplets. |

**Copied from easnerbanking commit `83e2e78ec45a9c55ee7109fa63fa60572a8ea47e`** (2026-11-14; last change to
`office/components` at `c0ef7973a`). When Office's UI changes, follow the design-system specs (both apps implement them)
and bring the change across by hand; update this commit when you do.

## Design tokens

`app/design-tokens.css` is generated from `easnerbanking/design-system/components/tokens.css`, the same way the website
does it:

```bash
npm run sync:tokens -w admin
```

It looks for the design system at `../../easnerbanking/design-system` from `admin/`. From a worktree, point at it:
`EASNER_DS_PATH=/path/to/easnerbanking/design-system npm run sync:tokens -w admin`.

Tokens only: no hex, no `gray-*`, no `font-bold` (ESLint enforces all three in `app/`, `components/` and `lib/`).

## Sign-in and roles

1. Email → 6-digit code (Supabase email OTP; no passwords, no links).
2. `accept_admin_invite()` turns a pending invite for that email into an `admin_members` row; anyone else sees **No
   access**. A Supabase Auth hook (`hook_before_user_created`) refuses to create users for emails with no invite.
3. MFA is required: first sign-in sets up an authenticator app (TOTP, QR code), every sign-in after asks for its code.
   The database grants nothing below `aal2`, so a half-signed-in session can't read or write anything.

Roles: **Owner** (team, settings), **Editor** (publish, categories, authors, media, redirects), **Writer** (own drafts,
submit for review). `useAuth().role` and `permissionsFor(role)` drive the UI; RLS enforces the same rules
(`supabase/migrations`, tested by `supabase/tests/rls.test.sql`).

Passkeys: Supabase's WebAuthn MFA is still behind a config flag (`[auth.mfa.web_authn]`), so the admin uses TOTP for now.

## Run it locally

Needs Docker for the local Supabase stack.

```bash
supabase start                      # from the repo root; applies supabase/migrations and seed.sql
cp admin/.env.example admin/.env.local   # paste the API URL and publishable (anon) key that `supabase start` prints
npm run dev:admin                   # http://localhost:3010
```

Sign in as `owner@easner.test` (seeded invite). The code arrives in Mailpit at http://127.0.0.1:54324. Scan the QR
code with any authenticator app.

Without Docker you can still check the schema and RLS: `npm run test:db` (PGlite with Supabase stubs).

## Bootstrapping production

On the hosted `easner-website` project, after `supabase db push`, invite the first owner once in the SQL editor:

```sql
insert into public.admin_invites (email, role, name) values ('someone@easner.com', 'owner', 'Their name');
```

Then enable the auth hook (Authentication → Hooks → Before user created → `public.hook_before_user_created`), TOTP MFA,
and the email OTP templates from `supabase/templates/`.

## Robots

Every response sends `X-Robots-Tag: noindex, nofollow, noarchive` (`next.config.mjs`) and `robots.txt` disallows
everything (`app/robots.ts`). Below 1024px the `DesktopMinViewportGate` replaces the app, as in Office.
