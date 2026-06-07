# Easner Design System

> Modern private banking for global operators – one design system across web
> (Easner Business), admin (Easner Office), and mobile (Easner Personal).

This document is the single source of truth for **tokens**, **primitives**,
**components**, and **usage patterns** across the monorepo. The canonical
token file is `packages/shared/src/design/tokens.ts`; this doc mirrors it and
describes how to consume the tokens across the three apps. **§2.0** defines the
**premium banking palette** (canonical hex + roles); implement new named
keys and CSS variables from that table when extending the codebase.

**Easner Office** (`office/`) follows this document as well: **`tokens.ts`**,
**§2.0** palette roles, motion where applicable, and **`office/components/ui`**
primitives aligned with §6.1. Admin tools may use light/dark theme switching;
stay token-driven (§9.1)–do not introduce one-off hex outside the shared system.

### Customer theme scope (Easner Business + mobile)

**Easner Business** (`business/`) and **Easner Personal** (`mobile/`) ship
**light appearance only**. Design, implement, and QA customer-facing screens
against light backgrounds and light semantic tokens–no user-facing dark mode,
no reliance on dark-theme layouts for those apps. (Other packages or apps in
the monorepo may still define dark tokens for shared CSS or tooling; product
surfaces for Business and mobile stay light.)

### Easner Business (web) vs Easner Personal (mobile) – customer UI identity

**Easner Business** customer UI **stays on the current web identity** documented
in this file: Tailwind + `business/app/globals.css` semantic variables (**§2.2**),
ivory-forward canvas where applicable, `components/ui` primitives (**§6.1**),
and existing layout/radius conventions for web cards and chrome. **Do not
retrofit Business screens to the mobile-only patterns below** unless a
deliberate cross-platform initiative says otherwise.

**Easner Personal (mobile)** ships a **distinct app-kit / neobank identity**
implemented in `mobile/src/theme/*` and shared UI. It reuses the **same brand
blue and success semantics** as §2.0 / `easnerBrand`, but **page canvas, plates,
and component shells** are tuned for a cool-gray + white card stack (see
**§2.3 Mobile** and **§6.2**). Treat the mobile sections below as the
**authoritative product spec for the customer app**; Business remains the
reference for web.

---

## 1. Design principles

1. **Premium private banking, not generic SaaS.** The product should feel
   **trustworthy, global, calm, and executive** – serious money movement with
   **high clarity**. Restraint over exuberance: no rainbow gradients, no neon
   greens, no loud decorative chrome.
2. **Controlled frosted UI (chrome only).** **Glassmorphism is not the main
   look**–solid surfaces carry the brand; blur is accent chrome only (see §4.4).
   **Blur / backdrop frosted effects** are allowed where they improve **system
   chrome**: modal and sheet scrims, sticky web headers, small overlays–always
   **neutral-tinted** (ivory/graphite family via tokens), never primary-filled
   “glass plates.” **Easner Personal** uses a **solid** main tab bar (white +
   hairline); reserve blur for sheets and similar overlays. See §4.4. Do **not**
   replace solid card and page surfaces with full-screen frosted panels that hurt
   readability of balances and compliance copy.
3. **Black + ivory foundation; blue for intent.** Default UI lives on **soft
   ivory** (`#F6F3EB`) and **graphite** (`#0F1110`) neutrals. **Easner blue**
   (`#007ACC`) is for **actions, links, focus, active states, and chart
   accents** – **never** for filling large backgrounds or wash-tinting whole
   screens. Avoid “SaaS blue overload” (screens that read as a blue product
   rather than a bank). Primary is **sparse**; neutrals carry almost all
   surface area.
4. **Sans-first typography.** Use the app sans stack for all UI–including hero
   balances and headlines–using **scale, weight, and letter-spacing** for
   hierarchy. **Tabular numerals** for every monetary figure.
5. **Monochrome by default; primary blue for brand actions; emerald for
   success.** `primary` / `#007ACC` drives CTAs, links, and focus rings.
   **Hover** uses the dedicated hover blue (`#0062A3`) – not a random darker
   blue. Emerald stays for **success** (completed, verified, positive
   outcomes). Red (“oxblood”) is used sparingly for destructive intent –
   never decorative.
6. **Spacious, tactile surfaces.** Generous padding, soft 16–28px radii,
   thin low-contrast borders (`border/60`), layered graphite shadows.
