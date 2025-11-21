-- Fix RLS Performance Warnings
-- This migration fixes:
-- 1. auth_rls_initplan warnings by wrapping auth.uid() in (select auth.uid())
-- 2. multiple_permissive_policies warnings by combining policies where appropriate

-- ============================================================================
-- PART 1: Update is_admin_user() function to use (select auth.uid())
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = (select auth.uid())
    AND (admin_users.status IS NULL OR admin_users.status = 'active')
  );
END;
$$;

-- ============================================================================
-- PART 2: Fix all user policies to use (select auth.uid()) for performance
-- ============================================================================

-- USER_PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

-- USERS TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Combine user and admin policies to avoid multiple permissive policies
CREATE POLICY "Users can view own profile or admins can view all"
  ON users
  FOR SELECT
  USING (
    (select auth.uid()) = id 
    OR is_admin_user()
  );

CREATE POLICY "Users can update own profile or admins can update all"
  ON users
  FOR UPDATE
  USING (
    (select auth.uid()) = id 
    OR is_admin_user()
  )
  WITH CHECK (
    (select auth.uid()) = id 
    OR is_admin_user()
  );

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- RECIPIENTS TABLE
DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;

-- Combine user and admin policies
CREATE POLICY "Users can view own recipients or admins can view all"
  ON recipients
  FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR is_admin_user()
  );

CREATE POLICY "Users can insert own recipients"
  ON recipients
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own recipients"
  ON recipients
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own recipients"
  ON recipients
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Combine user and admin policies
CREATE POLICY "Users can view own transactions or admins can view all"
  ON transactions
  FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR is_admin_user()
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions or admins can update all"
  ON transactions
  FOR UPDATE
  USING (
    (select auth.uid()) = user_id 
    OR is_admin_user()
  )
  WITH CHECK (
    (select auth.uid()) = user_id 
    OR is_admin_user()
  );

-- CRYPTO_WALLETS TABLE
DROP POLICY IF EXISTS "Users can view their own wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can create their own wallets" ON crypto_wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON crypto_wallets;

CREATE POLICY "Users can view their own wallets"
  ON crypto_wallets
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own wallets"
  ON crypto_wallets
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own wallets"
  ON crypto_wallets
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- CRYPTO_RECEIVE_TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Users can view their own receive transactions" ON crypto_receive_transactions;

CREATE POLICY "Users can view their own receive transactions"
  ON crypto_receive_transactions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- CARDS TABLE
DROP POLICY IF EXISTS "Users can view their own cards" ON cards;
DROP POLICY IF EXISTS "Users can create their own cards" ON cards;
DROP POLICY IF EXISTS "Users can update their own cards" ON cards;

CREATE POLICY "Users can view their own cards"
  ON cards
  FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own cards"
  ON cards
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own cards"
  ON cards
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- KYC_SUBMISSIONS TABLE
DROP POLICY IF EXISTS "Users can view own KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can create own KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Users can update own pending KYC submissions" ON kyc_submissions;

-- Combine user and admin policies
CREATE POLICY "Users can view own KYC submissions or admins can view all"
  ON kyc_submissions
  FOR SELECT
  USING (
    (select auth.uid()) = user_id 
    OR is_admin_user()
  );

CREATE POLICY "Users can create own KYC submissions"
  ON kyc_submissions
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own pending KYC submissions or admins can update all"
  ON kyc_submissions
  FOR UPDATE
  USING (
    ((select auth.uid()) = user_id AND status = 'pending')
    OR is_admin_user()
  )
  WITH CHECK (
    ((select auth.uid()) = user_id AND status = 'pending')
    OR is_admin_user()
  );

-- ============================================================================
-- PART 3: Fix storage policies for KYC documents
-- ============================================================================

DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;

CREATE POLICY "Users can upload own KYC documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (
      (storage.foldername(name))[1] = 'identity' OR
      (storage.foldername(name))[1] = 'address'
    ) AND
    split_part((storage.foldername(name))[2], '_', 1) = (select auth.uid())::text
  );

-- Combine user and admin policies
CREATE POLICY "Users can view own KYC documents or admins can view all"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND
    (
      split_part((storage.foldername(name))[2], '_', 1) = (select auth.uid())::text
      OR is_admin_user()
    )
  );

-- ============================================================================
-- PART 4: Fix early_access_requests and payment_methods policies
-- ============================================================================

-- EARLY_ACCESS_REQUESTS TABLE
DROP POLICY IF EXISTS "Admin users can view all early access requests" ON early_access_requests;
DROP POLICY IF EXISTS "Admin users can update early access requests" ON early_access_requests;

CREATE POLICY "Admin users can view all early access requests"
  ON early_access_requests
  FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admin users can update early access requests"
  ON early_access_requests
  FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- PAYMENT_METHODS TABLE
DROP POLICY IF EXISTS "Admin users can manage payment methods" ON payment_methods;

CREATE POLICY "Admin users can manage payment methods"
  ON payment_methods
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- PART 5: Remove duplicate "Service role full access" policies
-- Service role bypasses RLS entirely, so these policies are redundant
-- and cause multiple_permissive_policies warnings
-- ============================================================================

-- Drop service role policies that conflict with admin policies
-- Note: Service role operations bypass RLS, so these policies aren't needed
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access email_templates" ON email_templates;
DROP POLICY IF EXISTS "Service role full access exchange_rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role full access payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Service role full access system_settings" ON system_settings;

-- ============================================================================
-- PART 6: Fix currencies, email_templates, exchange_rates, system_settings
-- Combine public read policies with admin policies to avoid multiple permissive
-- ============================================================================

-- CURRENCIES TABLE - Combine public read with admin manage
-- Note: Keep existing "Anyone can view active currencies" or "Public can view currencies" 
-- but ensure admin policy doesn't conflict. Since admin can manage (ALL), it includes SELECT.
-- The multiple permissive warning is expected here - public can read, admin can do everything.
-- This is acceptable as they serve different purposes.

-- EMAIL_TEMPLATES TABLE - Similar situation
-- Public can view, admin can manage. This is acceptable.

-- EXCHANGE_RATES TABLE - Similar situation  
-- Public can view, admin can manage. This is acceptable.

-- SYSTEM_SETTINGS TABLE - Similar situation
-- Public can view, admin can manage. This is acceptable.

-- Note: The multiple permissive policies for public read + admin manage are acceptable
-- because they serve different purposes. However, if you want to eliminate the warnings,
-- you could combine them, but that would make the policies more complex.

-- ============================================================================
-- NOTES
-- ============================================================================

-- All policies now use (select auth.uid()) instead of auth.uid() for better performance
-- Multiple permissive policies have been combined using OR conditions
-- This reduces the number of policies that need to be evaluated per query

