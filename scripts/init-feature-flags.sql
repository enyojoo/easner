-- Quick script to initialize feature flags if migration hasn't been run
-- Run this directly in your Supabase SQL editor or via psql

-- Create feature_flags table if it doesn't exist
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

-- Insert initial feature flag for crypto receive
INSERT INTO feature_flags (feature_key, feature_name, is_enabled, description)
VALUES (
    'crypto_receive_enabled',
    'Receive Money',
    false,
    'Enable users to receive stablecoins which are automatically converted to fiat and deposited to their bank accounts'
)
ON CONFLICT (feature_key) DO NOTHING;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);

