import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { requireAdmin } from "@/lib/admin-auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminUser = await requireAdmin(request)
    if (!adminUser) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    console.log("Manual verification sync triggered by admin:", adminUser.id)

    const serverClient = createServerClient()
    
    // Get all users and their verification status
    const { data: users, error: usersError } = await serverClient
      .from("users")
      .select("id, verification_status")
    
    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Get auth users with email_confirmed_at
    const { data: authUsers, error: authError } = await serverClient.auth.admin.listUsers()
    
    if (authError) {
      console.error("Error fetching auth users:", authError)
      return NextResponse.json({ error: "Failed to fetch auth users" }, { status: 500 })
    }

    const updates = []
    
    for (const user of users || []) {
      const authUser = authUsers.users.find(au => au.id === user.id)
      
      if (authUser?.email_confirmed_at && user.verification_status !== "verified") {
        console.log(`User ${user.id} email confirmed, updating verification status`)
        updates.push({
          id: user.id,
          verification_status: "verified",
          updated_at: new Date().toISOString()
        })
      }
    }

    if (updates.length > 0) {
      console.log(`Updating verification status for ${updates.length} users`)
      
      // Update all users in batch
      const { error: updateError } = await serverClient
        .from("users")
        .upsert(updates)

      if (updateError) {
        console.error("Error updating verification status:", updateError)
        return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Updated verification status for ${updates.length} users`,
        updatedUsers: updates.length
      })
    } else {
      return NextResponse.json({ 
        success: true, 
        message: "No verification status updates needed",
        updatedUsers: 0
      })
    }
  } catch (error) {
    console.error("Error syncing verification status:", error)
    return NextResponse.json({ error: "Failed to sync verification status" }, { status: 500 })
  }
}
