# Enabling RLS on Supabase Tables

This guide will help you enable Row Level Security (RLS) on your Supabase tables safely.

## ⚠️ Important: Test First!

Before enabling RLS on production, test these changes in a development environment or staging database.

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

## Step 2: Run the RLS Policies

1. Copy the contents of `supabase-rls-policies.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute all the policies

## Step 3: Verify RLS is Enabled

Run this query to check if RLS is enabled on all tables:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admin_users', 'currencies', 'exchange_rates', 'recipients', 'transactions', 'payment_methods', 'system_settings');
```

All tables should show `rowsecurity = true`.

## Step 4: Test Your Application

1. **Test user login** - Should work normally
2. **Test transaction creation** - Should work normally  
3. **Test viewing transactions** - Should only show user's own transactions
4. **Test admin functions** - Should work normally (using service role)

## Step 5: Monitor for Issues

Watch for these potential issues:

### Common Issues and Solutions:

1. **"Insufficient privileges" errors**
   - Check if the user is properly authenticated
   - Verify the user exists in the `users` table

2. **"Row Level Security policy" errors**
   - Check if the policy conditions match your data structure
   - Verify `auth.uid()` is returning the correct user ID

3. **Admin operations failing**
   - Ensure admin operations use the service role key
   - Check if `auth.role() = 'service_role'` is working

## Step 6: Rollback Plan (if needed)

If you need to disable RLS temporarily:

```sql
-- Disable RLS on all tables (emergency rollback)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE currencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;
```

## Policy Explanation

### User Tables (`users`, `recipients`, `transactions`)
- Users can only access their own data
- Service role can access everything (for admin operations)

### Public Tables (`currencies`, `exchange_rates`, `payment_methods`, `system_settings`)
- Anyone can read active records
- Only service role can modify

### Admin Table (`admin_users`)
- Only service role can access (completely restricted)

## Testing Checklist

- [ ] User can log in
- [ ] User can view their own transactions
- [ ] User can create transactions
- [ ] User can view their own recipients
- [ ] User can create recipients
- [ ] User cannot see other users' data
- [ ] Admin functions work (using service role)
- [ ] Public data (currencies, rates) is accessible
- [ ] Error handling works properly

## If Something Goes Wrong

1. **Immediate fix**: Run the rollback SQL above
2. **Check logs**: Look at Supabase logs for specific errors
3. **Debug policies**: Use the verification queries to check policy status
4. **Test incrementally**: Enable RLS on one table at a time

## Support

If you encounter issues:
1. Check the Supabase logs
2. Test with a simple query first
3. Verify your authentication is working
4. Check if the user exists in the database
