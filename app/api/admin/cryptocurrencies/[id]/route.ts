import { type NextRequest, NextResponse } from "next/server"
import { supportedCryptocurrencyService } from "@/lib/database"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { withErrorHandling } from "@/lib/auth-utils"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const data = await request.json()
    const cryptocurrency = await supportedCryptocurrencyService.update(params.id, data)
    return NextResponse.json({ cryptocurrency })
  })()
}

