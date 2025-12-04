-- Storage RLS Policies for transaction-receipts bucket
-- This ensures receipts can be viewed by:
-- 1. Users viewing their own transaction receipts
-- 2. Admins viewing any receipts
-- 3. Service role (bypasses RLS) for server-side operations

-- Policy 1: Users can view receipts for their own transactions
-- Files are stored with path format: receipts/transactionId.ext
-- Extract transaction ID from filename and check if transaction belongs to user
DROP POLICY IF EXISTS "Users can view their own transaction receipts" ON storage.objects;
CREATE POLICY "Users can view their own transaction receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transaction-receipts' AND
  -- Extract transaction ID from path (format: receipts/transactionId.ext)
  EXISTS (
    SELECT 1
    FROM transactions
    WHERE transactions.transaction_id = split_part(name, '/', 2)
      AND transactions.user_id = auth.uid()
  )
);

-- Policy 2: Users can upload receipts for their own transactions
DROP POLICY IF EXISTS "Users can upload their own transaction receipts" ON storage.objects;
CREATE POLICY "Users can upload their own transaction receipts"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'transaction-receipts' AND
  -- Extract transaction ID from filename (format: receipts/transactionId.ext)
  EXISTS (
    SELECT 1
    FROM transactions
    WHERE transactions.transaction_id = split_part(name, '/', 2)
      AND transactions.user_id = auth.uid()
  )
);

-- Policy 3: Users can update receipts for their own transactions
DROP POLICY IF EXISTS "Users can update their own transaction receipts" ON storage.objects;
CREATE POLICY "Users can update their own transaction receipts"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1
    FROM transactions
    WHERE transactions.transaction_id = split_part(name, '/', 2)
      AND transactions.user_id = auth.uid()
  )
);

-- Policy 4: Users can delete receipts for their own transactions
DROP POLICY IF EXISTS "Users can delete their own transaction receipts" ON storage.objects;
CREATE POLICY "Users can delete their own transaction receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1
    FROM transactions
    WHERE transactions.transaction_id = split_part(name, '/', 2)
      AND transactions.user_id = auth.uid()
  )
);

-- Policy 5: Admins can view all receipts
DROP POLICY IF EXISTS "Admins can view all transaction receipts" ON storage.objects;
CREATE POLICY "Admins can view all transaction receipts"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Policy 6: Admins can delete any receipts (for cleanup)
DROP POLICY IF EXISTS "Admins can delete any transaction receipts" ON storage.objects;
CREATE POLICY "Admins can delete any transaction receipts"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'transaction-receipts' AND
  EXISTS (
    SELECT 1
    FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Note: Service role key (SUPABASE_SERVICE_ROLE_KEY) bypasses all RLS policies
-- This is used in server-side code to ensure admins can always access files

-- IMPORTANT: This bucket should be set to PRIVATE in Supabase Dashboard
-- When private, files are only accessible via:
-- 1. Signed URLs (generated via createSignedUrl() - expires after 1 hour)
-- 2. Service role key (bypasses RLS for server-side operations)
--
-- The application will use signed URLs:
-- - Admin viewing: /api/admin/receipts/documents generates signed URLs
-- - User viewing: API endpoint generates signed URLs for own receipts
--
-- Signed URLs work for both images (JPG, PNG) and PDFs
--
-- SETUP INSTRUCTIONS:
-- 1. Run this SQL migration in Supabase SQL Editor
-- 2. Go to Storage > transaction-receipts bucket > Settings
-- 3. Set bucket to PRIVATE
-- 4. Update receipt_url in transactions table to store file path instead of public URL
-- 5. Test by trying to view a receipt as admin or user

