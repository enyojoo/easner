-- Add can_send and can_receive columns to currencies table
ALTER TABLE currencies
ADD COLUMN can_send BOOLEAN DEFAULT true,
ADD COLUMN can_receive BOOLEAN DEFAULT true;

-- Update existing currencies to have both send and receive enabled
UPDATE currencies
SET can_send = true, can_receive = true
WHERE can_send IS NULL OR can_receive IS NULL;

-- Add comments for the new columns
COMMENT ON COLUMN currencies.can_send IS 'Whether this currency can be used for sending money';
COMMENT ON COLUMN currencies.can_receive IS 'Whether this currency can be used for receiving money';

