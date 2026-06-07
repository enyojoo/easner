# Invoicing

**Route:** `/invoicing`  
**Title:** Invoicing – Easner  
**Meta description:** Invoice globally and get paid by bank or stablecoin. Professional B2B invoicing on Easner Business with virtual accounts and stablecoin pay-in where enabled.

---

## Section 1: Hero

**Layout:** `split_50_50` – copy left, visual right  
**Visual slot:** `mkt-hero-invoicing-01`  
**Alt text:** Business owner creating an international invoice in Easner Business  
**Design notes:** SME at desk with invoice UI on laptop; professional, warm lighting

**H1:** Invoice globally. Get paid by bank or stablecoin.

**Subhead:** Create, send, and track invoices from Easner Business – let customers pay via virtual account details or stablecoin deposit address where enabled, with compliance and reconciliation built in.

**CTA primary:** Start invoicing → `/access`  
**CTA secondary:** See Business banking → `/business`

---

## Section 2: Problem

**Layout:** centered text block  
**Headline:** International invoices shouldn't mean payment chaos.

**Body:** Cross-border B2B payments often involve unclear instructions, slow settlement, and manual matching. Customers want simple pay-in options; you want one ledger and audit trail.

---

## Section 3: Solution

**Layout:** `split_50_50`  
**Visual slot:** `mkt-ui-invoice-editor`  
**Alt text:** Easner invoice creation screen  

**Headline:** Professional invoices with flexible pay-in.

**Body:** Generate branded invoices, share public payment links, and track status from your dashboard. Customers pay using methods you enable – bank transfer to your virtual account or stablecoin to an address on the invoice.

---

## Section 4: Pay-in methods

**Layout:** `split_40_60`  
**Visual slot:** `mkt-ui-invoice-payin`  
**Alt text:** Invoice payment page showing bank details and stablecoin address  

### Bank pay-in
Virtual account details on the invoice for USD, EUR, and other currencies where supported.

### Stablecoin pay-in
USDC or EURC deposit address and memo where enabled – same invoice, customer choice.

### Customer directory
Save invoice recipients and payer references for repeat business.

---

## Section 5: Use cases

| Use case | Description |
|----------|-------------|
| **Tuition and education** | Invoice families and institutions across borders with clear payment instructions. |
| **Import / export services** | Bill international clients in their preferred funding method. |
| **Agencies and consultancies** | Retainer and project invoices with status tracking. |

---

## Section 6: Tier note

Invoicing and virtual account pay-in require approved organization KYB (Tier 1 Global banking). Stablecoin pay-in on invoices requires enabled wallet features. See tier ladder in [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## Section 7: Compliance strip

Use compliance strip from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

**Note for business users:** You are typically the controller of your customer data on invoices; Easner processes payer information to deliver collections and compliance functions.

---

## Section 8: Final CTA

**Layout:** `cta_band`  
**Headline:** Send your next international invoice from Easner Business.  
**CTA:** Get Started → `/access`

---

## Footer

Use regulatory footer disclaimer from [`SHARED-COMPONENTS.md`](SHARED-COMPONENTS.md).

---

## FAQ

**Is invoicing available on Easner Personal?**  
Invoicing is a Easner Business feature on the web dashboard.

**Can payers use only bank transfer?**  
Yes. Stablecoin pay-in is optional where enabled.

**Are invoice pages public?**  
Customers receive a hosted payment experience to complete pay-in.

**How do fees work?**  
Fees and FX may apply to underlying payment rails. Display pricing on your invoice; Easner shows applicable transaction fees before confirmation in the dashboard.

**Do I need separate tools for QR or in-person pay?**  
For scan-to-pay and Terminal collections, see [Stablecoin Payments](/stablecoin).
