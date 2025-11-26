/**
 * Billing Tier Verification API
 * 
 * Checks user's current subscription tier and usage limits
 * Restricts access to features based on plan limitations
 * Provides upgrade suggestions when limits are exceeded
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { withRateLimit, adminRateLimit } from '../../../lib/middleware/rate-limit'

interface TierLimits {
  aiRequestsPerMonth: number
  channelsMax: number
  storageGB: number
  supportLevel: 'community' | 'email' | 'priority'
  analyticsRetentionDays: number
  customDomainAllowed: boolean
  apiCallsPerDay: number
}

interface SubscriptionTier {
  id: string
  name: string
  price: number
  currency: string
  limits: TierLimits
}

const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    limits: {
      aiRequestsPerMonth: 50,
      channelsMax: 2,
      storageGB: 1,
      supportLevel: 'community',
      analyticsRetentionDays: 7,
      customDomainAllowed: false,
      apiCallsPerDay: 100
    }
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    price: 29,
    currency: 'USD',
    limits: {
      aiRequestsPerMonth: 500,
      channelsMax: 10,
      storageGB: 10,
      supportLevel: 'email',
      analyticsRetentionDays: 30,
      customDomainAllowed: false,
      apiCallsPerDay: 1000
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 99,
    currency: 'USD',
    limits: {
      aiRequestsPerMonth: 5000,
      channelsMax: 50,
      storageGB: 100,
      supportLevel: 'priority',
      analyticsRetentionDays: 90,
      customDomainAllowed: true,
      apiCallsPerDay: 10000
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    limits: {
      aiRequestsPerMonth: 50000,
      channelsMax: 500,
      storageGB: 1000,
      supportLevel: 'priority',
      analyticsRetentionDays: 365,
      customDomainAllowed: true,
      apiCallsPerDay: 100000
    }
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

async function getUserTierAndUsage(userId: string, supabase: any) {
  // Get user's current subscription tier
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, workspace_id')
    .eq('id', userId)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch user profile: ${profileError.message}`)
  }

  const tierName = profile?.subscription_tier || 'free'
  const tier = SUBSCRIPTION_TIERS[tierName] || SUBSCRIPTION_TIERS.free

  // Get current month's usage
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: usage, error: usageError } = await supabase
    .from('ai_usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  if (usageError) {
    throw new Error(`Failed to fetch usage data: ${usageError.message}`)
  }

  // Calculate current usage
  const aiRequestsThisMonth = usage?.length || 0
  const totalTokensUsed = usage?.reduce((sum: number, log: any) => 
    sum + (log.prompt_tokens || 0) + (log.completion_tokens || 0), 0) || 0

  // Get channel count
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('id')
    .eq('workspace_id', profile?.workspace_id)

  const channelCount = channels?.length || 0

  // Get today's API calls
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const { data: apiCalls, error: apiError } = await supabase
    .from('api_usage_logs')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())

  const apiCallsToday = apiCalls?.length || 0

  return {
    user: profile,
    tier,
    usage: {
      aiRequestsThisMonth,
      totalTokensUsed,
      channelCount,
      apiCallsToday
    }
  }
}

function checkLimits(tier: SubscriptionTier, usage: any) {
  const violations = []
  const warnings = []

  // Check AI requests limit
  if (usage.aiRequestsThisMonth >= tier.limits.aiRequestsPerMonth) {
    violations.push({
      type: 'ai_requests',
      limit: tier.limits.aiRequestsPerMonth,
      current: usage.aiRequestsThisMonth,
      message: `You've reached your monthly AI request limit of ${tier.limits.aiRequestsPerMonth}`
    })
  } else if (usage.aiRequestsThisMonth >= tier.limits.aiRequestsPerMonth * 0.8) {
    warnings.push({
      type: 'ai_requests',
      limit: tier.limits.aiRequestsPerMonth,
      current: usage.aiRequestsThisMonth,
      message: `You're at ${Math.round((usage.aiRequestsThisMonth / tier.limits.aiRequestsPerMonth) * 100)}% of your AI request limit`
    })
  }

  // Check channel limit
  if (usage.channelCount >= tier.limits.channelsMax) {
    violations.push({
      type: 'channels',
      limit: tier.limits.channelsMax,
      current: usage.channelCount,
      message: `You've reached your channel limit of ${tier.limits.channelsMax}`
    })
  }

  // Check API calls limit
  if (usage.apiCallsToday >= tier.limits.apiCallsPerDay) {
    violations.push({
      type: 'api_calls',
      limit: tier.limits.apiCallsPerDay,
      current: usage.apiCallsToday,
      message: `You've reached your daily API call limit of ${tier.limits.apiCallsPerDay}`
    })
  }

  return { violations, warnings }
}

function getUpgradeRecommendation(tier: SubscriptionTier, violations: any[]) {
  if (tier.id === 'free' && violations.length > 0) {
    return {
      recommendedTier: 'creator',
      benefits: [
        '10x more AI requests (500/month)',
        'Up to 10 Lightning channels',
        'Email support',
        'Extended analytics'
      ],
      price: SUBSCRIPTION_TIERS.creator.price,
      savings: 'First month 50% off'
    }
  }

  if (tier.id === 'creator' && violations.length > 0) {
    return {
      recommendedTier: 'business',
      benefits: [
        '10x more AI requests (5,000/month)',
        'Up to 50 Lightning channels',
        'Priority support',
        'Custom domain',
        '90-day analytics retention'
      ],
      price: SUBSCRIPTION_TIERS.business.price,
      savings: null
    }
  }

  if (tier.id === 'business' && violations.length > 0) {
    return {
      recommendedTier: 'enterprise',
      benefits: [
        'Unlimited AI requests',
        'Unlimited channels',
        'White-label solution',
        'Dedicated support',
        '1-year analytics retention'
      ],
      price: SUBSCRIPTION_TIERS.enterprise.price,
      savings: 'Contact for volume pricing'
    }
  }

  return null
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
    
    // Get user from auth header or session
    const authHeader = req.headers.get('authorization')
    let userId: string

    if (authHeader?.startsWith('Bearer ')) {
      // API key or JWT token
      const token = authHeader.slice(7)
      
      // Verify token and extract user ID
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        )
      }
      
      userId = user.id
    } else {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { feature, action } = body

    // Get user tier and usage
    const { user, tier, usage } = await getUserTierAndUsage(userId, supabase)

    // Check limits
    const { violations, warnings } = checkLimits(tier, usage)

    // Determine if access should be allowed
    let accessAllowed = true
    let accessReason = ''

    // Feature-specific checks
    if (feature === 'ai_request' && violations.find(v => v.type === 'ai_requests')) {
      accessAllowed = false
      accessReason = 'Monthly AI request limit exceeded'
    } else if (feature === 'channel_creation' && violations.find(v => v.type === 'channels')) {
      accessAllowed = false
      accessReason = 'Channel limit exceeded'
    } else if (feature === 'api_call' && violations.find(v => v.type === 'api_calls')) {
      accessAllowed = false
      accessReason = 'Daily API call limit exceeded'
    }

    // Log the verification attempt
    await supabase
      .from('tier_verification_logs')
      .insert({
        user_id: userId,
        feature,
        action,
        tier_name: tier.name,
        access_allowed: accessAllowed,
        violations: violations.length,
        warnings: warnings.length
      })

    const response = {
      accessAllowed,
      accessReason,
      tier: {
        name: tier.name,
        limits: tier.limits
      },
      usage,
      violations,
      warnings,
      upgradeRecommendation: accessAllowed ? null : getUpgradeRecommendation(tier, violations)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Billing verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting
export const POST = withRateLimit(handler, adminRateLimit)

// Usage examples:
/*
POST /api/billing/verify-tier
{
  "feature": "ai_request",
  "action": "create_embedding"
}

Response:
{
  "accessAllowed": false,
  "accessReason": "Monthly AI request limit exceeded",
  "tier": {
    "name": "Free",
    "limits": { ... }
  },
  "usage": {
    "aiRequestsThisMonth": 50,
    "channelCount": 2
  },
  "violations": [...],
  "upgradeRecommendation": {
    "recommendedTier": "creator",
    "benefits": [...],
    "price": 29
  }
}
*/ 