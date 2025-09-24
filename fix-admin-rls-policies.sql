-- Fix RLS Policies for Admin Operations
-- This ensures admin pages work with RLS enabled

-- =====================================================
-- 1. Re-enable RLS on admin_users table
-- =====================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role only access admin" ON admin_users;

-- Create proper admin_users policy
CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. Fix USERS table policies for admin access
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role full access users" ON users;

-- Create new policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. Fix TRANSACTIONS table policies for admin access
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Service role full access transactions" ON transactions;

-- Create new policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. Fix RECIPIENTS table policies for admin access
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;
DROP POLICY IF EXISTS "Service role full access recipients" ON recipients;

-- Create new policies
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access recipients" ON recipients
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. Fix CURRENCIES table policies
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active currencies" ON currencies;
DROP POLICY IF EXISTS "Service role can modify currencies" ON currencies;

-- Create new policies
CREATE POLICY "Anyone can view active currencies" ON currencies
  FOR SELECT USING (status = 'active');

-- Service role can do everything
CREATE POLICY "Service role full access currencies" ON currencies
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. Fix EXCHANGE_RATES table policies
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role can modify exchange rates" ON exchange_rates;

-- Create new policies
CREATE POLICY "Anyone can view active exchange rates" ON exchange_rates
  FOR SELECT USING (status = 'active');

-- Service role can do everything
CREATE POLICY "Service role full access exchange_rates" ON exchange_rates
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. Fix PAYMENT_METHODS table policies
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Service role can modify payment methods" ON payment_methods;

-- Create new policies
CREATE POLICY "Anyone can view active payment methods" ON payment_methods
  FOR SELECT USING (status = 'active');

-- Service role can do everything
CREATE POLICY "Service role full access payment_methods" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. Fix SYSTEM_SETTINGS table policies
-- =====================================================
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Service role can modify system settings" ON system_settings;

-- Create new policies
CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access system_settings" ON system_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. Verify RLS is enabled and policies are working
-- =====================================================
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings')
ORDER BY tablename;

-- Check policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings')
ORDER BY tablename, policyname;
