// Test endpoint to check email configuration

import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const config = {
      sendgridApiKey: !!process.env.SENDGRID_API_KEY,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'Not set',
      sendgridFromName: process.env.SENDGRID_FROM_NAME || 'Not set',
      sendgridReplyTo: process.env.SENDGRID_REPLY_TO || 'Not set',
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      success: true,
      config,
      message: config.sendgridApiKey ? 'Email configuration looks good' : 'SENDGRID_API_KEY is missing'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check email configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
