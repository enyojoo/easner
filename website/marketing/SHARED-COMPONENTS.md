# Shared Components

Last updated: June 6, 2026

Reusable copy blocks for easner.com pages. Paste into React components or website CMS.

---

## Regulatory footer disclaimer

Use verbatim on every public page (matches [easner.com/business-banking](https://www.easner.com/business-banking)):

> Easner Group, Inc. ("Easner") is a financial technology company, not a bank or investment adviser. Banking, payment, verification, and card services available through Easner Personal (mobile app) and Easner Business (web dashboard) are provided by licensed partners. Easner does not provide investment, legal, tax, or financial advice.
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

**Footer links:** Terms of Service · Privacy Policy · KYC/KYB and AML Policy (label "Compliance" ok)

**Contact line:** Have questions? Email us at hello@easner.com or legal@easner.com for legal and compliance matters.

---

## Compliance strip (4 bullets)

Use on homepage and product pages above footer:

- KYC/KYB onboarding built into the product experience
- AML and sanctions screening on customers and transactions
- Banking, wallet, and payment rails connected where enabled
- Tiered access based on verification, jurisdiction, and product availability

**Section headline:** Compliance is built in, not added later.

**Section subhead:** Verification, screening, limits, and transaction controls are part of the Easner account flow – so money movement can scale with confidence.

---

## Tier ladder – Easner Personal

| Tier | Title | Description |
|------|-------|-------------|
| 1 | Global banking | USD and EUR bank accounts, pay-in and pay-out, and stablecoin flows. |
| 2 | African banking | NGN and regional pay-in and pay-out in local markets where we launch. |
| 3 | Cards | Your access to personal debit/credit cards for your online and physical payments. |

**Footnote:** Availability depends on verification, jurisdiction, approval, and product enablement.

---

## Tier ladder – Easner Business

| Tier | Title | Description |
|------|-------|-------------|
| 1 | Global banking | USD and EUR bank accounts, pay-in and pay-out, and stablecoin flows, plus other currency accounts where supported for your organization. |
| 2 | African banking | NGN and regional pay-in and pay-out for your business operations where we launch–local African banking for your organization. |
| 3 | Cards | Your access to corporate debit/credit cards for your business needs, spend controls, and cardholder management when approved. |

**Footnote:** Availability depends on verification, jurisdiction, approval, and product enablement.

---

## Product card grid (homepage)

### Easner Personal
**Link:** `/personal`  
**Thumb:** `mkt-thumb-personal`  
**Title:** Personal Banking  
**Description:** Mobile app for individuals – send, receive, and manage money across global and African corridors where enabled.

### Easner Business
**Link:** `/business`  
**Thumb:** `mkt-thumb-business`  
**Title:** Business Banking  
**Description:** Web dashboard for organizations – accounts, payouts, invoicing, Terminal, QR Pay, and team access.

### Easner APIs
**Link:** `/apis`  
**Thumb:** `mkt-thumb-apis`  
**Title:** Developer APIs  
**Description:** Embed compliant accounts, payouts, wallets, and collections in your own product.

**Secondary links:** [Stablecoin](/stablecoin) · [Invoicing](/invoicing) · [Cards](/cards)

---

## Persona card template

```markdown
**Persona:** [Name]
**Headline:** [One-liner]
**Body:** [2 sentences]
**Visual:** mkt-persona-[id]
**CTA:** [label] → [url]
```

### Diaspora / freelancer
**Headline:** Get paid globally. Keep more locally.  
**Body:** Receive in USD or EUR, move money home on fast rails, and avoid costly informal FX loops. Easner Personal puts global banking in your pocket.

### Cross-border SME
**Headline:** Run trade payments from one place.  
**Body:** Multi-currency accounts, payouts, and invoicing for import/export, tuition, and supplier payments – with compliance built in.

### Developer / platform
**Headline:** Ship global payments without building compliance from scratch.  
**Body:** Access KYC/KYB, accounts, payouts, and wallet infrastructure through Easner APIs – so you can focus on your product.

---

## TrustedBy component

- Use only logos with contractual clearance
- No volume metric pill (per decision)
- Placement: directly below homepage hero

---

## CTA band template

**Headline:** Ready to move money globally?  
**Subhead:** Open an Easner Personal or Business account – or talk to us about API integration.  
**Buttons:** Get Started → `/access` | Contact → `hello@easner.com`
