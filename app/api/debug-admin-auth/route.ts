// Debug endpoint to check admin authentication

import { NextRequest, NextResponse } from "next/server"
import { getAdminUser } from "@/lib/admin-auth-utils"

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking admin authentication...')
    
    // Get all cookies
    const cookies = request.cookies.getAll()
    const cookieInfo = cookies.map(c => ({ 
      name: c.name, 
      hasValue: !!c.value,
      valueLength: c.value?.length || 0,
      valuePreview: c.value?.substring(0, 50) || ''
    }))
    console.log('Debug: All cookies:', cookieInfo)
    
    // Try to get admin user
    const adminUser = await getAdminUser(request)
    
    if (!adminUser) {
      return NextResponse.json({ 
        error: "Admin authentication failed",
        cookies: cookieInfo,
        message: "Check server console for details"
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      },
      cookies: cookieInfo
    })
  } catch (error) {
    console.error('Debug admin auth error:', error)
    return NextResponse.json({ 
      error: 'Debug admin auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

