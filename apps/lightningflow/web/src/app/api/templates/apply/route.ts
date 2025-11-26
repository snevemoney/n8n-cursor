/**
 * Template Application API
 * 
 * Applies industry pack configurations to user workspaces
 * Handles Lightning settings, payment flows, and UI customization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { withRateLimit, defaultRateLimit } from '@/lib/middleware/rate-limiter'
import { Template } from '../../contracts/templates/route'

interface ApplyTemplateRequest {
  templateId: string
  workspaceId: string
  customizations?: {
    businessName?: string
    primaryColor?: string
    logoUrl?: string
    customDomain?: string
    paymentSettings?: {
      minPayment?: number
      maxPayment?: number
      feesPaidBy?: 'customer' | 'business' | 'split'
    }
  }
  integrations?: {
    posSystem?: string
    accountingSoftware?: string
    crmSystem?: string
    notificationChannels?: string[]
  }
}

interface ApplyTemplateResult {
  success: boolean
  workspaceId: string
  templateId: string
  appliedSettings: {
    paymentFlows: number
    lightningSettings: boolean
    uiCustomizations: boolean
    integrations: string[]
  }
  generatedAssets: {
    qrCodes: string[]
    paymentLinks: string[]
    widgets: string[]
  }
  nextSteps: string[]
  estimatedGoLiveTime: number // minutes
}

async function getSupabaseClient(req: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set() {},
        remove() {}
      }
    }
  )
}

async function getTemplateById(templateId: string): Promise<Template | null> {
  // This would typically fetch from the templates API
  // For now, we'll use a simplified lookup
  const templates = {
    'restaurant-basic': {
      id: 'restaurant-basic',
      name: 'Restaurant & Café',
      industry: 'restaurant',
      category: 'hospitality' as const,
      difficulty: 'beginner' as const,
      estimatedSetupTime: 15,
      paymentFlows: [
        {
          id: 'table-payment',
          name: 'Table Payment',
          type: 'lnurl_pay' as const,
          description: 'Customer scans QR code at table to pay bill',
          allowCustomAmount: true,
          expirationMinutes: 30,
          memo: 'Table {table_number} - {restaurant_name}'
        }
      ],
      configuration: {
        businessSettings: {
          acceptsCrypto: true,
          acceptsFiat: true,
          autoInvoiceGeneration: true,
          requiresDeposit: false
        },
        lightningSettings: {
          minPayment: 1000,
          maxPayment: 1000000,
          feesPaidBy: 'customer' as const,
          instantSettlement: true,
          privacyMode: false
        },
        uiCustomization: {
          primaryColor: '#FF6B35',
          brandingRequired: false
        },
        integrations: {
          pos: ['Square', 'Toast', 'Clover'],
          accounting: ['QuickBooks', 'Xero'],
          crm: ['Mailchimp'],
          notifications: ['SMS', 'Email']
        }
      }
    } as Template
  }

  return templates[templateId as keyof typeof templates] || null
}

async function applyLightningSettings(
  supabase: any,
  workspaceId: string,
  settings: any,
  customizations?: any
) {
  const lightningConfig = {
    workspace_id: workspaceId,
    min_payment: customizations?.paymentSettings?.minPayment || settings.minPayment,
    max_payment: customizations?.paymentSettings?.maxPayment || settings.maxPayment,
    fees_paid_by: customizations?.paymentSettings?.feesPaidBy || settings.feesPaidBy,
    instant_settlement: settings.instantSettlement,
    privacy_mode: settings.privacyMode,
    auto_invoice_generation: true
  }

  const { error } = await supabase
    .from('workspace_lightning_settings')
    .upsert(lightningConfig)

  if (error) {
    throw new Error(`Failed to apply Lightning settings: ${error.message}`)
  }

  return lightningConfig
}

async function createPaymentFlows(
  supabase: any,
  workspaceId: string,
  paymentFlows: any[],
  businessName?: string
) {
  const createdFlows = []

  for (const flow of paymentFlows) {
    const paymentFlow = {
      workspace_id: workspaceId,
      flow_id: flow.id,
      name: flow.name,
      type: flow.type,
      description: flow.description,
      default_amount: flow.defaultAmount,
      allow_custom_amount: flow.allowCustomAmount,
      expiration_minutes: flow.expirationMinutes,
      memo_template: flow.memo?.replace('{restaurant_name}', businessName || 'Your Business'),
      is_active: true
    }

    const { data, error } = await supabase
      .from('payment_flows')
      .insert(paymentFlow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment flow: ${error.message}`)
    }

    createdFlows.push(data)
  }

  return createdFlows
}

async function applyUICustomizations(
  supabase: any,
  workspaceId: string,
  uiConfig: any,
  customizations?: any
) {
  const uiSettings = {
    workspace_id: workspaceId,
    primary_color: customizations?.primaryColor || uiConfig.primaryColor,
    logo_url: customizations?.logoUrl || uiConfig.logoUrl,
    custom_domain: customizations?.customDomain || uiConfig.customDomain,
    branding_required: uiConfig.brandingRequired,
    theme_preset: 'default'
  }

  const { error } = await supabase
    .from('workspace_ui_settings')
    .upsert(uiSettings)

  if (error) {
    throw new Error(`Failed to apply UI customizations: ${error.message}`)
  }

  return uiSettings
}

async function generateQRCodes(workspaceId: string, paymentFlows: any[]): Promise<string[]> {
  // Generate QR codes for each payment flow
  const qrCodes = []

  for (const flow of paymentFlows) {
    const qrData = {
      type: flow.type,
      workspaceId: workspaceId,
      flowId: flow.flow_id,
      amount: flow.default_amount
    }

    // In production, this would generate actual QR codes
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(JSON.stringify(qrData))}`
    qrCodes.push(qrCodeUrl)
  }

  return qrCodes
}

async function generatePaymentLinks(workspaceId: string, paymentFlows: any[]): Promise<string[]> {
  // Generate payment links for each flow
  return paymentFlows.map(flow => 
    `${process.env.NEXT_PUBLIC_APP_URL}/pay/${workspaceId}/${flow.flow_id}`
  )
}

async function logTemplateUsage(
  supabase: any,
  userId: string,
  templateId: string,
  workspaceId: string
) {
  await supabase
    .from('template_usage_logs')
    .insert({
      user_id: userId,
      template_id: templateId,
      workspace_id: workspaceId,
      action: 'applied',
      success: true,
      applied_at: new Date().toISOString()
    })
}

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )
  }

  try {
    const supabase = await getSupabaseClient(req)
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body: ApplyTemplateRequest = await req.json()
    const { templateId, workspaceId, customizations, integrations } = body

    // Get template configuration
    const template = await getTemplateById(templateId)
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Verify workspace ownership
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('id, user_id')
      .eq('id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: 'Workspace not found or access denied' },
        { status: 403 }
      )
    }

    // Apply template configuration step by step
    let appliedSettings = {
      paymentFlows: 0,
      lightningSettings: false,
      uiCustomizations: false,
      integrations: [] as string[]
    }

    // 1. Apply Lightning settings
    await applyLightningSettings(
      supabase,
      workspaceId,
      template.configuration.lightningSettings,
      customizations
    )
    appliedSettings.lightningSettings = true

    // 2. Create payment flows
    const createdFlows = await createPaymentFlows(
      supabase,
      workspaceId,
      template.paymentFlows,
      customizations?.businessName
    )
    appliedSettings.paymentFlows = createdFlows.length

    // 3. Apply UI customizations
    await applyUICustomizations(
      supabase,
      workspaceId,
      template.configuration.uiCustomization,
      customizations
    )
    appliedSettings.uiCustomizations = true

    // 4. Generate assets
    const qrCodes = await generateQRCodes(workspaceId, createdFlows)
    const paymentLinks = await generatePaymentLinks(workspaceId, createdFlows)
    const widgets = [`/widget/${workspaceId}/payment`, `/widget/${workspaceId}/tip`]

    // 5. Log template usage
    await logTemplateUsage(supabase, user.id, templateId, workspaceId)

    const result: ApplyTemplateResult = {
      success: true,
      workspaceId,
      templateId,
      appliedSettings,
      generatedAssets: {
        qrCodes,
        paymentLinks,
        widgets
      },
      nextSteps: [
        'Test payment flows with small amounts',
        'Share QR codes with customers',
        'Configure notification settings',
        'Train staff on new payment system',
        'Monitor transaction analytics'
      ],
      estimatedGoLiveTime: template.estimatedSetupTime
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Template application error:', error)
    return NextResponse.json(
      { error: 'Failed to apply template' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const POST = withRateLimit(handler, defaultRateLimit) 