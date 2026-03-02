import { type NextRequest, NextResponse } from "next/server"
import { bridgeService } from "@/lib/bridge-service"
import { requireAdmin, createErrorResponse, withErrorHandling } from "@/lib/auth-utils"
import { supabase } from "@/lib/supabase"

/**
 * GET /api/admin/bridge/customers
 * List all Bridge customers (admin only)
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireAdmin(request)

  try {
    const { searchParams } = new URL(request.url)
    const kycStatus = searchParams.get("kycStatus")

    // Get all users with Bridge customer IDs
    let query = supabase
      .from("users")
      .select("bridge_customer_id, email, first_name, last_name")
      .not("bridge_customer_id", "is", null)

    const { data: users, error } = await query

    if (error) throw error

    // Fetch customer details from Bridge for each user
    const customers = await Promise.all(
      (users || [])
        .map(async (user) => {
          try {
            const customer = await bridgeService.getCustomer(user.bridge_customer_id)
            return {
              ...customer,
              email: customer.email || user.email,
              first_name: customer.first_name || user.first_name,
              last_name: customer.last_name || user.last_name,
            }
          } catch (error) {
            console.error(`Error fetching customer ${user.bridge_customer_id}:`, error)
            return null
          }
        })
        .filter((c) => c !== null),
    )

    // Filter by KYC status if specified
    const filteredCustomers =
      kycStatus && kycStatus !== "all"
        ? customers.filter((c) => c.kyc_status === kycStatus)
        : customers

    return NextResponse.json({
      customers: filteredCustomers,
    })
  } catch (error: any) {
    console.error("Error fetching Bridge customers:", error)
    return createErrorResponse(
      `Failed to fetch customers: ${error.message || "Unknown error"}`,
      500,
    )
  }
})

