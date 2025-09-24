// Admin transaction status update API endpoint

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id
    const body = await request.json()

    const { status, failure_reason, reference, completed_at } = body

    if (!status) {
      return NextResponse.json({ 
        error: "Status is required" 
      }, { status: 400 })
    }

    // Use service role client for admin operations
    const supabase = createServerClient()

    // Update transaction status directly
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (failure_reason) {
      updateData.failure_reason = failure_reason
    }

    if (reference) {
      updateData.reference = reference
    }

    if (completed_at) {
      updateData.completed_at = completed_at
    }

    const { data: updatedTransaction, error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('transaction_id', transactionId)
      .select(`
        *,
        recipient:recipients(*),
        user:users(first_name, last_name, email)
      `)
      .single()

    if (updateError) {
      return NextResponse.json({ 
        error: `Failed to update transaction: ${updateError.message}` 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      transaction: updatedTransaction 
    })
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return NextResponse.json({ 
      error: "Failed to update transaction status" 
    }, { status: 500 })
  }
}
