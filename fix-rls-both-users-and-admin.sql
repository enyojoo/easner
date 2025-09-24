-- Fix RLS for BOTH users and admins
-- This ensures both user pages and admin pages work

-- =====================================================
-- 1. Fix USERS table - allow users to see own data, admins to see all
-- =====================================================
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

-- Admin users can see all users
CREATE POLICY "Admin users can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- Admin users can update all users
CREATE POLICY "Admin users can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 2. Fix TRANSACTIONS table - allow users to see own data, admins to see all
-- =====================================================
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

-- Admin users can see all transactions
CREATE POLICY "Admin users can view all transactions" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- Admin users can update all transactions
CREATE POLICY "Admin users can update all transactions" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 3. Fix RECIPIENTS table - allow users to see own data, admins to see all
-- =====================================================
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

-- Admin users can see all recipients
CREATE POLICY "Admin users can view all recipients" ON recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 4. Keep CURRENCIES table - everyone can see, admins can manage
-- =====================================================
-- These should already be working, but let's make sure
DROP POLICY IF EXISTS "Public can view currencies" ON currencies;
DROP POLICY IF EXISTS "Admin users can manage currencies" ON currencies;
DROP POLICY IF EXISTS "Service role full access currencies" ON currencies;

-- Everyone can see currencies
CREATE POLICY "Public can view currencies" ON currencies
  FOR SELECT USING (true);

-- Admin users can manage currencies
CREATE POLICY "Admin users can manage currencies" ON currencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 5. Keep EXCHANGE_RATES table - everyone can see, admins can manage
-- =====================================================
-- These should already be working, but let's make sure
DROP POLICY IF EXISTS "Public can view exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admin users can manage exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Service role full access exchange rates" ON exchange_rates;

-- Everyone can see exchange rates
CREATE POLICY "Public can view exchange rates" ON exchange_rates
  FOR SELECT USING (true);

-- Admin users can manage exchange rates
CREATE POLICY "Admin users can manage exchange rates" ON exchange_rates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 6. Keep SYSTEM_SETTINGS table - everyone can see, admins can manage
-- =====================================================
DROP POLICY IF EXISTS "Public can view settings" ON system_settings;
DROP POLICY IF EXISTS "Admin users can manage settings" ON system_settings;
DROP POLICY IF EXISTS "Service role full access settings" ON system_settings;

-- Everyone can see settings
CREATE POLICY "Public can view settings" ON system_settings
  FOR SELECT USING (true);

-- Admin users can manage settings
CREATE POLICY "Admin users can manage settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 7. Keep EMAIL_TEMPLATES table - everyone can see, admins can manage
-- =====================================================
DROP POLICY IF EXISTS "Public can view email templates" ON email_templates;
DROP POLICY IF EXISTS "Admin users can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Service role full access email templates" ON email_templates;

-- Everyone can see email templates
CREATE POLICY "Public can view email templates" ON email_templates
  FOR SELECT USING (true);

-- Admin users can manage email templates
CREATE POLICY "Admin users can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- =====================================================
-- 8. Keep ADMIN_USERS table - only admins can see
-- =====================================================
DROP POLICY IF EXISTS "Admin users can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Service role full access admin_users" ON admin_users;

-- Admin users can see admin users
CREATE POLICY "Admin users can view admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
        OR (auth.users.raw_user_meta_data->>'role') = 'super_admin'
      )
    )
  );

-- Service role can do everything
CREATE POLICY "Service role full access admin_users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');
