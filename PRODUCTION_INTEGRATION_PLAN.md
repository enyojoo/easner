# Production Integration Plan - Mobile & Admin

## Current State Assessment

### ✅ What's Already Built

#### Mobile App (`/mobile`)
1. **Account Verification Flow**
   - Identity verification (KYC)
   - Address verification (KYC)
   - TOS acceptance via WebView
   - Status tracking with caching

2. **Receive Money Screen**
   - Virtual account display (USD/EUR)
   - Wallet address display (Solana)
   - QR codes for stablecoins
   - Manual account creation button (fallback)

3. **Dashboard**
   - Bridge wallet balance display
   - Currency switching (USD/EUR)

4. **Bridge Service Library**
   - `bridgeService.ts` - Client-side Bridge API wrapper
   - `bridgeKycHelpers.ts` - KYC data formatting
   - `bridgeHelpers.ts` - Utility functions
   - `bridgeSupportedCountries.ts` - Country validation

#### Admin Panel (`/app/admin`)
1. **Bridge Customers Page** (Enhanced - Consolidates Users + Bridge Data)
   - View all Bridge customers with user data
   - KYC status filtering (from Bridge + internal KYC)
   - Endorsement status display
   - User account management (activate/suspend)
   - KYC review and approval
   - Transaction history per user
   - User analytics (total, active, verified)
   - Export functionality
   - Bulk actions
   - Customer details modal with full user info

2. **Bridge Virtual Accounts Page**
   - View all virtual accounts
   - Currency filtering (USD/EUR)
   - Account details display

3. **Bridge Wallets Page**
   - View all wallets
   - Chain filtering
   - Balance display

**Note:** The `/admin/users` page will be deprecated in favor of the enhanced Bridge Customers page, which provides all user management features plus Bridge-specific data in one consolidated view.

### ⚠️ What Needs Work

#### Mobile App
1. **Send Money Flow** - Partial implementation
   - Bridge transfer creation started but incomplete
   - External account management missing
   - Transfer status tracking missing

2. **Payment Detection** - Not implemented
   - No UI for incoming payments
   - No payment notifications
   - No payment history

3. **Error Handling** - Needs improvement
   - Better error messages
   - Retry mechanisms
   - Offline handling

#### Admin Panel
1. **Monitoring & Alerts** - Missing
   - Webhook event monitoring
   - Failed payment alerts
   - KYC rejection tracking

2. **Manual Actions** - Limited
   - No manual account creation
   - No manual customer updates
   - No transfer management

## Current API Endpoints Status

### ✅ Existing Endpoints
- `POST /api/bridge/tos` - Create TOS link
- `GET /api/bridge/tos` - Check TOS status
- `PUT /api/bridge/customers/update-tos` - Update customer TOS
- `POST /api/bridge/customers` - Create customer
- `GET /api/bridge/customers` - Get customer status
- `GET /api/bridge/customers/[id]/status` - Get KYC status
- `GET /api/bridge/customers/[id]/endorsements` - Get endorsement status
- `GET /api/bridge/virtual-accounts` - Get virtual accounts
- `GET /api/bridge/wallets` - Get wallets
- `GET /api/bridge/wallets/balances` - Get wallet balances
- `POST /api/bridge/create-accounts` - Create accounts (manual trigger)
- `POST /api/bridge/transfers` - Create transfer ✅
- `GET /api/bridge/transfers/[id]` - Get transfer status ✅
- `GET /api/bridge/payments` - Get payment history ✅
- `GET /api/transactions/[id]/payment` - Get payment for transaction ✅

### ❌ Missing Endpoints
- `POST /api/bridge/external-accounts` - Create external account (for recipients)
- `GET /api/bridge/external-accounts` - List external accounts
- `GET /api/bridge/external-accounts/[id]` - Get external account

**Note:** 
- `lib/bridge-customer-service.ts` has external account methods, but no API endpoints expose them yet.
- **External accounts** represent recipient bank accounts where money will be sent. They store bank details (routing number, account number, IBAN, etc.) and are validated by Bridge.
- When a user sends money, we create an external account for the recipient, then use the Transfers API to send from the user's wallet/virtual account to that external account.

