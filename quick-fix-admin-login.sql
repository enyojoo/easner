-- Quick Fix: Temporarily disable RLS on admin_users to fix login
-- This will allow admin login to work immediately

-- Disable RLS on admin_users temporarily
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Check status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- Test query (should work now)
SELECT id, email, role, status 
FROM admin_users 
WHERE email = 'admin@easner.com';
