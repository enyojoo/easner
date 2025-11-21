-- Verify feature flags setup
-- Run this in Supabase SQL editor to check if everything is set up correctly

-- 1. Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'feature_flags'
) AS table_exists;

-- 2. Check if data exists
SELECT COUNT(*) as flag_count FROM feature_flags;

-- 3. Show all feature flags
SELECT * FROM feature_flags;

-- 4. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'feature_flags';

-- 5. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'feature_flags';

