import { type NextRequest, NextResponse } from "next/server"
import { supportedCryptocurrencyService } from "@/lib/database"
import { withErrorHandling } from "@/lib/auth-utils"

export const GET = withErrorHandling(async (request: NextRequest) => {
  const cryptocurrencies = await supportedCryptocurrencyService.getAll()
  return NextResponse.json({ cryptocurrencies })
})

