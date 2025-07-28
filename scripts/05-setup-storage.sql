-- Create storage bucket for transaction receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'transaction-receipts',
  'transaction-receipts',
  false,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for users to upload their own receipts
CREATE POLICY "Users can upload their own receipts" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'transaction-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own receipts
CREATE POLICY "Users can view their own receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'transaction-receipts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for admins to view all receipts
CREATE POLICY "Admins can view all receipts" ON storage.objects
FOR SELECT USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND status = 'active'
  )
);

-- Policy for admins to manage all receipts
CREATE POLICY "Admins can manage all receipts" ON storage.objects
FOR ALL USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = auth.jwt() ->> 'email' 
    AND status = 'active'
  )
);
