# Visual Specification

Last updated: June 6, 2026

Art direction, layout patterns, and asset manifest for easner.com marketing pages. Aligns with [`docs/design-system.md`](../design-system.md): premium private banking, calm, global — not crypto-bro, not neon SaaS.

---

## Art direction

**Feel:** Trustworthy, human, executive — serious money movement with warmth.

**Palette:** Easner primary blue, ivory/white canvas (Business web), cool-gray + white cards (Personal mobile). See design-system §2.0.

**Typography:** `font-unbounded` for headlines (website); body in accessible sans-serif.

**Photography:**
- Real environments: home office, café, airport lounge, small business shop, co-working
- Diverse subjects matching diaspora, freelancer, SME, developer audiences
- Natural light; avoid over-saturated stock

**Avoid:**
- Crypto coins, blockchain node visuals, price charts to the moon
- Hoodie hackers, neon gradients, meme aesthetic
- Generic "hands holding phone" without context
- Issuer branding on card imagery

**Product truth:**
- **Easner Personal** → iPhone mockups only
- **Easner Business** → browser/dashboard mockups only
- Never show web app for Personal or phone-only for Business dashboard heroes

---

## Layout patterns

| Layout ID | Description | Typical use |
|-----------|-------------|-------------|
| `center_hero` | Centered headline, subhead, CTAs; visual below | Homepage hero |
| `device_float` | Lifestyle background + floating phone/browser overlay | Homepage hero composite |
| `split_50_50` | Copy and image 50/50; alternate L/R per section | Product page features |
| `split_40_60` | Narrow copy, wide product screenshot | Feature deep-dives |
| `three_col_cards` | Three equal cards | Pillars, products, API models |
| `tab_audience` | Tabbed or stacked persona blocks | Solutions by audience |
| `compliance_split` | Copy left, shield/icon right | Compliance section |
| `cta_band` | Full-width CTA strip before footer | Final conversion |

**Mobile:** All splits stack vertically — copy first, visual below, unless visual is decorative background.

---

## Asset categories

| Type | ID prefix | Format | Dimensions |
|------|-----------|--------|------------|
| Lifestyle hero | `mkt-hero-*` | WebP/PNG | 2400×1350 (16:9) or 1800×1200 (3:2) |
| Persona thumbnail | `mkt-persona-*` | WebP/PNG | 800×800 square crop |
| Mobile UI | `mkt-ui-personal-*` | PNG | 1170×2532 in iPhone 15 frame |
| Web UI | `mkt-ui-business-*` | PNG | 1440×900 in browser chrome |
| Feature crop | `mkt-ui-{feature}-*` | PNG | 1200×800 |
| Product thumb | `mkt-thumb-*` | PNG/SVG | 400×300 |
| Icon illustration | `mkt-icon-*` | SVG | 96×96 |
| Corridor map | `mkt-map-corridors` | SVG/PNG | 1200×600 |
| Trust logos | `mkt-trust-logos` | SVG | height 32px |

**Storage:** `https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/marketing/{filename}`

**Naming:** `mkt-{page}-{section}-{variant}.{ext}`

**Existing assets (interim):**
- `brand/ew1.png` — replace with mobile-framed personal UI
- `brand/eb1.png` — refresh as `mkt-ui-business-dashboard`
- `brand/security.svg` — compliance section until `mkt-icon-compliance` exists

---

## Homepage wireframe

```
┌─────────────────────────────────────────────────────────┐
│  [PublicHeader]                                         │
├─────────────────────────────────────────────────────────┤
│              H1 + subhead + CTAs (center_hero)          │
│         ┌─────────────────────────────────┐             │
│         │  mkt-hero-home-01 (device_float)│             │
│         │  lifestyle + phone + dashboard  │             │
│         └─────────────────────────────────┘             │
├─────────────────────────────────────────────────────────┤
│  [TrustedBy logo strip]                                 │
├─────────────────────────────────────────────────────────┤
│  Why Easner — 4 cards (three_col_cards → 2×2 mobile)  │
├─────────────────────────────────────────────────────────┤
│  Products — Personal | Business | APIs (three_col_cards)│
├─────────────────────────────────────────────────────────┤
│  Solutions — 3 tabs (tab_audience + persona photos)     │
├─────────────────────────────────────────────────────────┤
│  Corridors — copy | mkt-map-corridors (split_50_50)     │
├─────────────────────────────────────────────────────────┤
│  Compliance — copy | icon (compliance_split)            │
├─────────────────────────────────────────────────────────┤
│  [PublicFooter + regulatory disclaimer]                 │
└─────────────────────────────────────────────────────────┘
```

---

## Per-page visual summary

