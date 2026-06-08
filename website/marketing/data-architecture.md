# Easner Frontend Data Architecture

This document is the canonical reference for how Easner loads, caches,
persists, and live-updates data across all three surfaces:

- **Easner Business** (`business/`, Next.js App Router) — Easner Business Banking
- **Easner Office** (`office/`, Next.js App Router)
- **Easner Mobile** (`mobile/`, Expo + React Native) — Easner Personal Banking

It summarises the sections of the accompanying plan in
`.plans/easner_data_architecture_*.plan.md` and links to the concrete code
artifacts so engineers can find the right abstraction without reading the
whole plan again.

The product goals the architecture is optimised for:

1. **Instant app feel.** The first thing a user sees on any screen is real
   data, never a skeleton chain.
2. **Trust on money-facing data.** Balances are authoritative and never
   move optimistically; ledger rows can, with a clear "Pending" pill.
3. **Minimal waterfalls and battery drain.** Polling is a fallback, not a
   strategy; realtime is reserved for truly critical state.
4. **Offline-friendly.** Mobile shows a last-known copy on cold launch.
5. **Clean multi-entity separation.** Switching entities on web never
   leaks data and never unmounts the shell.

---

## 1. Three-layer data model

| Layer | Lives in | Refresh trigger | Notes |
| --- | --- | --- | --- |
| **Server snapshot** | route `page.tsx` / `layout.tsx` server components (RSC) | per request | Prefetches the critical-freshness queries and hands them to the client via `HydrationBoundary`. |
| **Client cache (TanStack Query v5)** | Per-request on server, singleton in the browser, one-per-user on mobile | SWR (`staleTime`, focus, reconnect) | Single source of truth for every screen. |
| **Realtime updates** | Supabase Realtime `postgres_changes` | server events | Surgically mutates cache entries. Only wired for critical tables. |

See:
- `packages/shared/src/query/client.ts` — `createBaseQueryClient`
- `business/app/dashboard/page.tsx` — SSR prefetch + hydration
- `packages/shared/src/query/realtime.ts` — realtime bridge

## 2. Shared query package

All cross-surface primitives live in `@easner/shared`:

- `qk` — typed query key factory (`packages/shared/src/query/keys.ts`).
  Never build query keys by hand; always go through `qk.*`.
- `Scope` / `scopeKey` — data-isolation tuple for multi-entity/multi-user
  (`packages/shared/src/query/scope.ts`).
- `createBaseQueryClient` — canonical defaults tuned for a fintech SWR
  feel (`packages/shared/src/query/client.ts`).
- `attachRealtime` — Supabase → Query bridge with batching, version
  guarding, and list prepend helpers (`realtime.ts`).
- `UX` — shared UX thresholds (`ux-rules.ts`).
- `STORAGE_POLICY` — the matrix of what can live where on web vs mobile
  (`storage-policy.ts`).
- `pollingIntervalFor` — opt-in polling fallback, tied to realtime
  health (`polling-fallback.ts`).

## 3. Query meta tags

Every query opts into persistence and SSR behaviour via `meta`:

```ts
meta: {
  safePersist?: boolean   // mobile-only; never set for sensitive data
  noDehydrate?: boolean   // skip SSR hydration
  freshness?: "critical" | "operational" | "reference" | "analytics"
}
```

`meta.safePersist === true` is the **only** way a query lands in
`AsyncStorage` on mobile. Never tag balances, session secrets, card
numbers, or KYC status as safePersist.

## 4. Web provider layering

`business/components/providers.tsx` sets up (top-down):

1. `QueryClientProvider` — singleton browser client.
2. `BusinessScopeProvider` — derives the active scope from the session.
3. `ScopeRealtimeBridge` — one Supabase channel per scope, publishes
   `RealtimeHealth` via `RealtimeHealthContext`.
4. `InvoiceModuleStoreSync` — mirrors the invoices query into the legacy
   invoice module store for compatibility during migration.

Legacy data helpers such as `useTransactionsCached` and
`useCachedData` are compatibility shims over TanStack Query hooks. Call
sites can migrate piecemeal without a flag day.

