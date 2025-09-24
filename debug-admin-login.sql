-- Debug Admin Login Issues
-- Run this to check the current state

-- 1. Check if RLS is enabled on admin_users
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 2. Check existing policies on admin_users
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 3. Check if admin user exists
SELECT id, email, role, status, created_at 
FROM admin_users 
WHERE email = 'admin@easner.com';

-- 4. Test service role access (this should work)
-- Note: This will only work if you run it with service role key
SELECT 'Service role test' as test_type, count(*) as admin_count
FROM admin_users 
WHERE email = 'admin@easner.com';
