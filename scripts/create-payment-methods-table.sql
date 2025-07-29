-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(3) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank_account', 'qr_code')),
  name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  qr_code_data TEXT,
  instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_payment_methods_updated_at 
    BEFORE UPDATE ON payment_methods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create unique constraint for default payment methods per currency
CREATE UNIQUE INDEX idx_payment_methods_default_currency 
ON payment_methods (currency) 
WHERE is_default = true;

-- Insert default payment methods
INSERT INTO payment_methods (currency, type, name, account_name, account_number, bank_name, is_default, status) VALUES
('RUB', 'bank_account', 'Sberbank Russia', 'Novapay Russia LLC', '40817810123456789012', 'Sberbank Russia', true, 'active'),
('NGN', 'bank_account', 'First Bank Nigeria', 'Novapay Nigeria Ltd', '1234567890', 'First Bank Nigeria', true, 'active'),
('RUB', 'qr_code', 'SberPay QR', NULL, NULL, NULL, false, 'inactive')
ON CONFLICT DO NOTHING;

-- Update the QR code payment method with QR data
UPDATE payment_methods 
SET qr_code_data = 'https://qr.sber.ru/pay/12345',
    instructions = 'Scan this QR code with your SberPay app to complete the payment'
WHERE currency = 'RUB' AND type = 'qr_code';
