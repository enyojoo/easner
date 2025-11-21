import { type NextRequest, NextResponse } from "next/server"
import { currencyService } from "@/lib/database"
import { withErrorHandling } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const currencies = await currencyService.getAll()
  return NextResponse.json({ currencies })
})

