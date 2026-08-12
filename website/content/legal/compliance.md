# KYC/KYB and AML Policy

Last updated: August 12, 2026

---

## 1. Overview

**Easner Group, Inc.** (“**Easner**,” “**we**,” “**us**,” or “**our**”) maintains a compliance program covering know-your-customer (**KYC**), know-your-business (**KYB**), and anti-money laundering (**AML**) obligations across **Easner Personal Banking** and **Easner Business Banking**.

Easner is a financial technology company. Banking, money transmission, payment acceptance, verification, and related regulated services accessible through our platform are provided by **licensed partners**. Easner designs and operates the technology experience; partners perform regulated financial and compliance services under their licenses and regulatory frameworks.

For Turnkey-backed wallet features, Easner is **not a custodian** and does **not** sit in the flow of funds as a signing party (keys and signing are managed in Turnkey’s infrastructure; Easner controls product access only). Fiat money-transmission rails (including **Lightspark Grid**, **Noah**, and **Yellowcard** where enabled) remain partner-provided under those partners’ licenses and terms. See our Terms of Service for the full self-custody disclosure.

This policy explains who may use our Services, how we verify customers and businesses, how we monitor for financial crime, and your responsibilities. For how we handle personal data, see our Privacy Policy.

---

## 2. Know Your Customer and Know Your Business

**KYC** is the process of verifying the identity of individual users.

**KYB** is the process of verifying business entities, their legal status, beneficial owners, and authorized representatives.

**AML** comprises the laws, regulations, and controls designed to prevent money laundering, terrorist financing, fraud, and other financial crime – including customer due diligence, sanctions screening, transaction monitoring, recordkeeping, and reporting to authorities.

Together, these programs help protect Easner, our partners, our users, and the integrity of the financial system.

---

## 3. Supported Jurisdictions

Access to Tier 1 global banking – including identity verification, virtual accounts, and fiat pay-in and pay-out – depends on **licensed partner** eligibility rules and Easner product availability. **Easner Business Banking** and **Easner Personal Banking** apply product-specific residence rules for signup and verification. Countries offered at registration may also reflect our current rollout and Office allowlists.

### Eligibility principles

- You must be **18 or older** and truthfully represent your country of residence or business registration.
- All users and transactions are screened against applicable **sanctions and watchlists** (including OFAC, UN, EU, and UK). A match may block onboarding or payments regardless of country.
- Partners may require **Enhanced Due Diligence** for higher-risk profiles or jurisdictions.

### Easner Business Banking – hard-blocked jurisdictions

We do not onboard businesses located in, ordinarily resident in, or organized under the laws of:

