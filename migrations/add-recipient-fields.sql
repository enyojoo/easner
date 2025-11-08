-- Migration: Add new columns to recipients table for multi-region account support
-- This migration adds routing_number, sort_code, iban, and swift_bic columns
-- to support US, UK, and EURO account types

ALTER TABLE recipients
ADD COLUMN routing_number TEXT,
ADD COLUMN sort_code TEXT,
ADD COLUMN iban TEXT,
ADD COLUMN swift_bic TEXT;

-- Add comments for the new columns
COMMENT ON COLUMN recipients.routing_number IS 'Routing number for US bank accounts (9 digits)';
COMMENT ON COLUMN recipients.sort_code IS 'Sort code for UK bank accounts (6 digits)';
COMMENT ON COLUMN recipients.iban IS 'IBAN for European and some other bank accounts';
COMMENT ON COLUMN recipients.swift_bic IS 'SWIFT/BIC code for international bank transfers';

-- Note: Existing recipient data is preserved. The new columns are nullable
-- to maintain backward compatibility with existing recipients.

