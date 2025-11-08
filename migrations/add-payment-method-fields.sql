-- Migration: Add multi-region payment method fields
-- Description: Adds routing_number, sort_code, iban, and swift_bic columns to payment_methods table
-- Date: 2024

-- Add new columns to payment_methods table
ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS routing_number TEXT,
ADD COLUMN IF NOT EXISTS sort_code TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS swift_bic TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN payment_methods.routing_number IS '9-digit routing number for US accounts (USD)';
COMMENT ON COLUMN payment_methods.sort_code IS '6-digit sort code for UK accounts (GBP)';
COMMENT ON COLUMN payment_methods.iban IS 'International Bank Account Number for UK/EURO accounts';
COMMENT ON COLUMN payment_methods.swift_bic IS 'SWIFT/BIC code for UK/EURO accounts';

-- Note: Existing payment methods will have NULL values for these new columns
-- The application code will handle displaying appropriate fields based on currency code
-- No data migration is needed as existing payment methods will continue to work
-- with the existing account_number, account_name, and bank_name fields

