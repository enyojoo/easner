/**
 * Script to fetch all occupation codes from Bridge API
 * Run this script to update the static occupation codes list
 * Usage: npx tsx scripts/fetch-occupation-codes.ts
 */

// Load environment variables BEFORE importing bridge-service
// Use require for dotenv to ensure it runs before any imports
const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// Try to load .env.local first, then .env
const rootDir = path.join(__dirname, '..')
const envLocalPath = path.join(rootDir, '.env.local')
const envPath = path.join(rootDir, '.env')

// Load with override to ensure variables are set
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath, override: true })
  if (result.error) {
    console.error('Error loading .env.local:', result.error)
  } else {
    console.log('✅ Loaded .env.local')
  }
} else if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath, override: true })
  if (result.error) {
    console.error('Error loading .env:', result.error)
  } else {
    console.log('✅ Loaded .env')
  }
}

// Verify API key is loaded
if (process.env.BRIDGE_API_KEY) {
  console.log(`✅ BRIDGE_API_KEY loaded: ${process.env.BRIDGE_API_KEY.substring(0, 10)}...`)
} else {
  console.error('❌ BRIDGE_API_KEY not found. Please set it in .env.local or .env file')
  process.exit(1)
}

// Now import bridge-service (it will use the loaded environment variables)
const { bridgeService } = require('../lib/bridge-service')

async function fetchAndGenerateOccupationCodes() {
  try {
    console.log('Fetching occupation codes from Bridge API...')
    const occupationCodes = await bridgeService.getOccupationCodes()
    
    console.log(`Fetched ${occupationCodes.length} occupation codes`)
    
    // Read the current bridgeKycHelpers.ts file
    const fs = require('fs')
    const path = require('path')
    const helpersPath = path.join(__dirname, '../mobile/src/lib/bridgeKycHelpers.ts')
    const currentContent = fs.readFileSync(helpersPath, 'utf-8')
    
    // Generate the new OCCUPATION_OPTIONS array
    // Bridge API returns { display_name, code } format
    const occupationOptionsCode = `export const OCCUPATION_OPTIONS: Array<{ label: string; value: string }> = [
${occupationCodes.map((item: any, index: number) => {
  // Handle both 'occupation' and 'display_name' fields from Bridge API
  const occupationName = item.occupation || item.display_name || ''
  const label = occupationName.replace(/'/g, "\\'").replace(/\n/g, ' ').trim()
  const code = item.code || ''
  if (!label || !code) {
    console.warn(`Skipping invalid occupation code item:`, item)
    return null
  }
  return `  { label: '${label}', value: '${code}' }${index < occupationCodes.length - 1 ? ',' : ''}`
}).filter((line: string | null) => line !== null).join('\n')}
]`
    
    // Replace the OCCUPATION_OPTIONS section in the file
    // Find everything from the comment to the end of the array (including the closing bracket)
    const fullPattern = /(\/\*\*[\s\S]*?Occupation options for dropdown[\s\S]*?\*\/[\s\n]*)(export const OCCUPATION_OPTIONS[^=]*=\s*\[[\s\S]*?\n\])/m
    
    const newComment = `/**
 * Occupation options for dropdown
 * These are ALL occupation codes from Bridge API - GET /v0/lists/occupation_codes
 * Value is the occupation code (e.g., "132011" for "Accountant and auditor")
 * Last updated: ${new Date().toISOString()}
 * Total codes: ${occupationCodes.length}
 * Run: npx tsx scripts/fetch-occupation-codes.ts to update this list
 */`
    
    const replacement = `${newComment}\n${occupationOptionsCode}`
    
    let updatedContent = currentContent.replace(fullPattern, replacement)
    
    // If the pattern didn't match, try a more flexible approach
    if (updatedContent === currentContent) {
      // Find just the array declaration and its content
      const arrayPattern = /export const OCCUPATION_OPTIONS[^=]*=\s*\[[\s\S]*?\n\]/m
      updatedContent = currentContent.replace(arrayPattern, occupationOptionsCode)
      
      // Also update the comment if it exists
      const commentPattern2 = /(\/\*\*[\s\S]*?Occupation options for dropdown[\s\S]*?\*\/)/m
      if (commentPattern2.test(updatedContent)) {
        updatedContent = updatedContent.replace(commentPattern2, newComment)
      } else {
        // Insert comment before the export
        updatedContent = updatedContent.replace(
          /(export const OCCUPATION_OPTIONS)/m,
          `${newComment}\n$1`
        )
      }
    }
    
    fs.writeFileSync(helpersPath, updatedContent, 'utf-8')
    console.log(`✅ Successfully updated ${helpersPath}`)
    console.log(`   Total occupation codes: ${occupationCodes.length}`)
    
  } catch (error: any) {
    console.error('Error fetching occupation codes:', error)
    process.exit(1)
  }
}

fetchAndGenerateOccupationCodes()

