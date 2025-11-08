ALTER TABLE payment_methods
ADD COLUMN completion_timer_seconds INTEGER DEFAULT 3600;

-- Update existing payment methods to have 3600 seconds if NULL
UPDATE payment_methods
SET completion_timer_seconds = 3600
WHERE completion_timer_seconds IS NULL;

COMMENT ON COLUMN payment_methods.completion_timer_seconds IS 'Completion timer in seconds for the payment method (default: 3600 = 1 hour)';

