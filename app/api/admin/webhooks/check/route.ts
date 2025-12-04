// Check webhook events for a specific user or customer
// GET /api/admin/webhooks/check?userId=<userId>&customerId=<customerId>&eventType=<eventType>

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin, getAdminUser } from "@/lib/admin-auth-utils"
import { createServerClient } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Log request details for debugging
    const cookies = request.cookies.getAll()
    const authHeader = request.headers.get("authorization")
    console.log(`[WEBHOOK-CHECK] Request received`)
    console.log(`[WEBHOOK-CHECK] Auth header present:`, !!authHeader)
    console.log(`[WEBHOOK-CHECK] Cookies count:`, cookies.length)
    console.log(`[WEBHOOK-CHECK] Cookie names:`, cookies.map(c => c.name))
    
    // Try requireAdmin first (uses token from cookies)
    let adminUser
    try {
      adminUser = await requireAdmin(request)
      console.log(`[WEBHOOK-CHECK] Admin ${adminUser.email} checking webhooks`)
    } catch (authError: any) {
      console.warn(`[WEBHOOK-CHECK] requireAdmin failed, trying session-based auth:`, authError?.message)
      
      // Fallback: Try getAdminUser directly (might work even if requireAdmin failed)
      try {
        adminUser = await getAdminUser(request)
        if (!adminUser) {
          console.error(`[WEBHOOK-CHECK] getAdminUser returned null`)
          return NextResponse.json(
            { 
              error: "Authentication failed",
              message: "Admin access required"
            },
            { status: 401 }
          )
        }
        console.log(`[WEBHOOK-CHECK] Admin authenticated via getAdminUser: ${adminUser.email}`)
      } catch (fallbackError: any) {
        console.error(`[WEBHOOK-CHECK] Fallback auth also failed:`, fallbackError?.message)
        return NextResponse.json(
          { 
            error: "Authentication failed",
            message: "Unable to verify admin access. Please ensure you are logged in as an admin."
          },
          { status: 401 }
        )
      }
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const customerId = searchParams.get("customerId")
    const eventType = searchParams.get("eventType")

    // Get webhook events from database using service role client
    const serverClient = createServerClient()
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

