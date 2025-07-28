-- Add receipt fields to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_filename TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_receipt_url ON transactions(receipt_url);