### Admin Endpoints
- `GET /api/admin/bridge/customers` - List customers ✅
- `GET /api/admin/bridge/virtual-accounts` - List virtual accounts ✅
- `GET /api/admin/bridge/wallets` - List wallets ✅
- `GET /api/admin/bridge/payments` - List payments (needs implementation)
- `GET /api/admin/bridge/webhooks` - List webhook events (needs implementation)

## Production Integration Roadmap

### Phase 1: Core Mobile Features (Week 1-2)

#### 1.1 Complete Send Money Flow
**Priority: HIGH**

**How External Accounts Work:**
- External accounts store recipient bank account details (routing number, account number, IBAN, etc.)
- Bridge validates these accounts before allowing transfers
- When user sends money:
  1. Create external account with recipient's bank details (if not exists)
  2. Use Transfers API to send from user's wallet/virtual account to external account
  3. Bridge handles the actual bank transfer

**Tasks:**
- [ ] Create API endpoint for external account creation
- [ ] Add `bridge_external_account_id` field to recipients table
- [ ] Update recipient creation/update to create Bridge external account
- [ ] Update `mobile/src/lib/bridgeService.ts` with external account methods
- [ ] Complete Bridge transfer creation in SendAmountScreen
- [ ] Add transfer status polling
- [ ] Show transfer progress in UI
- [ ] Handle transfer failures gracefully
- [ ] Handle external account validation errors

**Files to Create/Update:**
- `app/api/bridge/external-accounts/route.ts` (NEW) - Create/list external accounts
  - `POST /api/bridge/external-accounts` - Create external account for recipient
  - `GET /api/bridge/external-accounts` - List user's external accounts
  - `GET /api/bridge/external-accounts/[id]` - Get external account details
- `migrations/add_bridge_external_account_id_to_recipients.sql` (NEW) - Add field
- `mobile/src/screens/send/SendAmountScreen.tsx` - Complete transfer flow
- `mobile/src/lib/bridgeService.ts` - Add external account methods:
  - `createExternalAccount(recipientData)` - Create external account
  - `getExternalAccount(id)` - Get external account
  - `listExternalAccounts()` - List all external accounts
- `mobile/src/screens/send/SendTransactionDetailsScreen.tsx` - Add transfer status
- `mobile/src/lib/recipientService.ts` - Create external account when creating/updating recipient

**API Endpoints Needed:**
- `POST /api/bridge/external-accounts` - Create external account (NEW)
  - Body: `{ accountType: "wire" | "ach" | "sepa", accountNumber?, routingNumber?, iban?, swiftBic?, bankName, accountHolderName, currency, country? }`
  - Returns: `{ id, customer_id, account_type, status, ... }`
- `GET /api/bridge/external-accounts` - List external accounts (NEW)
- `GET /api/bridge/external-accounts/[id]` - Get external account (NEW)
- `POST /api/bridge/transfers` - Create transfer ✅ (exists)
  - Body: `{ amount, currency, sourceWalletId, destinationExternalAccountId }`
- `GET /api/bridge/transfers/[id]` - Get transfer status ✅ (exists)

**Flow:**
1. User adds recipient with bank details (account number, routing number, IBAN, etc.)
2. System creates Bridge external account for recipient:
   - Determines account type (wire/ach/sepa) based on currency/country
   - Creates external account via Bridge API
   - Bridge validates the bank account details
3. Store `bridge_external_account_id` in recipients table
4. When sending money:
   - Use recipient's `bridge_external_account_id`
   - Create transfer from user's wallet/virtual account to external account
   - Bridge validates the external account and processes the transfer
   - Transfer status is tracked and updated

**External Account Types:**
- **Wire** (ACH): For USD transfers within USA (routing number + account number)
- **SEPA**: For EUR transfers within SEPA zone (IBAN + BIC)
- **Wire (International)**: For international transfers (SWIFT/BIC)

**Recipient Data Mapping:**
- USA recipients: `routing_number` + `account_number` → Wire/ACH
- EUR recipients: `iban` + `swift_bic` → SEPA
- Other: `iban` + `swift_bic` → Wire (International)

