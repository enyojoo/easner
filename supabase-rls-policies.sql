-- =====================================================
-- RLS Policies for Easner Application (Safe Version)
-- =====================================================
-- This file contains all the RLS policies needed for your Supabase tables
-- Run these commands in your Supabase SQL editor

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. ADMIN_USERS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role only access" ON admin_users;

-- Only service role can access admin users
CREATE POLICY "Service role only access" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. CURRENCIES TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active currencies" ON currencies;
DROP POLICY IF EXISTS "Service role can modify currencies" ON currencies;

-- Anyone can view active currencies (public data)
CREATE POLICY "Anyone can view active currencies" ON currencies
  FOR SELECT USING (status = 'active');

-- Only service role can modify currencies
CREATE POLICY "Service role can modify currencies" ON currencies
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. EXCHANGE_RATES TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role can modify exchange rates" ON exchange_rates;

-- Anyone can view active exchange rates (public data)
CREATE POLICY "Anyone can view active exchange rates" ON exchange_rates
  FOR SELECT USING (status = 'active');

-- Only service role can modify exchange rates
CREATE POLICY "Service role can modify exchange rates" ON exchange_rates
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. RECIPIENTS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can insert own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can update own recipients" ON recipients;
DROP POLICY IF EXISTS "Users can delete own recipients" ON recipients;
DROP POLICY IF EXISTS "Service role full access recipients" ON recipients;

-- Users can view their own recipients
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own recipients
CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipients
CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own recipients
CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access recipients" ON recipients
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. TRANSACTIONS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Service role can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Service role full access transactions" ON transactions;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own transactions (for status updates, receipts)
CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users cannot delete transactions (for audit trail)
-- Only service role can delete transactions
CREATE POLICY "Service role can delete transactions" ON transactions
  FOR DELETE USING (auth.role() = 'service_role');

-- Service role can do everything
CREATE POLICY "Service role full access transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. PAYMENT_METHODS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Service role can modify payment methods" ON payment_methods;

-- Anyone can view active payment methods (public data)
CREATE POLICY "Anyone can view active payment methods" ON payment_methods
  FOR SELECT USING (status = 'active');

-- Only service role can modify payment methods
CREATE POLICY "Service role can modify payment methods" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. SYSTEM_SETTINGS TABLE
-- =====================================================
-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Service role can modify system settings" ON system_settings;

-- Anyone can view system settings (public data)
CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

-- Only service role can modify system settings
CREATE POLICY "Service role can modify system settings" ON system_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. STORAGE POLICIES (for transaction receipts)
-- =====================================================
-- Enable RLS on storage bucket
-- Note: You'll need to run this in the Storage section of Supabase dashboard
-- or use the Supabase CLI

-- Users can upload receipts for their own transactions
-- CREATE POLICY "Users can upload own receipts" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'transaction-receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Users can view receipts for their own transactions
-- CREATE POLICY "Users can view own receipts" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'transaction-receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Service role can do everything with storage
-- CREATE POLICY "Service role full access storage" ON storage.objects
--   FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify RLS is enabled and policies are created

-- Check if RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings');

-- Check policies for a specific table (replace 'users' with any table name)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';
