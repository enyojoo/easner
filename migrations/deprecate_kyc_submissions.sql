-- Deprecate kyc_submissions table
-- All KYC data is now stored in the users table
-- 
-- IMPORTANT: Run migrate_kyc_submissions_to_users.sql BEFORE running this migration
-- to migrate existing data from kyc_submissions to users table
--
-- This migration marks the table as deprecated but doesn't drop it yet
-- (to preserve historical data for audit purposes)

-- Add a comment to mark the table as deprecated
COMMENT ON TABLE kyc_submissions IS 'DEPRECATED: KYC data is now stored in the users table. This table is kept for historical data only.';

-- Note: The table is not dropped to preserve historical data
-- If you want to drop it after migrating data and verifying the migration, run:
-- DROP TABLE IF EXISTS kyc_submissions CASCADE;

