# Smart app download links

Onelink-style routing for Easner Banking installs.

## Public URLs

| URL | Role |
|-----|------|
| `https://link.easner.com/app` | Canonical short link (QR, SMS, social) |
| `https://www.easner.com/download` | Desktop landing (QR + email form) |
| `https://api.easner.com/api/marketing/app-download-link` | Send download-link email (`appDownloadLink` template) |

## Routing

| Entry | Device | Result |
|-------|--------|--------|
| `link.easner.com` | Any | 302 → `https://www.easner.com` |
| `/app` (any host, incl. `link.easner.com`) | iOS | 302 → App Store |
| `/app` | Android | 302 → APK (or Play Store when env set) |
| `/app` | Desktop | 302 → `www.easner.com/download` |
| `/download` | Mobile | 302 → App Store / APK |
| `/download?platform=ios\|android` | Any | 302 → store/APK (email fallbacks) |

Routing lives in [`middleware.ts`](middleware.ts) plus a fallback [`app/app/route.ts`](app/app/route.ts). **`/app` smart redirects on any host** (no `Host` header required). Only **`/`** and **`/app`** are public on `link.easner.com`; other paths on that host → `www.easner.com`.

## Infrastructure

Traffic path: **Azure DNS → Azure Front Door → Vercel** (same origin as `www.easner.com`).

### 1. Azure DNS

Add a record for the short-link subdomain (point at your Front Door endpoint):

| Name | Type | Value |
|------|------|--------|
| `link` | CNAME | `<your-frontdoor-endpoint>.azurefd.net` |

(Use the same Front Door profile / endpoint that serves `www.easner.com`, unless you use a dedicated endpoint.)

### 2. Azure Front Door

Add **`link.easner.com`** as a custom domain on the Front Door profile that fronts the marketing site.

**Route rule (important):**

- **Do not** 301/302 `link.easner.com` → `www.easner.com`. The app relies on `Host: link.easner.com` for `/app` smart redirects.
- Forward **`/`** and **`/app`** (and any path under this host) to the **same Vercel origin** as `www.easner.com`.
- Preserve the original `Host` header (`link.easner.com`) when forwarding to Vercel, or configure Vercel to accept the domain (see below).

Suggested rule shape (names vary in portal):

| Setting | Value |
|---------|--------|
| Domain | `link.easner.com` |
| Patterns | `/*` |
| Origin group | Same as `www.easner.com` (Vercel) |
| Redirect to www | **Off** for this domain |

**Contrast with apex `easner.com`:** apex may redirect to `www` at the edge; `link.easner.com` must **not** follow that pattern. See [`UNIVERSAL-LINKS.md`](UNIVERSAL-LINKS.md) for AFD notes on `/.well-known/*` (legacy only).

### 3. Vercel (website project)

1. Add domain **`link.easner.com`** to the website project (Project → Settings → Domains).
2. Set env vars from [`.env.example`](.env.example):

```env
EASNER_APP_STORE_URL=https://apps.apple.com/us/app/easner/id6762069433
NEXT_PUBLIC_APP_LINK_URL=https://link.easner.com/app
NEXT_PUBLIC_APP_DOWNLOAD_API_URL=https://api.easner.com/api/marketing/app-download-link
# EASNER_PLAY_STORE_URL=   # when Play Store is live
# NEXT_PUBLIC_ANDROID_APK_URL=
```

### 4. easnerbanking (api.easner.com)

Set so the **email template** buttons resolve correctly:

```env
EASNER_APP_STORE_URL=https://apps.apple.com/us/app/easner/id6762069433
EASNER_PLAY_STORE_URL=https://github.com/enyojoo/easner/releases/latest/download/Easner-Beta.apk
EASNER_DOWNLOAD_PAGE_URL=https://link.easner.com/app
```

When Play Store launches, replace `EASNER_PLAY_STORE_URL` with the Play Store URL (no code change).

### Verify after DNS + AFD propagate

Requires **deploying** the latest website code (middleware + `/app` route handler).

```bash
# Short-link host root → www
curl -sI "https://link.easner.com/" | grep -i location

# Short link → store (mobile UA)
curl -sI -A "iPhone" "https://link.easner.com/app" | grep -i location

# Desktop short link → /download
curl -sI -A "Mozilla/5.0 (Macintosh)" "https://link.easner.com/app" | grep -i location

# Email fallback
curl -sI "https://www.easner.com/download?platform=ios" | grep -i location
```

### Troubleshooting `link.easner.com/app` returns 404

1. **Deploy** — push/build the website so [`middleware.ts`](middleware.ts) and [`app/app/route.ts`](app/app/route.ts) are live.
2. **Vercel domain** — Project → Settings → Domains → add `link.easner.com` (DNS is already CNAME to Front Door; Vercel must accept the host).
3. **Azure Front Door** — Route `link.easner.com/*` to the same Vercel origin as `www`. If `/app` 302s to `www.easner.com/` instead of a store, redeploy the latest website code (older builds sent non-link `/app` to home).
4. **Do not** redirect `link.easner.com` → `www` at the AFD layer (only the app redirects `/` → www in code).
5. After deploy, purge AFD/Vercel cache if you still see a stale 404.

### Preview email (easnerbanking repo)

```bash
npx tsx packages/server/scripts/send-all-email-previews.ts --template appDownloadLink --to you@example.com
```

## Website UI

- **Download the App** button (heroes, open-account dialog) → mobile redirects via short link; desktop opens QR + email dialog
- Email form POSTs directly to `api.easner.com` (CORS already allows www / apex)
- No SES or email HTML in this repo

## Local testing

```bash
# Accept link.localhost as short-link host
NEXT_PUBLIC_APP_LINK_HOST=link.localhost npm run dev --workspace=website

# Force platform without a mobile UA
open "http://localhost:3000/download?platform=ios"
```
