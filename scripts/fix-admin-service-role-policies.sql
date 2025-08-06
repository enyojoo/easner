-- First, let's check if RLS is properly configured for service role
-- The service role should bypass RLS, but let's ensure our policies work correctly

-- Drop existing admin policies that might be conflicting
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

DROP POLICY IF EXISTS "Admins can create currencies" ON currencies;
DROP POLICY IF EXISTS "Admins can update currencies" ON currencies;
DROP POLICY IF EXISTS "Admins can delete currencies" ON currencies;

DROP POLICY IF EXISTS "Admins can create exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can update exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can delete exchange rates" ON exchange_rates;

DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can create system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Super admins can delete system settings" ON system_settings;

-- Create a function to check if current user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('role') = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is admin (works with service role)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Service role bypasses all checks
  IF is_service_role() THEN
    RETURN TRUE;
  END IF;
  
  -- Check if authenticated user is an active admin
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMIN_USERS TABLE POLICIES (Service role friendly)
CREATE POLICY "Service role and admins can view admin users" ON admin_users
FOR SELECT
TO authenticated
USING ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and super admins can create admin users" ON admin_users
FOR INSERT
TO authenticated
WITH CHECK ( 
  is_service_role() OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

CREATE POLICY "Service role and super admins can update admin users" ON admin_users
FOR UPDATE
TO authenticated
USING ( 
  is_service_role() OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
)
WITH CHECK ( 
  is_service_role() OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

CREATE POLICY "Service role and super admins can delete admin users" ON admin_users
FOR DELETE
TO authenticated
USING ( 
  is_service_role() OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- CURRENCIES TABLE POLICIES (Service role friendly)
CREATE POLICY "Service role and admins can create currencies" ON currencies
FOR INSERT
TO authenticated
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can update currencies" ON currencies
FOR UPDATE
TO authenticated
USING ( is_service_role() OR is_admin_user() )
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can delete currencies" ON currencies
FOR DELETE
TO authenticated
USING ( is_service_role() OR is_admin_user() );

-- EXCHANGE_RATES TABLE POLICIES (Service role friendly)
CREATE POLICY "Service role and admins can create exchange rates" ON exchange_rates
FOR INSERT
TO authenticated
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can update exchange rates" ON exchange_rates
FOR UPDATE
TO authenticated
USING ( is_service_role() OR is_admin_user() )
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can delete exchange rates" ON exchange_rates
FOR DELETE
TO authenticated
USING ( is_service_role() OR is_admin_user() );

-- TRANSACTIONS TABLE POLICIES (Service role friendly)
CREATE POLICY "Service role and admins can view all transactions" ON transactions
FOR SELECT
TO authenticated
USING ( 
  is_service_role() OR 
  is_admin_user() OR 
  (SELECT auth.uid()) = user_id 
);

CREATE POLICY "Service role and admins can update transactions" ON transactions
FOR UPDATE
TO authenticated
USING ( is_service_role() OR is_admin_user() )
WITH CHECK ( is_service_role() OR is_admin_user() );

-- USERS TABLE POLICIES (Service role friendly)
-- Add policy for service role to update users
CREATE POLICY "Service role and admins can update any user" ON users
FOR UPDATE
TO authenticated
USING ( is_service_role() OR is_admin_user() )
WITH CHECK ( is_service_role() OR is_admin_user() OR (SELECT auth.uid()) = id );

-- SYSTEM_SETTINGS TABLE POLICIES (Service role friendly)
CREATE POLICY "Service role and admins can view system settings" ON system_settings
FOR SELECT
TO authenticated
USING ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can create system settings" ON system_settings
FOR INSERT
TO authenticated
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and admins can update system settings" ON system_settings
FOR UPDATE
TO authenticated
USING ( is_service_role() OR is_admin_user() )
WITH CHECK ( is_service_role() OR is_admin_user() );

CREATE POLICY "Service role and super admins can delete system settings" ON system_settings
FOR DELETE
TO authenticated
USING ( 
  is_service_role() OR 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- Grant necessary permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
