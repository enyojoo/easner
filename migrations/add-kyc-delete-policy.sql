-- Add DELETE policy for admins on kyc_submissions
CREATE POLICY "Admins can delete all KYC submissions"
  ON kyc_submissions
  FOR DELETE
  USING (is_admin_user());

