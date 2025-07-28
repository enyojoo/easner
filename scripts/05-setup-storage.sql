-- Create storage bucket for transaction receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-receipts',
  'transaction-receipts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'transaction-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'transaction-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND status = 'active'
  )
);
