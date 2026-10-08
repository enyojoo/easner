# Easner website: design system rebuild plan

Prepared October 8, 2026. Builds on [`website-improvement-plan.md`](website-improvement-plan.md) (September 5, 2026). Decisions recorded there still stand unless this document names them under **Decisions**.

**Status (October 8, 2026): built** on branch `website-design-system`, not yet committed or deployed. Phase 1 (tokens via `npm run sync:tokens`, `components/ds/`, Button pill, hex lint), Phase 2 (sentence-case in-card titles, proof row, click tabs, compliance trust illustration, neutral corridor tiles with an example payout, sitemap footer, grouped Products menu, card-link arrows, Business use-case links), Phase 3 (every product visual on 11 pages rebuilt from design-system screens in `components/marketing/screens/`; old mockups and photos deleted) and Phase 4 (copy below, alt text, sitemap dates). Inline hex is down from 1,492 to 86, all in tokens, flags, demo partner colours, third-party marks, QR and OG rendering.

Source of truth: the Easner design system at `easnerbanking/design-system` (README rules, `components/tokens.css`, component and screen specs under `components/<Name>/`, viewer at `viewer.html`). Brand voice: `easnerbanking/docs/marketing/VOICE-AND-GUARDRAILS.md`.

## Summary

The website already has the right bones: white canvas, ivory bands, Unbounded headlines, pill CTAs. The design system's website layer was written from it. What holds the site back is three things:

1. **The product mockups don't look like Easner.** They are hand-drawn, cool-grey, generic SaaS screens with a sidebar that doesn't exist in the product. The real product, as specified in the design system, is warm ivory, quieter, richer in detail and more trustworthy. Showing the actual product is the single largest quality gain available.
2. **Everything shouts at once.** Every heading, including in-card feature titles, is uppercase Unbounded at large sizes. Most sections are a grid of identical icon cards. The page has no rhythm between loud and quiet moments.
3. **Some visuals undercut trust.** The Personal page shows a $0.07 balance, a ₦10 transfer and "Two-Factor Authentication: OFF" on the account security card. The homepage shows a photo of a cash-counting machine for a stablecoin-native product.

The plan fixes these in four phases. Phase 1 has almost no visible change and makes everything after it cheap.

## Locked decisions carried over

From the September 5 plan and later user corrections. These are not reopened here except where noted under Decisions.

- Homepage H1 "Your Money. / Moved with Ease." and CTAs "Open Account" / "Explore products".
- Page H1s "Bank globally with Ease" (Personal) and "Global banking for business" (Business).
- Homepage audience tabs: "Personal Banking", "Business Banking", "Deploy Easner", "Easner API".
- Homepage product grid: keep every card, its position and its link. Do not group the cards.
- Existing section order on every page.
- **Direct Local Transfer is a rail, not a product.** Never market it by name.
- Cards are "when available". No live-card language.
- No em-dashes in customer-facing copy (use en-dashes), qualifiers inline and once (Voice and Guardrails).

---

## Phase 1: Foundations (no visible change)

**Tokens.** Replace the shadcn defaults in `website/app/globals.css` with the design system's `tokens.css`, exposed through Tailwind `@theme` so classes like `text-web-body`, `bg-web-band` and `border-web-hairline` exist. Add a small `scripts/sync-design-tokens.mjs` (same pattern as `sync-legal-content.mjs`) that copies `tokens.css` from the design system so the two can't drift. Delete the `.dark` block, the `easner-primary-*` scale and the `--radius: 0.5rem` base, and adopt the design system's radius scale.

**Colour mapping.** The site has 1,492 inline hex values. Most map directly:

| Hex | Uses | Token |
|---|---|---|
| `#5F665F` | 387 | `web-body` |
| `#0F1110` | 303 | `web-ink` |
| `#007ACC` | 139 | `brand-primary` |
| `#F8F6F0` | 84 | `web-plate` |
| `#E4DED1` | 73 | `web-hairline` |
| `#63717B` | 27 | `web-meta` |
| `#EAF5FD` | 26 | `surface-tint` |
| `#0064A8` | 19 | `web-link` |
| `#3AA6F8` | 12 | `web-accent-on-graphite` |
| `#3D443E` | 10 | `web-nav` |
| `#0A2540` | 9 | `brand-navy` |

