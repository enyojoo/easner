-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- USERS TABLE POLICIES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = id );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = id )
WITH CHECK ( (SELECT auth.uid()) = id );

-- Allow user registration
CREATE POLICY "Allow user registration" ON users
FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = id );

-- Users cannot delete their own account (business rule)
CREATE POLICY "Users cannot delete accounts" ON users
FOR DELETE
TO authenticated
USING ( false );

-- ADMIN_USERS TABLE POLICIES
-- Only admins can view admin users
CREATE POLICY "Admins can view admin users" ON admin_users
FOR SELECT
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only super admins can create admin users
CREATE POLICY "Super admins can create admin users" ON admin_users
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- Only super admins can update admin users
CREATE POLICY "Super admins can update admin users" ON admin_users
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- Only super admins can delete admin users
CREATE POLICY "Super admins can delete admin users" ON admin_users
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- CURRENCIES TABLE POLICIES
-- Everyone can view currencies (public data)
CREATE POLICY "Anyone can view currencies" ON currencies
FOR SELECT
TO authenticated, anon
USING ( true );

-- Only admins can create currencies
CREATE POLICY "Admins can create currencies" ON currencies
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can update currencies
CREATE POLICY "Admins can update currencies" ON currencies
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can delete currencies
CREATE POLICY "Admins can delete currencies" ON currencies
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- EXCHANGE_RATES TABLE POLICIES
-- Everyone can view exchange rates (public data)
CREATE POLICY "Anyone can view exchange rates" ON exchange_rates
FOR SELECT
TO authenticated, anon
USING ( true );

-- Only admins can create exchange rates
CREATE POLICY "Admins can create exchange rates" ON exchange_rates
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can update exchange rates
CREATE POLICY "Admins can update exchange rates" ON exchange_rates
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can delete exchange rates
CREATE POLICY "Admins can delete exchange rates" ON exchange_rates
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- TRANSACTIONS TABLE POLICIES
-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON transactions
FOR SELECT
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Users can create their own transactions
CREATE POLICY "Users can create own transactions" ON transactions
FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = user_id );

-- Only admins can update transactions (for status changes)
CREATE POLICY "Admins can update transactions" ON transactions
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- No one can delete transactions (audit trail)
CREATE POLICY "No one can delete transactions" ON transactions
FOR DELETE
TO authenticated
USING ( false );

-- RECIPIENTS TABLE POLICIES
-- Users can view their own recipients
CREATE POLICY "Users can view own recipients" ON recipients
FOR SELECT
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

-- Users can create their own recipients
CREATE POLICY "Users can create own recipients" ON recipients
FOR INSERT
TO authenticated
WITH CHECK ( (SELECT auth.uid()) = user_id );

-- Users can update their own recipients
CREATE POLICY "Users can update own recipients" ON recipients
FOR UPDATE
TO authenticated
USING ( (SELECT auth.uid()) = user_id )
WITH CHECK ( (SELECT auth.uid()) = user_id );

-- Users can delete their own recipients
CREATE POLICY "Users can delete own recipients" ON recipients
FOR DELETE
TO authenticated
USING ( (SELECT auth.uid()) = user_id );

-- PAYMENT_METHODS TABLE POLICIES
-- Everyone can view payment methods (public data)
CREATE POLICY "Anyone can view payment methods" ON payment_methods
FOR SELECT
TO authenticated, anon
USING ( true );

-- Only admins can create payment methods
CREATE POLICY "Admins can create payment methods" ON payment_methods
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can update payment methods
CREATE POLICY "Admins can update payment methods" ON payment_methods
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can delete payment methods
CREATE POLICY "Admins can delete payment methods" ON payment_methods
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- SYSTEM_SETTINGS TABLE POLICIES
-- Only admins can view system settings
CREATE POLICY "Admins can view system settings" ON system_settings
FOR SELECT
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can create system settings
CREATE POLICY "Admins can create system settings" ON system_settings
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can update system settings
CREATE POLICY "Admins can update system settings" ON system_settings
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only super admins can delete system settings
CREATE POLICY "Super admins can delete system settings" ON system_settings
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND role = 'super_admin' AND status = 'active'
  )
);

-- EMAIL_TEMPLATES TABLE POLICIES
-- Only admins can view email templates
CREATE POLICY "Admins can view email templates" ON email_templates
FOR SELECT
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can create email templates
CREATE POLICY "Admins can create email templates" ON email_templates
FOR INSERT
TO authenticated
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can update email templates
CREATE POLICY "Admins can update email templates" ON email_templates
FOR UPDATE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
)
WITH CHECK ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);

-- Only admins can delete email templates
CREATE POLICY "Admins can delete email templates" ON email_templates
FOR DELETE
TO authenticated
USING ( 
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = (SELECT auth.uid()) AND status = 'active'
  )
);
