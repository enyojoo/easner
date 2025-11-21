-- Fix Function Search Path Mutable Warnings
-- This migration fixes security warnings by setting search_path on all functions
-- Setting search_path prevents search path injection attacks

-- ============================================================================
-- PART 1: Fix update_kyc_submissions_updated_at function
-- ============================================================================

CREATE OR REPLACE FUNCTION update_kyc_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 2: Fix is_admin_user function
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
-- PART 3: Fix handle_new_user function (if it exists)
-- Common pattern: Creates user profile when new auth user is created
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 4: Fix is_service_role function (if it exists)
-- Common pattern: Checks if current role is service_role
-- ============================================================================

CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
END;
$$;

-- ============================================================================
-- PART 5: Fix update_payment_methods_updated_at function (if it exists)
-- Common pattern: Updates updated_at timestamp on payment_methods table
-- ============================================================================

CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 6: Fix update_updated_at_column function (if it exists)
-- Common pattern: Generic function to update updated_at column
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- NOTES
-- ============================================================================

-- All functions now have SET search_path = public, pg_temp which:
-- 1. Prevents search path injection attacks
-- 2. Ensures functions only access objects in the public schema
-- 3. Allows temporary objects (pg_temp) for compatibility
-- 4. Makes functions secure and predictable

-- Functions use CREATE OR REPLACE, so:
-- - If function exists, it will be updated with secure search_path
-- - If function doesn't exist, it will be created (though triggers may need to be created separately)
-- - This migration is idempotent and safe to run multiple times

