-- Add KYC-related columns to users table
-- This migration consolidates all KYC data into the users table

-- Add name columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS middle_name TEXT;

-- Add KYC data columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Add Bridge KYC metadata (JSONB for structured data)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bridge_kyc_metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on bridge_kyc_metadata for faster queries
CREATE INDEX IF NOT EXISTS idx_users_bridge_kyc_metadata ON users USING GIN (bridge_kyc_metadata);

-- Add comment to document the purpose
COMMENT ON COLUMN users.middle_name IS 'Middle name from Bridge KYC verification';
COMMENT ON COLUMN users.date_of_birth IS 'Date of birth from Bridge KYC verification';
COMMENT ON COLUMN users.address IS 'Residential address from Bridge KYC verification';
COMMENT ON COLUMN users.country_code IS '2-letter country code from Bridge KYC verification';
COMMENT ON COLUMN users.bridge_kyc_metadata IS 'JSON metadata containing Bridge KYC data (SSN, passport, employment, etc.)';

