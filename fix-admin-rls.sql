-- Quick fix for admin_users RLS issue
-- Run this in Supabase SQL Editor

-- Temporarily disable RLS on admin_users table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Check if admin_users table is accessible
SELECT * FROM admin_users LIMIT 5;
