-- Migration: Migrate from Stellar to Bridge Architecture
-- Description: Updates schema to support Bridge Liquidation Addresses (bank payouts) and Bridge Cards Top-Up (card payouts)
-- Date: 2025

-- ============================================================================
-- PART 1: Update crypto_wallets table to support Bridge addresses
-- ============================================================================

-- Add Bridge-specific columns to crypto_wallets
ALTER TABLE crypto_wallets
ADD COLUMN IF NOT EXISTS bridge_customer_id TEXT,
ADD COLUMN IF NOT EXISTS destination_type TEXT CHECK (destination_type IN ('bank', 'card')),
ADD COLUMN IF NOT EXISTS bridge_liquidation_address_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_address TEXT,
ADD COLUMN IF NOT EXISTS blockchain_memo TEXT,
ADD COLUMN IF NOT EXISTS external_account_id TEXT,
ADD COLUMN IF NOT EXISTS bridge_card_account_id TEXT,
ADD COLUMN IF NOT EXISTS destination_payment_rail TEXT CHECK (destination_payment_rail IN ('wire', 'card')),
ADD COLUMN IF NOT EXISTS destination_currency TEXT,
ADD COLUMN IF NOT EXISTS destination_wire_message TEXT,
ADD COLUMN IF NOT EXISTS chain TEXT;

-- Make recipient_id nullable (not needed for card payouts)
ALTER TABLE crypto_wallets
ALTER COLUMN recipient_id DROP NOT NULL;

-- Make stellar_account_id nullable (not used for Bridge)
ALTER TABLE crypto_wallets
ALTER COLUMN stellar_account_id DROP NOT NULL;

-- Make stellar_secret_key_encrypted nullable (not used for Bridge)
ALTER TABLE crypto_wallets
ALTER COLUMN stellar_secret_key_encrypted DROP NOT NULL;

-- Remove unique constraint on stellar_account_id (not needed for Bridge)
ALTER TABLE crypto_wallets
DROP CONSTRAINT IF EXISTS crypto_wallets_stellar_account_id_key;

-- Update comments
COMMENT ON COLUMN crypto_wallets.bridge_customer_id IS 'Bridge customer ID';
COMMENT ON COLUMN crypto_wallets.destination_type IS 'Payout destination type: bank (Liquidation Address) or card (Top-Up deposit address)';
COMMENT ON COLUMN crypto_wallets.bridge_liquidation_address_id IS 'Bridge liquidation address ID (for bank payouts)';
COMMENT ON COLUMN crypto_wallets.blockchain_address IS 'Blockchain deposit address (from liquidation address or card funding_instructions)';
COMMENT ON COLUMN crypto_wallets.blockchain_memo IS 'Blockchain memo for memo-based blockchains like Stellar (for bank payouts only)';
COMMENT ON COLUMN crypto_wallets.external_account_id IS 'Bridge external account ID (for bank payouts)';
COMMENT ON COLUMN crypto_wallets.bridge_card_account_id IS 'Bridge card account ID (for card payouts)';
COMMENT ON COLUMN crypto_wallets.destination_payment_rail IS 'Payment rail: wire (bank) or card';
COMMENT ON COLUMN crypto_wallets.destination_currency IS 'Destination currency (USD, EUR)';
COMMENT ON COLUMN crypto_wallets.destination_wire_message IS 'Optional wire message for bank payouts';
COMMENT ON COLUMN crypto_wallets.chain IS 'Blockchain chain (e.g., ethereum, stellar)';

-- ============================================================================
-- PART 2: Update crypto_receive_transactions table for Bridge
-- ============================================================================

-- Add Bridge-specific columns to crypto_receive_transactions
ALTER TABLE crypto_receive_transactions
ADD COLUMN IF NOT EXISTS destination_type TEXT CHECK (destination_type IN ('bank', 'card')),
ADD COLUMN IF NOT EXISTS bridge_liquidation_address_id TEXT,
ADD COLUMN IF NOT EXISTS bridge_liquidation_id TEXT,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS blockchain_memo TEXT,
ADD COLUMN IF NOT EXISTS external_account_id TEXT,
ADD COLUMN IF NOT EXISTS bridge_card_account_id TEXT,
ADD COLUMN IF NOT EXISTS destination_currency TEXT,
ADD COLUMN IF NOT EXISTS liquidation_status TEXT,
ADD COLUMN IF NOT EXISTS card_top_up_status TEXT;

-- Make stellar_transaction_hash nullable (Bridge uses blockchain_tx_hash)
ALTER TABLE crypto_receive_transactions
ALTER COLUMN stellar_transaction_hash DROP NOT NULL;

-- Remove unique constraint on stellar_transaction_hash (Bridge uses blockchain_tx_hash)
ALTER TABLE crypto_receive_transactions
DROP CONSTRAINT IF EXISTS crypto_receive_transactions_stellar_transaction_hash_key;

-- Make crypto_wallet_id nullable (may not always be linked to a wallet)
ALTER TABLE crypto_receive_transactions
ALTER COLUMN crypto_wallet_id DROP NOT NULL;

-- Update status enum to include Bridge-specific statuses
ALTER TABLE crypto_receive_transactions
DROP CONSTRAINT IF EXISTS crypto_receive_transactions_status_check;

