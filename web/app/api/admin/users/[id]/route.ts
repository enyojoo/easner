import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { createServerClient } from "@/lib/supabase"

/**
 * GET /api/admin/users/[id]
 * Get user data by userId (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin using admin_users table
    const serverClient = createServerClient()
    const { data: adminUser } = await serverClient
      .from("admin_users")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id: userId } = params
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Server client already created above

    // Get user data
    const { data: userData, error: userError } = await serverClient
      .from("users")
      .select("id, email, first_name, last_name, bridge_customer_id, bridge_signed_agreement_id, bridge_kyc_status, bridge_kyc_rejection_reasons")
      .eq("id", userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(userData)
  } catch (error: any) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    )
  }
}

