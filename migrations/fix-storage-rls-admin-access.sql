-- Migration: Fix Storage RLS Admin Access
-- This migration ensures admins can access all KYC documents in storage
-- by updating the Storage RLS policies to properly check for admin users

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete KYC documents" ON storage.objects;

-- Policy: Admins can view all files in kyc-documents bucket
-- Uses is_admin_user function to check if the authenticated user is an admin
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND public.is_admin_user((select auth.uid()))
);

-- Policy: Admins can delete files in kyc-documents bucket
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND public.is_admin_user((select auth.uid()))
);

-- Note: The service role key should bypass RLS, but if Storage RLS is still enforced,
-- these policies ensure admins can access files using their authenticated session.

