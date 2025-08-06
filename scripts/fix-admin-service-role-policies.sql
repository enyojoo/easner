-- Drop existing policies first
DROP POLICY IF EXISTS "Admin can manage all users" ON users;
DROP POLICY IF EXISTS "Admin can manage all transactions" ON transactions;
DROP POLICY IF EXISTS "Admin can manage all currencies" ON currencies;
DROP POLICY IF EXISTS "Admin can manage all exchange_rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admin can manage all settings" ON settings;

-- Create helper function to check if current user is service role
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS boolean AS $$
BEGIN
  RETURN current_setting('role') = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Service role can manage all users" ON users
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all users" ON users
FOR ALL TO authenticated
USING (is_admin_user() OR is_service_role())
WITH CHECK (is_admin_user() OR is_service_role());

-- Transactions table policies  
CREATE POLICY "Service role can manage all transactions" ON transactions
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all transactions" ON transactions
FOR ALL TO authenticated
USING (is_admin_user() OR is_service_role())
WITH CHECK (is_admin_user() OR is_service_role());

-- Currencies table policies
CREATE POLICY "Service role can manage all currencies" ON currencies
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all currencies" ON currencies
FOR ALL TO authenticated
USING (is_admin_user() OR is_service_role())
WITH CHECK (is_admin_user() OR is_service_role());

-- Exchange rates table policies
CREATE POLICY "Service role can manage all exchange_rates" ON exchange_rates
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all exchange_rates" ON exchange_rates
FOR ALL TO authenticated
USING (is_admin_user() OR is_service_role())
WITH CHECK (is_admin_user() OR is_service_role());

-- Settings table policies
CREATE POLICY "Service role can manage all settings" ON settings
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin can manage all settings" ON settings
FOR ALL TO authenticated
USING (is_admin_user() OR is_service_role())
WITH CHECK (is_admin_user() OR is_service_role());

-- Grant necessary permissions to service_role
GRANT ALL ON users TO service_role;
GRANT ALL ON transactions TO service_role;
GRANT ALL ON currencies TO service_role;
GRANT ALL ON exchange_rates TO service_role;
GRANT ALL ON settings TO service_role;
