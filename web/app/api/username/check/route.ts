import { type NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-utils"
import { isEasetagAvailable, validateEasetag } from "@/lib/username-service"
import { createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * GET /api/username/check?easetag=username
 * Check if easetag is available
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { searchParams } = new URL(request.url)
  const easetag = searchParams.get("easetag")

  if (!easetag) {
    return createErrorResponse("Easetag parameter is required", 400)
  }

  try {
    // Validate format
    const validation = validateEasetag(easetag)
    if (!validation.valid) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: validation.error,
      })
    }

    // Check availability
    const available = await isEasetagAvailable(easetag, user.id)

    return NextResponse.json({
      available,
      valid: true,
      easetag: easetag.replace(/^@/, "").toLowerCase(),
    })
  } catch (error: any) {
    console.error("Error checking easetag:", error)
    return createErrorResponse(
      `Failed to check easetag: ${error.message || "Unknown error"}`,
      500
    )
  }
})

