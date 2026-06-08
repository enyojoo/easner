# Marketing Website Content

Last updated: June 8, 2026

Documentation for easner.com marketing copy. **The live website is the source of truth** — these markdown files mirror [`lib/marketing/content/`](../lib/marketing/content/), [`shared-content.ts`](../lib/marketing/shared-content.ts), and legal components under [`components/legal/`](../components/legal/).

---

## Route map

| Website route | Markdown file | Live source |
|---------------|---------------|-------------|
| `/` | [`home.md`](home.md) | [`lib/marketing/content/home.ts`](../lib/marketing/content/home.ts) |
| `/personal` | [`personal.md`](personal.md) | [`lib/marketing/content/personal.ts`](../lib/marketing/content/personal.ts) |
| `/business` | [`business.md`](business.md) | [`lib/marketing/content/business.ts`](../lib/marketing/content/business.ts) |
| `/stablecoin` | [`stablecoin.md`](stablecoin.md) | [`lib/marketing/content/stablecoin.ts`](../lib/marketing/content/stablecoin.ts) |
| `/invoicing` | [`invoicing.md`](invoicing.md) | [`lib/marketing/content/invoicing.ts`](../lib/marketing/content/invoicing.ts) |
| `/cards` | [`cards.md`](cards.md) | [`lib/marketing/content/cards.ts`](../lib/marketing/content/cards.ts) |
| `/apis` | [`apis.md`](apis.md) | [`lib/marketing/content/apis.ts`](../lib/marketing/content/apis.ts) |
| `/terms` | — | [`components/legal/terms-content.tsx`](../components/legal/terms-content.tsx) |
| `/privacy` | — | [`components/legal/privacy-content.tsx`](../components/legal/privacy-content.tsx) |
| `/compliance` | — | [`components/legal/compliance-content.tsx`](../components/legal/compliance-content.tsx) |

**Related routes:** Terminal and QR Pay are covered on `/stablecoin` and `/business`.

---

## Foundation files (read first)

| File | Purpose |
|------|---------|
| [`NAMING.md`](NAMING.md) | Product naming ladder — Easner Mobile, Personal/Business Banking |
| [`VOICE-AND-GUARDRAILS.md`](VOICE-AND-GUARDRAILS.md) | Legal-aligned vocabulary — review before any copy change |
| [`MESSAGING-HIERARCHY.md`](MESSAGING-HIERARCHY.md) | One-liner, pillars, audiences, CTAs, SEO (mirrors live site) |
| [`VISUAL-SPEC.md`](VISUAL-SPEC.md) | Layouts, asset IDs, shot list for design |
| [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md) | Footer, compliance strip, tier ladders, reusable blocks |

---

## Sync workflow

1. Change copy in the live source (`lib/marketing/content/*.ts`, `shared-content.ts`, or legal components).
2. Update the matching markdown file in this folder to document what shipped.
3. Pull footer and compliance strip wording from live constants — do not paraphrase.
4. Run QA checklist below before publish.

### Placeholders in website code

| Placeholder | Value |
|-------------|-------|
| `{APP_STORE_URL}` | iOS App Store link (`lib/marketing/constants.ts`) |
| `{PLAY_STORE_URL}` | Google Play link |
| `{BUSINESS_SIGNUP_URL}` | Business signup URL |

---

## Asset checklist (design)

Full manifest in [`VISUAL-SPEC.md`](VISUAL-SPEC.md). Upload to Supabase `brand/marketing/`.

**Priority for launch (minimum viable visuals):**

- [ ] `mkt-hero-home-01`
- [ ] `mkt-hero-personal-01` + `mkt-ui-personal-receive`
- [ ] `mkt-hero-business-01` + `mkt-ui-business-dashboard`
- [ ] `mkt-hero-stablecoin-01` + `mkt-ui-stablecoin-receive`
- [ ] `mkt-icon-pillar-*` (×4) or interim icons
- [ ] `mkt-map-corridors`

---

## QA checklist (before publish)

### Voice and legal

- [ ] No banned words: instant, zero fee, free transfers, AI AML, HSM custody, GDPR residency (see [`VOICE-AND-GUARDRAILS.md`](VOICE-AND-GUARDRAILS.md))
- [ ] Qualifiers on cost (~60%), stablecoin, cards, corridors
- [ ] Product names match [`NAMING.md`](NAMING.md) in legal/footer contexts
- [ ] Regulatory footer matches [`REGULATORY_FOOTER_PARAGRAPHS`](../lib/marketing/shared-content.ts)
- [ ] Links to `/terms`, `/privacy`, `/compliance`

### CTAs (segmented)

- [ ] Personal → App Store / Google Play
- [ ] Business → external signup URL
- [ ] APIs → `/contact`
- [ ] No ~$980K volume metric on homepage

### Visuals

- [ ] Personal pages use phone mockups only (Easner Mobile)
- [ ] Business pages use browser/dashboard mockups only (Easner Business)
- [ ] No crypto coin imagery

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-06 | Initial marketing content pack |
| 2026-06-07 | Expanded `apis.md` |
| 2026-06-08 | Added [`NAMING.md`](NAMING.md); legal naming pass; reverse-sync docs from live website |

---

## Out of scope (this folder)

- Photography and asset production (spec in VISUAL-SPEC only)
- Mobile Legal screen link updates (optional app follow-up)
