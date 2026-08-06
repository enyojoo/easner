# Easner Mobile – App Store marketing

Source of truth: [`lib/marketing/content/app-store.ts`](lib/marketing/content/app-store.ts)  
Website alignment: [`/personal`](https://www.easner.com/personal)

Update App Store Connect and Google Play Console from the fields below. Character limits are platform constraints.

## App Store Connect (iOS)

| Field | Limit | Copy |
|-------|-------|------|
| **Subtitle** | 30 | Bank globally with Ease |
| **Promotional text** | 170 | Send, receive, and manage money in global and local currencies. Bank transfers and stablecoin – bank globally with Ease. |
| **Keywords** | 100 | `mobile banking,money transfer,multi-currency,stablecoin,cross-border,freelancer,diaspora,remittance` |
| **Description** | 4000 | See [Full description](#full-description) |

## Google Play Console (Android)

| Field | Limit | Copy |
|-------|-------|------|
| **Short description** | 80 | Bank globally – send, receive, and manage money in global and local currencies. |
| **Full description** | 4000 | See [Full description](#full-description) |

## Full description

```
Easner is mobile banking for global money – send, receive, and manage funds in global and local currencies. Bank transfers and stablecoin, built so you can bank globally with Ease.

BANK GLOBALLY WITH EASE: Manage multi-currency balances, send to saved recipients, receive by account details or stablecoin deposit address, and track every transaction in one place.

SEND MONEY YOUR WAY: Send by bank transfer, stablecoin, open banking, or mobile money. See fees, FX, and delivery estimates before you confirm.

RECEIVE MONEY: Get paid using account details or a stablecoin deposit address – choose Bank or Stablecoin on the Receive tab. No external crypto wallet setup required.

CARDS: Spend from your Easner balances with personal cards – controls and activity, right in the app.

RECIPIENTS & EASETAG: Save recipients, send by EASETAG (@handle), and move money between people you trust.

SECURITY YOU CAN USE: Multi-factor authentication, PIN, and biometric unlock on supported devices.

WHO IT'S FOR: Individuals 18 or older – freelancers, remote workers, diaspora, students, and families managing cross-border money.

IMPORTANT: Easner Group, Inc. is a financial technology company, not a bank. Banking and related services are provided by regulated partners. Easner is not FDIC-insured and does not hold customer deposits. Stablecoin and wallet features may operate on public blockchains. Digital assets are not legal tender and are not FDIC-insured or SIPC-protected. Blockchain transactions may be public and irreversible. Card products, when available, are subject to issuer approval. Fees and FX may apply. Processing times vary by corridor and review. Some features depend on verification status, jurisdiction, and product availability.

Legals: easner.com/terms · easner.com/privacy · easner.com/compliance
Questions? easner.com/contact or support@easner.com
```

## Keywords notes

- Paste with **no spaces after commas** – each space counts toward the 100-character limit.
- Skip words already in the app name or subtitle (`bank`, `global`, `ease`) – Apple indexes those separately.
- Skip low-value terms like `app` or single tickers (`USD`) unless you need corridor-specific discovery.
- `remittance` and `diaspora` are supporting search terms; lead positioning stays global/cross-border in subtitle and description.

## Notes

- Lead with **global / cross-border** positioning; diaspora is a use case, not the primary identity.
- Keep en-dashes (`–`) in customer-facing copy; avoid em-dashes (`—`).
- When Play Store is live, set `EASNER_PLAY_STORE_URL` per [`DOWNLOAD.md`](DOWNLOAD.md).
