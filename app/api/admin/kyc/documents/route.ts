import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/admin/kyc/documents?path=identity/userId_filename.pdf
 * 
 * Returns a signed URL for a KYC document that admins can use to view files.
 * The signed URL is valid for 1 hour.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")
    
    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    const serverClient = createServerClient()
    
    // Generate signed URL (valid for 1 hour)
    const { data, error } = await serverClient.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error("Error generating signed URL:", error)
      return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
    }
    
    // Return the signed URL
    return NextResponse.json({ url: data.signedUrl })
  } catch (error: any) {
    console.error("Error in admin KYC document endpoint:", error)
    if (error.message === "Admin access required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

