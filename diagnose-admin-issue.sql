-- Diagnose Admin Login Issue
-- Run this to understand what's happening

-- 1. Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';

-- 2. Check all policies on admin_users
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'admin_users'
ORDER BY policyname;

-- 3. Check admin user data
SELECT id, email, role, status, created_at 
FROM admin_users 
WHERE email = 'admin@easner.com';

-- 4. Check if there are any users with this email in the users table
SELECT id, email, created_at 
FROM users 
WHERE email = 'admin@easner.com';

-- 5. Check auth.users table (if accessible)
-- This might show the actual user ID that's being authenticated
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
WHERE email = 'admin@easner.com';
