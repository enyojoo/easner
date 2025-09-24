-- =====================================================
-- SAFE RLS Setup - Run This Instead
-- =====================================================
-- This version safely handles existing policies

-- First, let's check what policies already exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings')
ORDER BY tablename, policyname;

-- =====================================================
-- Step 1: Enable RLS on all tables
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 2: Drop ALL existing policies (clean slate)
-- =====================================================
-- Users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
END $$;

-- Admin users table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'admin_users')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON admin_users';
    END LOOP;
END $$;

-- Currencies table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'currencies')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON currencies';
    END LOOP;
END $$;

-- Exchange rates table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exchange_rates')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON exchange_rates';
    END LOOP;
END $$;

-- Recipients table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'recipients')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON recipients';
    END LOOP;
END $$;

-- Transactions table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transactions')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON transactions';
    END LOOP;
END $$;

-- Payment methods table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_methods')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON payment_methods';
    END LOOP;
END $$;

-- System settings table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'system_settings')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON system_settings';
    END LOOP;
END $$;

-- =====================================================
-- Step 3: Create new policies
-- =====================================================

-- USERS TABLE POLICIES
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- ADMIN_USERS TABLE POLICIES
CREATE POLICY "Service role only access admin" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- CURRENCIES TABLE POLICIES
CREATE POLICY "Anyone can view active currencies" ON currencies
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service role can modify currencies" ON currencies
  FOR ALL USING (auth.role() = 'service_role');

-- EXCHANGE_RATES TABLE POLICIES
CREATE POLICY "Anyone can view active exchange rates" ON exchange_rates
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service role can modify exchange rates" ON exchange_rates
  FOR ALL USING (auth.role() = 'service_role');

-- RECIPIENTS TABLE POLICIES
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access recipients" ON recipients
  FOR ALL USING (auth.role() = 'service_role');

-- TRANSACTIONS TABLE POLICIES
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can delete transactions" ON transactions
  FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- PAYMENT_METHODS TABLE POLICIES
CREATE POLICY "Anyone can view active payment methods" ON payment_methods
  FOR SELECT USING (status = 'active');

CREATE POLICY "Service role can modify payment methods" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- SYSTEM_SETTINGS TABLE POLICIES
CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role can modify system settings" ON system_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- Step 4: Verify everything is working
-- =====================================================
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings')
ORDER BY tablename;

-- Check policies
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings')
ORDER BY tablename, policyname;