Not in the system: `#6F756F` (123 uses; likely fails 4.5:1 on plates, so map to `web-meta`), `#E9E4D8` (57; map to `web-hairline`), `#0F8A5F` (44; bright emerald; use `success-text` for text and `success` for fills). Most of the mockup greys (`#F0F8FE`, `#E3E8EB`, `#FAFBFC`, `#54616D`) disappear in Phase 3 rather than being mapped.

**Components** in `website/components/ds/`, ported from the design system's reference bundle:

- Website: `Headline`, `Eyebrow`, `Button` (with `pill`), `WebCard`, `CtaPanel`.
- Money and status, for mockups: `Amount`, `StatusBadge`, `CurrencyFlag`, and a `formatMoney` helper implementing the design system's money rules.

`Headline` replaces the type constants in `lib/marketing/layout-constants.ts`.

**Hex lint scopes** (`website/eslint.config.mjs`): error in `components/**` and `app/**`; warn in the older mockup files (`visual-slot`, `account-mockups`, `payment-mockups`, `corridor-coverage-visual`) until they are rebuilt; off where hex is required (Cal.com embed config, QR rendering, store icons, OG images, the demo partner colour).

**Guardrails.**

- Add a lint step that fails on new `#rrggbb` values in `website/components` and `website/app`.
- Replace `text-red-600` and `green-*` in the two forms with `destructive-text` and `success-text`.
- Remove `@fontsource/inter` if unused.

---

## Phase 2: Design improvements

Ranked by impact. Each item follows a design system rule; none needs new tokens.

### 2.1 Quiet the typography

Use the design system's levels as written:

- **Uppercase Unbounded** only for the hero `h1`, page `h1`s and section `h2`s.
- **In-card and in-section titles** use `Headline level="sub"`: Unbounded, sentence case. This covers "Named accounts", "Collections", "Connect your site" and the rest. Today they are uppercase at about 40px and compete with the section heading above them.
- **Small card titles** in the grids stay Geist semibold, as they are.
- **Body text in small cards** is 14px with about 28px leading, which reads loose and airy. Move it to `body-sm` (14/22) or 15/24.
- **Headline punctuation:** pick one rule. Today "Accept payments on your website." has a full stop and "Global banking for business" doesn't. Recommendation: full stops only on two-line, two-sentence headlines ("Your Money. Moved with Ease."), none elsewhere.

### 2.2 Give each page rhythm

Most pages run hero → icon-card grid → icon-card grid → photo tabs → icon-card grid. Alternate densities instead:

- **Why choose Easner → a proof row.** Make the four pillars lead with a figure set in `display-lg` Geist: **80+** countries, **~60%** lower cost in supported corridors, **3** account currencies (USD, EUR, GBP), **USDC · EURC**. Keep each pillar's existing sentence below its figure. Figures read faster than icons and say "serious money" in a way icons can't.
- **Product grid** (layout locked): keep the cards and add a quiet `ArrowRight` that moves 2px on hover, so the cards read as links. Today nothing signals that they're clickable.
- **Business use cases:** nine identical cards mix customer types ("Startups", "Agencies") with jobs ("Team payments", "Selling on your own website"). Split them: six customer-type cards, with the three jobs becoming inline links under the grid ("Run payroll →", "Sell on your website →", "Get paid with a link →").

### 2.3 Fix the audience-tabs section

The section pins on scroll and cycles four tabs, which takes about four screens of scrolling. At 1440 wide, each step leaves roughly 400px of empty white under the card.

- Shrink the pinned height to the card's height, or drop the scroll pinning and use click-only tabs with a short crossfade. Shorter scrolling and less empty space.
- Replace the photos with product screens (see Phase 3). The "Deploy Easner" photo shows a cash-counting machine and stacks of banknotes, the opposite of stablecoin-native, and it reads as cash handling. The "Easner API" photo is a generic stock shot of people at a code screen.

### 2.4 Make the compliance band earn its space

The right half was a large empty dark panel holding one shield icon. **Built (October 8):** a trust illustration (your call: a shield, not product screens): an Easner-blue shield at the centre of concentric rings, with three checks around it ("Identity verified", "Sanctions screened", "Payments encrypted"). The band moves from graphite to `brand-navy`, the colour the design system reserves for executive bands.

