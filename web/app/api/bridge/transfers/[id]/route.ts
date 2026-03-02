import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/transfers/[id]
 * Get transfer status
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const transferId = params.id

  try {
    const transfer = await bridgeService.getTransferStatus(transferId)

    return NextResponse.json({
      id: transfer.id,
      amount: transfer.amount,
      currency: transfer.currency,
      status: transfer.status,
      source: transfer.source,
      destination: transfer.destination,
      createdAt: transfer.created_at,
      updatedAt: transfer.updated_at,
    })
  } catch (error: any) {
    console.error("Error fetching transfer:", error)
    return createErrorResponse(
      `Failed to fetch transfer: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

