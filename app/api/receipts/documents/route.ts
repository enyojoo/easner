import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/receipts/documents?path=receipts/transactionId.ext
 * 
 * Returns a signed URL for a transaction receipt that users can use to view their own receipts.
 * The signed URL is valid for 1 hour.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")
    
    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Verify user authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the receipt belongs to the user
    // Extract transaction ID from path (format: receipts/transactionId.ext)
    const transactionId = filePath.split('/')[1]?.split('.')[0]
    if (!transactionId) {
      return NextResponse.json({ error: "Invalid file path format" }, { status: 400 })
    }

    // Check if transaction belongs to user
    const serverClient = createServerClient()
    const { data: transaction, error: txError } = await serverClient
      .from("transactions")
      .select("id, user_id, transaction_id")
      .eq("transaction_id", transactionId)
      .single()

    if (txError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized - receipt does not belong to user" }, { status: 403 })
    }

    console.log(`[USER-RECEIPTS] User ${user.id} requesting receipt: ${filePath}`)

    // Use service role key to generate signed URL (bypasses RLS)
    const { data, error } = await serverClient.storage
      .from("transaction-receipts")
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error("[USER-RECEIPTS] Error generating signed URL:", {
        error: error.message,
        code: error.statusCode,
        filePath,
        userId: user.id
      })
      
      if (error.statusCode === 404 || error.statusCode === "404" || error.message?.includes("not found")) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      
      return NextResponse.json({ 
        error: "Failed to generate signed URL",
        details: error.message 
      }, { status: 500 })
    }
    
    if (!data?.signedUrl) {
      console.error("No signed URL returned from Supabase")
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
    }

    console.log(`[USER-RECEIPTS] Successfully generated signed URL for ${filePath}`)
    
    return NextResponse.json({ url: data.signedUrl })
  } catch (error: any) {
    console.error("Error in receipt document endpoint:", {
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

