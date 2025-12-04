import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth-utils"
import { createClient } from "@supabase/supabase-js"
import { getAccessTokenFromRequest } from "@/lib/supabase-server-helpers"

/**
 * GET /api/admin/kyc/documents?path=identity/userId_filename.pdf
 * 
 * Returns a signed URL for a KYC document that admins can use to view files.
 * The signed URL is valid for 1 hour.
 * 
 * Uses the admin user's authenticated session to generate signed URLs,
 * which respects Storage RLS policies that allow admins to view all files.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const adminUser = await getAdminUser(request)
    if (!adminUser) {
      console.error("Admin access denied - user not found or not admin")
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")
    
    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    console.log(`Admin ${adminUser.email} requesting document: ${filePath}`)

    // Try using admin's authenticated session first (respects RLS policies)
    // This uses the admin's auth token which should pass the RLS policy check
    const { createServerSupabaseClient } = await import("@/lib/supabase-server-helpers")
    const { client: adminClient } = createServerSupabaseClient(request)
    
    let data, error
    
    // First try with admin's authenticated session (respects RLS)
    const result = await adminClient.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    data = result.data
    error = result.error
    
    // If that fails with 403, fall back to service role key
    if (error && (error.statusCode === 403 || error.statusCode === "403" || error.message?.includes("Forbidden"))) {
      console.log(`[ADMIN-DOCS] Admin session failed, trying service role key for: ${filePath}`)
      const { createServerClient } = await import("@/lib/supabase")
      const serverClient = createServerClient()
      
      const fallbackResult = await serverClient.storage
        .from("kyc-documents")
        .createSignedUrl(filePath, 3600)
      
      data = fallbackResult.data
      error = fallbackResult.error
    }
    
    if (error) {
      console.error("Error generating signed URL:", {
        error: error.message,
        code: error.statusCode,
        statusCode: error.statusCode,
        filePath,
        adminId: adminUser.id,
        adminEmail: adminUser.email
      })
      
      // If it's a 404, the file doesn't exist
      if (error.statusCode === 404 || error.statusCode === "404" || error.message?.includes("not found")) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      
      // If it's a 403, log it but this shouldn't happen with service role key
      if (error.statusCode === 403 || error.statusCode === "403" || error.message?.includes("Forbidden")) {
        console.error("Unexpected 403 error with service role key - this should not happen")
        return NextResponse.json({ 
          error: "Access denied. Please check Storage configuration." 
        }, { status: 403 })
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

    console.log(`Successfully generated signed URL for ${filePath}`)
    
    // Return the signed URL
    return NextResponse.json({ url: data.signedUrl })
  } catch (error: any) {
    console.error("Error in admin KYC document endpoint:", {
      error: error.message,
      stack: error.stack
    })
    
    if (error.message === "Admin access required" || error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 })
  }
}