7. **One tokenized truth.** Raw palette in `packages/shared`, re-exported
   through Tailwind CSS variables on web and React Native palette objects on
   mobile. Named constants in `tokens.ts` may grow over time; the **canonical
   hex table** in §2.0 is the north star for brand color roles.

---

## 2. Palette

### 2.0 Core banking palette (canonical hex)

These seven roles define the **premium Easner look**: private-bank restraint
plus clear digital affordances. Use them consistently across web, office,
mobile, email, and PDF.

| Role | Hex | Usage |
| ---- | --- | ----- |
| **Primary blue** | `#007ACC` | Primary buttons, text links, focus rings, key chart series, active nav – **sparingly** on large areas. |
| **Hover blue** | `#0062A3` | Hover states for primary controls and links (paired with primary blue). |
| **Deep navy** | `#0A2540` | Executive emphasis: hero bands, headers, marketing moments, “institutional” contrast – **not** default body text on ivory (use `ink` / foreground tokens). |
| **Graphite black** | `#0F1110` | Premium cards, inverse pills, primary text on light surfaces when paired with ivory. |
| **Soft ivory** | `#F6F3EB` | Default light canvas; warm, calm base. |
| **Light tint** | `#EAF5FD` | Sparse cool highlights: selected rows, info callouts, subtle “blue air” behind content – **not** a second background for whole screens. |
| **Dark mode accent** | `#3AA6F8` | Shared-token accent for dark surfaces (e.g. tooling, Office, emails). **Not** used for Easner Business or mobile customer UI (light-only). |

**Discipline:** If the UI feels “like a blue app,” you’ve used primary/tint
too broadly. Reset to ivory/graphite chrome and reserve blue for actions and
meaning. **Primary color must never paint large page or card backgrounds**–only
neutrals and, where specified, sparse light tint (`#EAF5FD`).

### 2.1 Raw brand tokens (`packages/shared/src/design/tokens.ts`)

The shared `easnerBrand` object holds the **implementable** named constants;
web uses `--primary-hover`, `--surface-tint`, `--brand-navy` in
`globals.css` (and `@theme` as `primary-hover`, `surface-tint`, `brand-navy`).
Mobile mirrors these in `mobile/src/theme/colors.ts` (`brand`).

| Token             | Hex       | Role                                  |
| ----------------- | --------- | ------------------------------------- |
| `graphite`        | `#0F1110` | Primary dark canvas / inverse surface |
| `carbon`          | `#151817` | Elevated dark surface                 |
| `ink`             | `#1C201E` | Deepest text on light canvas          |
| `ivory`           | `#F6F3EB` | Canvas in light mode                  |
| `cloud`           | `#F8F6F0` | Off-white plates / secondary canvas   |
| `mist`            | `#E9E4D8` | Hairline dividers                     |
| `stone`           | `#D9D4C7` | Inactive input borders                |
| `slate`           | `#6F756F` | Secondary text / muted icons          |
| `primary`         | `#007ACC` | **Brand primary** (CTAs, links, ring) |
| `primaryHover`    | `#0062A3` | Hover for primary controls (§2.0)     |
| `primaryDeep`     | `#005A9E` | Pressed / dark end of primary ramp    |
| `navy`            | `#0A2540` | Deep navy – executive emphasis (§2.0) |
| `tintBlue`        | `#EAF5FD` | Light tint – sparse selection/info (§2.0) |
| `darkAccent`      | `#3AA6F8` | Shared-token accent for dark surfaces (Office, tooling, email). Not used for Easner Business or mobile UI. |
| `darkPrimaryHover`| `#2B8FDC` | Paired accent for gradients on dark canvases where those surfaces exist (not customer Business/mobile). |
| `emerald`         | `#0F8A5F` | **Success** / verified / positive     |
| `emeraldDeep`     | `#0A6E4C` | Success emphasis / dark success text  |
| `amber`           | `#A8792A` | Warning (never a highlight)           |
| `oxblood`         | `#7A2E2E` | Destructive (never decorative)        |

### 2.2 Semantic map (web)

These are the Tailwind CSS variables exposed by `business/app/globals.css`
and mirrored in `office/app/globals.css`. **Easner Business** implements and
reviews customer UI against the **Light** column only. A **Dark** column may
still exist in shared CSS for other apps or utilities–do not ship Easner
Business layouts against dark tokens.

