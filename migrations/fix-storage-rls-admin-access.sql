-- Migration: Fix Storage RLS Admin Access
-- This migration ensures admins can access all KYC documents in storage
-- by creating the is_admin_user function and updating Storage RLS policies

-- Create or replace the is_admin_user function
-- This function checks if a user ID exists in the admin_users table and is active
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = user_id
      AND (status IS NULL OR status = 'active')
  );
END;
$$;

-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all KYC documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete KYC documents" ON storage.objects;

-- Policy: Admins can view all files in kyc-documents bucket
-- Uses is_admin_user function to check if the authenticated user is an admin
-- Note: auth.uid() is called directly - the function handles NULL cases
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid() IS NOT NULL
  AND public.is_admin_user(auth.uid())
);

-- Policy: Admins can delete files in kyc-documents bucket
CREATE POLICY "Admins can delete KYC documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid() IS NOT NULL
  AND public.is_admin_user(auth.uid())
);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;

