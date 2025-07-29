-- Create payment_methods table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(10) NOT NULL REFERENCES currencies(code),
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank_account', 'qr_code', 'mobile_money', 'crypto')),
  name VARCHAR(255) NOT NULL,
  account_name VARCHAR(255),
  account_number VARCHAR(100),
  bank_name VARCHAR(255),
  bank_code VARCHAR(50),
  routing_number VARCHAR(50),
  swift_code VARCHAR(20),
  qr_code_data TEXT,
  instructions TEXT,
  is_default BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO payment_methods (currency, type, name, account_name, account_number, bank_name, is_default, status) VALUES
('RUB', 'bank_account', 'Sberbank Russia', 'Novapay Russia LLC', '40817810123456789012', 'Sberbank Russia', true, 'active'),
('NGN', 'bank_account', 'First Bank Nigeria', 'Novapay Nigeria Ltd', '1234567890', 'First Bank Nigeria', true, 'active'),
('RUB', 'qr_code', 'SberPay QR', NULL, NULL, NULL, false, 'inactive')
ON CONFLICT DO NOTHING;

-- Update the qr_code payment method with QR data
UPDATE payment_methods 
SET qr_code_data = 'https://qr.sber.ru/pay/12345',
    instructions = 'Scan this QR code with your SberPay app to complete the payment'
WHERE currency = 'RUB' AND type = 'qr_code';

-- Create updated_at trigger for payment_methods
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE
    ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
