// KYC Data Verification Script
// Run this to verify KYC data format for a specific user
// Usage: npx tsx scripts/verify-kyc-data.ts <userId>

import { createServerClient } from "../lib/supabase"
import { kycService } from "../lib/kyc-service"
import { validateKYCForBridge, getBridgeRequirementsForCountry } from "../lib/bridge-kyc-validator"
import { buildBridgeCustomerPayloadFromKyc } from "../lib/bridge-kyc-builder"

async function verifyKYCData(userId: string) {
  console.log(`\n🔍 Verifying KYC data for user: ${userId}\n`)
  
  const supabase = createServerClient()
  
  // Step 1: Get user data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, first_name, last_name")
    .eq("id", userId)
    .single()
  
  if (userError || !user) {
    console.error(`❌ User not found: ${userError?.message || "Unknown error"}`)
    process.exit(1)
  }
  
  console.log(`✅ User found: ${user.email}`)
  console.log(`   Name: ${user.first_name} ${user.last_name}\n`)
  
  // Step 2: Get KYC submissions
  const submissions = await kycService.getByUserId(userId, supabase)
  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")
  
  console.log(`📋 KYC Submissions:`)
  console.log(`   Identity: ${identitySubmission ? '✅ Found' : '❌ Missing'}`)
  console.log(`   Address: ${addressSubmission ? '✅ Found' : '❌ Missing'}\n`)
  
  if (!identitySubmission || !addressSubmission) {
    console.error(`❌ Missing KYC submissions`)
    process.exit(1)
  }
  
  // Step 3: Validate KYC data
  console.log(`🔍 Validating KYC data...\n`)
  const validation = validateKYCForBridge(
    identitySubmission,
    addressSubmission,
    user.email,
    user.first_name,
    user.last_name
  )
  
  if (!validation.isValid) {
    console.error(`❌ Validation FAILED:\n`)
    validation.errors.forEach(error => console.error(`   - ${error}`))
    console.error(`\n   Missing fields: ${validation.missingFields.join(', ')}\n`)
    process.exit(1)
  }
  
  console.log(`✅ Validation PASSED\n`)
  
  if (validation.warnings.length > 0) {
    console.log(`⚠️  Warnings:\n`)
    validation.warnings.forEach(warning => console.log(`   - ${warning}`))
    console.log()
  }
  
  // Step 4: Show country requirements
  const countryCode = addressSubmission.country_code || identitySubmission.country_code
  if (countryCode) {
    const requirements = getBridgeRequirementsForCountry(countryCode)
    console.log(`🌍 Country: ${countryCode}`)
    console.log(`   Required fields: ${requirements.requiredFields.join(', ')}`)
    console.log(`   Optional fields: ${requirements.optionalFields.join(', ')}`)
    console.log(`   Required documents: ${requirements.requiredDocuments.join(', ') || 'None'}`)
    console.log(`   Optional documents: ${requirements.optionalDocuments.join(', ') || 'None'}\n`)
  }
  
  // Step 5: Test payload building (without signed_agreement_id)
  console.log(`🧪 Testing payload building...\n`)
  try {
    // Use a test signed_agreement_id for verification (won't actually create customer)
    const testSignedAgreementId = "test-verification-only"
    const payload = await buildBridgeCustomerPayloadFromKyc(
      userId,
      testSignedAgreementId,
      true, // needsUSD
      false, // needsEUR
      supabase
    )
    
    console.log(`✅ Payload built successfully!\n`)
    console.log(`📦 Payload structure:`)
    console.log(`   - Email: ${payload.email ? '✅' : '❌'}`)
    console.log(`   - First Name: ${payload.first_name ? '✅' : '❌'}`)
    console.log(`   - Last Name: ${payload.last_name ? '✅' : '❌'}`)
    console.log(`   - Date of Birth: ${payload.date_of_birth ? '✅' : '❌'}`)
    console.log(`   - Address: ${payload.address ? '✅' : '❌'}`)
    console.log(`   - Signed Agreement ID: ${payload.signed_agreement_id ? '✅' : '❌'}`)
    console.log(`   - Tax ID (SSN): ${payload.tax_identification_number ? '✅' : '⚠️  Optional'}`)
    console.log(`   - Phone: ${payload.phone ? '✅' : '⚠️  Optional'}`)
    console.log(`   - Passport: ${payload.passport ? '✅' : '⚠️  Optional'}`)
    console.log(`   - Proof of Address: ${payload.proof_of_address ? '✅' : '⚠️  Optional'}`)
    console.log(`   - Endorsements: ${payload.endorsements ? payload.endorsements.join(', ') : 'None'}\n`)
    
    console.log(`✅ All checks passed! KYC data is ready for Bridge customer creation.\n`)
    
  } catch (error: any) {
    console.error(`❌ Payload building FAILED:`)
    console.error(`   ${error.message}\n`)
    process.exit(1)
  }
}

// Run verification
const userId = process.argv[2]
if (!userId) {
  console.error("Usage: npx tsx scripts/verify-kyc-data.ts <userId>")
  process.exit(1)
}

verifyKYCData(userId).catch(error => {
  console.error("Error:", error)
  process.exit(1)
})