## 5. Mobile provider layering

`mobile/App.tsx` mounts `<QueryProvider>` between `AuthProvider` and the
legacy context tree. `QueryProvider` owns:

- the lifetime QueryClient
- AsyncStorage persistence (`mobile/src/query/persister.ts`, filtered to
  `meta.safePersist` only, busted on `APP_BUILD_ID`)
- AppState → focusManager bridge
- the scope context and realtime subscription
- `RealtimeHealthContext` for opt-in polling fallback

`BalanceContext` is now a thin shim over `useWalletBalances` so screens
keep the `{ balances, refreshBalances, updateBalanceOptimistically }`
surface while data flows through the Query cache.

## 6. SSR snapshot + hydration

Server components that sit above a data-dense surface:

1. Resolve the scope from the signed cookie (`business/lib/server/scope.ts`).
2. Create a per-request `createBaseQueryClient()`.
3. `prefetchQuery` / `prefetchInfiniteQuery` for critical data using
   `serverApiFetch` (`business/lib/server/api.ts`).
4. `dehydrate(qc)` into a `<HydrationBoundary>`.

`business/app/dashboard/page.tsx` is the canonical example. The paired
`business/app/dashboard/layout.tsx` remains shell-only so client-side
navigation stays instant.

## 7. Query hooks

Per-domain hooks live under `business/hooks/queries/` and
`mobile/src/hooks/queries/`. Each file tunes `staleTime`, `gcTime`, and
`meta.freshness` for its data and documents the realtime contract.

Mutation hooks mirror the layout (`hooks/mutations/`) and follow the
optimistic/pessimistic matrix from §9 of the plan:

- **Never optimistic:** balances, approvals of money-moving actions, KYC.
- **Optimistic row, pessimistic state:** transfers (pending row
  prepended; never nudges balances).
- **Fully optimistic:** non-destructive metadata (tagging a transaction,
  marking a notification read).

## 8. Realtime contract

- One multiplexed channel per `Scope` on Business and Personal; Office uses a
  separate platform-wide admin channel (see §8a).
- Events are debounced at 50 ms per `queryKey` to coalesce bursts.
- Every write is version-guarded via `pickNewer` (`version`,
  `updated_at` fallback) before touching cache.
- Transaction list UPDATE events patch cached infinite-query pages via
  `patchRowInPages`; INSERT events invalidate the active transactions
  queries (list rows are API-mapped shapes, so prepend is deferred until
  a shared mapper exists).
- Sibling pages are marked `inactive` so they revalidate lazily.

Channel health is exposed via `RealtimeHealth`. Surfaces that want a
fallback poll call:

```ts
refetchInterval: pollingIntervalFor("critical", useRealtimeHealth()),
```

### 8a. Office admin realtime

Office subscribes to platform-wide ledger changes via
`office/lib/query/attach-office-realtime.ts`, wired in
`OfficeQueryProvider` through `OfficeRealtimeBridge` (gated on
`useOfficeAdminEnabled`).

| Table | Events | Cache effect |
| --- | --- | --- |
| `transactions` | INSERT, UPDATE | Invalidate `officeKeys.transactions()` + overview presets |
| `users` | INSERT, UPDATE | Invalidate `officeKeys.users()` + overview |
| `wallet_balances` | * | Invalidate overview KPIs |

Supabase Realtime respects RLS — active office admins receive row events
via `is_active_office_admin()` policies (see migration
`20250530120000_transactions_hidden_from_feed.sql`).

Health is exposed through `useOfficeRealtimeHealth()` for optional
reconnect banners; transaction lists do not poll while the channel is
healthy.

## 8b. PostgREST egress — transaction lists

Transaction **list** reads intentionally omit the `payload` column and
filter with `hidden_from_feed = false` at query time so a single indexed
Supabase round-trip powers each page.

| Constant | Used by |
| --- | --- |
| `LEDGER_LIST_SELECT` | `GET /api/transactions`, personal mobile list |
| `LEDGER_DETAIL_SELECT` | `GET /api/transactions/[id]` (full payload + enrichment) |
| `OFFICE_LEDGER_LIST_SELECT` | Office admin transaction loaders |

