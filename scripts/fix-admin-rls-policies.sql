-- Fix admin_users policies to allow proper authentication
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can create admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can update admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can delete admin users" ON admin_users;

-- Allow admin login verification (needed for authentication)
CREATE POLICY "Allow admin login verification" ON admin_users
FOR SELECT
TO authenticated, anon
USING ( true );

-- Only authenticated admins can create admin users
CREATE POLICY "Authenticated admins can create admin users" ON admin_users
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT auth.email()) AND status = 'active'
  )
);

-- Only authenticated admins can update admin users
CREATE POLICY "Authenticated admins can update admin users" ON admin_users
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT auth.email()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT auth.email()) AND status = 'active'
  )
);

-- Only authenticated admins can delete admin users
CREATE POLICY "Authenticated admins can delete admin users" ON admin_users
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (SELECT auth.email()) AND status = 'active'
  )
);

-- Fix other admin-related policies to use service role for admin operations
DROP POLICY IF EXISTS "Admins can create currencies" ON currencies;
DROP POLICY IF EXISTS "Admins can update currencies" ON currencies;
DROP POLICY IF EXISTS "Admins can delete currencies" ON currencies;

-- Currencies - allow service role to manage
CREATE POLICY "Service role can manage currencies" ON currencies
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- Exchange rates - allow service role to manage
DROP POLICY IF EXISTS "Admins can create exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can update exchange rates" ON exchange_rates;
DROP POLICY IF EXISTS "Admins can delete exchange rates" ON exchange_rates;

CREATE POLICY "Service role can manage exchange rates" ON exchange_rates
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- Payment methods - allow service role to manage
DROP POLICY IF EXISTS "Admins can create payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can update payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can delete payment methods" ON payment_methods;

CREATE POLICY "Service role can manage payment methods" ON payment_methods
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- System settings - allow service role to manage
DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can create system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Super admins can delete system settings" ON system_settings;

CREATE POLICY "Service role can manage system settings" ON system_settings
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- Email templates - allow service role to manage
DROP POLICY IF EXISTS "Admins can view email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can create email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can update email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can delete email templates" ON email_templates;

CREATE POLICY "Service role can manage email templates" ON email_templates
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- Transactions - allow admins to view all and update status
DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
DROP POLICY IF EXISTS "Admins can update transactions" ON transactions;

CREATE POLICY "Service role can manage all transactions" ON transactions
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- Disable RLS for admin operations by creating permissive policies for service role

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Admin users can manage all data" ON transactions;
DROP POLICY IF EXISTS "Admin users can manage all users" ON users;
DROP POLICY IF EXISTS "Admin users can manage currencies" ON currencies;
DROP POLICY IF EXISTS "Admin users can manage exchange rates" ON exchange_rates;

-- Create permissive policies for admin operations
CREATE POLICY "Service role can manage all transactions" ON transactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all users" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all currencies" ON currencies
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all exchange rates" ON exchange_rates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all recipients" ON recipients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage all payment methods" ON payment_methods
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure admin users table has proper policies
CREATE POLICY "Service role can manage admin users" ON admin_users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
