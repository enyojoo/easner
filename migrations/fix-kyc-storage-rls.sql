-- Fix KYC Storage RLS Policy
-- The issue is that storage.foldername() doesn't include the filename in the array
-- We need to parse the path differently to extract the user ID

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own KYC documents or admins can view all" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;

-- Create fixed upload policy
-- File path format: identity/userId_timestamp.ext or address/userId_timestamp.ext
-- We extract user ID from the full path by splitting on '/' and then on '_'
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (
    -- Check if path starts with 'identity/' or 'address/'
    (name LIKE 'identity/%' OR name LIKE 'address/%') AND
    -- Extract user ID from filename (format: userId_timestamp.ext)
    -- Split path by '/', take the filename part, then split by '_' and take first part
    split_part(split_part(name, '/', 2), '_', 1) = (select auth.uid())::text
  )
);

-- Create fixed view policy for users
CREATE POLICY "Users can view own KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  (
    -- Check if path starts with 'identity/' or 'address/'
    (name LIKE 'identity/%' OR name LIKE 'address/%') AND
    -- Extract user ID from filename
    split_part(split_part(name, '/', 2), '_', 1) = (select auth.uid())::text
  )
);

-- Create admin view policy
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