### 2.5 Logo strip: kept for now

Kept as it is at your request (October 8). Revisit later: the strongest replacement is a row of supported currencies and rails, which the voice rules favour over third-party logos.

### 2.6 Corridor section: neutral tiles and a real number

- The country tiles each carry a different pastel tint (pink, green, cream, lilac). That's a rainbow the design system forbids. Use white `web-plate` tiles with round flags.
- Add one concrete payout line under the grid in the design system's rate format, for example "$1 = ₦1,359 · Bank or mobile money". It turns "80+ countries" into something felt.
- Mark the rate as illustrative, consistent with the September plan.

### 2.7 Footer and navigation

- **Footer:** it has only Terms, Privacy, Compliance and the disclaimer. Add a sitemap row with four columns: Personal (Personal Banking, Cards, Download), Business (Business Banking, Checkout, Payment Links, Invoicing, Payroll), Build (Partners, Developers, Stablecoin) and Company (About, Contact, legal). Low risk, real SEO value, and it catches people who scroll to the bottom looking for a product.
- **Header:** drop "Home" from the nav, since the logo does that job. Split the ten-item Products menu into those same three labelled columns. The September plan deferred larger navigation changes; this reorganises the menu without changing any destination.

### 2.8 Mobile art direction

On phones, the homepage hero shows the desktop dashboard shrunk to 360px. Swap in the phone screen (AppHome) below 640px instead of scaling down the desktop screen.

---

## Phase 3: Mockups built from design-system screens

### Approach

Rebuild the mockups as React components that copy the design system's screen specs. Don't use screenshots. Code stays crisp at every size, weighs less than images, and updates when the product does.

- **Render at product size, then scale.** Each screen is laid out at its real product width (1200px for Business, 390px for the app) using the product's own type sizes: `body-sm` 14/22, `label` 14/20, `hero-balance`, the app scale. The frame then scales the whole screen with `transform: scale()` to fit its slot. Text sizes, spacing and proportions match the real product exactly, rather than being retuned per breakpoint, which is how today's mockups drifted.
- **Frames:**
  - `BrowserFrame`: ivory chrome with a URL pill such as `business.easner.com`, `checkout.easner.com` or `invoice.easner.com`. The URL is free credibility.
  - `PhoneFrame`: from the AppHome card.
  - `CardFrame`: the existing `shadow-showcase` plate.
- **One demo world.** A shared `lib/marketing/demo-data.ts` using the design system's own fictional records, so amounts and names agree across pages:
  - Business: Northwind Trading Ltd, Acme Logistics, Payroll – September (18 people).
  - People: Kwame Mensah, Olivia Mensah.
  - Personal: "AO" with a $24,190.32 USD balance.
- **Money rules applied everywhere:**
  - Symbol first, true minus (`−$450`), no `.00` on whole amounts in lists, cents in breakdowns.
  - Money in shown in blue with a +, money out in ink.
  - Rates written as `$1 = ₦1,359`.
  - Statuses from the StatusBadge table only.
- **Accessibility.** Mockups are `aria-hidden` with a descriptive `alt` on the frame and `inert` contents, so the fake controls stay out of keyboard navigation (as the September plan required).

### Screen assignments

Each mockup uses the named design-system card(s) as its spec.

