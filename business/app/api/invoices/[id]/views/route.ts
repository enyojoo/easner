import { NextRequest, NextResponse } from "next/server"
import { getInvoiceViewEvents } from "@/lib/invoice-view-events"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params
    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID required" }, { status: 400 })
    }

    const events = getInvoiceViewEvents(invoiceId)
    return NextResponse.json({ views: events })
  } catch (err) {
    console.error("Get invoice views error:", err)
    return NextResponse.json(
      { error: "Failed to get views" },
      { status: 500 }
    )
  }
}