| CSS variable        | Light (HSL)       | Dark (HSL)        | Tailwind class                  |
| ------------------- | ----------------- | ----------------- | ------------------------------- |
| `--background`      | `42 38% 97%`      | `120 6% 8%`       | `bg-background`                 |
| `--foreground`      | `135 7% 12%`      | `42 33% 95%`      | `text-foreground`               |
| `--card`            | `0 0% 100%`       | `120 7% 9%`       | `bg-card`                       |
| `--muted`           | `42 33% 92%`      | `135 5% 14%`      | `bg-muted`                      |
| `--muted-foreground`| `120 3% 45%`      | `42 15% 70%`      | `text-muted-foreground`         |
| `--border`          | `42 28% 85%`      | `135 5% 18%`      | `border-border`                 |
| `--primary`         | `204 100% 40%`    | `204 100% 52%`    | `bg-primary`, `text-primary`    |
| `--destructive`     | `0 45% 33%`       | `0 45% 45%`       | `bg-destructive`                |
| `--warning`         | `37 61% 41%`      | `37 61% 50%`      | `bg-warning`                    |
| `--success`         | `156 80% 30%`     | `156 80% 34%`     | `bg-success` (emerald)          |
| `--sidebar`         | `42 33% 95%`      | `120 6% 8%`       | `bg-sidebar`                    |
| `--sidebar-border`  | `42 28% 85%`      | `135 5% 16%`      | `border-sidebar-border`         |

**Rules for semantic usage:**

* `primary` (blue): primary action on a surface, links, and focus ring;
  active nav indicator. Do not use for generic “success” – use `success` /
  emerald. Do not paint whole cards or page backgrounds primary blue; use
  ivory/graphite and **light tint** (`#EAF5FD`) only where a cool highlight is
  needed.
* **Hover:** interactive hover for primary should track **hover blue**
  (`#0062A3`) once exposed as `--primary-hover` or equivalent – not an
  arbitrary `primary/90`.
* **Deep navy** (`#0A2540`): reserved for high-contrast brand moments, not
  default `text-foreground` on ivory (that remains ink/graphite via tokens).
* **Easner Business + mobile:** stay on light surfaces and `#007ACC` primary
  semantics; ignore dark-column tokens for customer-facing screens in those
  apps.
* `destructive` / oxblood: only for destructive confirmations and failed
  status – **never** for debit amounts or expense categories.
* `warning` / amber: pending states, soft warnings. Never a success or
  "in progress".
* Neutrals (`muted`, `border`) carry all non-accent chrome.

### 2.3 Mobile palette (`mobile/src/theme/colors.ts`) – **Easner Personal app identity**

The mobile palette is **light-only** for customers: resolve UI with
`useThemeColors()` even where optional dark keys exist for typings or future
use. It **does not** mirror the web HSL table in §2.2 row-for-row; instead it
implements the **mobile app canvas + plate system** below while keeping **§2.0
brand blues and emerald** for actions and success.

**Canvas vs plates (core idea)**

| Role | Typical token / value | Use |
| ---- | -------------------- | --- |
| **App canvas** | `semantic.background` (`#F4F5F7`) | Full-screen background behind scroll content; cool gray, not warm ivory. |
| **Raised plate / card** | `frame.background` (`#FFFFFF`) + `frame.border` | `surfaceFrameStyle()` – section trays, list shells, form cards (`SectionCard`, profile blocks). |
| **Inset / muted field** | `frame` fill on read-only rows, `background.primary` on editable inputs | Profile view vs edit; OTP cells (`otpCodeBoxVisual`). |
| **Primary** | `primary.main` `#007ACC` | CTAs, links, focus, key affordances – still **sparse** on large areas (§1–§2.0). |
| **Hero gradient** | `primary.heroGradient` (`#007ACC` → `#0EA5E9`) | Dashboard balance hero and other **controlled** sky-blue moments – not a default page wash. |
| **Text** | `text.primary` / `text.secondary` / `text.tertiary` | Slate-scale ink on light; use hierarchy + weight, not extra hues. |
| **Destructive** | `error.*` / `semantic.destructive` | Failures, destructive actions, insufficient-balance emphasis – not decorative. |

