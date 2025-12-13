import { type NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth-utils"
import { setEasetag } from "@/lib/username-service"
import { createErrorResponse, withErrorHandling } from "@/lib/auth-utils"

/**
 * POST /api/username/set
 * Set easetag for authenticated user
 * Body: { easetag: string }
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const body = await request.json()
  const { easetag } = body

  if (!easetag) {
    return createErrorResponse("Easetag is required", 400)
  }

  try {
    await setEasetag(user.id, easetag)

    return NextResponse.json({
      success: true,
      easetag: easetag.replace(/^@/, "").toLowerCase(),
      message: "Easetag set successfully",
    })
  } catch (error: any) {
    console.error("Error setting easetag:", error)
    return createErrorResponse(
      `Failed to set easetag: ${error.message || "Unknown error"}`,
      400
    )
  }
})

/**
 * DELETE /api/username/set
 * Remove easetag for authenticated user
 */
export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser(request)
  const { removeEasetag } = await import("@/lib/username-service")

  try {
    await removeEasetag(user.id)

    return NextResponse.json({
      success: true,
      message: "Easetag removed successfully",
    })
  } catch (error: any) {
    console.error("Error removing easetag:", error)
    return createErrorResponse(
      `Failed to remove easetag: ${error.message || "Unknown error"}`,
      500
    )
  }
})

