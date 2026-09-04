# Smart app download links

One URL for app installs: **`https://www.easner.com/app`**

## Public URLs

| URL | Role |
|-----|------|
| `https://www.easner.com/app` | Canonical link — mobile → store; desktop → download landing |
| `https://easner.com/app` | Apex alias → `www.easner.com/app` |
| `https://api.easner.com/api/marketing/app-download-link` | Send download-link email (`appDownloadLink` template) |

## Routing

| Entry | Device | Result |
|-------|--------|--------|
| `/app` | iOS | 302 → App Store |
| `/app` | Android | 302 → Play Store |
| `/app` | Desktop | Download page (QR + email form) |
| `/app` | Link-preview bots | 200 HTML + Open Graph |
| `/app?platform=ios\|android` | Any | 302 → App Store / Play Store (email fallbacks) |

Routing lives in [`proxy.ts`](proxy.ts) and [`app/(marketing)/app/page.tsx`](app/(marketing)/app/page.tsx).

## Vercel (website project)

```env
EASNER_APP_STORE_URL=https://apps.apple.com/us/app/easner/id6762069433
EASNER_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.easner.android
NEXT_PUBLIC_APP_LINK_URL=https://www.easner.com/app
NEXT_PUBLIC_APP_DOWNLOAD_API_URL=https://api.easner.com/api/marketing/app-download-link
```

## easnerbanking (api.easner.com)

```env
EASNER_APP_STORE_URL=https://apps.apple.com/us/app/easner/id6762069433
EASNER_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.easner.android
EASNER_DOWNLOAD_PAGE_URL=https://www.easner.com/app
```

Email fallback buttons can use `https://www.easner.com/app?platform=ios` or `?platform=android`.

## Azure

Marketing site: **Azure DNS → Azure Front Door → Vercel** (`www.easner.com`, `easner.com`).

Remove `link.easner.com` completely (DNS, Front Door, Vercel domains).

## Verify after deploy

```bash
curl -sI -A "iPhone" "https://www.easner.com/app" | grep -i location
curl -sI -A "Mozilla/5.0 (Macintosh)" "https://www.easner.com/app" | grep -iE '^(HTTP|content-type)'
curl -s -A "facebookexternalhit/1.1" "https://www.easner.com/app" | grep -i 'og:title'
```

## Local testing

```bash
npm run dev --workspace=website
open "http://localhost:3000/app"
open "http://localhost:3000/app?platform=ios"
```