| Jurisdiction | ISO |
|----------------|-----|
| Afghanistan | AF |
| Belarus | BY |
| Bhutan | BT |
| Burundi | BI |
| Congo (Democratic Republic of the) | CD |
| Cuba | CU |
| Gaza Strip / West Bank (Palestinian Territories) | PS |
| Guinea-Bissau | GW |
| Haiti | HT |
| Iran | IR |
| Iraq | IQ |
| Kenya | KE |
| Kosovo | XK |
| Lebanon | LB |
| Libya | LY |
| Mozambique | MZ |
| Myanmar | MM |
| North Korea (Democratic People's Republic of Korea) | KP |
| Pakistan | PK |
| Qatar | QA |
| Russia | RU |
| Somalia | SO |
| South Sudan | SS |
| Sudan | SD |
| Syria | SY |
| Venezuela | VE |
| Yemen | YE |
| Zimbabwe | ZW |

We also do not provide Services in **Crimea, Sevastopol, Donetsk, Kherson, Luhansk, or Zaporizhzhia** (sub-national regions; not selectable as standalone countries in registration).

These jurisdictions are excluded from Easner Business Banking signup and KYB country pickers.

### Easner Personal Banking – hard-blocked jurisdictions

We do not onboard Personal Banking users located in, or ordinarily resident in:

| Jurisdiction | ISO |
|----------------|-----|
| Afghanistan | AF |
| Burkina Faso | BF |
| Belarus | BY |
| Congo (Democratic Republic of the) | CD |
| Central African Republic | CF |
| Cuba | CU |
| United Kingdom | GB |
| Guinea-Bissau | GW |
| Haiti | HT |
| Iraq | IQ |
| Iran | IR |
| North Korea (Democratic People's Republic of Korea) | KP |
| Lebanon | LB |
| Libya | LY |
| Mali | ML |
| Myanmar | MM |
| Mozambique | MZ |
| Nicaragua | NI |
| Panama | PA |
| Pakistan | PK |
| Palestinian Territory | PS |
| Russia | RU |
| Sudan | SD |
| Somalia | SO |
| South Sudan | SS |
| Syria | SY |
| Ukraine | UA |
| Venezuela | VE |
| Vanuatu | VU |
| Yemen | YE |
| Zimbabwe | ZW |

Product notes: **Kenya (KE)** is blocked on Easner Business Banking but may be available on Easner Personal Banking. **United Kingdom (GB)** remains available on Easner Business Banking and is blocked on Easner Personal Banking. **Ukraine (UA)** is blocked on Easner Personal Banking as a whole; occupied territories listed above remain excluded on Easner Business Banking as sub-national regions.

### Other jurisdictions

If your country is not listed above for the product you are using, you may be eligible subject to partner approval, successful verification, sanctions screening, and Easner feature availability. Cross-border and local corridors (for example mobile money or local bank rails in Africa, Latin America, Asia, and other regions) may be available to eligible Tier 1 global users without constituting a separate regional banking account product.

Partner jurisdiction policies may change. We update our practices when material changes apply.

Source of truth in product code: `packages/shared/src/jurisdiction-blocked-countries.ts`.

---

## 4. When We Verify

We conduct KYC/KYB when:

- You register for an account or before regulated features are enabled
- You send, receive, or fund an account through partner rails
- Virtual accounts, stablecoin deposit addresses, payroll disbursement, online payments (Stripe Connect), or card products are provisioned or enabled
- Periodic or risk-based reviews are required
- Your profile, ownership, activity, or jurisdiction changes materially
- A partner or regulator requires additional information

You may need to accept **partner terms** presented during hosted verification before certain services are enabled. For **Lightspark Grid** money transmission, the Lightspark End User Terms included in our Terms of Service also apply. For **Noah** money transmission and related payment services, Noah’s partner terms and notices presented during onboarding also apply (**Noah US, Inc.**, NMLS ID 2696057 for applicable U.S. money-transmission services). For **Yellowcard** corridor payments, Yellowcard’s partner terms presented during onboarding or in the payment flow also apply.

---

## 5. Information We Collect

### Annex A – Individual users (Easner Personal Banking)

- Full legal name, date of birth, nationality, and residential address
- Government-issued photo ID and proof of address where required
- Phone, email, and tax or national identifiers where applicable
- Employment, occupation, source of funds, and expected activity where required
- Selfie or liveness data where required for fraud prevention
- Verification status and related compliance metadata

### Annex B – Business users (Easner Business Banking)

- Legal name, registration number, jurisdiction, and business address
- Business website and customer-facing contact details where required for KYB
- Industry, nature of business, tax IDs, and registration documents
- Beneficial owners and persons with significant control (typically 25% or more, or as required by law)
- Authorized signatories and their identity verification
- Source of funds, expected volumes, and operational details
- Team members with access to the business account, where required for access control
- Merchant / online-payments details required by Stripe when Connect is enabled

### Document standards

Identity documents must be valid, legible, and match account information. Address documents are typically dated within the last three months unless otherwise specified. Non-English documents may require certified translation. We or our partners may request additional documents based on risk, product, or jurisdiction.

---

## 6. Verification Process

1. You create an Easner account.
2. You complete **hosted verification** with a licensed partner:
   - **Easner Personal Banking (individuals):** **Noah** KYC (in-app or browser).
   - **Easner Business Banking:** **Lightspark Grid** KYB.
3. Automated and, where needed, manual review is performed.
4. Sanctions, PEP, and adverse media screening is conducted.
5. You receive an outcome: approved, pending, rejected, or a request for more information.
6. Upon approval, eligible accounts, payment rails, and features are provisioned by tier and partner enablement.

Most verifications complete within **1–3 business days**. Complex cases may take longer.

For Grid money-transmission customers, Easner records acceptance of Lightspark’s End User Terms (version, timestamp, IP, and acceptance method) and provides that consent to Lightspark as required before accounts can open.

---

## 7. Our AML Program

Easner’s AML framework includes:

- **Customer Due Diligence (CDD)** – KYC/KYB before regulated services are used
- **Enhanced Due Diligence (EDD)** – for PEPs, high-risk geographies, unusual activity, or complex structures
- **Sanctions screening** – of customers, beneficiaries, and transactions
- **Transaction monitoring** – across fiat, stablecoin, wallet, payroll, and card-acceptance activity where enabled
- **Suspicious activity reporting** – to relevant authorities when required
- **Recordkeeping** – typically **5 to 7 years** after account closure or last activity, or longer where mandated
- **Training and governance** – for personnel with compliance responsibilities, in coordination with licensed partners

Licensed partners perform identity verification, screening, and much of the transaction monitoring underlying our Services. Easner integrates partner outputs into account decisions, limits, and escalation.

### Transaction monitoring

We and our partners review activity for indicators such as unusual size or frequency, structuring, inconsistent use versus profile, high-risk corridors, sanctions exposure, and – for business users – patterns inconsistent with invoicing, Terminal, QR Pay, payroll, or online card-acceptance activity.

We may pause, decline, or request information about transactions pending compliance review.

### Suspicious activity reporting

Where we or a partner identify potentially suspicious activity, a **Suspicious Activity Report** or equivalent filing may be made to the appropriate authority. **We cannot inform you** when such a report is filed or an investigation is underway – this is required by law to prevent “tipping off.”

---

## 8. Tier Entitlements

| Tier | Description | Typical requirement |
|------|-------------|---------------------|
| **Tier 1 – Global banking** | USD/EUR accounts, pay-in/pay-out, regional corridors where enabled, stablecoin flows | Approved KYC or KYB |
| **Tier 2 – Cards** | Personal or business cards when available | Separate partner approval; **not generally live today** |
| **Tier 3 – Online payments (Business Banking)** | Accept card payments on invoices via Stripe Connect; settlement to Easner balance | Approved KYB plus Stripe Connected Account onboarding |

Cross-border and local pay-in/pay-out corridors (for example via Yellowcard mobile-money or local bank rails in Africa, Latin America, Asia, and other regions) may be offered to eligible Tier 1 global users and jurisdictions. They are a corridor capability under Tier 1, not a separate regional banking account tier, unless we expressly launch one.

---

## 9. Verification Outcomes and Limits

**Approved:** You may use Services within your tier, limits, and partner availability.

**Pending:** Some features may be restricted until review completes.

**Rejected:** Common reasons include invalid documents, information mismatches, incomplete files, sanctions concerns, or jurisdiction ineligibility. You may be able to resubmit where permitted.

We and our partners may impose transaction limits, corridor restrictions, or holds based on verification level and risk. Limits are communicated in the app or dashboard where practicable.

Online payments may be limited or suspended independently based on Stripe, card-network, or Easner risk decisions.

---

## 10. Your Responsibilities

You must:

- Provide accurate, complete, and current information
- Use the Services only for lawful purposes
- Cooperate with verification and information requests
- Notify us of changes to identity, ownership, or business activity
- Not evade sanctions, monitoring, or geographic restrictions

False or misleading information may result in account closure and reporting to authorities.

---

## 11. Your Rights

You may access verification status in the app or dashboard, request correction of inaccurate information (subject to regulatory limits), and contact us about the verification process. Some rights are limited by AML and recordkeeping laws.

For data held by a licensed partner, contact **legal@easner.com** and we will coordinate where appropriate.

---

## 12. Sharing and Security

We share KYC/KYB and compliance information with **licensed partners**, infrastructure providers, regulators, law enforcement, and other institutions where permitted by law and necessary to provide or protect the Services. See our **Privacy Policy** (Section 5) for named financial and infrastructure partners (including Lightspark Grid, Noah, and Yellowcard as fiat money-transmission / payments partners, Sumsub, Stripe, Turnkey, and Relay where applicable).

We protect compliance data with encryption, access controls, and confidentiality training. Partners retain data under their own regulatory obligations, which may continue after your Easner account closes.

---

## 13. Changes to This Policy

We may update this policy as regulations, partners, or our Services evolve. Material changes will be posted with an updated “Last updated” date.

---

## 14. Contact Us

**Easner Group, Inc.**  
584 Castro St, Suite 4092  
San Francisco, CA 94114, United States  

**Email (legal and compliance):** legal@easner.com  
**For Support:** Live Chat or email support@easner.com  
**Phone:** +1 628 228 6083  
**Website:** www.easner.com