```ts
const palette = useThemeColors()

palette.semantic.background // app canvas
palette.frame.background      // white plate
palette.frame.border          // plate hairline
palette.primary.main          // #007ACC
palette.primary.heroGradient  // sky hero strip (tuple)
palette.text.primary
palette.success.main          // e.g. #16A34A (mobile success ramp)
```

Always consume the palette via `useThemeColors()` – do **not** import
`lightColors` / `darkColors` directly from components.

**Relationship to Easner Business:** Web customer UI remains **§2.2** + ivory
grammar; mobile uses the **table above** for new and refreshed screens. Shared
`easnerBrand` in `packages/shared` is still the single raw source for blues and
neutrals where names align.

---

## 3. Typography

Use **sans only** for Easner Business and mobile–no serif display face. Hierarchy
comes from **type scale, weight, tracking, and color**, not a second family.

### 3.1 Stacks

| Stack          | Role                                      | Where                         |
| -------------- | ----------------------------------------- | ----------------------------- |
| **Sans**       | All UI–navigation, body, hero money, titles | Web: Geist Sans via Tailwind `font-sans`. Mobile: Geist faces registered in `mobile/App.tsx`. |
| **Monospace**  | Code strings, wallet addresses            | Web: Geist Mono where needed  |

Do not mix multiple sans families on the same surface (one loaded sans stack
per app).

### 3.2 Web scale

| Utility / token | Weight | Size / line-height | Use                           |
| --------------- | ------ | ------------------ | ----------------------------- |
| `font-sans text-[44px] leading-[52px] tabular-nums` | 500–600 | 44 / 52 | Hero balance |
| `font-sans text-[32px] tabular-nums` | 600 | 32 / 40 | Section title / large stat |
| `text-3xl font-semibold tracking-tight` | 600 | 28–32 / 36 | Page header                   |
| `text-lg font-semibold` | 600 | 18 / 28 | Card title                    |
| `text-sm` | 400–500 | 14 / 20 | Body                          |
| `text-xs text-muted-foreground` | 400–500 | 12 / 16 | Meta                          |
| `text-[11px] uppercase tracking-[0.12em]` | 600 | 11 / 16 | Eyebrows / label caps         |

All monetary numbers use `tabular-nums` (wired through
`font-feature-settings: "tnum"` in `globals.css`).

### 3.3 Mobile scale (`mobile/src/theme/typography.ts`)

Use the exported `textStyles` / size tokens–hero balances and large amounts use
the **largest sans sizes** (e.g. `balanceDisplay`, display steps) with **bold or
semibold** weights and tabular figures, not a separate font family. Align names
in code over time with this doc (legacy token names may still say “serif” in
identifiers–treat them as **large sans** roles).

**Auth & secondary flows:** `theme/authScreen.ts` defines **`screenTitle`**
(display-class) for **sign-in / sign-up entry** only, and **`screenTitleCompact`**
(headline-medium scale) for OTP, forgot password, reset password, and similar
steps so hierarchy stays calm next to the app canvas.

---

## 4. Spacing, radius, shadows

### 4.1 Spacing (4 px grid)

`0, 1 (4), 2 (8), 3 (12), 4 (16), 5 (20), 6 (24), 7 (28), 8 (32), 10 (40), 12 (48), 16 (64), 20 (80), 24 (96)`

Premium surfaces prefer `p-6` / `p-8` (24–32 px) over the tighter defaults of
stock Shadcn. On mobile, cards typically use `spacing[5]` / `spacing[6]`.

### 4.2 Radius

| Token     | Value  | Use                                |
| --------- | ------ | ---------------------------------- |
| `sm`      | 8 px   | Dense chips / inline controls      |
| `md`      | 12 px  | Inputs, small cards                |
| `lg`      | 16 px  | Buttons                            |
| `xl`      | 20 px  | Inputs on web, form surfaces       |
| `2xl`     | 22 px  | Popovers, tooltips                 |
| `3xl`     | 28 px  | Dialogs, cards, panels             |
| `full`    | 9999   | Pills, avatars                     |

**Easner Business (web):** buttons use `rounded-xl` or `rounded-2xl`. Cards use
`rounded-3xl`. The **xl = 20 px** column reflects **web** Tailwind-style naming
in this table.

