// Check webhook events for a specific user or customer
// GET /api/admin/webhooks/check?userId=<userId>&customerId=<customerId>&eventType=<eventType>

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"
import { bridgeService } from "@/lib/bridge-service"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const customerId = searchParams.get("customerId")
    const eventType = searchParams.get("eventType")

    // Get webhook events from database
    let query = supabase
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
      const { data: user } = await supabase
        .from("users")
        .select("id, email, bridge_customer_id, bridge_kyc_status, bridge_kyc_rejection_reasons, updated_at")
        .eq("id", userId)
        .single()

      if (user) {
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
    console.error("Error checking webhook events:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check webhook events" },
      { status: 500 }
    )
  }
}

