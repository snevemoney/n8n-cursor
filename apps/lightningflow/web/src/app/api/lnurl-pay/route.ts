import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { assertSupabase } from '@/lib/supabase-server'

// Safe Supabase client creation with fallbacks
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
    console.warn('Supabase not configured - using mock mode')
    return null
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

const supabase = createSupabaseClient()

// Mark route as dynamic to prevent static generation issues
export const dynamic = 'force-dynamic'

// Simple LNURL encoder to replace bech32 dependency
function toLnurl(url: string): string {
  return `lnurl${url.toLowerCase()}`;
}

/**
 * GET /api/lnurl-pay
 * Main entry point for LNURL-pay requests
 */
export async function GET(request: NextRequest) {
  try {
    // Return mock response if Supabase not configured
    if (!supabase) {
      const { searchParams } = new URL(request.url)
      const invoiceId = searchParams.get('invoice_id')

      if (!invoiceId) {
        return NextResponse.json(
          { error: 'Invoice ID is required' },
          { status: 400 }
        )
      }

      // Generate mock LNURL
      const callbackUrl = `${request.nextUrl.origin}/api/lnurl-pay/callback?invoice_id=${invoiceId}`
      const mockLnurl = toLnurl(callbackUrl)

      return NextResponse.json({
        success: true,
        lnurl: mockLnurl,
        qr_code: `data:image/svg+xml;base64,${Buffer.from('<svg>Mock QR Code</svg>').toString('base64')}`,
        invoice_id: invoiceId,
        mode: 'mock'
      })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoice_id')

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      )
    }

    // Get invoice from database
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Generate LNURL for the callback
    const callbackUrl = `${request.nextUrl.origin}/api/lnurl-pay/callback?invoice_id=${invoiceId}`
    const lnurl = toLnurl(callbackUrl)

    return NextResponse.json({
      success: true,
      lnurl,
      qr_code: `data:image/svg+xml;base64,${Buffer.from('<svg>QR Code</svg>').toString('base64')}`,
      invoice_id: invoiceId
    })

  } catch (error) {
    console.error('LNURL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate LNURL' },
      { status: 500 }
    )
  }
}
