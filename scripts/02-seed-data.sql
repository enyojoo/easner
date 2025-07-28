-- Insert default currencies
INSERT INTO currencies (code, name, symbol, flag_svg) VALUES
('RUB', 'Russian Ruble', '₽', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#1435a1" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#fff"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#c53a28"></path></svg>'),
('NGN', 'Nigerian Naira', '₦', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#3b8655"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#3b8655"></path></svg>');

-- Insert default exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_type, fee_amount, min_amount, max_amount) VALUES
('RUB', 'NGN', 22.45, 'free', 0, 100, 500000),
('NGN', 'RUB', 0.0445, 'percentage', 1.5, 1000, 10000000);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@novapay.com', '$2b$10$rQZ8kHp0rJ0YxJ0YxJ0YxOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGq', 'System Administrator', 'super_admin');

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('platform_name', 'Novapay', 'Platform name'),
('support_email', 'support@novapay.com', 'Support email address'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('registration_enabled', 'true', 'User registration enabled'),
('email_verification_required', 'true', 'Email verification required for new accounts'),
('max_transaction_amount', '50000', 'Maximum transaction amount'),
('min_transaction_amount', '10', 'Minimum transaction amount'),
('daily_transaction_limit', '100000', 'Daily transaction limit per user'),
('base_currency', 'NGN', 'Base currency for reporting'),
('session_timeout', '30', 'Session timeout in minutes'),
('password_min_length', '8', 'Minimum password length'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('account_lockout_duration', '15', 'Account lockout duration in minutes');
