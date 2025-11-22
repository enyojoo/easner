-- Add address text field to kyc_submissions table
ALTER TABLE kyc_submissions
ADD COLUMN IF NOT EXISTS address TEXT;

COMMENT ON COLUMN kyc_submissions.address IS 'User-entered address text for address verification';

