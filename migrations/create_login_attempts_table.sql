-- Create login_attempts table for tracking login attempts and implementing account lockout
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_created ON login_attempts(email, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_success ON login_attempts(email, success);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view all login attempts
CREATE POLICY "Admin users can view all login attempts" ON login_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for service role to insert login attempts
CREATE POLICY "Service role can insert login attempts" ON login_attempts
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy for service role to delete login attempts
CREATE POLICY "Service role can delete login attempts" ON login_attempts
  FOR DELETE
  TO service_role
  USING (true);
