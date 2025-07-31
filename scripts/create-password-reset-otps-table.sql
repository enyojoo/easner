-- Create password_reset_otps table for storing OTP codes
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  otp VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_otp ON password_reset_otps(otp);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires_at ON password_reset_otps(expires_at);

-- Add RLS policies
ALTER TABLE password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage OTP records
CREATE POLICY "Service role can manage password reset OTPs" ON password_reset_otps
  FOR ALL USING (auth.role() = 'service_role');

-- Clean up expired OTPs (optional - can be run periodically)
-- DELETE FROM password_reset_otps WHERE expires_at < NOW() - INTERVAL '1 day';