ALTER TABLE crypto_receive_transactions
ADD CONSTRAINT crypto_receive_transactions_status_check
CHECK (status IN ('pending', 'confirmed', 'converting', 'converted', 'deposited', 'failed', 'processing', 'completed'));

-- Update comments
COMMENT ON COLUMN crypto_receive_transactions.destination_type IS 'Payout destination type: bank or card';
COMMENT ON COLUMN crypto_receive_transactions.bridge_liquidation_address_id IS 'Bridge liquidation address ID (for bank payouts)';
COMMENT ON COLUMN crypto_receive_transactions.bridge_liquidation_id IS 'Bridge liquidation transaction ID (for bank payouts)';
COMMENT ON COLUMN crypto_receive_transactions.blockchain_tx_hash IS 'Blockchain transaction hash (replaces stellar_transaction_hash)';
COMMENT ON COLUMN crypto_receive_transactions.blockchain_memo IS 'Blockchain memo used in deposit (for Stellar, bank payouts only)';
COMMENT ON COLUMN crypto_receive_transactions.external_account_id IS 'External account ID (for bank payouts)';
COMMENT ON COLUMN crypto_receive_transactions.bridge_card_account_id IS 'Bridge card account ID (for card payouts)';
COMMENT ON COLUMN crypto_receive_transactions.destination_currency IS 'Destination currency';
COMMENT ON COLUMN crypto_receive_transactions.liquidation_status IS 'Liquidation status from Bridge (for bank payouts)';
COMMENT ON COLUMN crypto_receive_transactions.card_top_up_status IS 'Card top-up status from Bridge (for card payouts)';

-- Create index on blockchain_tx_hash
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_blockchain_tx_hash 
ON crypto_receive_transactions(blockchain_tx_hash);

-- ============================================================================
-- PART 3: Create cards table for Bridge Cards API
-- ============================================================================

CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bridge_customer_id TEXT NOT NULL,
    bridge_card_account_id TEXT NOT NULL UNIQUE,
    card_number TEXT,
    currency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'frozen')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_bridge_card_account_id ON cards(bridge_card_account_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);

-- Enable RLS for cards
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cards
CREATE POLICY "Users can view their own cards"
    ON cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
    ON cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
    ON cards FOR UPDATE
    USING (auth.uid() = user_id);

COMMENT ON TABLE cards IS 'Bridge Cards API card accounts (Top-Up funding strategy)';
COMMENT ON COLUMN cards.bridge_customer_id IS 'Bridge customer ID';
COMMENT ON COLUMN cards.bridge_card_account_id IS 'Bridge card account ID (source of truth for card balance)';
COMMENT ON COLUMN cards.card_number IS 'Masked card number for display';
COMMENT ON COLUMN cards.currency IS 'Card currency (USD, EUR)';
COMMENT ON COLUMN cards.status IS 'Card status';
COMMENT ON COLUMN cards.id IS 'Note: Card balance is NOT stored in database, always read from Bridge card account';

-- ============================================================================
-- PART 4: Update transactions table for Send Money flow
-- ============================================================================

-- Add columns for payment collection and payout routing
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS payment_collection_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_link_id TEXT,
ADD COLUMN IF NOT EXISTS payment_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payout_provider TEXT CHECK (payout_provider IN ('yellow_card', 'bridge')),
ADD COLUMN IF NOT EXISTS yellow_card_disbursement_id TEXT,
ADD COLUMN IF NOT EXISTS bridge_payout_id TEXT,
ADD COLUMN IF NOT EXISTS payout_status TEXT CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_payment_link_id ON transactions(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payout_provider ON transactions(payout_provider);
CREATE INDEX IF NOT EXISTS idx_transactions_payout_status ON transactions(payout_status);

-- Update comments
COMMENT ON COLUMN transactions.payment_collection_provider IS 'Provider used for payment collection (Bridge, PSP, etc.)';
COMMENT ON COLUMN transactions.payment_link_id IS 'Payment link/transaction ID';
COMMENT ON COLUMN transactions.payment_received_at IS 'When payment was received';
COMMENT ON COLUMN transactions.payout_provider IS 'Payout provider: yellow_card (African fiat) or bridge (USD/EUR)';
COMMENT ON COLUMN transactions.yellow_card_disbursement_id IS 'Yellow Card disbursement ID';
COMMENT ON COLUMN transactions.bridge_payout_id IS 'Bridge payout ID';
COMMENT ON COLUMN transactions.payout_status IS 'Payout status';

-- ============================================================================
-- PART 5: Create indexes for Bridge fields
-- ============================================================================

-- Indexes for crypto_wallets Bridge fields
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_bridge_customer_id ON crypto_wallets(bridge_customer_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_destination_type ON crypto_wallets(destination_type);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_bridge_liquidation_address_id ON crypto_wallets(bridge_liquidation_address_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_bridge_card_account_id ON crypto_wallets(bridge_card_account_id);

-- Indexes for crypto_receive_transactions Bridge fields
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_destination_type ON crypto_receive_transactions(destination_type);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_bridge_liquidation_address_id ON crypto_receive_transactions(bridge_liquidation_address_id);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_bridge_card_account_id ON crypto_receive_transactions(bridge_card_account_id);

