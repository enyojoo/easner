# Email Verification Auto-Sync Setup

This document explains how to set up automatic verification status updates when users confirm their email addresses.

## What Was Implemented

1. **Webhook Handler** (`app/api/webhooks/supabase-auth/route.ts`)
   - Handles Supabase auth events
   - Automatically updates `verification_status` to "verified" when `email_confirmed_at` is set

2. **Sync Method** (`lib/admin-data-store.ts`)
   - `syncVerificationStatus()` method that compares email confirmation status with verification status
   - Runs automatically when admin data is loaded
   - Updates verification status for users whose emails are confirmed but status is not "verified"

3. **Manual Sync API** (`app/api/admin/sync-verification/route.ts`)
   - Admin-only endpoint to manually trigger verification sync
   - Useful for bulk updates or troubleshooting

4. **Admin UI Button** (`app/admin/users/page.tsx`)
   - "Sync Verification" button in the admin users page
   - Allows admins to manually trigger verification status sync

## Setup Instructions

### 1. Configure Supabase Webhook (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to Database → Webhooks
3. Create a new webhook with these settings:
   - **Table**: `auth.users`
   - **Events**: `UPDATE`
   - **Type**: `HTTP Request`
   - **URL**: `https://yourdomain.com/api/webhooks/supabase-auth`
   - **HTTP Method**: `POST`
   - **HTTP Headers**: `Content-Type: application/json`

### 2. Alternative: Manual Sync

If you prefer not to use webhooks, the system will automatically sync verification status when:
- Admin data is loaded (background sync)
- Admin clicks "Sync Verification" button

## How It Works

1. **Automatic (Webhook)**: When a user confirms their email via Supabase's email verification, the webhook automatically updates their `verification_status` to "verified"

2. **Background Sync**: Every time admin data is loaded, the system checks for users whose emails are confirmed but verification status is not "verified" and updates them

3. **Manual Sync**: Admins can click the "Sync Verification" button to immediately sync all verification statuses

## Testing

To test the functionality:

1. Create a test user account
2. Verify the user's email through Supabase's email verification process
3. Check the admin users page - the verification status should automatically update to "verified"
4. If not automatic, use the "Sync Verification" button

## Notes

- The sync process is non-blocking and runs in the background
- Only users with `email_confirmed_at` set and `verification_status` not equal to "verified" will be updated
- The system uses Supabase's admin API to access auth user data
- All updates are logged for debugging purposes
