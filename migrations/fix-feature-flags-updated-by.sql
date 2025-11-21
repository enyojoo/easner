-- Fix feature_flags.updated_by foreign key constraint
-- This allows admin users (who are in admin_users table, not users table) to update feature flags

-- Drop the existing foreign key constraint
ALTER TABLE feature_flags 
DROP CONSTRAINT IF EXISTS feature_flags_updated_by_fkey;

-- Re-add the constraint but allow NULL values (which is already the case, but make it explicit)
-- Since admin users are in admin_users table, we'll set updated_by to NULL for admin updates
-- The column already allows NULL, so we just need to ensure the constraint allows it
ALTER TABLE feature_flags
ADD CONSTRAINT feature_flags_updated_by_fkey 
FOREIGN KEY (updated_by) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- Note: The updated_by column will be set to NULL when admin users (who don't exist in users table) update flags
-- This is acceptable since we track who made the change via the admin_users table and application logs

