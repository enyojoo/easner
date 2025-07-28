-- Insert default currencies with flag SVGs
INSERT INTO currencies (code, name, symbol, flag_svg, status) VALUES
('RUB', 'Russian Ruble', '₽', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#1435a1" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#fff"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#c53a28"></path></svg>', 'active'),
('NGN', 'Nigerian Naira', '₦', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M10 4H22V28H10z"></path><path d="M5,4h6V28H5c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" fill="#3b8655"></path><path d="M25,4h6V28h-6c-2.208,0-4-1.792-4-4V8c0-2.208,1.792-4,4-4Z" transform="rotate(180 26 16)" fill="#3b8655"></path></svg>', 'active'),
('USD', 'US Dollar', '$', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#fff" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#b22234"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#b22234"></path><path fill="#3c3b6e" d="M1,4H13v8H1V4z"></path></svg>', 'active'),
('EUR', 'Euro', '€', '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><path fill="#039" d="M1 11H31V21H1z"></path><path d="M5,4H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" fill="#039"></path><path d="M5,20H27c2.208,0,4,1.792,4,4v4H1v-4c0-2.208,1.792-4,4-4Z" transform="rotate(180 16 24)" fill="#039"></path><circle fill="#fc0" cx="16" cy="16" r="3"></circle></svg>', 'active')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  symbol = EXCLUDED.symbol,
  flag_svg = EXCLUDED.flag_svg,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- Insert exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, fee_type, fee_amount, status) VALUES
('RUB', 'NGN', 22.45, 'free', 0, 'active'),
('NGN', 'RUB', 0.0445, 'percentage', 1.5, 'active'),
('USD', 'NGN', 1650.00, 'fixed', 5.00, 'active'),
('NGN', 'USD', 0.000606, 'percentage', 2.0, 'active'),
('EUR', 'NGN', 1750.00, 'fixed', 7.50, 'active'),
('NGN', 'EUR', 0.000571, 'percentage', 2.5, 'active'),
('RUB', 'USD', 0.0105, 'percentage', 1.0, 'active'),
('USD', 'RUB', 95.24, 'free', 0, 'active')
ON CONFLICT (from_currency, to_currency) DO UPDATE SET
  rate = EXCLUDED.rate,
  fee_type = EXCLUDED.fee_type,
  fee_amount = EXCLUDED.fee_amount,
  status = EXCLUDED.status,
  updated_at = CURRENT_TIMESTAMP;

-- Insert admin user (password: admin123)
INSERT INTO admin_users (email, password_hash, full_name, role, status, permissions) VALUES
('admin@novapay.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', 'active', ARRAY['all'])
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  permissions = EXCLUDED.permissions,
  updated_at = CURRENT_TIMESTAMP;

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'Novapay', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('maintenance_mode', 'false', 'Maintenance mode status'),
('max_transaction_amount', '10000', 'Maximum transaction amount in USD'),
('min_transaction_amount', '1', 'Minimum transaction amount in USD'),
('default_currency', 'NGN', 'Default currency for new users'),
('support_email', 'support@novapay.com', 'Support email address'),
('company_address', 'Lagos, Nigeria', 'Company address')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;
