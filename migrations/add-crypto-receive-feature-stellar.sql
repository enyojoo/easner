-- Migration: Add crypto receive feature (Stellar + Circle Anchor)
-- Description: Adds tables and columns for stablecoin receive functionality
-- Date: 2024

-- Create crypto_wallets table
CREATE TABLE IF NOT EXISTS crypto_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crypto_currency TEXT NOT NULL,
    blockchain TEXT NOT NULL DEFAULT 'stellar',
    stellar_account_id TEXT UNIQUE NOT NULL,
    stellar_secret_key_encrypted TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    fiat_currency TEXT NOT NULL,
    recipient_id UUID NOT NULL REFERENCES recipients(id) ON DELETE RESTRICT,
    xlm_reserve NUMERIC DEFAULT 0,
    usdc_trustline_established BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create crypto_receive_transactions table
CREATE TABLE IF NOT EXISTS crypto_receive_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT UNIQUE NOT NULL,
    stellar_transaction_hash TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crypto_wallet_id UUID NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
    crypto_amount NUMERIC NOT NULL CHECK (crypto_amount > 0),
    crypto_currency TEXT NOT NULL DEFAULT 'USDC',
    fiat_amount NUMERIC NOT NULL CHECK (fiat_amount > 0),
    fiat_currency TEXT NOT NULL,
    exchange_rate NUMERIC NOT NULL CHECK (exchange_rate > 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'converting', 'converted', 'deposited', 'failed')),
    circle_conversion_id TEXT,
    circle_payout_id TEXT,
    confirmed_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    deposited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create supported_cryptocurrencies table
CREATE TABLE IF NOT EXISTS supported_cryptocurrencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    blockchain TEXT NOT NULL DEFAULT 'stellar',
    is_stablecoin BOOLEAN NOT NULL DEFAULT true,
    stellar_asset_code TEXT NOT NULL,
    stellar_asset_issuer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    icon_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_key TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS crypto_receive_transaction_id UUID REFERENCES crypto_receive_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'send' CHECK (transaction_type IN ('send', 'receive'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_stellar_account_id ON crypto_wallets(stellar_account_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_status ON crypto_wallets(status);

CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_user_id ON crypto_receive_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_wallet_id ON crypto_receive_transactions(crypto_wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_stellar_hash ON crypto_receive_transactions(stellar_transaction_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_status ON crypto_receive_transactions(status);
CREATE INDEX IF NOT EXISTS idx_crypto_receive_transactions_created_at ON crypto_receive_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_supported_cryptocurrencies_code ON supported_cryptocurrencies(code);
CREATE INDEX IF NOT EXISTS idx_supported_cryptocurrencies_status ON supported_cryptocurrencies(status);

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);

CREATE INDEX IF NOT EXISTS idx_transactions_crypto_receive_id ON transactions(crypto_receive_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- Insert initial feature flag for crypto receive
INSERT INTO feature_flags (feature_key, feature_name, is_enabled, description)
VALUES (
    'crypto_receive_enabled',
    'Receive Money',
    false,
    'Enable users to receive stablecoins which are automatically converted to fiat and deposited to their bank accounts'
)
ON CONFLICT (feature_key) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE crypto_wallets IS 'Stores Stellar wallet addresses for users receiving stablecoins';
COMMENT ON COLUMN crypto_wallets.stellar_account_id IS 'Stellar account public key (G...)';
COMMENT ON COLUMN crypto_wallets.stellar_secret_key_encrypted IS 'Encrypted Stellar secret key for server operations';
COMMENT ON COLUMN crypto_wallets.xlm_reserve IS 'XLM balance reserved for transaction fees';
COMMENT ON COLUMN crypto_wallets.usdc_trustline_established IS 'Whether USDC trustline has been established for this account';

COMMENT ON TABLE crypto_receive_transactions IS 'Tracks incoming stablecoin transactions and their conversion to fiat';
COMMENT ON COLUMN crypto_receive_transactions.stellar_transaction_hash IS 'Stellar transaction hash from Horizon API';
COMMENT ON COLUMN crypto_receive_transactions.circle_conversion_id IS 'Circle Anchor conversion ID for crypto-to-fiat conversion';
COMMENT ON COLUMN crypto_receive_transactions.circle_payout_id IS 'Circle Anchor payout ID for fiat deposit';

COMMENT ON TABLE supported_cryptocurrencies IS 'Admin-configurable list of supported cryptocurrencies';
COMMENT ON COLUMN supported_cryptocurrencies.stellar_asset_code IS 'Asset code on Stellar network (e.g., USDC)';
COMMENT ON COLUMN supported_cryptocurrencies.stellar_asset_issuer IS 'Stellar issuer address for the asset (Circle address for USDC)';

COMMENT ON TABLE feature_flags IS 'System feature toggles for enabling/disabling features';
COMMENT ON COLUMN feature_flags.feature_key IS 'Unique key identifier (e.g., crypto_receive_enabled)';
COMMENT ON COLUMN feature_flags.is_enabled IS 'Whether the feature is currently enabled';

COMMENT ON COLUMN transactions.crypto_receive_transaction_id IS 'Link to crypto receive transaction if this is a receive transaction';
COMMENT ON COLUMN transactions.transaction_type IS 'Type of transaction: send (fiat) or receive (stablecoin)';

-- Insert initial feature flag for crypto receive
INSERT INTO feature_flags (feature_key, feature_name, is_enabled, description)
VALUES ('crypto_receive_enabled', 'Receive Money', false, 'Enable users to receive stablecoins that auto-convert to fiat')
ON CONFLICT (feature_key) DO NOTHING;

-- Insert USDC on Stellar configuration
INSERT INTO supported_cryptocurrencies (code, name, blockchain, is_stablecoin, stellar_asset_code, stellar_asset_issuer, status)
VALUES ('USDC', 'USD Coin', 'stellar', true, 'USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', 'active')
ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security (RLS) policies
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_receive_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crypto_wallets
CREATE POLICY "Users can view their own wallets"
    ON crypto_wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets"
    ON crypto_wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
    ON crypto_wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for crypto_receive_transactions
CREATE POLICY "Users can view their own receive transactions"
    ON crypto_receive_transactions FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for supported_cryptocurrencies (public read, admin write)
CREATE POLICY "Anyone can view active supported cryptocurrencies"
    ON supported_cryptocurrencies FOR SELECT
    USING (status = 'active');

-- RLS Policies for feature_flags (public read, admin write)
CREATE POLICY "Anyone can view feature flags"
    ON feature_flags FOR SELECT
    USING (true);

-- Note: Admin write policies should be added separately based on your admin role setup
-- These policies assume users can only access their own data
-- Admin access should be handled through service layer or additional policies