| Page · slot | Design-system card(s) | What it should show |
|---|---|---|
| Home · hero | **BizHome** in BrowserFrame (no phone; your call) | Total balance, Send / Add money / Create invoice, Money in and out, recent activity with Completed and Processing |
| Home · tab Personal Banking | **AppHome** | USD balance hero, Add money / Send money, recent transactions |
| Home · tab Business Banking | **BizAccounts** | One card per currency with Add money and Move |
| Home · tab Deploy Easner | **WebPartnerShowcase** (new) | The Easner app beside the same app under a fictional partner's brand, and what the partner sets |
| Home · tab Easner API | **BizConsoleDeveloper** | API keys and a webhook delivery log |
| Home · corridor | **AppSend** (amount step) + CurrencyFlag tiles | Rate line, receiving amount, method (bank or mobile money) |
| Home · compliance | **BizVerify**, **BizSecurity** | Verified business, a held payment, authenticator approval |
| Personal · hero | **AppHome** + **AppSend** review, two phones | Replaces the screenshot showing a $0.07 balance |
| Personal · Send money | **AppSend**, **AppSendReview** | Recipient, amount, fee and arrival, all shown before confirming |
| Personal · Named accounts | **AccountCard** / receive details with **CopyField** | Account name, number and routing, copy buttons |
| Personal · Quick sending | **AppRecipient** | Saved recipients and an EASETAG search |
| Personal · Account security | **AppSecurity** | Authenticator **on**, PIN, Face ID: the opposite of today's "2FA OFF" |
| Business · hero | **BizHome** | as above |
| Business · Named accounts | **BizAddMoneyLocal** | Account details in the business's name |
| Business · Supplier payments | **BizSend**, **BizSendReview** | Recipient, amount, rate, Sending from |
| Business · Collections | **BizInvoices** / **BizLinks** / **BizTerminal** | Money in from three sources |
| Business · Team access | **BizSettings** (team roles) | Admin / Finance / View only |
| Invoicing | **BizInvoiceCreate** → **BizInvoicePublic** | Create, then what the payer sees: card, bank, stablecoin |
| Payment Links | **BizLinks** → **BizPayPublic** | Create a link, then the hosted pay panel |
| Checkout | **CheckoutHosted**, **CheckoutEmbedded** | Order summary, Apple Pay, Card or bank / USDC, merchant-tinted pay button |
| Payroll | **BizPayroll** + **AppPayroll** / **AppPayStub** | Run with approvals on the business side; the payday and pay stub the employee sees in the app |
| Stablecoin | **BizReceiveOnramp**, **CopyField**, AppSend wallet method | Network and address clarity, status |
| Cards | **CardFace** ("Coming soon" state), **BizCards** | The design system already has an honest "Coming soon" face: use it |
| Developers | **BizConsoleDeveloper** | Keys, webhooks, Workbench |
| Partners · hero and Branded deployment | **WebPartnerShowcase** | as above; the compliance feature reuses BizVerify |

Checkout is the clearest example of the gap: the design system's CheckoutHosted, a two-column order page with merchant branding, Apple Pay and USDC, looks far more credible than the site's current single-card "Nova Analytics Pro $49.00" mock.

### Order

1. **Kit:** frames, demo data, money and status primitives, a transaction row. These are shared by everything.
2. **Home hero and Personal page:** highest traffic, and Personal carries the trust problems.
3. **Business and Checkout.**
4. **Invoicing, Payment Links, Payroll, Cards, Stablecoin, Developers.**
5. **Partners**, from WebPartnerShowcase.

---

## Phase 4: Copy recommendations

Proposals only. Locked headlines are untouched. Each proposal follows the voice rules: a concrete fact, the qualifier inline once, no hedge sentences, en-dashes.

### Homepage

**Persona: Personal Banking.** The current body uses the retired name "Easner Personal" (see Decisions), and "Your everyday. Your next big thing." says nothing specific.

> **Headline:** Get paid in dollars. Pay anyone, anywhere.
> **Body:** Hold USD, EUR and GBP, receive to account details in your name, and send to banks, mobile money and wallets in 80+ countries – all from the Easner app.

**Persona: Business Banking.** "Get paid. Pay your people. Keep track." is strong. Keep it.

**Product grid card copy:** one verb-led line plus one distinguishing fact each.

| Card | Proposed |
|---|---|
| Personal Banking | Your money in USD, EUR and GBP, with account details in your name. |
| Business Banking | Business accounts, customer payments and supplier payouts in one dashboard. |
| Checkout | Card, bank and USDC payments on your own site, with Easner as merchant of record. |
| Payment Links | Get paid with a link – one-time or recurring, no website needed. |
| Whitelabel programs | Launch cross-border payments under your own brand on Easner infrastructure. |
| Stablecoin Payments | Send and receive USDC and EURC, where enabled, alongside your currency balances. |
| Invoicing | Invoices your customers can pay by card, bank or stablecoin. |
| Payroll | Pay your team in 80+ countries, with approvals before any money moves. |
| Cards | Spend controls for you and your team – when available. |

**Corridor section.** The headline "At home. Around the world." is fine. Shorten the body:

> Hold USD, EUR and GBP. Pay out to banks, mobile money and wallets in 80+ countries, typically within minutes to hours.

