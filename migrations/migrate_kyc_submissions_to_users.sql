-- Migrate existing KYC submission data to users table
-- This migration moves approved identity and address submissions from kyc_submissions to users table
-- Only migrates data for users who don't already have Bridge KYC data (bridge_customer_id is NULL)

-- Step 1: Migrate identity submission data (approved identity submissions)
-- Extract first_name and last_name from full_name, and update date_of_birth
-- Note: This assumes full_name format is "First Last" or "First Middle Last"
-- For names with multiple parts, first word = first_name, last word = last_name
UPDATE users u
SET 
  -- Parse full_name into first_name and last_name
  first_name = COALESCE(
    NULLIF(TRIM(u.first_name), ''),
    CASE 
      WHEN i.full_name IS NOT NULL AND TRIM(i.full_name) != '' THEN
        TRIM(SPLIT_PART(TRIM(i.full_name), ' ', 1))
      ELSE u.first_name
    END
  ),
  last_name = COALESCE(
    NULLIF(TRIM(u.last_name), ''),
    CASE 
      WHEN i.full_name IS NOT NULL AND TRIM(i.full_name) != '' THEN
        -- Get the last word (handles both "First Last" and "First Middle Last")
        -- Use array functions: split into array and get last element
        (string_to_array(TRIM(i.full_name), ' '))[array_length(string_to_array(TRIM(i.full_name), ' '), 1)]
      ELSE u.last_name
    END
  ),
  date_of_birth = COALESCE(u.date_of_birth, i.date_of_birth::DATE),
  country_code = COALESCE(u.country_code, i.country_code),
  bridge_kyc_metadata = COALESCE(
    u.bridge_kyc_metadata,
    jsonb_build_object(
      'source', 'legacy_kyc_submission',
      'id_type', i.id_type,
      'id_document_url', i.id_document_url,
      'id_document_filename', i.id_document_filename,
      'submission_id', i.id,
      'submission_created_at', i.created_at
    )
  ),
  updated_at = GREATEST(u.updated_at, i.updated_at)
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    full_name,
    date_of_birth,
    country_code,
    id_type,
    id_document_url,
    id_document_filename,
    id,
    created_at,
    updated_at
  FROM kyc_submissions
  WHERE type = 'identity' 
    AND status = 'approved'
    AND full_name IS NOT NULL
    AND full_name != ''
  ORDER BY user_id, updated_at DESC
) i
WHERE u.id = i.user_id
  AND u.bridge_customer_id IS NULL  -- Only migrate if user doesn't have Bridge KYC
  AND (u.first_name IS NULL OR u.first_name = '' OR u.date_of_birth IS NULL);

-- Step 2: Migrate address submission data (approved address submissions)
UPDATE users u
SET 
  address = COALESCE(u.address, a.address),
  country_code = COALESCE(u.country_code, a.country_code),
  bridge_kyc_metadata = COALESCE(
    u.bridge_kyc_metadata,
    jsonb_build_object(
      'source', 'legacy_kyc_submission',
      'document_type', a.document_type,
      'address_document_url', a.address_document_url,
      'address_document_filename', a.address_document_filename,
      'submission_id', a.id,
      'submission_created_at', a.created_at
    )
  ) || COALESCE(
    -- Merge with existing metadata if it exists
    CASE WHEN u.bridge_kyc_metadata IS NOT NULL THEN u.bridge_kyc_metadata ELSE '{}'::jsonb END,
    '{}'::jsonb
  ),
  updated_at = GREATEST(u.updated_at, a.updated_at)
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    address,
    country_code,
    document_type,
    address_document_url,
    address_document_filename,
    id,
    created_at,
    updated_at
  FROM kyc_submissions
  WHERE type = 'address' 
    AND status = 'approved'
    AND address IS NOT NULL
    AND address != ''
  ORDER BY user_id, updated_at DESC
) a
WHERE u.id = a.user_id
  AND u.bridge_customer_id IS NULL  -- Only migrate if user doesn't have Bridge KYC
  AND (u.address IS NULL OR u.address = '');

-- Step 3: Merge metadata from both identity and address submissions if both exist
-- This ensures users with both approved identity and address submissions have complete metadata
UPDATE users u
SET 
  bridge_kyc_metadata = (
    SELECT jsonb_build_object(
      'source', 'legacy_kyc_submission',
      'identity', jsonb_build_object(
        'id_type', i.id_type,
        'id_document_url', i.id_document_url,
        'id_document_filename', i.id_document_filename,
        'submission_id', i.id,
        'submission_created_at', i.created_at
      ),
      'address', jsonb_build_object(
        'document_type', a.document_type,
        'address_document_url', a.address_document_url,
        'address_document_filename', a.address_document_filename,
        'submission_id', a.id,
        'submission_created_at', a.created_at
      )
    )
  )
FROM (
  SELECT DISTINCT ON (user_id)
    user_id,
    id_type,
    id_document_url,
    id_document_filename,
    id,
    created_at
  FROM kyc_submissions
  WHERE type = 'identity' 
    AND status = 'approved'
  ORDER BY user_id, updated_at DESC
) i
LEFT JOIN (
  SELECT DISTINCT ON (user_id)
    user_id,
    document_type,
    address_document_url,
    address_document_filename,
    id,
    created_at
  FROM kyc_submissions
  WHERE type = 'address' 
    AND status = 'approved'
  ORDER BY user_id, updated_at DESC
) a ON i.user_id = a.user_id
WHERE u.id = i.user_id
  AND u.bridge_customer_id IS NULL  -- Only migrate if user doesn't have Bridge KYC
  AND i.id IS NOT NULL
  AND (u.bridge_kyc_metadata IS NULL OR u.bridge_kyc_metadata = '{}'::jsonb);

-- Note: This migration preserves the kyc_submissions table for historical reference
-- The table will be deprecated but not dropped, allowing for audit trails