#### 1.2 Payment Detection & Notifications
**Priority: HIGH**

**Tasks:**
- [ ] Add payment history screen
- [ ] Show payment notifications
- [ ] Display payment status in transaction details
- [ ] Add payment matching UI

**Files to Create/Update:**
- `mobile/src/screens/main/PaymentHistoryScreen.tsx` (new)
- `mobile/src/screens/transactions/TransactionDetailsScreen.tsx`
- `mobile/src/contexts/NotificationsContext.tsx` (add payment notifications)

**API Endpoints Needed:**
- `GET /api/bridge/payments` - Get payment history
- `GET /api/transactions/[id]/payment` - Get payment for transaction

#### 1.3 Error Handling & UX Improvements
**Priority: MEDIUM**

**Tasks:**
- [ ] Add retry mechanisms for failed API calls
- [ ] Improve error messages (user-friendly)
- [ ] Add loading states
- [ ] Handle network errors gracefully
- [ ] Add offline mode detection

**Files to Update:**
- `mobile/src/lib/bridgeService.ts` (add retry logic)
- All Bridge-related screens (add error handling)

### Phase 2: Admin Panel Enhancements (Week 2-3)

#### 2.1 Webhook Event Monitoring
**Priority: HIGH**

**Tasks:**
- [ ] Create webhook events page
- [ ] Show event history
- [ ] Filter by event type
- [ ] Show event details
- [ ] Display failed events

**Files to Create:**
- `app/admin/bridge/webhooks/page.tsx` (new)
- `app/api/admin/bridge/webhooks/route.ts` (new)

**Database:**
- Use existing `bridge_webhook_events` table

#### 2.2 Payment Monitoring
**Priority: MEDIUM**

**Tasks:**
- [ ] Create payments page
- [ ] Show unmatched payments
- [ ] Show payment matching status
- [ ] Manual payment matching tool

**Files to Create:**
- `app/admin/bridge/payments/page.tsx` (new)
- `app/api/admin/bridge/payments/route.ts` (new)

**Database:**
- Use existing `bridge_payments` table

#### 2.3 Enhanced Bridge Customers Page (Consolidation)
**Priority: HIGH**

**Tasks:**
- [ ] Merge user management features from `/admin/users` into Bridge Customers page
- [ ] Add user account status management (activate/suspend)
- [ ] Add KYC review and approval functionality
- [ ] Add transaction history per customer
- [ ] Add user analytics cards (total users, active, verified, new this week)
- [ ] Add export functionality
- [ ] Add bulk actions (bulk status updates)
- [ ] Enhance customer details modal with:
  - Full user profile information
  - Transaction history
  - KYC submissions (identity + address)
  - Bridge account details (wallets, virtual accounts)
  - Account actions (activate/suspend)
- [ ] Update API endpoint to return combined user + Bridge data
- [ ] Add filtering by user status, verification status, and Bridge KYC status

**Files to Update:**
- `app/admin/bridge/customers/page.tsx` - Major enhancement
- `app/api/admin/bridge/customers/route.ts` - Return combined user + Bridge data
- `app/admin/users/page.tsx` - Mark as deprecated (or redirect to Bridge Customers)

**Benefits:**
- Single source of truth for user management
- All Bridge and user data in one place
- Better admin workflow
- Reduces duplication

#### 2.4 Manual Actions
**Priority: LOW**

**Tasks:**
- [ ] Manual account creation tool
- [ ] Customer update tool
- [ ] Transfer management
- [ ] KYC resubmission tool

**Files to Update:**
- `app/admin/bridge/customers/page.tsx` (add actions)
- `app/admin/bridge/virtual-accounts/page.tsx` (add actions)

### Phase 3: Production Readiness (Week 3-4)

#### 3.1 Testing & Validation
**Priority: HIGH**

**Tasks:**
- [ ] End-to-end testing of all flows
- [ ] Test webhook handling
- [ ] Test payment matching
- [ ] Test error scenarios
- [ ] Performance testing

**Test Scenarios:**
1. User registration → KYC → TOS → Account creation
2. Receive money → Payment detection → Matching
3. Send money → Transfer creation → Status updates
4. Error handling (API failures, network issues)

