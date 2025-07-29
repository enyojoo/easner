-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('registration', 'transaction', 'security', 'notification', 'marketing')),
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_modified_by UUID REFERENCES admin_users(id)
);

-- Insert default email templates
INSERT INTO email_templates (name, subject, template_type, html_content, text_content, variables, is_default) VALUES
(
  'Welcome Email',
  'Welcome to Novapay!',
  'registration',
  '<html><body><h1>Welcome to Novapay, {{first_name}}!</h1><p>Thank you for joining our platform. Your account has been successfully created.</p><p>You can now start sending money to your loved ones with ease.</p><p>Best regards,<br>The Novapay Team</p></body></html>',
  'Welcome to Novapay, {{first_name}}! Thank you for joining our platform. Your account has been successfully created. You can now start sending money to your loved ones with ease. Best regards, The Novapay Team',
  '{"first_name": "User''s first name", "email": "User''s email address"}',
  true
),
(
  'Transaction Confirmation',
  'Your transaction has been processed',
  'transaction',
  '<html><body><h1>Transaction Confirmation</h1><p>Dear {{first_name}},</p><p>Your transaction <strong>{{transaction_id}}</strong> has been successfully processed.</p><p><strong>Details:</strong></p><ul><li>Amount Sent: {{send_amount}} {{send_currency}}</li><li>Amount Received: {{receive_amount}} {{receive_currency}}</li><li>Recipient: {{recipient_name}}</li><li>Status: {{status}}</li></ul><p>Thank you for using Novapay!</p></body></html>',
  'Transaction Confirmation - Dear {{first_name}}, Your transaction {{transaction_id}} has been successfully processed. Amount Sent: {{send_amount}} {{send_currency}}, Amount Received: {{receive_amount}} {{receive_currency}}, Recipient: {{recipient_name}}, Status: {{status}}. Thank you for using Novapay!',
  '{"first_name": "User''s first name", "transaction_id": "Transaction ID", "send_amount": "Amount sent", "send_currency": "Send currency", "receive_amount": "Amount received", "receive_currency": "Receive currency", "recipient_name": "Recipient name", "status": "Transaction status"}',
  true
),
(
  'Password Reset',
  'Reset your Novapay password',
  'security',
  '<html><body><h1>Password Reset Request</h1><p>Dear {{first_name}},</p><p>We received a request to reset your password for your Novapay account.</p><p>Click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>This link will expire in 24 hours.</p><p>If you did not request this password reset, please ignore this email.</p><p>Best regards,<br>The Novapay Team</p></body></html>',
  'Password Reset Request - Dear {{first_name}}, We received a request to reset your password for your Novapay account. Click this link to reset your password: {{reset_link}}. This link will expire in 24 hours. If you did not request this password reset, please ignore this email. Best regards, The Novapay Team',
  '{"first_name": "User''s first name", "reset_link": "Password reset link"}',
  true
)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger for email_templates
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE
    ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