| Page | Hero asset | Feature assets |
|------|------------|----------------|
| `home.md` | `mkt-hero-home-01` | `mkt-icon-pillar-*` (×4), `mkt-thumb-*` (×3), `mkt-persona-*` (×3), `mkt-map-corridors` |
| `personal.md` | `mkt-hero-personal-01` | `mkt-ui-personal-send`, `mkt-ui-personal-receive`, `mkt-ui-personal-recipients` |
| `business.md` | `mkt-hero-business-01` | `mkt-ui-business-dashboard`, `mkt-ui-business-send`, `mkt-ui-business-accounts` |
| `stablecoin.md` | `mkt-hero-stablecoin-01` | `mkt-ui-stablecoin-receive`, `mkt-ui-terminal`, `mkt-ui-qrpay`, `mkt-diagram-invisible-rails` |
| `invoicing.md` | `mkt-hero-invoicing-01` | `mkt-ui-invoice-editor`, `mkt-ui-invoice-payin` |
| `cards.md` | `mkt-hero-cards-01` | `mkt-ui-cards-controls` (future mock) |
| `apis.md` | `mkt-hero-apis-01` | `mkt-icon-api-banking`, `mkt-icon-api-agency`, `mkt-icon-api-integration` |

---

## Full asset manifest

| Asset ID | Page | Section | Status | Notes |
|----------|------|---------|--------|-------|
| `mkt-hero-home-01` | home | hero | **Needed** | Founder/SME + floating phone + dashboard |
| `mkt-icon-pillar-ux` | home | why | **Needed** | Banking-simple icon |
| `mkt-icon-pillar-cost` | home | why | **Needed** | Cost efficiency icon |
| `mkt-icon-pillar-compliance` | home | why | **Needed** | Compliance icon |
| `mkt-icon-pillar-invisible` | home | why | **Needed** | Invisible infra icon |
| `mkt-thumb-personal` | home | products | **Needed** | Phone mini UI |
| `mkt-thumb-business` | home | products | **Needed** | Dashboard mini UI |
| `mkt-thumb-apis` | home | products | **Needed** | Code/API mini visual |
| `mkt-persona-diaspora` | home | solutions | **Needed** | Remote worker / travel context |
| `mkt-persona-sme` | home | solutions | **Needed** | SME owner at desk |
| `mkt-persona-dev` | home | solutions | **Needed** | Developer at workstation |
| `mkt-map-corridors` | home | corridors | **Needed** | Abstract US/EU ↔ Africa routes |
| `mkt-icon-compliance` | home | compliance | Interim | Use `security.svg` until designed |
| `mkt-hero-personal-01` | personal | hero | **Needed** | Diaspora/freelancer + phone |
| `mkt-ui-personal-send` | personal | features | **Needed** | Send flow screenshot |
| `mkt-ui-personal-receive` | personal | features | **Needed** | Bank \| Stablecoin receive tabs |
| `mkt-ui-personal-recipients` | personal | features | **Needed** | Recipients list |
| `mkt-hero-business-01` | business | hero | **Needed** | SME + dashboard composite |
| `mkt-ui-business-dashboard` | business | features | Interim | Refresh from `eb1.png` |
| `mkt-ui-business-send` | business | features | **Needed** | Send/payout UI |
| `mkt-ui-business-accounts` | business | features | **Needed** | Multi-currency accounts |
| `mkt-hero-stablecoin-01` | stablecoin | hero | **Needed** | UI-forward; no coins |
| `mkt-diagram-invisible-rails` | stablecoin | story | **Needed** | Legacy 5-day vs Easner flow |
| `mkt-ui-stablecoin-receive` | stablecoin | features | **Needed** | Dual receive UI |
| `mkt-ui-terminal` | stablecoin | terminal | **Needed** | Terminal + scene |
| `mkt-ui-qrpay` | stablecoin | qrpay | **Needed** | QR scan mock |
| `mkt-hero-invoicing-01` | invoicing | hero | **Needed** | Owner + invoice UI |
| `mkt-ui-invoice-editor` | invoicing | features | **Needed** | Invoice creation |
| `mkt-ui-invoice-payin` | invoicing | features | **Needed** | VA + stablecoin on invoice |
| `mkt-hero-cards-01` | cards | hero | **Needed** | Card in hand; no issuer logo |
| `mkt-ui-cards-controls` | cards | features | **Future** | Spend controls mock |
| `mkt-hero-apis-01` | apis | hero | **Needed** | Developer + API diagram |
| `mkt-icon-api-banking` | apis | models | **Needed** | Banking model icon |
| `mkt-icon-api-agency` | apis | models | **Needed** | Agency model icon |
| `mkt-icon-api-integration` | apis | models | **Needed** | API integration icon |

---

## Section block template (for page docs)

```markdown
### Section: [Name]
**Layout:** [layout_id]
**Visual slot:** [asset_id]
**Alt text:** [accessible description]
**Design notes:** [composition, crop, device frame, people direction]
```
