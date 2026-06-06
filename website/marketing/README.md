# Marketing Website Content

Last updated: June 6, 2026

Source of truth for easner.com marketing copy. Same workflow as [`docs/legal/`](../legal/): draft here, paste into the website repo, keep in sync.

---

## Route map

| Website route | Markdown file | Website component (suggested) |
|---------------|---------------|-------------------------------|
| `/` | [`home.md`](home.md) | `app/page.tsx` → Hero, WhyEasner, ProductGrid, Solutions, Corridors, Compliance |
| `/personal` | [`personal.md`](personal.md) | `app/personal/page.tsx` |
| `/business` | [`business.md`](business.md) | `app/business/page.tsx` |
| `/stablecoin` | [`stablecoin.md`](stablecoin.md) | `app/stablecoin/page.tsx` |
| `/invoicing` | [`invoicing.md`](invoicing.md) | `app/invoicing/page.tsx` |
| `/cards` | [`cards.md`](cards.md) | `app/cards/page.tsx` |
| `/apis` | [`apis.md`](apis.md) | `app/apis/page.tsx` |

**Related routes (optional):** `/terminal`, `/qr-pay` — sections inside `/stablecoin` per [`stablecoin.md`](stablecoin.md).

---

## Foundation files (read first)

| File | Purpose |
|------|---------|
| [`VOICE-AND-GUARDRAILS.md`](VOICE-AND-GUARDRAILS.md) | Legal-aligned vocabulary — review before any copy change |
| [`MESSAGING-HIERARCHY.md`](MESSAGING-HIERARCHY.md) | One-liner, pillars, audiences, CTAs, SEO |
| [`VISUAL-SPEC.md`](VISUAL-SPEC.md) | Layouts, asset IDs, shot list for design |
| [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md) | Footer, compliance strip, tier ladders, reusable blocks |

---

## Paste workflow

1. Open the page markdown file for the route.
2. Each `## Section` maps to one React section component.
3. Copy headline, subhead, body, bullets into JSX.
4. Copy **Layout** and **Visual slot** into component comments for design/engineering.
5. Pull footer and compliance strip from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md) — do not paraphrase.
6. Run QA checklist below before publish.

### Placeholders to replace in website

| Placeholder | Value |
|-------------|-------|
| `{APP_STORE_URL}` | iOS App Store link |
| `{PLAY_STORE_URL}` | Google Play link |

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
- [ ] Refresh mobile framing for Personal (replace `ew1.png` misuse on homepage)

---

## QA checklist (before publish)

### Voice and legal

- [ ] No banned words: instant, zero fee, free transfers, AI AML, HSM custody, GDPR residency (see [`VOICE-AND-GUARDRAILS.md`](VOICE-AND-GUARDRAILS.md))
- [ ] Qualifiers on cost (~60%), stablecoin, cards, corridors
- [ ] Personal = mobile; Business = web dashboard
- [ ] Regulatory footer matches [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md)
- [ ] Links to `/terms`, `/privacy`, `/compliance`
- [ ] Cross-check against [`docs/legal/`](../legal/)

### CTAs (segmented)

- [ ] Personal → App Store / Google Play
- [ ] Business → `/access`
- [ ] APIs → `hello@easner.com`
- [ ] No ~$980K volume metric on homepage

### Visuals

- [ ] Personal pages use phone mockups only
- [ ] Business pages use browser/dashboard mockups only
- [ ] No crypto coin imagery
- [ ] Cards page has "when available" badge

---

## Homepage migration notes

Replace in website `HomePage` component:

| Remove | Replace with |
|--------|--------------|
| "Move Money Globally Like SMS" | See [`home.md`](home.md) Section 1 H1 |
| "API-first … US and EU businesses" only | Full subhead in home.md |
| Individuals section `ew1.png` (web) | Mobile iPhone mockup per [`VISUAL-SPEC.md`](VISUAL-SPEC.md) |
| Compliance: AI AML, HSM, GDPR bullets | [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md) compliance strip |
| 4 sections only | 7 sections per home.md |

Add components: `WhyEasner`, `ProductGrid`, `SolutionsByAudience`, `CorridorStory`.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-06 | Initial marketing content pack — 12 files, aligned with legal docs and product tier ladder |

---

## Out of scope (this folder)

- easner.com Next.js implementation
- Photography and asset production (spec in VISUAL-SPEC only)
- Mobile Legal screen link updates (optional app follow-up)
