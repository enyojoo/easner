-- Storage RLS Policies for kyc-documents bucket
-- This ensures files can be viewed by:
-- 1. Users viewing their own files
-- 2. Admins viewing any files
-- 3. Service role (bypasses RLS) for server-side operations

-- Enable RLS on the storage.objects table (if not already enabled)
-- Note: This is typically enabled by default in Supabase

-- Policy 1: Users can view their own files
-- Files are stored with path format: identity/userId_filename.ext or address/userId_filename.ext
-- Using split_part to extract folder and filename parts
DROP POLICY IF EXISTS "Users can view their own KYC documents" ON storage.objects;
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  (
    -- Check if the file path starts with the user's ID (for identity or address folders)
    -- Format: identity/userId_filename.ext or address/userId_filename.ext
    (split_part(name, '/', 1) = 'identity' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
    OR
    (split_part(name, '/', 1) = 'address' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
  )
);

-- Policy 2: Users can upload their own files
DROP POLICY IF EXISTS "Users can upload their own KYC documents" ON storage.objects;
CREATE POLICY "Users can upload their own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' AND
  (
    (split_part(name, '/', 1) = 'identity' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
    OR
    (split_part(name, '/', 1) = 'address' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
  )
);

-- Policy 3: Users can update their own files
DROP POLICY IF EXISTS "Users can update their own KYC documents" ON storage.objects;
CREATE POLICY "Users can update their own KYC documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'kyc-documents' AND
  (
    (split_part(name, '/', 1) = 'identity' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
    OR
    (split_part(name, '/', 1) = 'address' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
  )
);

-- Policy 4: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete their own KYC documents" ON storage.objects;
CREATE POLICY "Users can delete their own KYC documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  (
    (split_part(name, '/', 1) = 'identity' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
    OR
    (split_part(name, '/', 1) = 'address' AND 
     split_part(name, '/', 2) LIKE (auth.uid()::text || '_%'))
  )
);

-- Policy 5: Admins can view all files
-- This checks if the user is an admin by looking in the admin_users table
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy 6: Admins can delete any files (for cleanup)
DROP POLICY IF EXISTS "Admins can delete any KYC documents" ON storage.objects;
CREATE POLICY "Admins can delete any KYC documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kyc-documents' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.id = auth.uid()
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
--
-- SETUP INSTRUCTIONS:
-- 1. Run this SQL migration in Supabase SQL Editor
-- 2. Go to Storage > kyc-documents bucket > Settings
-- 3. Set bucket to PRIVATE
-- 4. Ensure "File size limit" and "Allowed MIME types" allow your file types
-- 5. Test by trying to view a file as admin
--
-- If you still get 403 errors after running this migration:
-- - Check that the bucket is set to PRIVATE (not PUBLIC)
-- - Verify admin_users table has the admin user's id
-- - Check server logs for detailed error messages
-- - Ensure SUPABASE_SERVICE_ROLE_KEY is set in environment variables

