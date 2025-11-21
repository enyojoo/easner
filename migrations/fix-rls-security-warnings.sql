-- Fix RLS Security Warnings
-- This migration fixes all RLS policies that insecurely reference user_metadata
-- and enables RLS on user_profiles table

-- ============================================================================
-- PART 1: Enable RLS on user_profiles table
-- ============================================================================

ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for user_profiles if they don't exist
-- Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles
      FOR SELECT
      USING ((select auth.uid()) = id);
  END IF;
END $$;

-- ============================================================================
-- PART 2: Fix RLS policies that reference user_metadata
-- Replace all policies that check user_metadata.isAdmin with admin_users table check
-- ============================================================================

-- Helper function to check if user is admin (reusable)
-- Uses (select auth.uid()) for better performance (avoids re-evaluation per row)
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
-- CURRENCIES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage currencies" ON currencies;

-- Create secure admin policy
CREATE POLICY "Admin users can manage currencies"
  ON currencies
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- EMAIL_TEMPLATES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage email templates" ON email_templates;

-- Create secure admin policy
CREATE POLICY "Admin users can manage email templates"
  ON email_templates
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- EXCHANGE_RATES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage exchange rates" ON exchange_rates;

-- Create secure admin policy
CREATE POLICY "Admin users can manage exchange rates"
  ON exchange_rates
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- SYSTEM_SETTINGS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage settings" ON system_settings;

-- Create secure admin policy
CREATE POLICY "Admin users can manage settings"
  ON system_settings
  FOR ALL
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admin users can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admin users can update all transactions" ON transactions;

-- Create secure admin policies
CREATE POLICY "Admin users can view all transactions"
  ON transactions
  FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admin users can update all transactions"
  ON transactions
  FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- USERS TABLE
-- ============================================================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Admin users can update all users" ON users;

-- Create secure admin policies
CREATE POLICY "Admin users can view all users"
  ON users
  FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admin users can update all users"
  ON users
  FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- ADMIN_USERS TABLE
-- ============================================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;

-- Create secure admin policy
CREATE POLICY "Admin users can view admin users"
  ON admin_users
  FOR SELECT
  USING (is_admin_user());

-- ============================================================================
-- RECIPIENTS TABLE
-- ============================================================================

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admin users can view all recipients" ON recipients;

-- Create secure admin policy
CREATE POLICY "Admin users can view all recipients"
  ON recipients
  FOR SELECT
  USING (is_admin_user());

-- ============================================================================
-- KYC_SUBMISSIONS TABLE (fix user_profiles reference)
-- ============================================================================

-- Drop existing admin policies that reference user_profiles
DROP POLICY IF EXISTS "Admins can view all KYC submissions" ON kyc_submissions;
DROP POLICY IF EXISTS "Admins can update all KYC submissions" ON kyc_submissions;

-- Create secure admin policies using admin_users table
CREATE POLICY "Admins can view all KYC submissions"
  ON kyc_submissions
  FOR SELECT
  USING (is_admin_user());

CREATE POLICY "Admins can update all KYC submissions"
  ON kyc_submissions
  FOR UPDATE
  USING (is_admin_user())
  WITH CHECK (is_admin_user());

-- ============================================================================
-- NOTES
-- ============================================================================

-- All RLS policies now use the is_admin_user() function which checks the
-- admin_users table instead of user_metadata. This is secure because:
-- 1. admin_users table is managed by application/service layer
-- 2. user_metadata can be edited by end users and is not secure
-- 3. The function uses SECURITY DEFINER to ensure proper access control

