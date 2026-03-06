import { NextRequest, NextResponse } from "next/server"
import { addInvoiceViewEvent } from "@/lib/invoice-view-events"

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown"
  }
  return request.headers.get("x-real-ip") ?? "unknown"
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
    }

    const clientIp = getClientIp(request)
    const businessOwnerIp = request.cookies.get("easner_business_owner_ip")?.value

    // If IP differs from business owner (or no cookie set), treat as customer view
    const isCustomerView = !businessOwnerIp || clientIp !== businessOwnerIp

    if (isCustomerView) {
      addInvoiceViewEvent(invoiceId)
    }

    return NextResponse.json({ recorded: isCustomerView })
  } catch (err) {
    console.error("Record invoice view error:", err)
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    )
  }
}
