import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-utils"
import { bridgeService } from "@/lib/bridge-service"
import { withErrorHandling } from "@/lib/api-utils"

/**
 * GET /api/bridge/occupation-codes
 * Fetch occupation codes from Bridge API
 * These are used for the "most_recent_occupation" field for international customers
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)

  try {
    const occupationCodes = await bridgeService.getOccupationCodes()
    
    return NextResponse.json({
      occupationCodes: occupationCodes.map((item) => ({
        code: item.code,
        occupation: item.occupation,
        label: item.occupation, // For UI display
        value: item.code, // Use code as value
      })),
    })
  } catch (error: any) {
    console.error("Error fetching occupation codes:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch occupation codes" },
      { status: 500 }
    )
  }
})

