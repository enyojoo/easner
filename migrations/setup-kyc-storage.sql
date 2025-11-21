-- Create storage bucket for KYC documents
-- This should be run in Supabase SQL Editor or via migration tool

-- Create the storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false, -- Private bucket (not public)
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for KYC documents bucket
-- Users can upload their own documents (file path format: identity/userId_timestamp.ext or address/userId_timestamp.ext)
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (
    (storage.foldername(name))[1] = 'identity' OR
    (storage.foldername(name))[1] = 'address'
  ) AND
  -- Extract user ID from filename (format: userId_timestamp.ext)
  split_part((storage.foldername(name))[2], '_', 1) = auth.uid()::text
);

-- Users can view their own documents
CREATE POLICY "Users can view own KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  -- Extract user ID from filename (format: userId_timestamp.ext)
  split_part((storage.foldername(name))[2], '_', 1) = auth.uid()::text
);

-- Admins can view all documents
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Note: Users cannot delete their own documents - only admins can manage storage

