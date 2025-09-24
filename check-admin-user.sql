-- Check if admin user exists
SELECT * FROM admin_users WHERE email = 'admin@easner.com';

-- Check all admin users
SELECT id, email, role, status FROM admin_users;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'admin_users';