Defaults:

- Page size **50** (max **100** on user API); cursor is keyset on
  `(occurred_at DESC, created_at DESC, id DESC)`.
- `hidden_from_feed` is set at upsert via `resolveHiddenFromFeed()` —
  runtime suppression scans are not run on the list path.
- The transactions list route logs `[ledger-list]` metrics:
  `row_count`, `response_bytes`, `supabase_query_count`, `duration_ms`.

Backfill scripts (one-time, not per-request):

- `business/scripts/backfill-bank-deposit-pay-in.ts` — sender/rail metadata
- `business/scripts/backfill-hidden-from-feed.ts` — `hidden_from_feed` column

## 9. UX primitives

Found under `business/components/data/` and
`mobile/src/components/data/`:

- `RefreshedAt` — subtle "Updated Xs ago" that stays silent until data is
  actually old.
- `InlineCardError` — inline banner that keeps the last-known values on
  screen; full-screen errors are reserved for first-ever renders.
- `PendingBadge` — quiet pill for optimistic rows.
- `VirtualizedTransactions` (web) / `TransactionsList` (mobile) —
  windowed ledger primitives that plug into `useInfiniteQuery`.
- `useHoverPrefetch` (web) / `usePressPrefetch` (mobile) — row-level
  prefetch so detail screens open on populated cache.

## 9a. Loading contract

This contract is mandatory for every data-bearing screen, route section,
card, or list across Business, Mobile, and Office:

- Show a skeleton only when the first request is pending **and** there is
  no hydrated, cached, placeholder, or persisted-safe data to render.
- When data already exists, keep rendering it while `isFetching` /
  `isRefetching`; background refresh must never collapse the page back to
  a blank state or full-page skeleton.
- When a refetch fails after prior success, keep the stale data visible
  and show an inline error treatment.
- Show an empty state only after a successful empty response, never as a
  placeholder for “still loading”.
- Do not persist raw balances to disk. If a surface needs instant paint
  for money data, use query hydration, in-memory cache continuity, or
  realtime-backed refresh instead of ad-hoc storage.

## 10. Storage policy

`STORAGE_POLICY` in the shared package is the single source of truth.
Summarised:

- **Web session** → `httpOnly` cookies only.
- **Web UI prefs** (theme, layout toggles) → `localStorage`.
- **Mobile cache** → `AsyncStorage`, filtered by `meta.safePersist`.
- **Mobile balance-adjacent hints** → only non-sensitive metadata such as
  `lastKnown.balanceMetadata` when explicitly allowed by
  `STORAGE_POLICY`; never raw balances.
- **Mobile secrets** (refresh tokens, PIN salts) → `SecureStore`.
- **Forbidden:** never persist balances, card numbers, masked PANs,
  session tokens, or KYC status to `localStorage` or `AsyncStorage`.

## 11. Multi-entity switching

`useSwitchEntity` (`business/lib/query/use-switch-entity.ts`) performs
an atomic switch:

1. Cancel in-flight queries on the outgoing scope.
2. Prefetch wallets + first transactions page on the incoming scope.
3. Flip the active scope (realtime re-subscribes via its effect).
4. Mark outgoing caches `inactive` for lazy revalidation.

The shell never unmounts; `keepPreviousData` smooths the transition.

## 12. Performance

- **Virtualisation:** `@tanstack/react-virtual` on web, FlatList with
  tuned windowing on mobile (swap-compatible with `@shopify/flash-list`).
- **Pagination:** `useInfiniteQuery` keyed with filters so filter
  changes don't blow away scroll state thanks to `keepPreviousData`.
- **Prefetch:** `useHoverPrefetch` / `usePressPrefetch` warms detail
  queries before navigation.
- **Structural sharing:** enabled by default in the shared client; row
  identity is preserved across refetches so Radix/Shadcn components
  don't re-run enter animations.

## 13. Migration status & ownership

- Legacy `dataCache` module and `CACHE_KEYS` are retained only as
  deprecated re-exports until all consumers move to the new hooks.
