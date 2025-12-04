-- Storage RLS Policies for kyc-documents bucket
-- This ensures files can be viewed by:
-- 1. Users viewing their own files
-- 2. Admins viewing any files
-- 3. Service role (bypasses RLS) for server-side operations

-- Enable RLS on the storage.objects table (if not already enabled)
-- Note: This is typically enabled by default in Supabase

-- Policy 1: Users can view their own files
-- Files are stored with path format: identity/userId_filename.ext or address/userId_filename.ext
CREATE POLICY IF NOT EXISTS "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  (
    -- Check if the file path starts with the user's ID (for identity or address folders)
    (storage.foldername(name))[1] = 'identity' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  ) OR (
    (storage.foldername(name))[1] = 'address' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  )
);

-- Policy 2: Users can upload their own files
CREATE POLICY IF NOT EXISTS "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (
    -- Check if the file path starts with the user's ID
    (storage.foldername(name))[1] = 'identity' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  ) OR (
    (storage.foldername(name))[1] = 'address' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  )
);

-- Policy 3: Users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update their own KYC documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'kyc-documents' AND
  (
    (storage.foldername(name))[1] = 'identity' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  ) OR (
    (storage.foldername(name))[1] = 'address' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  )
);

-- Policy 4: Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete their own KYC documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  (
    (storage.foldername(name))[1] = 'identity' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  ) OR (
    (storage.foldername(name))[1] = 'address' AND 
    (storage.foldername(name))[2] LIKE (auth.uid()::text || '_%')
  )
);

-- Policy 5: Admins can view all files
-- This checks if the user is an admin by looking in the admin_users table
CREATE POLICY IF NOT EXISTS "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Policy 6: Admins can delete any files (for cleanup)
CREATE POLICY IF NOT EXISTS "Admins can delete any KYC documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- Note: Service role key (SUPABASE_SERVICE_ROLE_KEY) bypasses all RLS policies
-- This is used in server-side code (e.g., app/api/admin/kyc/documents/route.ts)
-- to ensure admins can always access files regardless of RLS configuration

-- IMPORTANT: This bucket should be set to PRIVATE in Supabase Dashboard
-- When private, files are only accessible via:
-- 1. Signed URLs (generated via createSignedUrl() - expires after 1 hour)
-- 2. Service role key (bypasses RLS for server-side operations)
--
-- The application already uses signed URLs:
-- - Admin viewing: /api/admin/kyc/documents generates signed URLs
-- - User viewing: kycService.getSignedUrl() generates signed URLs for own files
-- - Bridge API: Server-side downloads (bypasses RLS) to convert to base64
--
-- Signed URLs work for both images (JPG, PNG) and PDFs

