import { type NextRequest, NextResponse } from "next/server"
import { getWalletIdByUsername } from "@/lib/username-service"
import { createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/username/lookup?username=@username
 * Lookup wallet ID by username (Easetag)
 * Used for P2P transfers
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  if (!username) {
    return createErrorResponse("Username parameter is required", 400)
  }

  try {
    const result = await getWalletIdByUsername(username)

    if (!result) {
      return NextResponse.json(
        { found: false, message: "User not found" },
        { status: 404 }
      )
    }

    if (!result.bridgeWalletId) {
      return NextResponse.json(
        {
          found: true,
          hasWallet: false,
          message: "User does not have a wallet set up",
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      found: true,
      hasWallet: true,
      userId: result.userId,
      easetag: result.easetag,
      bridgeWalletId: result.bridgeWalletId,
      displayName: result.firstName && result.lastName
        ? `${result.firstName} ${result.lastName}`
        : result.firstName || result.lastName || result.easetag,
    })
  } catch (error: any) {
    console.error("Error looking up username:", error)
    return createErrorResponse(
      `Failed to lookup username: ${error.message || "Unknown error"}`,
      500
    )
  }
})