**Easner Personal (mobile):** `mobile/src/theme/index.ts` exports **`borderRadius`**
keys that **do not** share the same pixel values as the **web** table above
(e.g. mobile **`xl` is 16 px**, not 20 px). Use this map when wiring RN styles;
do not assume Tailwind `rounded-xl` semantics on mobile.

**Mobile `borderRadius` map** (`mobile/src/theme/index.ts`):

| Key (`borderRadius.*`) | Pixels | Typical use |
| ---------------------- | ------ | ----------- |
| `none` | 0 | Flush edges, dividers |
| `sm` | 4 | Tiny wells, tight chips |
| `md` | 8 | Compact controls |
| `lg` | 12 | Secondary surfaces |
| `xl` | 16 | **`Button`**, **`TextField`**, OTP cells (`otpCodeBoxVisual`) |
| `2xl` | 20 | Default **`SectionCard`** radius |
| `3xl` | 24 | Larger plates; matches **`SURFACE_FRAME_RADIUS_DEFAULT`** |
| `4xl` | 28 | Hero-scale cards where needed |
| `full` | 9999 | Pills, avatars, circular chrome |

---

### 4.3 Shadows

Every shadow is pure graphite, no color bloom:

| Token          | Web class / CSS var          | Use                          |
| -------------- | ---------------------------- | ---------------------------- |
| `shadow-soft`  | `--shadow-card`              | Default card elevation       |
| `shadow-lift`  | `--shadow-lift`              | Hovered button / modal       |
| `shadow-inset` | `--shadow-inset`             | Subtle inner highlight       |

Mobile: `shadows.sm` (4 px), `shadows.md` (12 px), `shadows.lg` (24 px) from
`mobile/src/theme/shadows.ts`. Mobile tokens keep the API names
(`xs/sm/md/lg/xl/primary/success/glow/inner`) but are all graphite-based, and
`primary`/`success`/`glow` now resolve to the same soft graphite drop-shadow
(no colored glow).

### 4.4 Frosted / blur surfaces (controlled)

**Glassmorphism is not the main look.** The product identity is grounded in **solid**
canvases and cards (ivory/graphite tokens), typography, and restrained primary
blue–not frosted blur as the dominant aesthetic. Frost and backdrop blur are
**supporting chrome** for system surfaces (tab bars, sheets, sticky headers,
scrims, small overlays). They **do not** replace solid card bodies, balances,
or compliance-heavy layouts.

**Allowed** – token-backed, neutral frosted **chrome** only:

* **Easner Business:** translucent sticky headers (`backdrop-blur` + muted
  background), dialog and alert **scrims** (`backdrop-blur-sm` over graphite),
  chart tooltips and small overlays that keep content readable.
* **Easner Personal (mobile):** the **main tab bar** is **solid** – white
  (`semantic.card`) with a **hairline top border** and **no** backdrop blur
  (`AppNavigator` tab chrome). **`BlurView`** / `palette.glass.*` remain for
  **sheets** (`PremiumModalSheet`, alerts) and other **overlay chrome** where
  tokens already define glass; optional blur on narrow surfaces (e.g. card
  chrome) when consistent with tokens.

**Not allowed** – decorative “glassmorphism” as the **main surface language**:
full cards or full screens dominated by blur, neon edge glows, or **primary-tinted**
frosted fields. **Legibility of money and compliance copy beats blur intensity.**

---

## 5. Motion

| Token    | Value                      | Use                                      |
| -------- | -------------------------- | ---------------------------------------- |
| `instant`| 0 ms                       | No transition (intentional static)        |
| `fast`   | 150 ms ease-out            | Hover, focus                              |
| `normal` | 250 ms ease-out            | Button press, tooltip, dropdown           |
| `slow`   | 400 ms cubic-bezier        | Dialog enter/exit, sheet                  |
| `slower` | 600 ms cubic-bezier        | Page transition, hero reveal              |

Buttons nudge by `0.5px` on press (`active:translate-y-[0.5px]`) – the
only "physical" motion allowed on click.

**Mobile (`mobile/src/theme/motion.ts`):** use the exported durations so RN
matches the same intent – `sheetMs` (~250) with sheets and large surfaces,
`tapMs` for micro-interactions, `screenEnterMs` / `listRowEnterMs` for screen
and list entrances. Prefer these constants over ad hoc timing values.

---

## 6. Components

### 6.0 Reference flows (quality bar)

Ship tokens, motion (§5), and primitives consistently first on:

