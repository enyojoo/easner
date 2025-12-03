import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-utils"
import { bridgeService } from "@/lib/bridge-service"
import { withErrorHandling } from "@/lib/api-utils"

/**
 * GET /api/bridge/kyc-options
 * Fetch all KYC options from Bridge API:
 * - Occupation codes (for most_recent_occupation)
 * - Source of funds options (static list of valid Bridge values)
 * - Employment status options (static list of valid Bridge values)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    // Fetch occupation codes from Bridge API
    const occupationCodes = await bridgeService.getOccupationCodes()
    
    // Source of funds - these are the exact string values Bridge accepts
    const sourceOfFundsOptions = [
      { label: 'Salary', value: 'salary' },
      { label: 'Company Funds', value: 'company_funds' },
      { label: 'Ecommerce Reseller', value: 'ecommerce_reseller' },
      { label: 'Gambling Proceeds', value: 'gambling_proceeds' },
      { label: 'Gifts', value: 'gifts' },
      { label: 'Government Benefits', value: 'government_benefits' },
      { label: 'Inheritance', value: 'inheritance' },
      { label: 'Investments/Loans', value: 'investments_loans' },
      { label: 'Pension/Retirement', value: 'pension_retirement' },
      { label: 'Sale of Assets/Real Estate', value: 'sale_of_assets_real_estate' },
      { label: 'Savings', value: 'savings' },
      { label: 'Someone Else\'s Funds', value: 'someone_elses_funds' },
    ]
    
    // Employment status - these are the exact values Bridge accepts
    const employmentStatusOptions = [
      { label: 'Employed', value: 'employed' },
      { label: 'Unemployed', value: 'unemployed' },
      { label: 'Self-Employed', value: 'self_employed' },
      { label: 'Retired', value: 'retired' },
      { label: 'Student', value: 'student' },
    ]
    
    return NextResponse.json({
      occupationCodes: occupationCodes.map((item) => ({
        code: item.code,
        occupation: item.occupation,
        label: item.occupation, // For UI display
        value: item.code, // Use code as value
      })),
      sourceOfFunds: sourceOfFundsOptions,
      employmentStatus: employmentStatusOptions,
    })
  } catch (error: any) {
    console.error("Error fetching KYC options:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch KYC options" },
      { status: 500 }
    )
  }
})

