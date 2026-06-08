# Universal Links & App Links (easner.com)

Serves Apple Universal Links and Android App Links for **Easner Mobile** (`com.easner.mobile`).

## Endpoints

| URL | Purpose |
|-----|---------|
| `/.well-known/apple-app-site-association` | Apple Universal Links (primary) |
| `/apple-app-site-association` | Apple legacy path (same JSON) |
| `/.well-known/assetlinks.json` | Android App Links |

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Example | Source |
|----------|---------|--------|
| `APPLE_TEAM_ID` | `AB12CD34EF` | [Apple Developer](https://developer.apple.com/account) → Membership → **Team ID** (10 characters) |
| `ANDROID_SHA256_CERT_FINGERPRINTS` | `AA:BB:...` | Google Play Console → App signing, or `eas credentials -p android` (comma-separated for multiple) |

After changing `APPLE_TEAM_ID`, redeploy the website. No code change is required.

## Apex domain (`easner.com` vs `www.easner.com`)

The mobile app entitlement is `applinks:easner.com` (apex, not `www`). Apple fetches AASA from:

`https://easner.com/.well-known/apple-app-site-association`

That URL must return **HTTP 200** and valid JSON on the **apex host** — not a 301 to `www.easner.com`.

### Azure Front Door (where the redirect actually happens)

`easner.com` is fronted by **Azure Front Door**, not Vercel domain settings. Today, apex requests (including `/.well-known/*`) are 301-redirected to `www` at the edge (`x-azure-ref` in response headers) before they reach the Next.js app.

**Required AFD change:** add a **higher-priority** rule (or dedicated route) so these paths on `easner.com` are **forwarded to the Vercel origin without a redirect**:

| Path |
|------|
| `/.well-known/apple-app-site-association` |
| `/.well-known/assetlinks.json` |
| `/apple-app-site-association` |

Keep the existing apex → `www` redirect for all other paths (marketing pages).

Example rule-set layout (order matters — well-known rules first):

1. **Route / rule (priority 1)** — host `easner.com`, path matches the three URLs above → forward to website origin (Vercel), preserve host `easner.com`.
2. **Route / rule (priority 2)** — host `easner.com`, path `/*` → 301 redirect to `https://www.easner.com{path}`.

In the Azure portal: Front Door profile → **Rule sets** (or per-route rules) → match on **Request URI** path + **Host** header → action **Route configuration** (not URL redirect) for the well-known paths.

The Next.js routes in this repo serve the JSON once the request reaches Vercel. AFD must not strip or rewrite those paths.

### What this repo does *not* control

Vercel `vercel.json` cannot fix apex Universal Links if Azure Front Door redirects first. No Vercel Domains redirect setting is involved — configure the exception in **Azure Front Door**.

## Verify after deploy + AFD rule

```bash
# Must be 200 on easner.com — no Location: www.easner.com
curl -sS -D - "https://easner.com/.well-known/apple-app-site-association" | head -20
curl -sS "https://easner.com/.well-known/apple-app-site-association" | jq .
curl -sS -o /dev/null -w "%{http_code}\n" "https://easner.com/apple-app-site-association"

# Marketing redirect should still work
curl -sS -I "https://easner.com/" | grep -i '^location:'
```

Apple validator: https://search.developer.apple.com/appsearch-validation-tool/ — domain `easner.com`, app ID `com.easner.mobile`.
