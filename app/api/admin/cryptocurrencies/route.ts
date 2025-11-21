import { type NextRequest, NextResponse } from "next/server"
import { supportedCryptocurrencyService } from "@/lib/database"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { withErrorHandling } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const cryptocurrencies = await supportedCryptocurrencyService.getAll()
    return NextResponse.json({ cryptocurrencies })
  })()
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await requireAdmin(request)
    const data = await request.json()
    const cryptocurrency = await supportedCryptocurrencyService.create(data)
    return NextResponse.json({ cryptocurrency })
  })()
}

