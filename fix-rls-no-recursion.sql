-- Fix RLS without recursion
-- This creates policies that don't cause infinite loops

-- =====================================================
-- 1. Fix USERS table - simple policies without admin_users check
-- =====================================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Admin users can view all users" ON users;
DROP POLICY IF EXISTS "Admin users can update all users" ON users;
DROP POLICY IF EXISTS "Service role full access users" ON users;

-- Users can see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- For now, let's allow all authenticated users to see all users
-- This is temporary until we fix the admin detection
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. Fix TRANSACTIONS table - simple policies
-- =====================================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Admin users can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admin users can update all transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Service role full access transactions" ON transactions;

-- Users can see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- For now, let's allow all authenticated users to see all transactions
-- This is temporary until we fix the admin detection
CREATE POLICY "Authenticated users can view all transactions" ON transactions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. Fix RECIPIENTS table - simple policies
-- =====================================================
-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;
DROP POLICY IF EXISTS "Admin users can view all recipients" ON recipients;
DROP POLICY IF EXISTS "Service role full access recipients" ON recipients;

-- Users can see their own recipients
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- For now, let's allow all authenticated users to see all recipients
-- This is temporary until we fix the admin detection
CREATE POLICY "Authenticated users can view all recipients" ON recipients
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 4. Keep CURRENCIES table - everyone can see
-- =====================================================
DROP POLICY IF EXISTS "Public can view currencies" ON currencies;
DROP POLICY IF EXISTS "Admin users can manage currencies" ON currencies;
DROP POLICY IF EXISTS "Service role full access currencies" ON currencies;

-- Everyone can see currencies
CREATE POLICY "Public can view currencies" ON currencies
  FOR SELECT USING (true);

-- =====================================================
-- 5. Keep EXCHANGE_RATES table - everyone can see
-- =====================================================
DROP POLICY IF EXISTS "Public can view exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admin users can manage exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role full access exchange rates" ON exchange_rates;

-- Everyone can see exchange rates
CREATE POLICY "Public can view exchange rates" ON exchange_rates
  FOR SELECT USING (true);

-- =====================================================
-- 6. Keep SYSTEM_SETTINGS table - everyone can see
-- =====================================================
DROP POLICY IF EXISTS "Public can view settings" ON system_settings;
DROP POLICY IF EXISTS "Admin users can manage settings" ON system_settings;
DROP POLICY IF EXISTS "Service role full access settings" ON system_settings;

-- Everyone can see settings
CREATE POLICY "Public can view settings" ON system_settings
  FOR SELECT USING (true);

-- =====================================================
-- 7. Keep EMAIL_TEMPLATES table - everyone can see
-- =====================================================
DROP POLICY IF EXISTS "Public can view email templates" ON email_templates;
DROP POLICY IF EXISTS "Admin users can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Service role full access email templates" ON email_templates;

-- Everyone can see email templates
CREATE POLICY "Public can view email templates" ON email_templates
  FOR SELECT USING (true);

-- =====================================================
-- 8. Fix ADMIN_USERS table - disable RLS temporarily
-- =====================================================
-- Disable RLS on admin_users to prevent recursion
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all policies on admin_users
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;