- `invalidateB2bInvoicesCache` / `invalidateBusinessCustomersCache` are
  no-ops; they stay so existing call sites compile.
- New features MUST use `useQuery` + `qk.*`; never import
  `dataCache` or build keys inline.

---

### Quick links

| Topic | Path |
| --- | --- |
| Shared primitives | `packages/shared/src/query/*` |
| Web client API wrapper | `business/lib/query/api-client.ts` |
| Web server API wrapper | `business/lib/server/api.ts` |
| Web scope context | `business/lib/query/scope.tsx` |
| Web realtime bridge | `business/lib/query/use-supabase-realtime-scope.ts` |
| Office realtime bridge | `office/lib/query/attach-office-realtime.ts` |
| Ledger list selects | `business/lib/ledger/ledger-select.ts` |
| Web SSR layout | `business/app/(dashboard)/layout.tsx` |
| Mobile QueryProvider | `mobile/src/query/QueryProvider.tsx` |
| Mobile persister | `mobile/src/query/persister.ts` |
| Mobile scope | `mobile/src/query/scope.tsx` |
| UX primitives | `business/components/data/`, `mobile/src/components/data/` |
| UX rules constants | `packages/shared/src/query/ux-rules.ts` |
| Storage policy | `packages/shared/src/query/storage-policy.ts` |
| Noah virtual accounts (DB columns) | `business/lib/noah/virtual-account-columns.ts` |

## 14. `virtual_accounts` (Noah fiat receive)

**USD:** one row per user/business — merged from ACH + Wire + SWIFT Noah PMs (`mergeUsdPayinPaymentMethods`). `noah_virtual_account_id` is the preferred ACH PaymentMethodID. Columns: `account_number` (all rails), `routing_number` (ACH/Wire ABA), `bic` (SWIFT). Extra per-rail USD rows are deleted on sync.

**EUR / GBP:** one row per Noah PaymentMethodID (e.g. SEPA for EUR).

| Column | USD (merged) | EUR SEPA | GBP |
| --- | --- | --- | --- |
| `account_number` | ✓ | — | ✓ |
| `routing_number` | ✓ (ACH/Wire) | — | — |
| `iban` | — | ✓ | — |
| `bic` | ✓ (SWIFT) | ✓ | — |
| `sort_code` | — | — | ✓ |

Dropped: `account_name`, `noah_payment_method_id`, `source_type`, `swift_bic` (→ `bic`), `metadata`.

On write (`persist-account-data`, `payment-method-map`): `account_holder_name` and `bank_name` are title-cased; `bank_address` uses the same rules as KYC addresses. Short all-caps bank tokens (2–5 letters, e.g. SSB, HSBC) stay uppercase; words like BANK → Bank (`format-display-text.ts`).

## 15. Individual KYC on `users`

On Noah **Customer** approval, `syncNoahCustomerToSupabase` writes normalized identity + address columns and sets `kyc_verified_at`. `GET /api/settings/personal` returns `profileLocked` and a `verifiedIdentity` block (masked ID number only).

| Column | Source |
| --- | --- |
| `kyc_id_type` | Noah `Identities[0].IDType` (raw enum) |
| `kyc_id_number` | Full number (mask in API/UI) |
| `kyc_id_issuing_country` | ISO-2 |
| `kyc_address_*` | `PrimaryResidence` (title-cased on write) |
| `kyc_verified_at` | Webhook / approval time |

Dropped on `users`: `noah_kyc_metadata`, `noah_kyb_customer_id`, `noah_kyb_status` (KYB remains on `businesses`).

Flags: bundled PNGs in `packages/shared/assets/flags` (from flagcdn via `npm run sync:flags`); shared `CountryFlag` / `CurrencyFlag` for web + mobile.

**Noah onboarding (Tier 1):** Use `POST /v1/onboarding/:CustomerID` (hosted onboarding) only. Noah Standard Model handles **KYC/KYB + partner Terms & Conditions** in one `HostedURL` — no separate TOS API, `noah_signed_agreement_id` column, or `/api/noah/tos` route. Mobile/business entry: `POST /api/noah/kyc-links`.
