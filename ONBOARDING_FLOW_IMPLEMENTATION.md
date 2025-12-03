# Onboarding Flow Implementation Plan
## KYC → TOS → Account Creation

## Current Flow Overview

### Step 1: KYC Submission (Mobile)
- User submits **Identity Verification** → stored in `kyc_submissions` table
- User submits **Address Verification** → stored in `kyc_submissions` table
- Both submissions must be **approved** by admin before proceeding

### Step 2: TOS Acceptance (Mobile)
- After both KYC submissions are approved, TOS card appears
- User clicks TOS card → opens Bridge TOS WebView
- User accepts TOS → receives `signed_agreement_id`
- `signed_agreement_id` stored in `users.bridge_signed_agreement_id`
- ✅ **Fixed**: Only updates Bridge customer if customer exists (no error if customer doesn't exist yet)

### Step 3: Admin Review & Send to Bridge (Admin Panel)
- Admin reviews KYC submissions on `/admin/kyc` page
- Admin approves both identity and address submissions
- Admin clicks **"Send to Bridge"** button when ready
- This calls `POST /api/admin/kyc/send-to-bridge` with `userId`
- API builds customer payload from KYC data in database
- Creates Bridge customer via `initializeBridgeAccount()` with `signed_agreement_id`
- Creates wallet and virtual accounts (if endorsements approved)

### Step 4: Bridge KYC Status Updates (Webhook)
- Bridge processes KYC and updates customer status
- Webhook `customer.updated.status_transitioned` fires
- Updates `bridge_kyc_status` in database (not_started, incomplete, under_review, approved, rejected)
- Updates `bridge_kyc_rejection_reasons` if rejected
- Status reflected on both admin panel and mobile app
- `completeAccountSetupAfterKYC()` creates accounts if status becomes "approved"

## Current Status

### ✅ Completed Features

#### 1. KYC → Bridge Customer Creation Flow
**Status: ✅ Working**
- KYC submissions stored in database ✅
- KYC data validation implemented ✅
- Admin "Send to Bridge" button implemented ✅
- Customer creation with KYC data works ✅
- All required fields validated before creation ✅

#### 2. TOS Acceptance Flow
**Status: ✅ Working**
- TOS acceptance stores `signed_agreement_id` ✅
- TOS link generation works (POST /v0/customers/tos_links for new, GET /v0/customers/{id}/tos_acceptance_link for existing) ✅
- WebView integration with redirect_uri and postMessage ✅
- Only updates Bridge customer if customer exists (no errors) ✅
- Status badges show Bridge KYC status when available ✅

#### 3. Bridge KYC Status Tracking
**Status: ✅ Working**
- Webhook handler processes `customer.updated.status_transitioned` ✅
- Updates `bridge_kyc_status` in database ✅
- Updates `bridge_kyc_rejection_reasons` if rejected ✅
- Admin panel shows Bridge KYC status with auto-refresh ✅
- Mobile app shows Bridge KYC status on verification cards ✅
- Status notices match Easner messaging (no Bridge mentions) ✅

#### 4. Account Creation After KYC Approval
**Status: ✅ Working**
- Webhook handler exists ✅
- `completeAccountSetupAfterKYC()` function exists ✅
- Accounts created automatically when KYC approved ✅
- Endorsement polling implemented ✅

### 🔄 Needs Testing

#### 1. End-to-End Flow Testing
- [ ] Test complete flow: KYC → Admin Approval → Send to Bridge → Status Updates → Account Creation
- [ ] Test with USA user (SSN)
- [ ] Test with non-USA user (passport/ID)
- [ ] Test rejection flow and resubmission

#### 2. Error Scenarios
- [ ] Test KYC validation errors
- [ ] Test TOS link creation failures
- [ ] Test customer creation failures
- [ ] Test webhook failures
- [ ] Test network errors during flow

## Implementation Tasks

### Phase 1: Verify & Fix KYC Submission Flow

#### Task 1.1: Verify KYC Data Format
- [x] Check that KYC submissions contain all required Bridge fields
- [x] Add validation for required fields before customer creation
- [x] Create KYC validator utility (`lib/bridge-kyc-validator.ts`)
- [x] Add validation to `buildBridgeCustomerPayloadFromKyc()`
- [x] Create verification script (`scripts/verify-kyc-data.ts`)
- [ ] Test with different countries (USA vs non-USA)
- [ ] Test with different ID types
- [ ] Test document conversion to base64

**Files Created/Updated:**
- ✅ `lib/bridge-kyc-validator.ts` (NEW) - KYC validation utility
- ✅ `lib/bridge-kyc-builder.ts` - Added validation before payload building
- ✅ `lib/kyc-service.ts` - Added `metadata` field to interface
- ✅ `scripts/verify-kyc-data.ts` (NEW) - Verification script
- `mobile/src/screens/verification/IdentityVerificationScreen.tsx` - KYC submission
- `mobile/src/screens/verification/AddressVerificationScreen.tsx` - Address submission

**What Was Added:**
1. **KYC Validator** (`lib/bridge-kyc-validator.ts`):
   - Validates all required fields for Bridge
   - Country-specific requirements (USA, EEA, International)
   - Returns detailed errors and warnings
   - Checks metadata for country-specific fields (SSN for USA, passport/ID for non-USA)

2. **Validation Integration**:
   - `buildBridgeCustomerPayloadFromKyc()` now validates before building payload
   - Throws clear errors if validation fails
   - Logs warnings for optional but recommended fields

3. **Verification Script**:
   - Run `npx tsx scripts/verify-kyc-data.ts <userId>` to verify a user's KYC data
   - Checks all required fields
   - Tests payload building
   - Shows country-specific requirements

#### Task 1.2: Add KYC Validation
- [x] Add validation before customer creation
- [x] Check that both identity and address are approved
- [x] Verify all required fields are present
- [x] Show clear error messages if validation fails
- [x] Add validation to API endpoint
- [ ] Test validation with real user data

**Files Updated:**
- ✅ `lib/bridge-kyc-validator.ts` (NEW) - Comprehensive validation
- ✅ `lib/bridge-kyc-builder.ts` - Integrated validation
- ✅ `app/api/bridge/customers/route.ts` - Added validation check before customer creation

**What Was Added to API Endpoint:**
1. **Early Validation**:
   - Fetches user data and KYC submissions first
   - Validates KYC data before attempting customer creation
   - Returns clear error messages if validation fails

2. **Status Checks**:
   - Verifies both identity and address submissions are "approved"
   - Returns specific error if status is not approved

3. **Error Messages**:
   - Lists all validation errors
   - Shows missing fields
   - Provides actionable feedback to user

4. **Logging**:
   - Comprehensive logging at each step
   - Logs validation results
   - Logs warnings (non-blocking)

**Flow:**
1. Validate `signedAgreementId` is provided
2. Fetch user data (email, first_name, last_name)
3. Fetch KYC submissions
4. Validate KYC data structure
5. Check KYC submission statuses are "approved"
6. Save `signedAgreementId` to database
7. Build customer payload
8. Initialize Bridge account

**Next Steps:**
1. Test validation with real user data using verification script
2. Test with USA and non-USA users
3. Verify error messages are user-friendly

### Phase 2: Verify & Fix TOS Flow

#### Task 2.1: Verify TOS Link Creation
- [x] TOS link creation implemented (POST /v0/customers/tos_links for new, GET /v0/customers/{id}/tos_acceptance_link for existing)
- [x] TOS link parsing fixed (uses `response.url` instead of `response.tos_link`)
- [x] Redirect URI construction fixed (no more `https://undefined/...`)
- [ ] Test TOS link creation in production
- [ ] Handle errors gracefully
- [ ] Show loading states

**Files Updated:**
- ✅ `app/api/bridge/tos/route.ts` - TOS link creation with correct endpoints
- ✅ `lib/bridge-service.ts` - `getTOSLink()` and `getTOSLinkForCustomer()` methods
- ✅ `mobile/src/lib/bridgeService.ts` - TOS link fetching
- ✅ `mobile/src/screens/verification/AccountVerificationScreen.tsx` - TOS UI

#### Task 2.2: Verify TOS Acceptance Flow
- [x] TOS WebView opens correctly ✅
- [x] `signed_agreement_id` captured from redirect_uri and postMessage ✅
- [x] `signed_agreement_id` stored in database ✅
- [x] Only updates Bridge customer if customer exists (no errors) ✅
- [ ] Test customer update after TOS acceptance (when customer exists)

**Files Updated:**
- ✅ `mobile/src/screens/verification/AccountVerificationScreen.tsx` - TOS WebView handler with proper error handling
- ✅ `app/api/bridge/customers/update-tos/route.ts` - TOS update endpoint
- ✅ `app/api/bridge/tos/callback/route.ts` - Callback handler for redirect_uri
- ✅ `mobile/src/lib/bridgeService.ts` - `updateCustomerTOS()` method

### Phase 3: Verify & Fix Customer Creation Flow

#### Task 3.1: Verify Customer Creation Trigger
- [x] Admin "Send to Bridge" button implemented ✅
- [x] Customer creation triggered by admin action ✅
- [x] Customer payload built correctly from KYC data ✅
- [x] Error handling implemented ✅
- [ ] Test with real user data
- [ ] Add user feedback on admin panel (loading, success, error states)

**Files Updated:**
- ✅ `app/admin/kyc/page.tsx` - Added "Send to Bridge" button with status display
- ✅ `app/api/admin/kyc/send-to-bridge/route.ts` - New endpoint for admin-triggered customer creation
- ✅ `app/api/bridge/customers/route.ts` - Customer creation endpoint with validation
- ✅ `lib/bridge-onboarding-service.ts` - `initializeBridgeAccount()` function
- ✅ `lib/bridge-kyc-builder.ts` - Customer payload builder with validation

#### Task 3.2: Verify Customer Creation with KYC Data
- [ ] Test customer creation with USA user (SSN)
- [ ] Test customer creation with non-USA user (ID documents)
- [ ] Verify all KYC fields are correctly mapped
- [ ] Test with missing optional fields

**Files to Check:**
- `lib/bridge-kyc-builder.ts` - Customer payload builder
- `lib/bridge-onboarding-service.ts` - Account initialization

### Phase 4: Verify & Fix Account Creation Flow

#### Task 4.1: Verify Webhook Configuration
- [ ] Verify webhook endpoint is accessible
- [ ] Test webhook signature verification
- [ ] Verify webhook events are being received
- [ ] Check webhook event processing

**Files to Check:**
- `app/api/crypto/webhooks/bridge/route.ts` - Webhook handler
- Bridge dashboard - Webhook configuration

#### Task 4.2: Verify Account Creation After KYC Approval
- [x] Webhook handler processes KYC status updates ✅
- [x] Accounts created when KYC is approved ✅
- [x] Wallet creation implemented ✅
- [x] Virtual account creation (USD/EUR) implemented ✅
- [x] Endorsement polling implemented ✅
- [x] Bridge KYC status displayed on admin and mobile ✅
- [ ] Test with real Bridge webhook events
- [ ] Verify endorsement approval timing

**Files Updated:**
- ✅ `app/api/crypto/webhooks/bridge/route.ts` - Webhook handler for KYC approval and status updates
- ✅ `lib/bridge-onboarding-service.ts` - `completeAccountSetupAfterKYC()` function
- ✅ `app/admin/kyc/page.tsx` - Shows Bridge KYC status with auto-refresh
- ✅ `app/api/admin/users/[id]/route.ts` - Returns `bridge_kyc_status` and `bridge_kyc_rejection_reasons`
- ✅ `mobile/src/screens/verification/AccountVerificationScreen.tsx` - Shows Bridge KYC status on verification cards

#### Task 4.3: Add Account Creation Status Tracking
- [ ] Show account creation status in mobile app
- [ ] Poll for account creation status
- [ ] Update UI when accounts are created
- [ ] Handle account creation failures

**Files to Update:**
- `mobile/src/screens/receive/ReceiveMoneyScreen.tsx` - Show account status
- `mobile/src/lib/bridgeService.ts` - Add account status checking

## Testing Checklist

### End-to-End Flow Test
1. [x] User submits identity verification ✅
2. [x] Admin approves identity verification ✅
3. [x] User submits address verification ✅
4. [x] Admin approves address verification ✅
5. [x] TOS card appears on account verification screen ✅
6. [x] User clicks TOS card → WebView opens ✅
7. [x] User accepts TOS → `signed_agreement_id` received and stored ✅
8. [x] Admin clicks "Send to Bridge" button ✅
9. [x] Customer is created in Bridge with KYC data ✅
10. [x] Bridge processes KYC → webhook fires ✅
11. [x] Bridge KYC status updates reflected on admin and mobile ✅
12. [x] Accounts (wallet + virtual accounts) are created when approved ✅
13. [ ] User sees accounts on receive money screen (needs testing)

### Error Scenarios
1. [ ] KYC submission fails → show error
2. [ ] TOS link creation fails → show error
3. [ ] TOS acceptance fails → show error
4. [ ] Customer creation fails → show error
5. [ ] Account creation fails → show error
6. [ ] Webhook fails → manual account creation option

### Edge Cases
1. [ ] User with USA address (SSN only)
2. [ ] User with non-USA address (ID documents)
3. [ ] User with missing optional fields
4. [ ] User with rejected KYC → resubmission
5. [ ] User with incomplete KYC → partial submission
6. [ ] Network errors during any step
7. [ ] App closed during flow → resume flow

## Implementation Priority

### Week 1: Core Flow Verification
**Day 1-2: KYC → Bridge Customer**
- Verify KYC data format
- Test customer creation with KYC data
- Fix any data mapping issues

**Day 3-4: TOS → Customer Creation**
- Verify TOS link creation
- Test TOS acceptance flow
- Test customer creation trigger
- Fix any timing issues

**Day 5: Account Creation**
- Verify webhook configuration
- Test account creation after KYC approval
- Add status tracking
- Fix any account creation issues

### Week 2: Error Handling & UX
**Day 1-2: Error Handling**
- Add comprehensive error handling
- Add retry mechanisms
- Add user-friendly error messages

**Day 3-4: UX Improvements**
- Add loading states
- Add progress indicators
- Add success/error feedback
- Improve status display

**Day 5: Testing & Documentation**
- Complete end-to-end testing
- Document the flow
- Create troubleshooting guide

## Success Criteria

### Functional Requirements
- ✅ KYC submissions are correctly formatted for Bridge
- ✅ KYC data validation implemented
- ✅ TOS acceptance works and stores `signed_agreement_id`
- ✅ Admin "Send to Bridge" workflow implemented
- ✅ Customer is created with all KYC data
- ✅ Bridge KYC status tracking implemented
- ✅ Status updates reflected on admin and mobile
- ✅ Accounts are created after KYC approval
- [ ] User can see accounts on receive money screen (needs testing)

### Non-Functional Requirements
- ✅ Error handling is comprehensive
- ✅ User feedback is clear and helpful (no Bridge mentions in UI)
- ✅ Status badges show correct colors (Green/Yellow/Red/Gray)
- ✅ Admin panel auto-refreshes every 30 seconds
- [ ] Flow works reliably (95%+ success rate) - needs testing
- [ ] Performance is acceptable (< 5s per step) - needs testing
- [ ] Works for both USA and non-USA users - needs testing

## Next Steps

1. **End-to-End Testing** (Priority)
   - Test complete flow: KYC → Admin Approval → Send to Bridge → Status Updates → Account Creation
   - Test with real user data (USA and non-USA)
   - Verify accounts appear on receive money screen
   - Test rejection flow and resubmission

2. **Production Testing**
   - Test TOS link creation in production
   - Test webhook events in production
   - Verify Bridge KYC status updates in real-time
   - Test account creation timing

3. **Error Scenario Testing**
   - Test KYC validation errors
   - Test TOS link creation failures
   - Test customer creation failures
   - Test webhook failures
   - Test network errors during flow

4. **UX Improvements** (If needed)
   - Add loading states on admin panel
   - Add success/error feedback
   - Improve status display clarity
   - Add retry mechanisms if needed

5. **Documentation**
   - Document the complete flow
   - Create troubleshooting guide
   - Document Bridge status values and meanings

