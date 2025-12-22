-- Add address fields, transfer_type, and checking_or_savings to recipients table
ALTER TABLE recipients
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS transfer_type TEXT CHECK (transfer_type IN ('ACH', 'Wire')),
ADD COLUMN IF NOT EXISTS checking_or_savings TEXT CHECK (checking_or_savings IN ('checking', 'savings'));

-- Add comment for documentation
COMMENT ON COLUMN recipients.address_line1 IS 'Street address line 1 (required for US bank accounts)';
COMMENT ON COLUMN recipients.address_line2 IS 'Street address line 2 (optional)';
COMMENT ON COLUMN recipients.city IS 'City (required for US bank accounts)';
COMMENT ON COLUMN recipients.state IS 'State code (required for US bank accounts)';
COMMENT ON COLUMN recipients.postal_code IS 'ZIP/Postal code (required for US bank accounts)';
COMMENT ON COLUMN recipients.transfer_type IS 'Transfer type for US accounts: ACH or Wire';
COMMENT ON COLUMN recipients.checking_or_savings IS 'Account type for US accounts: checking or savings';

