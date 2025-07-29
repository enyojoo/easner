-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  data_type VARCHAR(50) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  category VARCHAR(100) DEFAULT 'general',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system settings
INSERT INTO system_settings (key, value, data_type, category, description) VALUES
('maintenance_mode', 'false', 'boolean', 'platform', 'Enable to temporarily disable user access'),
('registration_enabled', 'true', 'boolean', 'platform', 'Allow new user registrations'),
('email_verification_required', 'true', 'boolean', 'platform', 'Require email verification for new accounts'),
('base_currency', 'NGN', 'string', 'platform', 'Default currency for displaying transaction amounts and reports'),
('two_factor_required', 'true', 'boolean', 'security', 'Require 2FA for all user accounts'),
('session_timeout', '30', 'number', 'security', 'Session timeout in minutes'),
('password_min_length', '8', 'number', 'security', 'Minimum password length'),
('password_require_special_chars', 'true', 'boolean', 'security', 'Enforce special character requirements'),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout'),
('account_lockout_duration', '15', 'number', 'security', 'Account lockout duration in minutes')
ON CONFLICT (key) DO NOTHING;
