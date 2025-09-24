-- Debug RLS Policies
-- Check what's happening with the policies

-- 1. Check if RLS is enabled on users table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- 2. Check all policies on users table
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY policyname;

-- 3. Check if there are any users in the users table
SELECT COUNT(*) as user_count FROM users;

-- 4. Check if there are any admin users
SELECT COUNT(*) as admin_count FROM admin_users;

-- 5. Check the current user's metadata (this will show what's in the session)
SELECT auth.uid() as current_user_id;

-- 6. Check if the current user has admin metadata
SELECT 
  auth.uid() as user_id,
  auth.role() as user_role,
  (auth.jwt() ->> 'user_metadata')::jsonb as user_metadata;
