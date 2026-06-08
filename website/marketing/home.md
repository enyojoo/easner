# Home Page

**Route:** `/`  
**Title:** Easner – Stablecoin Banking for Global Businesses  
**Meta description:** Stablecoin-powered accounts, payouts, collections, cards, and APIs. Familiar banking screens with compliance built in.  
**Keywords:** stablecoin banking infrastructure, cross-border payments, global business banking

**Live source:** [`lib/marketing/content/home.ts`](../lib/marketing/content/home.ts)

---

## Section 1: Hero

**Layout:** `center_hero`  
**Visual slot:** `mkt-hero-home-01`  
**Alt text:** Easner Business dashboard overview

**H1:** Global banking, Simplified.

**Subhead:** Stablecoin-powered accounts, payouts, collections, cards, and APIs. Familiar banking screens with compliance built in.

**CTA primary:** Open Account → `#` (open-account action)  
**CTA secondary:** Explore products → `#products`

---

## Section 2: Trust strip

**Layout:** `TrustedBy` component

---

## Section 3: Why Easner

**Layout:** `three_col_cards`  
**Section headline:** Why teams choose Easner

| Pillar | Icon | Body |
|--------|------|------|
| **No crypto complexity** | `mkt-icon-pillar-ux` | Send, receive, invoice, and manage money in screens that feel like banking – not a trading app. |
| **Move more, spend less** | `mkt-icon-pillar-cost` | Modern settlement can reduce cross-border cost vs legacy paths – up to ~60% in supported flows. |
| **Compliance-ready** | `mkt-icon-pillar-compliance` | KYC/KYB, AML screening, limits, and transaction controls are built in from day one. |
| **Speed without the noise** | `mkt-icon-pillar-invisible` | Stablecoin speed and global reach sit behind fiat-native screens. |

---

## Section 4: Product grid

Use product cards from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md) (live: [`PRODUCT_CARDS`](../lib/marketing/shared-content.ts), [`SECONDARY_PRODUCT_CARDS`](../lib/marketing/shared-content.ts)).

---

## Section 5: Solutions by audience

| Audience | Headline | Body | CTAs |
|----------|----------|------|------|
| Freelancers, remote workers, and diaspora | Get paid globally. Keep more locally. | Receive in supported global currencies, move money home on faster paths, and keep a clean record of every transfer with Easner Personal Banking. | App Store, Google Play |
| Cross-border SMEs and trade | Run global operations from one dashboard. | Manage accounts, payouts, invoicing, collections, team access, and reporting for import/export, supplier, and contractor payments with Easner Business Banking. | Open Business account |
| Developers and platforms | Embed global rails without building compliance. | Build with Easner APIs for verification, accounts, payouts, wallets, and collections, then focus your roadmap on the customer experience. | Talk to our team → `/contact` |

**Visual slots:** `mkt-persona-diaspora`, `mkt-persona-sme`, `mkt-persona-dev`

---

## Section 6: Corridors

**Headline:** Expanding where global business meets emerging markets  
**Body:** Hold USD, EUR, and GBP from global markets, then pay out locally across Africa and the region – for salaries, supplier payments, and cross-border trade.  
**Visual slot:** `mkt-map-corridors`  
**Alt text:** Map showing payment corridors between US, EU, and African markets  
**CTA:** Open Account → `#` (open-account action)

---

## Section 7: Compliance strip

Use compliance strip from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## Section 8: Final CTA

**Layout:** `cta_band`  
**Headline:** Ready to move money globally?  
**Subhead:** Open an Easner account, or talk to us about building on Easner APIs.  
**CTA primary:** Open Account → `#` (open-account action)  
**CTA secondary:** Contact → `/contact`

---

## FAQ (defined in code, not rendered on homepage)

| Question | Answer |
|----------|--------|
| Is Easner a bank? | No. Easner is a financial technology company. Regulated banking, payment, and verification services are provided by licensed partners. |
| Do I need to understand crypto to use Easner? | No. Easner is designed around banking-simple screens. Stablecoin infrastructure may power settlement behind the scenes. |
| What products does Easner offer? | Easner Personal (mobile app for individuals), Easner Business (web dashboard for organizations), and Easner APIs for developers and platforms. |
| Are fees zero? | Fees and exchange rates may apply depending on product and corridor. Applicable fees are shown before you confirm a transaction. |
| Which countries are supported? | Availability varies by jurisdiction, verification tier, and partner rules. See our KYC/KYB and AML Policy for eligibility details. |

---

## Footer

Use regulatory footer disclaimer from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).  
**Links:** [Terms](/terms) · [Privacy](/privacy) · [KYC/KYB and AML Policy](/compliance)
