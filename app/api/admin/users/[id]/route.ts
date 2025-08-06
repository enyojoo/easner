import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = params.id

    console.log('Updating user:', userId, 'with data:', body)

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId)

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    console.log('User updated successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
