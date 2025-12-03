import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireUser, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/bridge/virtual-accounts/[id]
 * Get virtual account details
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const user = await requireUser(request)
  const virtualAccountId = params.id

  try {
    const virtualAccount = await bridgeService.getVirtualAccountDetails(virtualAccountId)

    return NextResponse.json({
      id: virtualAccount.id,
      currency: virtualAccount.currency,
      accountNumber: virtualAccount.source_deposit_instructions?.bank_account_number,
      routingNumber: virtualAccount.source_deposit_instructions?.bank_routing_number,
      iban: virtualAccount.source_deposit_instructions?.iban,
      bic: virtualAccount.source_deposit_instructions?.bic,
      bankName: virtualAccount.source_deposit_instructions?.bank_name,
      accountHolderName: virtualAccount.source_deposit_instructions?.account_holder_name,
      status: virtualAccount.status,
    })
  } catch (error: any) {
    console.error("Error fetching virtual account:", error)
    return createErrorResponse(
      `Failed to fetch virtual account: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

