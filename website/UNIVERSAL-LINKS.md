# Universal Links & App Links

> **Moved to `app.easner.com`** – consumer app web + mobile deep links now live on the app subdomain, not marketing `easner.com`. See `easnerbanking/docs/mobile/APP-EASNER-COM.md`.

## Legacy `easner.com` routes in this repo

This marketing site still serves `/.well-known/*` on **easner.com** apex for backward compatibility until all installs use `app.easner.com`. New builds register `applinks:app.easner.com` only.

## Endpoints (legacy apex – optional sunset)

| URL | Purpose |
|-----|---------|
| `/.well-known/apple-app-site-association` | Apple Universal Links (legacy apex) |
| `/apple-app-site-association` | Apple legacy path (same JSON) |
| `/.well-known/assetlinks.json` | Android App Links (legacy apex) |

## Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Example | Source |
|----------|---------|--------|
| `APPLE_TEAM_ID` | `AB12CD34EF` | [Apple Developer](https://developer.apple.com/account) → Membership → **Team ID** (10 characters) |
| `ANDROID_SHA256_CERT_FINGERPRINTS` | `AA:BB:...` | Google Play Console → App signing, or `eas credentials -p android` (comma-separated for multiple) |

## Apex domain (`easner.com` vs `www.easner.com`)

If you keep legacy apex AASA, Azure Front Door must forward `/.well-known/*` on `easner.com` **without** redirecting to `www` first. See prior AFD rule notes below.

### Azure Front Door (where the redirect actually happens)

`easner.com` is fronted by **Azure Front Door**. Apex requests (including `/.well-known/*`) may be 301-redirected to `www` at the edge before they reach Vercel.

**Required AFD change (legacy only):** higher-priority rule so these paths on `easner.com` are **forwarded to the Vercel origin without a redirect**:

| Path |
|------|
| `/.well-known/apple-app-site-association` |
| `/.well-known/assetlinks.json` |
| `/apple-app-site-association` |

## Primary verification host: `app.easner.com`

Deploy the Expo web project (`easnerbanking/mobile`) to Vercel with domain `app.easner.com`. That deployment serves:

- Expo web (`expo export --platform web`)
- `/.well-known/apple-app-site-association`
- `/.well-known/assetlinks.json`

```bash
curl -sS -D - "https://app.easner.com/.well-known/apple-app-site-association" | head -20
curl -sS "https://app.easner.com/.well-known/assetlinks.json" | jq .
```

Apple validator: https://search.developer.apple.com/appsearch-validation-tool/ – domain `app.easner.com`, app ID `com.easner.mobile`.
