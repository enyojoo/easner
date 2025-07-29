-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('registration', 'transaction', 'security', 'notification', 'marketing')),
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO email_templates (name, subject, template_type, html_content, text_content, variables, is_default) VALUES
('Welcome Email', 'Welcome to Novapay!', 'registration', 
 '<h1>Welcome to Novapay, {{first_name}}!</h1><p>Thank you for joining our platform. Your account has been successfully created.</p><p>Email: {{email}}</p>',
 'Welcome to Novapay, {{first_name}}! Thank you for joining our platform. Your account has been successfully created. Email: {{email}}',
 '{"first_name": "User''s first name", "email": "User''s email address"}',
 true),
('Transaction Confirmation', 'Your transaction has been processed', 'transaction',
 '<h2>Transaction Confirmation</h2><p>Dear {{first_name}},</p><p>Your transaction of {{amount}} {{currency}} has been successfully processed.</p><p>Transaction ID: {{transaction_id}}</p>',
 'Transaction Confirmation - Dear {{first_name}}, Your transaction of {{amount}} {{currency}} has been successfully processed. Transaction ID: {{transaction_id}}',
 '{"first_name": "User''s first name", "amount": "Transaction amount", "currency": "Transaction currency", "transaction_id": "Transaction ID"}',
 true),
('Password Reset', 'Reset your Novapay password', 'security',
 '<h2>Password Reset Request</h2><p>Dear {{first_name}},</p><p>Click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p>',
 'Password Reset Request - Dear {{first_name}}, Click the link below to reset your password: {{reset_link}}',
 '{"first_name": "User''s first name", "reset_link": "Password reset link"}',
 true)
ON CONFLICT DO NOTHING;
