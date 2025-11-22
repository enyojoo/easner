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

    // Get access token from request to create authenticated client
    const token = getAccessTokenFromRequest(request)
    if (!token) {
      console.error("No access token found in request")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Create authenticated client using admin's session
    // This respects Storage RLS policies that allow admins to view all files
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
    
    // Generate signed URL using admin's authenticated session
    // Storage RLS policies should allow admins to view all files
    const { data, error } = await authenticatedClient.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error("Error generating signed URL:", {
        error: error.message,
        code: error.statusCode,
        filePath,
        adminId: adminUser.id,
        adminEmail: adminUser.email
      })
      
      // If it's a 404, the file doesn't exist
      if (error.statusCode === "404" || error.message?.includes("not found")) {
        return NextResponse.json({ error: "File not found" }, { status: 404 })
      }
      
      // If it's a 403, Storage RLS is blocking admin access
      if (error.statusCode === "403" || error.message?.includes("Forbidden")) {
        console.error("Storage RLS blocking admin access - check Storage RLS policies")
        return NextResponse.json({ 
          error: "Access denied. Please check Storage RLS policies allow admin access." 
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