#### 3.2 Monitoring & Logging
**Priority: HIGH**

**Tasks:**
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Add structured logging
- [ ] Set up alerts for critical failures
- [ ] Monitor webhook delivery
- [ ] Track payment matching success rate

#### 3.3 Documentation
**Priority: MEDIUM**

**Tasks:**
- [ ] API documentation
- [ ] Admin panel user guide
- [ ] Mobile app user guide
- [ ] Troubleshooting guide
- [ ] Runbook for common issues

## Implementation Details

### Mobile App Architecture

#### Bridge Service Layer
```
mobile/src/lib/bridgeService.ts
├── Customer Management
│   ├── getCustomer()
│   └── createCustomer()
├── Account Management
│   ├── getVirtualAccount()
│   ├── getWallet()
│   └── getWalletBalances()
├── Transfer Management
│   ├── createTransfer()
│   ├── getTransfer()
│   └── listTransfers()
├── External Accounts
│   ├── createExternalAccount()
│   └── listExternalAccounts()
└── Payments
    ├── getPayments()
    └── getPayment()
```

#### Screen Flow
```
Registration
  ↓
Account Verification
  ├── Identity Verification (KYC)
  ├── Address Verification (KYC)
  └── TOS Acceptance
  ↓
Account Creation (Automatic via Webhook)
  ↓
Dashboard (View Balances)
  ↓
Receive Money (View Accounts/Wallets)
  ↓
Send Money (Create Transfer)
  ↓
Transaction Details (View Status)
```

### Admin Panel Architecture

#### Bridge Management Pages
```
app/admin/bridge/
├── customers/
│   └── page.tsx - Enhanced: User + Bridge customer management
│       - User account management (activate/suspend)
│       - KYC review and approval
│       - Transaction history
│       - User analytics
│       - Bridge customer details
│       - Export & bulk actions
├── virtual-accounts/
│   └── page.tsx - Virtual account list, details
├── wallets/
│   └── page.tsx - Wallet list, balances
├── payments/
│   └── page.tsx - Payment history, matching (NEW)
└── webhooks/
    └── page.tsx - Webhook events, monitoring (NEW)

Note: /admin/users page will be deprecated in favor of enhanced Bridge Customers page
```

#### API Endpoints
```
/api/admin/bridge/
├── customers/ - List, get, update customers
├── virtual-accounts/ - List, get virtual accounts
├── wallets/ - List, get wallets
├── payments/ - List, get, match payments (NEW)
└── webhooks/ - List, get webhook events (NEW)
```

## Critical Path Items

### Must Have Before Production Launch

1. **Complete Send Money Flow** ✅
   - Users must be able to send money
   - Transfers must be trackable

2. **Payment Detection** ✅
   - Incoming payments must be detected
   - Payments must match to transactions

3. **Webhook Monitoring** ✅
   - Admin must see webhook events
   - Failed events must be visible

4. **Error Handling** ✅
   - All errors must be handled gracefully
   - Users must see helpful messages

5. **Testing** ✅
   - All critical paths tested
   - Error scenarios tested

### Nice to Have (Post-Launch)

1. Manual admin actions
2. Advanced analytics
3. Payment retry mechanisms
4. Bulk operations
5. Export functionality

## Environment Setup

### Production Environment Variables

```bash
# Bridge API
BRIDGE_API_KEY=sk-live-...
BRIDGE_API_BASE_URL=https://api.bridge.xyz

# Webhooks
BRIDGE_WEBHOOK_SECRET="-----BEGIN PUBLIC KEY-----..."

# Mobile App
EXPO_PUBLIC_API_URL=https://api.easner.com
```

### Database Migrations

Already Applied:
- ✅ `bridge_payments` table
- ✅ `bridge_webhook_events` table
- ✅ `bridge_virtual_accounts` table
- ✅ `bridge_wallets` table

## Success Metrics

### Mobile App
- ✅ KYC completion rate > 80%
- ✅ Account creation success rate > 95%
- ✅ Payment detection rate > 99%
- ✅ Transfer success rate > 98%
- ✅ Error rate < 2%

