import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/customers/[id]/endorsements?name=base|sepa
 * Get endorsement status for a specific endorsement
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const customerId = params.id
  const { searchParams } = new URL(request.url)
  const endorsementName = searchParams.get("name") as "base" | "sepa" | null

  try {
    if (endorsementName) {
      // Get specific endorsement
      const endorsement = await bridgeService.checkEndorsementStatus(
        customerId,
        endorsementName,
      )

      if (!endorsement) {
        return NextResponse.json({
          found: false,
        })
      }

      return NextResponse.json({
        found: true,
        name: endorsement.name,
        status: endorsement.status,
        requirements: endorsement.requirements,
      })
    } else {
      // Get all endorsements
      const customer = await bridgeService.getCustomer(customerId)
      return NextResponse.json({
        endorsements: customer.endorsements || [],
      })
    }
  } catch (error: any) {
    console.error("Error fetching endorsement status:", error)
    return createErrorResponse(
      `Failed to fetch endorsement status: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

