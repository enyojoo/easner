-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage all data" ON users;
DROP POLICY IF EXISTS "Admin users can manage all transactions" ON transactions;
DROP POLICY IF EXISTS "Admin users can manage all currencies" ON currencies;
DROP POLICY IF EXISTS "Admin users can manage all exchange_rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admin users can manage all recipients" ON recipients;
DROP POLICY IF EXISTS "Admin users can manage all payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Admin users can manage all system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admin users can manage all email_templates" ON email_templates;

-- Create helper function to check if current user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('role') = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role bypasses all checks
  IF is_service_role() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if authenticated user is in admin_users table
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (auth.jwt() ->> 'email')
    AND status = 'active'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Service role and admins can manage users"
ON users FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Transactions table policies  
CREATE POLICY "Service role and admins can manage transactions"
ON transactions FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Currencies table policies
CREATE POLICY "Service role and admins can manage currencies"
ON currencies FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Exchange rates table policies
CREATE POLICY "Service role and admins can manage exchange_rates"
ON exchange_rates FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Recipients table policies
CREATE POLICY "Service role and admins can manage recipients"
ON recipients FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Payment methods table policies
CREATE POLICY "Service role and admins can manage payment_methods"
ON payment_methods FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- System settings table policies
CREATE POLICY "Service role and admins can manage system_settings"
ON system_settings FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Email templates table policies (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_templates') THEN
    EXECUTE 'CREATE POLICY "Service role and admins can manage email_templates"
    ON email_templates FOR ALL
    TO authenticated, service_role
    USING (is_service_role() OR is_admin_user())
    WITH CHECK (is_service_role() OR is_admin_user())';
  END IF;
END $$;

-- Admin users table policies
CREATE POLICY "Service role and admins can manage admin_users"
ON admin_users FOR ALL
TO authenticated, service_role
USING (is_service_role() OR is_admin_user())
WITH CHECK (is_service_role() OR is_admin_user());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