### Admin Panel
- ✅ Webhook delivery rate > 99%
- ✅ Payment matching rate > 95%
- ✅ Average response time < 2s
- ✅ Uptime > 99.9%

## Implementation Priority

### Week 1: Critical Mobile Features

**Day 1-2: External Accounts & Send Money**
1. Create external accounts API endpoint
2. Add database migration for `bridge_external_account_id`
3. Update recipient creation to create Bridge external account
4. Complete send money flow with transfer creation
5. Add transfer status polling

**Day 3-4: Payment Detection**
1. Add payment status to transaction details screens
2. Add payment notifications
3. Test payment matching flow

**Day 5: Error Handling**
1. Improve error messages
2. Add retry mechanisms
3. Add loading states

### Week 2: Admin Panel & Testing

**Day 1-2: Admin Monitoring**
1. Enhance Bridge Customers page (consolidate user management)
2. Create webhook events page
3. Create payments monitoring page
4. Add filtering and search

**Day 3-4: Testing**
1. End-to-end testing
2. Error scenario testing
3. Performance testing

**Day 5: Documentation**
1. API documentation
2. Admin user guide
3. Troubleshooting guide

### Week 3: Production Readiness

**Day 1-2: Monitoring Setup**
1. Error tracking (Sentry)
2. Structured logging
3. Alerts configuration

**Day 3-4: Final Testing**
1. Production environment testing
2. Load testing
3. Security review

**Day 5: Launch Preparation**
1. Final documentation
2. Runbook creation
3. Team training

## Next Steps (Immediate)

### Priority 1: Onboarding Flow (KYC → TOS → Accounts)
**This is the foundation - must work before anything else**

1. **Verify KYC → Bridge Customer Flow** (Today)
   - Review `lib/bridge-kyc-builder.ts` - ensure all KYC data is correctly formatted
   - Test customer creation with KYC data from database
   - Verify all required fields are present
   - Fix any data mapping issues

2. **Verify TOS → Customer Creation** (Today)
   - Test TOS link creation in production
   - Test TOS acceptance flow
   - Verify customer creation is triggered after TOS
   - Test `updateCustomerTOS()` endpoint

3. **Verify Account Creation** (Tomorrow)
   - Test webhook configuration
   - Verify `completeAccountSetupAfterKYC()` works
   - Test account creation after KYC approval
   - Add account status tracking in mobile app

**See `ONBOARDING_FLOW_IMPLEMENTATION.md` for detailed plan**

### Priority 2: Send Money Flow
4. **Create External Accounts API** (After onboarding works)
   - `app/api/bridge/external-accounts/route.ts`
   - Database migration for `bridge_external_account_id` in recipients table
   - **External accounts** represent recipient bank accounts where money will be sent
   - Bridge validates these accounts before allowing transfers
   - When user adds recipient, create external account with their bank details
   - Store `bridge_external_account_id` in recipients table for reuse
   - **Account types**: Wire/ACH (USA), SEPA (EUR), Wire International (other)

5. **Complete Send Money Flow** (After onboarding works)
   - Update SendAmountScreen to:
     - Check if recipient has `bridge_external_account_id`
     - If not, create external account when sending (or when adding recipient)
     - Use external account ID in transfer creation
   - Add external account creation to recipient flow:
     - When creating/updating recipient, create Bridge external account
     - Handle account type detection (wire/ach/sepa based on currency/country)
     - Handle validation errors from Bridge
   - Add transfer status tracking:
     - Poll transfer status after creation
     - Show transfer progress in UI
     - Handle transfer failures gracefully

### Priority 3: Payment Detection
6. **Add Payment Status UI** (After onboarding works)
   - Update transaction details screens
   - Add payment notifications

### Priority 4: Admin Monitoring
7. **Admin Monitoring** (After core flows work)
   - Webhook events page
   - Payments page
   - Enhanced Bridge Customers page

## Notes

- **No Web App Changes**: All integration is mobile-only
- **Admin Panel**: Used for monitoring and management only
- **Production Only**: All sandbox code removed
- **Focus**: User experience and reliability

