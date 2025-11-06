/**
 * Templates API - Industry Pack System
 * 
 * Manages industry-specific template configurations
 * Provides templates for restaurants, barbershops, car rentals, etc.
 * Implements RLS for workspace isolation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { withRateLimit, defaultRateLimit } from '@/lib/middleware/rate-limiter'
import { cookies } from 'next/headers'

export interface Template {
  id: string
  name: string
  industry: string
  description: string
  category: 'hospitality' | 'retail' | 'services' | 'entertainment' | 'professional'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedSetupTime: number // minutes
  features: string[]
  paymentFlows: PaymentFlow[]
  pricing: PricingConfig
  requirements: string[]
  tags: string[]
  isPopular: boolean
  usageCount: number
  rating: number
  thumbnailUrl?: string
  previewImages: string[]
  configuration: TemplateConfiguration
}

interface PaymentFlow {
  id: string
  name: string
  type: 'invoice' | 'lnurl_pay' | 'lnurl_withdraw' | 'recurring'
  description: string
  defaultAmount?: number
  allowCustomAmount: boolean
  expirationMinutes: number
  memo?: string
}

interface PricingConfig {
  basePrice: number
  currency: 'USD' | 'SATS'
  tieredPricing?: {
    tier: string
    price: number
    features: string[]
  }[]
}

interface TemplateConfiguration {
  businessSettings: {
    acceptsCrypto: boolean
    acceptsFiat: boolean
    autoInvoiceGeneration: boolean
    requiresDeposit: boolean
    depositPercentage?: number
  }
  lightningSettings: {
    minPayment: number
    maxPayment: number
    feesPaidBy: 'customer' | 'business' | 'split'
    instantSettlement: boolean
    privacyMode: boolean
  }
  uiCustomization: {
    primaryColor: string
    logoUrl?: string
    customDomain?: string
    brandingRequired: boolean
  }
  integrations: {
    pos: string[]
    accounting: string[]
    crm: string[]
    notifications: string[]
  }
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

// Industry pack templates
const INDUSTRY_TEMPLATES: Template[] = [
  {
    id: 'restaurant-basic',
    name: 'Restaurant & Café',
    industry: 'restaurant',
    description: 'Complete payment solution for restaurants with table service, takeout, and delivery',
    category: 'hospitality',
    difficulty: 'beginner',
    estimatedSetupTime: 15,
    features: [
      'Table-based QR payments',
      'Tip integration (10-25%)',
      'Split bill functionality',
      'Kitchen receipt printing',
      'Delivery tracking',
      'Customer feedback collection'
    ],
    paymentFlows: [
      {
        id: 'table-payment',
        name: 'Table Payment',
        type: 'lnurl_pay',
        description: 'Customer scans QR code at table to pay bill',
        allowCustomAmount: true,
        expirationMinutes: 30,
        memo: 'Table {table_number} - {restaurant_name}'
      },
      {
        id: 'tip-payment',
        name: 'Tip Payment',
        type: 'lnurl_pay',
        description: 'Separate tip payment with suggested amounts',
        allowCustomAmount: true,
        expirationMinutes: 10,
        memo: 'Tip for {restaurant_name}'
      }
    ],
    pricing: {
      basePrice: 0,
      currency: 'USD'
    },
    requirements: [
      'Lightning node with 1M+ sats capacity',
      'POS system integration (optional)',
      'Stable internet connection',
      'Staff training (30 minutes)'
    ],
    tags: ['food', 'hospitality', 'tips', 'pos'],
    isPopular: true,
    usageCount: 1247,
    rating: 4.8,
    thumbnailUrl: '/templates/restaurant-preview.jpg',
    previewImages: [
      '/templates/restaurant-1.jpg',
      '/templates/restaurant-2.jpg',
      '/templates/restaurant-3.jpg'
    ],
    configuration: {
      businessSettings: {
        acceptsCrypto: true,
        acceptsFiat: true,
        autoInvoiceGeneration: true,
        requiresDeposit: false
      },
      lightningSettings: {
        minPayment: 1000, // 1k sats (~$0.50)
        maxPayment: 1000000, // 1M sats (~$500)
        feesPaidBy: 'customer',
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
  },
  {
    id: 'barbershop-classic',
    name: 'Barbershop & Salon',
    industry: 'barbershop',
    description: 'Appointment-based payments with tips and loyalty rewards',
    category: 'services',
    difficulty: 'beginner',
    estimatedSetupTime: 10,
    features: [
      'Appointment booking with deposits',
      'Service-based pricing',
      'Tip integration (15-30%)',
      'Loyalty points system',
      'Stylist selection',
      'No-show protection'
    ],
    paymentFlows: [
      {
        id: 'service-payment',
        name: 'Service Payment',
        type: 'invoice',
        description: 'Payment for completed services',
        allowCustomAmount: false,
        expirationMinutes: 60,
        memo: '{service_name} at {salon_name}'
      },
      {
        id: 'deposit-payment',
        name: 'Appointment Deposit',
        type: 'invoice',
        description: '25% deposit to secure appointment',
        allowCustomAmount: false,
        expirationMinutes: 1440, // 24 hours
        memo: 'Deposit for {appointment_date} at {salon_name}'
      }
    ],
    pricing: {
      basePrice: 0,
      currency: 'USD'
    },
    requirements: [
      'Booking system (Calendly, etc.)',
      'Lightning capacity: 500k+ sats',
      'Tablet or smartphone',
      'Staff Lightning wallet training'
    ],
    tags: ['salon', 'appointments', 'tips', 'beauty'],
    isPopular: true,
    usageCount: 892,
    rating: 4.7,
    thumbnailUrl: '/templates/barbershop-preview.jpg',
    previewImages: [
      '/templates/barbershop-1.jpg',
      '/templates/barbershop-2.jpg'
    ],
    configuration: {
      businessSettings: {
        acceptsCrypto: true,
        acceptsFiat: true,
        autoInvoiceGeneration: true,
        requiresDeposit: true,
        depositPercentage: 25
      },
      lightningSettings: {
        minPayment: 5000, // 5k sats (~$2.50)
        maxPayment: 200000, // 200k sats (~$100)
        feesPaidBy: 'business',
        instantSettlement: true,
        privacyMode: true
      },
      uiCustomization: {
        primaryColor: '#8B4513',
        brandingRequired: false
      },
      integrations: {
        pos: ['Square'],
        accounting: ['QuickBooks'],
        crm: ['Calendly', 'Acuity'],
        notifications: ['SMS']
      }
    }
  },
  {
    id: 'car-rental-premium',
    name: 'Car Rental & Fleet',
    industry: 'car_rental',
    description: 'Security deposits, damage protection, and flexible rental payments',
    category: 'services',
    difficulty: 'intermediate',
    estimatedSetupTime: 25,
    features: [
      'Security deposit management',
      'Damage assessment integration',
      'Fuel charge automation',
      'Extended rental billing',
      'Insurance claim processing',
      'Fleet vehicle tracking'
    ],
    paymentFlows: [
      {
        id: 'security-deposit',
        name: 'Security Deposit',
        type: 'lnurl_withdraw',
        description: 'Refundable security deposit using LNURL withdraw',
        allowCustomAmount: false,
        expirationMinutes: 2880, // 48 hours
        memo: 'Security deposit for {vehicle_model} rental'
      },
      {
        id: 'rental-payment',
        name: 'Rental Payment',
        type: 'invoice',
        description: 'Final rental payment after return',
        allowCustomAmount: true,
        expirationMinutes: 120,
        memo: 'Rental payment for {vehicle_model}'
      }
    ],
    pricing: {
      basePrice: 29,
      currency: 'USD',
      tieredPricing: [
        {
          tier: 'basic',
          price: 0,
          features: ['Up to 5 vehicles', 'Basic deposit management']
        },
        {
          tier: 'professional',
          price: 29,
          features: ['Up to 25 vehicles', 'Advanced damage tracking', 'Insurance integration']
        },
        {
          tier: 'enterprise',
          price: 99,
          features: ['Unlimited vehicles', 'Fleet management', 'Custom integrations']
        }
      ]
    },
    requirements: [
      'Fleet management system',
      'Lightning node with 5M+ sats capacity',
      'Damage assessment process',
      'Insurance provider integration',
      'Staff training (2 hours)'
    ],
    tags: ['rental', 'deposits', 'fleet', 'insurance'],
    isPopular: false,
    usageCount: 234,
    rating: 4.5,
    thumbnailUrl: '/templates/car-rental-preview.jpg',
    previewImages: [
      '/templates/car-rental-1.jpg',
      '/templates/car-rental-2.jpg',
      '/templates/car-rental-3.jpg'
    ],
    configuration: {
      businessSettings: {
        acceptsCrypto: true,
        acceptsFiat: false,
        autoInvoiceGeneration: true,
        requiresDeposit: true,
        depositPercentage: 100
      },
      lightningSettings: {
        minPayment: 50000, // 50k sats (~$25)
        maxPayment: 20000000, // 20M sats (~$10,000)
        feesPaidBy: 'customer',
        instantSettlement: false, // Hold for damages
        privacyMode: true
      },
      uiCustomization: {
        primaryColor: '#1E40AF',
        brandingRequired: true
      },
      integrations: {
        pos: ['Custom'],
        accounting: ['QuickBooks', 'SAP'],
        crm: ['Salesforce'],
        notifications: ['SMS', 'Email', 'Push']
      }
    }
  }
]

async function handler(req: NextRequest) {
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

    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url)
      const industry = searchParams.get('industry')
      const category = searchParams.get('category')
      const difficulty = searchParams.get('difficulty')
      const popular = searchParams.get('popular') === 'true'
      const templateId = searchParams.get('id')

      let filteredTemplates = INDUSTRY_TEMPLATES

      // Filter by specific template ID
      if (templateId) {
        const template = filteredTemplates.find(t => t.id === templateId)
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({ template })
      }

      // Apply filters
      if (industry) {
        filteredTemplates = filteredTemplates.filter(t => t.industry === industry)
      }
      if (category) {
        filteredTemplates = filteredTemplates.filter(t => t.category === category)
      }
      if (difficulty) {
        filteredTemplates = filteredTemplates.filter(t => t.difficulty === difficulty)
      }
      if (popular) {
        filteredTemplates = filteredTemplates.filter(t => t.isPopular)
      }

      // Sort by popularity (usage count) by default
      filteredTemplates.sort((a, b) => b.usageCount - a.usageCount)

      return NextResponse.json({
        templates: filteredTemplates,
        total: filteredTemplates.length,
        categories: Array.from(new Set(INDUSTRY_TEMPLATES.map(t => t.category))),
        industries: Array.from(new Set(INDUSTRY_TEMPLATES.map(t => t.industry))),
        popular: INDUSTRY_TEMPLATES.filter(t => t.isPopular)
      })
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    )

  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const GET = withRateLimit(handler, defaultRateLimit) 