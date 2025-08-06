import { NextRequest, NextResponse } from 'next/response'
import { createAdminClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const transactionId = params.id
    const supabaseAdmin = createAdminClient()

    console.log('Updating transaction:', transactionId, 'with data:', body)

    const updates: any = { 
      ...body,
      updated_at: new Date().toISOString()
    }
    
    if (body.status === "completed") {
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .update(updates)
      .eq("transaction_id", transactionId)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('Transaction updated successfully:', data)

    return NextResponse.json({ 
      success: true, 
      data: data?.[0] 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}