* **Easner Business (web):** **Dashboard**, **Send money** (amount / key
  confirmation), **Transactions** list and row patterns.
* **Easner Personal (mobile):** same flows plus **More**, **Profile / edit**,
  **Auth / MFA / PIN**, and **transaction details** – these screens define the
  **cool-gray canvas + white `SectionCard` + sky hero** kit (**§2.3**, **§6.2**).

Other screens should converge to the same bar over time.

### 6.1 Web primitives (business + office)

All ship from `components/ui` on each app:

| Primitive      | Variants                                                                   | Notes |
| -------------- | -------------------------------------------------------------------------- | ----- |
| `Button`       | `default`, `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link` | `primary` = Easner blue; `default` = graphite. Sizes `sm / default / lg / icon / icon-sm`. |
| `Card`         | `elevation: flat | soft | card | lift`                                     | Default `rounded-3xl border border-border/60 bg-card shadow-soft` |
| `Input`        | –                                                                          | `h-12 rounded-2xl border-border/70` with subtle inset highlight |
| `Badge`        | `neutral | emerald | amber | oxblood | slate | outline | solid`            | Emerald = success; amber = pending; oxblood = failed; slate = cancelled. |
| `Alert`        | `default | info | success | warning | destructive`                        | Soft background + hairline border |
| `Dialog`       | –                                                                          | `bg-graphite/60 backdrop-blur` overlay, `rounded-3xl` content |
| `AlertDialog`  | –                                                                          | Matches Dialog |
| `Table`        | –                                                                          | `h-12` rows, tabular figures, `hover:bg-muted/60` |
| `Tooltip` / `Popover` (office) | –                                                          | `rounded-2xl border-border/60 shadow-card` |
| `Avatar`       | –                                                                          | `rounded-full bg-muted ring-1 ring-border/60` |
| `sonner`       | –                                                                          | Card-like toast: `rounded-2xl bg-card`; success styling uses emerald / `success` |

### 6.2 Mobile primitives (`mobile/src/components/*`)

**Surfaces & layout**

* **`theme/surfaceFrame.ts`** – `surfaceFrameStyle()` / `surfaceChromeCircleStyle()`
  for **white framed plates** on the gray canvas (hairline `frame.border`,
  graphite shadow). **`surfaceChromeCircleStyle(..., 44)`** is the default
  **header back / icon** hit target (24 px icons inside).
* **`ui/SectionCard.tsx`** – canonical **raised section card** (default radius
  **`2xl`**, configurable shadow).
* **`ui/Surface.tsx`** – themed inset / alternate card surface where a full
  `SectionCard` is not needed.

**Controls & data**

* **`ui/Button.tsx`** – primary / secondary / ghost / outline; corners use
  **`borderRadius.xl`** (16 px) for parity with inputs.
* **`ui/TextField.tsx`** – tall field row, **`borderRadius.xl`**, mist/ink border.
* **`ui/OtpCodeInput.tsx`** + **`theme/otpCodeBoxVisual.ts`** – six framed cells
  (idle **1 px** `border.dark`, active/focus **primary**); shared sizing with
  auth screens.
* **`ui/StatusPill.tsx`**, **`ui/FilterChip.tsx`** – status and filter affordances
  on Activity / details.
* **`BottomButton.tsx`** – full-width primary CTA (primary intent).

**Premium layer**

* `mobile/src/components/premium/` – `GlossyPrimaryButton`,
  `SecondaryOutlineButton`, `PremiumModalSheet`, `PremiumSurface`, `GradientCard`,
  `ShimmerLoader`, `HapticButton`, etc. Use for high-touch flows; keep primary
  usage **sparse** (§1–§2).

**Icons**

* Prefer **Lucide** (`lucide-react-native`) for product UI on a screen; avoid
  mixing icon packs on the same screen so patterns stay consistent.

### 6.3 Example patterns

Reference components live in:

* `business/components/examples/` – `BalanceCard`, `TransactionRow`,
  `TreasuryStatCard`, `FxConversionPanel`.
* `mobile/src/components/examples/` – `PremiumWalletCard`, `BalanceCard`,
  `TransactionRow`, `TreasuryStatCard`, `FxConversionPanel`.

They demonstrate:

