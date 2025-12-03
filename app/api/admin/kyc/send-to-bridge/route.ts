import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth-utils"
import { bridgeService } from "@/lib/bridge-service"
import { buildBridgeCustomerPayloadFromKyc } from "@/lib/bridge-kyc-builder"
import { initializeBridgeAccount } from "@/lib/bridge-onboarding-service"
import { kycService } from "@/lib/kyc-service"
import { createServerClient } from "@/lib/supabase"

/**
 * POST /api/admin/kyc/send-to-bridge
 * Admin endpoint to send user's KYC data to Bridge and create customer
 */
export async function POST(request: NextRequest) {
  try {
    // Log request details for debugging
    const authHeader = request.headers.get("authorization")
    const cookies = request.cookies.getAll()
    console.log("[SEND-TO-BRIDGE] Request received")
    console.log("[SEND-TO-BRIDGE] Auth header present:", !!authHeader)
    console.log("[SEND-TO-BRIDGE] Cookies count:", cookies.length)
    console.log("[SEND-TO-BRIDGE] Cookie names:", cookies.map(c => c.name))
    
    // Check admin authentication
    let adminUser
    try {
      adminUser = await requireAdmin(request)
      console.log("[SEND-TO-BRIDGE] Admin authenticated:", adminUser.email)
    } catch (authError: any) {
      console.error("[SEND-TO-BRIDGE] Admin authentication failed:", authError?.message)
      console.error("[SEND-TO-BRIDGE] Auth error stack:", authError?.stack)
      return NextResponse.json({ 
        error: "Authentication failed",
        message: authError?.message || "Admin access required"
      }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Use server client to bypass RLS
    const serverClient = createServerClient()

    // Get user data
    const { data: targetUser, error: userError } = await serverClient
      .from("users")
      .select("id, email, first_name, last_name, bridge_customer_id, bridge_signed_agreement_id")
      .eq("id", userId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user already has a Bridge customer
    if (targetUser.bridge_customer_id) {
      return NextResponse.json(
        { error: "User already has a Bridge customer. Customer ID: " + targetUser.bridge_customer_id },
        { status: 400 }
      )
    }

    // Check if user has TOS signed
    if (!targetUser.bridge_signed_agreement_id) {
      return NextResponse.json(
        { error: "User must accept Terms of Service before sending KYC to Bridge" },
        { status: 400 }
      )
    }

    // Get KYC submissions
    const submissions = await kycService.getByUserId(userId, serverClient)
    const identitySubmission = submissions.find(s => s.type === "identity")
    const addressSubmission = submissions.find(s => s.type === "address")

    if (!identitySubmission || !addressSubmission) {
      return NextResponse.json(
        { 
          error: "User must complete both identity and address verification",
          hasIdentity: !!identitySubmission,
          hasAddress: !!addressSubmission,
        },
        { status: 400 }
      )
    }

    // Build customer payload from KYC data
    console.log(`[ADMIN-SEND-TO-BRIDGE] Building customer payload for user ${userId}`)
    const customerPayload = await buildBridgeCustomerPayloadFromKyc(
      userId,
      targetUser.bridge_signed_agreement_id,
      true, // needsUSD
      false, // needsEUR (can be made configurable)
      serverClient
    )

    // Initialize Bridge account (creates customer, wallet, virtual accounts)
    // This function handles customer creation and will skip if customer already exists
    console.log(`[ADMIN-SEND-TO-BRIDGE] Initializing Bridge account for user ${userId}`)
    const result = await initializeBridgeAccount({
      userId: userId,
      email: targetUser.email || '',
      customerPayload,
      needsUSD: true,
      needsEUR: false,
    })

    // Get customer details
    const customer = await bridgeService.getCustomer(result.customerId)

    return NextResponse.json({
      success: true,
      customerId: result.customerId,
      kycStatus: customer.kyc_status,
      endorsements: customer.endorsements || [],
      walletId: result.walletId,
      usdVirtualAccountId: result.usdVirtualAccountId,
      eurVirtualAccountId: result.eurVirtualAccountId,
      rejectionReasons: customer.rejection_reasons,
    })
  } catch (error: any) {
    console.error("Error sending KYC to Bridge:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send KYC to Bridge" },
      { status: 500 }
    )
  }
}

