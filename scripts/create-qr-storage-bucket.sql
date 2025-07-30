-- Create storage bucket for QR code files
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qr-codes', 'payment-qr-codes', true);

-- Set up RLS policies for the bucket
CREATE POLICY "Allow public read access to QR codes" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-qr-codes');

CREATE POLICY "Allow admin insert QR codes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-qr-codes');

CREATE POLICY "Allow admin update QR codes" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-qr-codes');

CREATE POLICY "Allow admin delete QR codes" ON storage.objects
FOR DELETE USING (bucket_id = 'payment-qr-codes');
