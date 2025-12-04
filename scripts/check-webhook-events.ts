// Script to check Bridge webhook events
// Usage: npx tsx scripts/check-webhook-events.ts [--eventType=kyc] [--customerId=<id>] [--userId=<id>]

import { createClient } from "@supabase/supabase-js"
import { bridgeService } from "../lib/bridge-service"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkWebhookEvents() {
  const args = process.argv.slice(2)
  const eventType = args.find(arg => arg.startsWith("--eventType="))?.split("=")[1] || "kyc"
  const customerId = args.find(arg => arg.startsWith("--customerId="))?.split("=")[1]
  const userId = args.find(arg => arg.startsWith("--userId="))?.split("=")[1]

  console.log("🔍 Checking Bridge Webhook Events...")
  console.log("Filters:", { eventType, customerId, userId })
  console.log("")

  // Query webhook events
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
    console.error("❌ Error querying webhook events:", error)
    process.exit(1)
  }

  console.log(`📊 Found ${webhookEvents?.length || 0} webhook events`)
  console.log("")

  // Filter KYC-related events
  const kycEvents = webhookEvents?.filter((e: any) =>
    e.event_type?.includes("customer") ||
    e.event_type?.includes("kyc")
  ) || []

  console.log(`🔐 KYC-related events: ${kycEvents.length}`)
  console.log("")

  if (kycEvents.length > 0) {
    console.log("📋 KYC Webhook Events:")
    console.log("=".repeat(80))
    kycEvents.forEach((event: any, index: number) => {
      console.log(`\n${index + 1}. Event Type: ${event.event_type}`)
      console.log(`   Event ID: ${event.event_id || "N/A"}`)
      console.log(`   Customer ID: ${event.customer_id || "N/A"}`)
      console.log(`   User ID: ${event.user_id || "N/A"}`)
      console.log(`   Created At: ${event.created_at}`)
    })
  } else {
    console.log("⚠️  No KYC-related webhook events found")
  }

  // If customerId provided, check Bridge API status
  if (customerId) {
    console.log("")
    console.log("🌉 Checking Bridge API Status...")
    try {
      const customer = await bridgeService.getCustomer(customerId)
      console.log("✅ Bridge Customer Status:")
      console.log(`   KYC Status: ${customer.kyc_status || "N/A"}`)
      console.log(`   Status: ${customer.status || "N/A"}`)
      console.log(`   Created: ${customer.created_at}`)
      console.log(`   Updated: ${customer.updated_at}`)
    } catch (error: any) {
      console.error("❌ Error fetching from Bridge API:", error.message)
    }
  }

  // If userId provided, check database status
  if (userId) {
    console.log("")
    console.log("💾 Checking Database Status...")
    const { data: user } = await supabase
      .from("users")
      .select("id, email, bridge_customer_id, bridge_kyc_status, bridge_kyc_rejection_reasons, updated_at")
      .eq("id", userId)
      .single()

    if (user) {
      console.log("✅ User Database Status:")
      console.log(`   Email: ${user.email}`)
      console.log(`   Bridge Customer ID: ${user.bridge_customer_id || "N/A"}`)
      console.log(`   KYC Status: ${user.bridge_kyc_status || "N/A"}`)
      console.log(`   Rejection Reasons: ${user.bridge_kyc_rejection_reasons ? JSON.stringify(user.bridge_kyc_rejection_reasons, null, 2) : "N/A"}`)
      console.log(`   Updated At: ${user.updated_at}`)
    }
  }

  console.log("")
  console.log("=".repeat(80))
  console.log("✅ Check complete!")
}

checkWebhookEvents().catch(console.error)

