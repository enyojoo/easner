-- Update system_settings table structure
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS data_type VARCHAR(20) DEFAULT 'string';
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add constraint for data_type after column is created
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'system_settings_data_type_check' 
        AND table_name = 'system_settings'
    ) THEN
        ALTER TABLE system_settings ADD CONSTRAINT system_settings_data_type_check 
        CHECK (data_type IN ('string', 'number', 'boolean', 'json'));
    END IF;
END $$;

-- Create payment_methods table for admin-configured payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL REFERENCES currencies(code),
    type VARCHAR(20) NOT NULL,
    name VARCHAR(200) NOT NULL,
    account_name VARCHAR(200), -- For bank accounts
    account_number VARCHAR(100), -- For bank accounts
    bank_name VARCHAR(200), -- For bank accounts
    qr_code_data TEXT, -- For QR codes
    instructions TEXT, -- For QR codes
    status VARCHAR(20) DEFAULT 'active',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add constraints for payment_methods after table is created
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payment_methods_type_check' 
        AND table_name = 'payment_methods'
    ) THEN
        ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_type_check 
        CHECK (type IN ('bank_account', 'qr_code'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'payment_methods_status_check' 
        AND table_name = 'payment_methods'
    ) THEN
        ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_status_check 
        CHECK (status IN ('active', 'inactive'));
    END IF;
END $$;

-- Create unique constraint for default payment methods per currency
CREATE UNIQUE INDEX IF NOT EXISTS payment_methods_currency_default_unique 
ON payment_methods (currency) 
WHERE is_default = true;

-- Insert default system settings
INSERT INTO system_settings (key, value, description, category, data_type) VALUES
('platform_name', 'Novapay', 'Platform display name', 'platform', 'string'),
('support_email', 'support@novapay.com', 'Support contact email', 'platform', 'string'),
('maintenance_mode', 'false', 'Enable maintenance mode', 'platform', 'boolean'),
('registration_enabled', 'true', 'Allow new user registrations', 'platform', 'boolean'),
('email_verification_required', 'true', 'Require email verification for new accounts', 'platform', 'boolean'),
('max_transaction_amount', '50000', 'Maximum transaction amount', 'platform', 'number'),
('min_transaction_amount', '10', 'Minimum transaction amount', 'platform', 'number'),
('daily_transaction_limit', '100000', 'Daily transaction limit per user', 'platform', 'number'),
('base_currency', 'NGN', 'Base currency for reporting', 'platform', 'string'),
('two_factor_required', 'true', 'Require 2FA for admin accounts', 'security', 'boolean'),
('session_timeout', '30', 'Session timeout in minutes', 'security', 'number'),
('password_min_length', '8', 'Minimum password length', 'security', 'number'),
('password_require_special_chars', 'true', 'Require special characters in passwords', 'security', 'boolean'),
('max_login_attempts', '5', 'Maximum login attempts before lockout', 'security', 'number'),
('account_lockout_duration', '15', 'Account lockout duration in minutes', 'security', 'number'),
('email_notifications_enabled', 'true', 'Enable email notifications', 'notifications', 'boolean'),
('sms_notifications_enabled', 'false', 'Enable SMS notifications', 'notifications', 'boolean'),
('push_notifications_enabled', 'true', 'Enable push notifications', 'notifications', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- Insert sample payment methods
INSERT INTO payment_methods (currency, type, name, account_name, account_number, bank_name, status, is_default) VALUES
('RUB', 'bank_account', 'Sberbank Russia', 'Novapay Russia LLC', '40817810123456789012', 'Sberbank Russia', 'active', true),
('NGN', 'bank_account', 'First Bank Nigeria', 'Novapay Nigeria Ltd', '1234567890', 'First Bank Nigeria', 'active', true),
('RUB', 'qr_code', 'SberPay QR', NULL, NULL, NULL, 'active', false)
ON CONFLICT DO NOTHING;

-- Update the QR code payment method with QR data
UPDATE payment_methods 
SET qr_code_data = 'https://qr.sber.ru/pay/12345',
    instructions = 'Scan this QR code with your SberPay app to complete the payment'
WHERE name = 'SberPay QR';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_methods_currency ON payment_methods(currency);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON payment_methods(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(currency, is_default);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Create trigger for payment_methods updated_at
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_payment_methods_updated_at();

-- Row Level Security for payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;

-- Allow public read access to active payment methods
CREATE POLICY "Anyone can view active payment methods" ON payment_methods 
    FOR SELECT USING (status = 'active');

-- Admin policies for payment_methods
CREATE POLICY "Admins can manage payment methods" ON payment_methods 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = current_setting('request.jwt.claims', true)::json ->> 'email'
            AND status = 'active'
        )
    );

-- Admin policies for system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Public can view public system settings" ON system_settings;

CREATE POLICY "Admins can manage system settings" ON system_settings 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = current_setting('request.jwt.claims', true)::json ->> 'email'
            AND status = 'active'
        )
    );

-- Allow public read access to certain system settings
CREATE POLICY "Public can view public system settings" ON system_settings 
    FOR SELECT USING (
        key IN ('platform_name', 'support_email', 'registration_enabled', 'maintenance_mode')
    );