* **Hero balance** – large sans, tabular figures, 44 px web / ~48 px mobile hero scale.
* **Positive delta** – typically success / emerald tone; no bright red for
  negative deltas.
* **Wallet card** – graphite gradient only; accent color on wordmark only.
  Physical vs virtual variant.

---

## 7. Charts

Use `business/components/charts/chart-primitives.tsx` which wraps `recharts`:

* `easnerChartColors` – monochrome palette; first series uses `chart-1`
  (primary blue) for the lead metric (balance, inflow).
* `easnerChartAxisProps` – graphite axis, `tabular-nums` tick label.
* `EasnerChartTooltip` – card-styled tooltip with hairline border.
* `BalanceSparkline` – tone-aware sparkline (positive = emerald, flat/negative
  = graphite).

Do not import colors directly – always pass the `easnerChart*` helpers.

---

## 8. Emails & PDFs

### 8.1 Transactional emails (`packages/server/lib`)

* `generateBaseEmailTemplate` – ivory canvas, white card, bold sans title,
  primary blue CTA button (pill shape), graphite body copy.
* Status badges are brand-mapped:
  * `status-pending`   → amber (`#FAF1DB`/`#8A6221`)
  * `status-processing`→ stone (`#EFECE2`/`#3D403D`)
  * `status-completed` → emerald (`#E6F4EC`/`#0A6E4C`)
  * `status-failed`    → oxblood (`#F4E5E5`/`#5F2424`)
  * `status-cancelled` → slate (`#EFECE2`/`#6F756F`)
* Dark-mode email variant (where supported) keeps primary blue CTA and graphite
  surfaces–separate from Easner Business / mobile product scope.

### 8.2 PDF documents (`business/components/*-pdf-document.tsx`)

Most `@react-pdf/renderer` stylesheets use graphite `#0F1110`, slate
`#6F756F`, ivory `#F6F3EB`, primary `#007ACC` for brand bars/accents;
success copy may still use emerald `#0F8A5F` where semantic. The autopay placard card
(`render-placard-pdf.tsx` / `render-placard-hd-png.ts`) uses a graphite
linear gradient (`#0F1110` → `#151817` → `#1C201E`) instead of the old
purple/indigo one.

---

## 9. How to consume

### 9.1 Web (`business/`, `office/`)

**Easner Office** uses the same design-system contracts as Business: import UI from
`@/components/ui/*`, map semantics through shared CSS variables in
`office/app/globals.css`, and extend behavior only via tokens–not parallel palette
forks. Office **may** switch light/dark theme per layout (e.g. `next-themes`);
mapped variables must still trace to **§2.0** / `tokens.ts`.

Customer-facing **Easner Business** screens follow **light-only** semantics (§9.3).

```tsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

<Card elevation="card">
  <h3 className="font-sans text-2xl font-semibold tracking-tight">
    Total balance
  </h3>
  <p className="font-sans text-[44px] leading-[52px] tabular-nums font-medium">
    $248,190.32
  </p>
  <Badge variant="emerald">+2.14%</Badge>
  <Button variant="primary">Deposit</Button>
</Card>
```

### 9.2 Mobile

```tsx
import { BalanceCard, TransactionRow } from "@/components/examples"
import { useThemeColors, textStyles } from "@/theme"

const palette = useThemeColors()

<BalanceCard
  label="Total balance"
  amount={248190.32}
  deltaPct={2.14}
  primaryAction={{ label: "Deposit", onPress: handleDeposit }}
/>

<Text style={[textStyles.balanceDisplay, { color: palette.text.primary }]}>
  $248,190.32
</Text>
```

### 9.3 Theme (Business + mobile)

* **Easner Business** (`business/`): ship **light appearance only** for customer
  UI. Do not rely on `dark` class or dark semantic tokens for Business screens,
  even if shared CSS defines dark variables for other packages.
* **Easner Personal** (`mobile/`): **light only**–no user-facing dark mode;
  `ThemePaletteProvider` and navigation chrome target light semantics.

Other apps (e.g. **Easner Office**) may still use `next-themes` or equivalent
where configured; that does not change Business or mobile policy above.

---

## 10. Anti-patterns

* ❌ **SaaS blue overload** – full-width blue sections, blue page backgrounds,
  or blue-heavy marketing chrome. Reset to ivory/graphite; use primary blue
  and light tint sparingly.
