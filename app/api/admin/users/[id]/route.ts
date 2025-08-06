import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = params.id
    const supabaseAdmin = createAdminClient()

    console.log('Updating user:', userId, 'with data:', body)

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)
      .select()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('User updated successfully:', data)

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
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