The previous version restated "stablecoin-native infrastructure". The hero already says it, and the rules say once per page.

**Compliance band.** Keep "Verification at every step." Tighten the body so it leads with the fact and ends on a benefit:

> Every customer is verified and every payment is screened before it moves. Banking and payment services are provided by licensed partners.

**Final CTA.** "Your next chapter starts here." is generic.

> **Headline:** One account. 80+ countries.
> **Subhead:** Open Easner Personal Banking in the app, or Easner Business Banking on the web.

### Business

- **Hero subhead.** It currently leads with the mechanism ("Stablecoin settlement carries…"). Lead with the outcome:
  > Account details in your business's name, customer payments, invoices and payouts to 80+ countries – in one dashboard, on stablecoin-native rails.
- **Feature titles** in sentence case: "Accounts in your name", "Supplier payments", "Collections", "Team access". Today "Named Accounts" is title case while the others aren't.
- **Use cases:** six customer-type cards, with jobs as links (see 2.2).
- **CTA band:** "Open your Easner Business account" is good. Change the subhead to: "Accounts, collections, payouts and team controls – set up in one place."

### Personal

- **Hero subhead.** "USD and other major currencies" is vague. Name them:
  > Hold USD, EUR and GBP. Top up with card, Apple Pay, Google Pay or ACH, and send to 80+ countries.

  GBP needs the "where supported" qualifier once on the page. Put it in the FAQ rather than here.
- **Account security** feature, once the mockup shows it switched on:
  > Authenticator, PIN and Face ID protect every sign-in and every new recipient.

### Checkout

- **Hero subhead.** Five lines that end on infrastructure. Merchants buy outcomes:
  > Take card, bank and USDC payments on your site, one-time or by subscription, with Easner as merchant of record. Every payment lands in Easner Business.
- **Primary CTA:** "Start with Easner Checkout" → "Get started". The product name is already in the H1 context and in the nav.

### Site-wide

- **Retired naming.** "Easner Personal" appears three times on the homepage (persona body, an FAQ link label, an FAQ answer). Rename per the Decisions answer.
- **No "stablecoin-native" in every section.** The hero states it. Pillars and features describe what the customer sees.
- **Mockup copy follows the product's voice:** sentence-case buttons, statuses from the StatusBadge table only, no "Received"/"Sent" pseudo-statuses ("Completed" is the status; the direction comes from the arrow and the + or −).

---

## Decisions (made October 8, 2026)

1. **Personal-page screenshots: replace all five** with screens built from the design system (AppHome, AppSend and AppSendReview, AccountCard with CopyField, AppRecipient, AppSecurity). The current screenshots show a $0.07 balance, a ₦10 send and two-factor authentication switched off; on a page asking people to trust Easner with their money, that outweighs the September decision to keep them. The coded screens also stay current as the app changes.
2. **Homepage hero: the Business dashboard only** (your call, October 8, overriding my phone-overlay recommendation). BizHome in a browser frame; on phones, a legible crop of its main column (balance, actions, money in and out).
3. **Naming: the website follows `NAMING.md`.** "Easner Personal Banking" for the product, "the Easner app" in running prose, never "Easner Personal". The design-system README's casing example covers product UI, not marketing copy, so no design-system change is needed.
4. **Deploy Easner / Partners visual: designed.** New design-system card **WebPartnerShowcase** (`easnerbanking/design-system/components/WebPartnerShowcase/`). It shows the Easner app beside the same app under a fictional partner ("Harbor Remit", its own colour and logo), plus a panel listing what a partner sets and what Easner runs. It is labelled a website illustration because the product has no partner-branding console yet; it changes only logo, name and accent colour, so it promises nothing the Agency Model doesn't deliver. Replaces the cash-counting photo.
5. **Logo strip: kept for now** (your call).

## Verification

- Every page at 360, 390, 768, 1280 and 1440 wide; no clipped headlines or mockup content.
- Each mockup compared side by side with its design-system card in `viewer.html`.
- Contrast: every text pair at AA. Run axe on each page.
- `grep` for hex in `website/components` and `website/app` returns only brand assets.
- `npm run check:seo`, build and lint pass; TypeScript diagnostics no higher than the current 21.
- Analytics event names and CTA locations unchanged.