* ❌ Off-palette blues, indigo, or purple gradients – use tokenized primary
  (`#007ACC`), hover (`#0062A3`), and §2.0 accents only.
* ❌ Neon/spring green (`#00D632`, `#34D399`) – emerald `#0F8A5F` only.
* ❌ `text-red-600` / bright `#EF4444` – use `text-destructive` or oxblood
  `#7A2E2E`.
* ❌ Hardcoded hex values in components – always go through tokens,
  Tailwind CSS variables, or `useThemeColors()`.
* ❌ **Decorative glassmorphism** – full-screen or dominant-card UI built from
  blur/frost instead of solid ivory/graphite surfaces; neon rim glows;
  primary-tinted frosted panels. Token frosted **chrome** is allowed (§4.4).
* ❌ Colored shadows (`shadowColor: primary`) on mobile – shadows are always
  graphite.
* ❌ Mixing multiple sans families on one surface–use one loaded stack per app.

---

## 11. Source of truth

| File                                                         | Purpose                                |
| ------------------------------------------------------------ | -------------------------------------- |
| `packages/shared/src/design/tokens.ts`                       | Raw palette + HSL tuples + scales      |
| `business/app/globals.css` / `office/app/globals.css`        | Web CSS variables & Tailwind theme     |
| `business/components/ui/*` / `office/components/ui/*`        | Web component primitives               |
| `business/components/charts/chart-primitives.tsx`            | Chart wrappers                         |
| `business/components/examples/*` / `mobile/src/components/examples/*` | Reference compositions        |
| `mobile/src/theme/colors.ts`                                 | Mobile palette (customer app: light-only) |
| `mobile/src/theme/surfaceFrame.ts`                           | Framed plates + circular header chrome |
| `mobile/src/theme/otpCodeBoxVisual.ts`                       | OTP cell frame tokens                  |
| `mobile/src/theme/typography.ts`                             | Mobile type scale                      |
| `mobile/src/theme/shadows.ts`                                | Mobile shadow scale                    |
| `mobile/src/contexts/ThemePaletteContext.tsx`                | Mobile theme provider / hooks          |
| `mobile/src/theme/surfaces.ts`                               | Glass-related semantic surface helpers |
| `mobile/src/theme/motion.ts`                                | Mobile motion durations (pairs with §5) |
| `packages/server/lib/email-generator.ts`                     | Email CSS + template frame             |
| `business/lib/invoice-email-template.ts`                     | B2B invoice email (primary CTA)        |

### Linked design artifacts

Keep **Figma libraries** (team-owned files) aligned with variable **names** from
`tokens.ts` / §2.2–document internal links or file keys in your team wiki; this
repo references behavior here, not embedded canvas URLs.

---

## 12. Design files & Figma MCP

### Variable parity

* **Color / spacing / radius / elevation** in Figma should mirror **`packages/shared/src/design/tokens.ts`** and web semantic names (§2.2) so designers and engineers share one vocabulary.
* **Easner Business + Easner Personal (mobile)** frames use **light appearance only** (see **Theme scope** at the top of this document; §9.3)–no requirement to maintain dark-mode variants for customer product mocks.

### Workflow

1. **Library first** – extend variables before inventing one-off hex on frames.
2. **Pilot screens** – compose §6.0 reference flows from components + tokens (Dashboard, Send, Transactions).
3. **Implementation** – ship via **`business/components/ui/*`** and **`mobile/src/components/ui/*`** / **`premium/`**; avoid styles that violate §10.

### Figma MCP skills (Cursor)

| Skill / usage | Role |
| ------------- | ---- |
| **`figma-generate-library`** | Build or refresh Figma variables/tokens from the codebase narrative (§2, §4). |
| **`figma-generate-design`** (+ **`figma-use`**) | Assemble or update full screens in Figma from tokens; load **`figma-use`** before any **`use_figma`** execution. |
| **`figma-implement-design`** | Turn approved frames into code using primitives above. |
| **`figma-code-connect`** | Optional: map key components (e.g. `Card`, `Button`, `PremiumSurface`, `GlossyPrimaryButton`, `PremiumModalSheet`) to Figma components for designer–dev parity. |
| **`create_design_system_rules`** | Generates repo-aware prompts; keep **`docs/design-system.md`** authoritative when tokens change. |

When in doubt, read the example components in each app first – they show
the intended composition of tokens.
