import { type NextRequest, NextResponse } from "next/server"
import { combinedTransactionService } from "@/lib/combined-transaction-service"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("Admin transactions API - Starting request")
    
    // Check admin authentication
    let adminUser
    try {
      adminUser = await requireAdmin(request)
      console.log("Admin authenticated:", adminUser.email)
    } catch (authError: any) {
      console.error("Admin authentication failed:", authError?.message)
      return NextResponse.json({ 
        error: "Authentication failed",
        message: authError?.message || "Admin access required"
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = (searchParams.get("type") || "all") as "all" | "send" | "receive"
    const status = searchParams.get("status") || undefined
    const search = searchParams.get("search") || undefined
    const limit = parseInt(searchParams.get("limit") || "100")

    console.log("Admin transactions API - Fetching with filters:", { type, status, search, limit })

    // Get combined transactions
    let transactions
    try {
      transactions = await combinedTransactionService.getAdminAllTransactions({
        type,
        status,
        search,
        limit,
      })
      console.log(`Admin transactions API - Found ${transactions.length} transactions`)
    } catch (fetchError: any) {
      console.error("Error fetching transactions:", fetchError)
      console.error("Fetch error message:", fetchError?.message)
      console.error("Fetch error stack:", fetchError?.stack)
      throw fetchError // Re-throw to be caught by outer catch
    }

    return NextResponse.json({ transactions })
  } catch (error: any) {
    console.error("Error loading admin transactions:", error)
    console.error("Error type:", typeof error)
    console.error("Error message:", error?.message)
    console.error("Error name:", error?.name)
    console.error("Error stack:", error?.stack)
    
    // Try to serialize error safely
    let errorMessage = "Unknown error"
    let errorDetails: any = undefined
    
    try {
      errorMessage = error?.message || String(error) || "Unknown error"
      if (process.env.NODE_ENV === "development") {
        errorDetails = {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          toString: String(error),
        }
      }
    } catch (serializeError) {
      console.error("Failed to serialize error:", serializeError)
    }
    
    return NextResponse.json({ 
      error: "Failed to load transactions",
      message: errorMessage,
      details: errorDetails
    }, { status: 500 })
  }
}
