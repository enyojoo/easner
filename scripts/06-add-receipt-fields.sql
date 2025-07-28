-- Add receipt fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_filename TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster queries on transactions with receipts
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_url ON transactions(receipt_url) WHERE receipt_url IS NOT NULL;

-- Update existing transactions to have null receipt fields (already null by default)
-- This is just for documentation purposes
COMMENT ON COLUMN transactions.receipt_url IS 'URL to the uploaded payment receipt in Supabase Storage';
COMMENT ON COLUMN transactions.receipt_filename IS 'Original filename of the uploaded receipt';
COMMENT ON COLUMN transactions.receipt_uploaded_at IS 'Timestamp when the receipt was uploaded';
