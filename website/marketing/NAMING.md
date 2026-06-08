# Product Naming

Last updated: June 8, 2026

Source of truth for Easner product names in marketing, legal, and App Store copy. When docs conflict, this file wins until legal counsel updates contracts.

---

## Naming ladder

| Layer | Consumer | Business |
|-------|----------|----------|
| **Company / brand** | Easner | Easner |
| **Product (marketing)** | **Easner Personal Banking** | **Easner Business Banking** |
| **Surface (app / dashboard)** | **Easner Mobile** | **Easner Business** |
| **App Store / home screen** | **Easner** | — (web) |
| **P2P handle** | **EASETAG** (@handle) | — |

**Relationships:**

- **Easner Personal Banking** is delivered through **Easner Mobile** (iOS and Android).
- **Easner Business Banking** is delivered through **Easner Business** (web dashboard).

---

## Do not use

| Retired | Use instead |
|---------|-------------|
| **Easner Personal** | Easner Personal Banking or Easner Mobile (by context) |
| **Easner tag** | **EASETAG** |

---

## When to use which name

| Context | Consumer | Business |
|---------|----------|----------|
| Website hero, `/personal`, `/business` | Easner Personal Banking | Easner Business Banking |
| App Store listing, app icon | Easner | — |
| “Download the app”, auth errors, engineering | Easner Mobile | — |
| “Sign in on the web”, dashboard UI | — | Easner Business |
| Legal definitions (Terms, Privacy, KYC) | Easner Mobile (Easner Personal Banking) | Easner Business (Easner Business Banking) |
| Invoice emails, web `<title>` | — | Easner Business Banking (matches live product) |

---

## Other product names (unchanged)

| Name | Surface |
|------|---------|
| **Terminal** | Business collections (in-person) |
| **QR Pay** | Business collections (scan-to-pay) |
| **Easner APIs** | Developer platform |
| **Easner Office** | Internal admin |

---

## Cross-references

- Voice and banned terms: [`VOICE-AND-GUARDRAILS.md`](VOICE-AND-GUARDRAILS.md)
- Legal pages (React): [`components/legal/`](../components/legal/)
- Live marketing copy: [`lib/marketing/content/`](../lib/marketing/content/)

---

## Live site notes

- **Legal and footer** use the full naming ladder (Easner Mobile / Easner Personal Banking, etc.).
- **Marketing page copy** in `lib/marketing/content/*.ts` may use shorthand in feature prose (e.g. "Easner Personal" in meta description on `/personal`) where not yet updated — legal/footer/mock chrome follow [`NAMING.md`](NAMING.md).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-08 | Initial naming ladder — retire Easner Personal; EASETAG standard |
| 2026-06-08 | Legal/footer alignment; doc paths point to live React legal components |
