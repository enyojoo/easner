# Shared Components

Last updated: June 8, 2026

Reusable copy blocks for easner.com pages. **Live source:** [`lib/marketing/shared-content.ts`](../lib/marketing/shared-content.ts) and [`components/layout/public-footer.tsx`](../components/layout/public-footer.tsx).

---

## Regulatory footer disclaimer

Use verbatim on every public page via `REGULATORY_FOOTER_PARAGRAPHS`:

> Easner Group, Inc. ("Easner") is a financial technology company, not a bank or investment adviser. Banking, payment, verification, and card services available through Easner Mobile (Easner Personal Banking) and Easner Business (Easner Business Banking) are provided by licensed partners. Easner does not provide investment, legal, tax, or financial advice.
>
> Easner is not FDIC-insured and does not hold customer deposits. Banking services are provided by third-party banking partners, not by Easner.
>
> Where enabled, stablecoin and wallet features are supported through infrastructure partners and may operate on public blockchains. Digital assets are not legal tender, are not backed by a government, and are not FDIC-insured or protected by SIPC. Blockchain transactions may be public and irreversible.
>
> Corporate and personal card products, when available, are issued by a third-party issuer and are subject to credit approval.
>
> Easner may receive compensation from third-party service providers.
>
> Use of the Easner platform is subject to the Terms of Service, Privacy Policy, and KYC/KYB and AML Policy, which include limitations of liability, a class action waiver, and mandatory arbitration.

**Footer links:** Terms of Service · Privacy Policy · KYC/KYB and AML Policy (nav label "Compliance" ok → `/compliance`)

**Contact line:** Have questions? [Contact us](/contact).

---

## Compliance strip (4 bullets)

Use on homepage and product pages above footer (`COMPLIANCE_STRIP`):

- KYC/KYB onboarding built into the product experience
- AML and sanctions screening on customers and transactions
- Banking, wallet, and payment rails connected
- Access based on verification, jurisdiction, and product availability

**Section headline:** Compliance is built in, not added later.

**Section subhead:** Verification, screening, limits, and transaction controls are part of the Easner account flow – so money movement can scale with confidence.

---

## Tier ladder — Easner Personal Banking

Live constants: `PERSONAL_TIERS` in [`shared-content.ts`](../lib/marketing/shared-content.ts). Not currently rendered on `/personal`.

| Tier | Title | Description |
|------|-------|-------------|
| 1 | Global banking | USD and EUR account details, pay-in and pay-out, and stablecoin flows. |
| 2 | African banking | NGN and regional pay-in and pay-out in local markets where we launch. |
| 3 | Cards | Your access to personal debit/credit cards for your online and physical payments. |

**Footnote (`TIER_FOOTNOTE`):** Availability depends on verification, jurisdiction, approval, and product enablement.

---

## Tier ladder — Easner Business Banking

Live constants: `BUSINESS_TIERS` in [`shared-content.ts`](../lib/marketing/shared-content.ts). Not currently rendered on `/business`.

| Tier | Title | Description |
|------|-------|-------------|
| 1 | Global banking | USD and EUR account details, pay-in and pay-out, and stablecoin flows, plus other currencies where supported for your organization. |
| 2 | African banking | NGN and regional pay-in and pay-out for your business operations where we launch – local African banking for your organization. |
| 3 | Cards | Your access to corporate debit/credit cards for your business needs, spend controls, and cardholder management when approved. |

**Footnote:** Availability depends on verification, jurisdiction, approval, and product enablement.

---

## Product card grid (homepage)

Live constants: `PRODUCT_CARDS` + `SECONDARY_PRODUCT_CARDS` in [`shared-content.ts`](../lib/marketing/shared-content.ts).

### Personal Banking
**Link:** `/personal`  
**Thumb:** `mkt-thumb-personal`  
**Title:** Personal Banking  
**Description:** Mobile banking for global earners – receive, send, and manage money across supported corridors.

### Business Banking
**Link:** `/business`  
**Thumb:** `mkt-thumb-business`  
**Title:** Business Banking  
**Description:** A web control center for accounts, payouts, invoicing, Terminal, QR Pay, teams, and reporting.

### Developer APIs
**Link:** `/apis`  
**Thumb:** `mkt-thumb-apis`  
**Title:** Developer APIs  
**Description:** Embed accounts, payouts, wallets, collections, and compliance-ready workflows in your product.

**Secondary cards:** Stablecoin · Invoicing · Cards (see `SECONDARY_PRODUCT_CARDS`)

---

## Persona cards (homepage solutions)

Live source: `solutionsPersonas` in [`lib/marketing/content/home.ts`](../lib/marketing/content/home.ts).

### Freelancers, remote workers, and diaspora
**Headline:** Get paid globally. Keep more locally.  
**Body:** Receive in supported global currencies, move money home on faster paths, and keep a clean record of every transfer with Easner Personal Banking.  
**Visual:** `mkt-persona-diaspora`  
**CTAs:** App Store, Google Play

### Cross-border SMEs and trade
**Headline:** Run global operations from one dashboard.  
**Body:** Manage accounts, payouts, invoicing, collections, team access, and reporting for import/export, supplier, and contractor payments with Easner Business Banking.  
**Visual:** `mkt-persona-sme`  
**CTA:** Open Business account

### Developers and platforms
**Headline:** Embed global rails without building compliance.  
**Body:** Build with Easner APIs for verification, accounts, payouts, wallets, and collections, then focus your roadmap on the customer experience.  
**Visual:** `mkt-persona-dev`  
**CTA:** Talk to our team → `/contact`

---

## TrustedBy component

- Use only logos with contractual clearance
- No volume metric pill (per decision)
- Placement: directly below homepage hero

---

## CTA band template

Live source: `DEFAULT_CTA_BAND` in [`shared-content.ts`](../lib/marketing/shared-content.ts).

**Headline:** Ready to move money globally?  
**Subhead:** Open an Easner account, or talk to us about building on Easner APIs.  
**Buttons:** Open Account → `#` (open-account action) | Contact → `/contact`
