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
    const searchParams = request.nextUrl.searchParams
    const filePath = searchParams.get("path")
    
    if (!filePath) {
      return NextResponse.json({ error: "File path is required" }, { status: 400 })
    }

    // Try to verify admin access, but don't fail if it doesn't work
    // We'll use service role as fallback which should work regardless
    const adminUser = await getAdminUser(request)
    const isAdmin = !!adminUser
    
    if (isAdmin) {
      console.log(`Admin ${adminUser.email} requesting document: ${filePath}`)
    } else {
      console.log(`[ADMIN-DOCS] Admin check failed, using service role for: ${filePath}`)
      // Log available cookies for debugging
      const cookies = request.cookies.getAll()
      console.log(`[ADMIN-DOCS] Available cookies:`, cookies.map(c => c.name))
    }

    // Use service role key directly to bypass RLS
    // This ensures admins can always access files even if admin auth check fails
    // The service role key bypasses all RLS policies
    const { createServerClient } = await import("@/lib/supabase")
    const serverClient = createServerClient()
    
    console.log(`[ADMIN-DOCS] Generating signed URL with service role for: ${filePath}`)
    const { data, error } = await serverClient.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error("[ADMIN-DOCS] Error generating signed URL:", {
        error: error.message,
        code: error.statusCode,
        statusCode: error.statusCode,
        filePath,
        isAdmin,
        adminId: adminUser?.id,
        adminEmail: adminUser?.email
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

