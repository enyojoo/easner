# Business Banking

**Route:** `/business`  
**Title:** Business Banking – Easner  
**Meta description:** Cross-border business banking on one dashboard. Multi-currency accounts, payouts, invoicing, Terminal, QR Pay, and team access – with KYC/KYB and compliance built in.

---

## Section 1: Hero

**Layout:** `split_50_50` – copy left, visual right  
**Visual slot:** `mkt-hero-business-01`  
**Alt text:** Small business founder reviewing Easner Business dashboard  
**Design notes:** SME owner at desk or retail counter; browser mockup showing dashboard alongside lifestyle scene

**H1:** Business banking built for cross-border operations.

**Subhead:** Easner Business is your web dashboard for organization onboarding, multi-currency accounts, payouts, team access, and collections – invoicing, Terminal, and QR Pay where enabled – with stablecoin and fiat rails behind a single compliance program.

**CTA primary:** Open Business account → `/access`  
**CTA secondary:** See invoicing → `/invoicing`

---

## Section 2: Problem

**Layout:** centered text block  
**Headline:** Global trade shouldn't mean fragmented tools.

**Body:** Cross-border SMEs juggle multiple banks, spreadsheets, and informal FX to pay suppliers, collect from customers, and manage treasury. High fees and slow settlement eat into margins – especially in corridors where formal rails underperform.

---

## Section 3: Solution

**Layout:** `split_50_50` – visual left, copy right  
**Visual slot:** `mkt-ui-business-dashboard`  
**Alt text:** Easner Business dashboard with accounts and recent transactions  
**Design notes:** Browser chrome, ivory Business canvas; show accounts + transaction list (interim: refresh `eb1.png`)

**Headline:** One control center for how your business moves money.

**Body:** Complete organization KYB, invite team members with access controls, and run pay-in, pay-out, and reporting from one place. Connect collections tools when you need to invoice customers or accept in-person and QR payments.

---

## Section 4: Features

**Layout:** alternating `split_40_60`

### Organization and KYB
Hosted business verification, beneficial ownership, and authorized signatories – gates features by tier.

### Multi-currency accounts
**Visual:** `mkt-ui-business-accounts`  
USD, EUR, and other currencies where supported; virtual accounts and stablecoin flows where enabled.

### Send and payouts
**Visual:** `mkt-ui-business-send`  
Pay suppliers, contractors, and partners globally – bank, stablecoin, and regional rails where available.

### Collections
Cards linking to `/invoicing` and `/stablecoin`:
- **Invoicing** – professional invoices with bank and stablecoin pay-in
- **Terminal** – in-person collections
- **QR Pay** – scan-to-pay

### Team and reporting
Role-based access, customer directory, and transaction history for reconciliation.

---

## Section 5: Tier availability

Use **Tier ladder – Easner Business** from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## Section 6: Use cases

| Use case | Description |
|----------|-------------|
| **Import / export** | Pay international suppliers and collect from buyers with clear audit trails. |
| **Tuition and services** | Invoice overseas clients; accept bank or stablecoin pay-in on one invoice. |
| **Distributed teams** | Payout contractors across corridors from a single business account. |

---

## Section 7: Compliance strip

Use compliance strip from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## Section 8: Final CTA

**Layout:** `cta_band`  
**Headline:** Open your Easner Business account.  
**CTA:** Get Started → `/access`

---

## Footer

Use regulatory footer disclaimer from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## FAQ

**Who can use Easner Business?**  
Registered businesses in supported jurisdictions that complete organization KYB.

**Can I invite team members?**  
Yes. Account owners control who can access the organization dashboard.

**Does Easner Business include invoicing?**  
Yes. See our [Invoicing](/invoicing) page. Terminal and QR Pay are part of our stablecoin collections infrastructure.

**Are stablecoin features required?**  
No. Use fiat rails where available. Stablecoin pay-in and wallet features are optional where enabled.

**How are fees structured?**  
Fees and FX may apply by product and corridor. Amounts are shown before you confirm transactions.
