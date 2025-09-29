-- Create early_access_requests table for storing early access form submissions
CREATE TABLE IF NOT EXISTS early_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  whatsapp_telegram VARCHAR(255) NOT NULL,
  primary_use_case VARCHAR(100) NOT NULL,
  located_in VARCHAR(10) NOT NULL, -- Country code
  sending_to VARCHAR(10) NOT NULL, -- Country code
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_early_access_requests_email ON early_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_status ON early_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_created_at ON early_access_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_primary_use_case ON early_access_requests(primary_use_case);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_located_in ON early_access_requests(located_in);
CREATE INDEX IF NOT EXISTS idx_early_access_requests_sending_to ON early_access_requests(sending_to);

-- Enable RLS
ALTER TABLE early_access_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view all early access requests
CREATE POLICY "Admin users can view all early access requests" ON early_access_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for admin users to update early access requests
CREATE POLICY "Admin users can update early access requests" ON early_access_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Create policy for service role to insert early access requests
CREATE POLICY "Service role can insert early access requests" ON early_access_requests
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy for service role to update early access requests
CREATE POLICY "Service role can update early access requests" ON early_access_requests
  FOR UPDATE
  TO service_role
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_early_access_requests_updated_at 
    BEFORE UPDATE ON early_access_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
