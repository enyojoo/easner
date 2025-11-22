-- Add full_name and date_of_birth columns to kyc_submissions table for identity verification
ALTER TABLE kyc_submissions
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

COMMENT ON COLUMN kyc_submissions.full_name IS 'Full name from identity document';
COMMENT ON COLUMN kyc_submissions.date_of_birth IS 'Date of birth from identity document';

