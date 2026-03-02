// Check webhook events for a specific user or customer
// GET /api/admin/webhooks/check?userId=<userId>&customerId=<customerId>&eventType=<eventType>

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { createClient } from "@supabase/supabase-js"
import { bridgeService } from "@/lib/bridge-service"
import { getAccessTokenFromRequest } from "@/lib/supabase-server-helpers"

export async function GET(request: NextRequest) {
  try {
    // Use token-based authentication (same as getAdminUser)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Get access token from cookies
    const token = getAccessTokenFromRequest(request)
    
    if (!token) {
      console.error("[WEBHOOK-CHECK] No authentication token found")
      const allCookies = request.cookies.getAll()
      console.log("[WEBHOOK-CHECK] Available cookies:", allCookies.map(c => c.name))
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Create anon client to verify token and get user
    const anonClient = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token)
    
    if (userError || !user) {
      console.error("[WEBHOOK-CHECK] Failed to get user from token:", userError?.message)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    console.log("[WEBHOOK-CHECK] Authenticated user found:", user.id, user.email)
    
    // Check if user is admin by querying admin_users table using service role
    const serverClient = createServerClient()
    const { data: adminUser, error: adminError } = await serverClient
      .from("admin_users")
      .select("id, email, role, name, status")
      .eq("id", user.id)
      .single()
    
    if (adminError || !adminUser) {
      console.error("[WEBHOOK-CHECK] User is not an admin:", adminError?.message)
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Check if admin user is active (if status field exists)
    if (adminUser.status && adminUser.status !== "active") {
      console.error("[WEBHOOK-CHECK] Admin user is not active:", adminUser.status)
      return NextResponse.json({ error: "Admin account is not active" }, { status: 403 })
    }

    console.log(`[WEBHOOK-CHECK] Admin ${adminUser.email} checking webhooks`)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const customerId = searchParams.get("customerId")
    const eventType = searchParams.get("eventType")

    // Get webhook events from database using service role client (already created above)
    let query = serverClient
      .from("bridge_webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    if (eventType) {
      query = query.ilike("event_type", `%${eventType}%`)
    }

    const { data: webhookEvents, error } = await query

    if (error) {
      throw error
    }

    // If customerId provided, also check Bridge API for current status
    let bridgeStatus = null
    if (customerId) {
      try {
        const customer = await bridgeService.getCustomer(customerId)
        bridgeStatus = {
          kyc_status: customer.kyc_status,
          status: customer.status,
          created_at: customer.created_at,
          updated_at: customer.updated_at,
        }
      } catch (error: any) {
        console.error("Error fetching customer from Bridge:", error)
        bridgeStatus = { error: error.message }
      }
    }

    // If userId provided, get user's current KYC status from database
    let userStatus = null
    if (userId) {
      const { data: user, error: userError } = await serverClient
        .from("users")
        .select("id, email, bridge_customer_id, bridge_kyc_status, bridge_kyc_rejection_reasons, updated_at")
        .eq("id", userId)
        .single()

      if (userError) {
        console.error("[WEBHOOK-CHECK] Error fetching user:", userError)
        userStatus = { error: userError.message }
      } else if (user) {
        userStatus = {
          email: user.email,
          bridge_customer_id: user.bridge_customer_id,
          bridge_kyc_status: user.bridge_kyc_status,
          bridge_kyc_rejection_reasons: user.bridge_kyc_rejection_reasons,
          updated_at: user.updated_at,
        }
      }
    }

    return NextResponse.json({
      webhookEvents: webhookEvents || [],
      bridgeStatus,
      userStatus,
      summary: {
        totalEvents: webhookEvents?.length || 0,
        kycEvents: webhookEvents?.filter((e: any) => 
          e.event_type?.includes("customer") || 
          e.event_type?.includes("kyc")
        ).length || 0,
      },
    })
  } catch (error: any) {
    console.error("[WEBHOOK-CHECK] Error checking webhook events:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    })
    
    // If it's an admin auth error, return 401 (not 403)
    if (error.message === "Admin access required" || error.message?.includes("Unauthorized") || error.message?.includes("Authentication failed")) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message || "Failed to check webhook events",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

