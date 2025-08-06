import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const updates = await request.json()
    
    console.log('Updating transaction:', id, updates)
    
    const supabase = createServerClient()
    
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    }

    if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('transaction_id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating transaction:', error)
      throw error
    }

    console.log('Transaction updated successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction', details: error },
      { status: 500 }
    )
  }
}
