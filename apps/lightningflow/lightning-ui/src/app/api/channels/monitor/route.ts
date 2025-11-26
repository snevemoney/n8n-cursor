import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, RATE_LIMITS } from '@/lib/middleware/rate-limiter'

async function handleGET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'channels'
  const include_inactive = searchParams.get('include_inactive') === 'true'

  const supabase = createClient()
  
  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    switch (type) {
      case 'channels':
        return await getChannels(supabase, user.id, include_inactive)
      case 'alerts':
        return await getAlerts(supabase, user.id)
      case 'health':
        return await getHealthSummary(supabase, user.id)
      case 'capacity-history':
        const channel_id = searchParams.get('channel_id')
        const days = parseInt(searchParams.get('days') || '7')
        return await getCapacityHistory(supabase, user.id, channel_id, days)
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Monitor API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handlePOST(req: NextRequest) {
  const body = await req.json()
  const { action, channel_id, alert_id } = body

  const supabase = createClient()
  
  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    switch (action) {
      case 'acknowledge_alert':
        return await acknowledgeAlert(supabase, user.id, alert_id)
      case 'resolve_alert':
        return await resolveAlert(supabase, user.id, alert_id)
      case 'update_channel':
        return await updateChannelState(supabase, user.id, body)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Monitor POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Apply rate limiting to both GET and POST endpoints
export const GET = withRateLimit(handleGET, RATE_LIMITS.MONITORING)
export const POST = withRateLimit(handlePOST, RATE_LIMITS.MONITORING)

async function getChannels(supabase: any, userId: string, includeInactive: boolean) {
  let query = supabase
    .from('live_channels')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!includeInactive) {
    query = query.eq('active', true)
  }

  const { data: channels, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with recent alerts
  const channelIds = channels.map((c: any) => c.channel_id)
  const { data: recentAlerts } = await supabase
    .from('channel_alerts')
    .select('channel_id, alert_type, severity, triggered_at')
    .in('channel_id', channelIds)
    .eq('resolved', false)
    .order('triggered_at', { ascending: false })

  // Group alerts by channel
  const alertsByChannel = recentAlerts?.reduce((acc: any, alert: any) => {
    if (!acc[alert.channel_id]) acc[alert.channel_id] = []
    acc[alert.channel_id].push(alert)
    return acc
  }, {}) || {}

  // Add alerts to channels
  const enrichedChannels = channels.map((channel: any) => ({
    ...channel,
    alerts: alertsByChannel[channel.channel_id] || [],
    alert_count: alertsByChannel[channel.channel_id]?.length || 0,
    has_critical_alerts: alertsByChannel[channel.channel_id]?.some((a: any) => a.severity === 'critical') || false
  }))

  return NextResponse.json({ channels: enrichedChannels })
}

async function getAlerts(supabase: any, userId: string) {
  const { data: alerts, error } = await supabase
    .from('view_urgent_alerts')
    .select('*')
    .eq('user_id', userId)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ alerts })
}

async function getHealthSummary(supabase: any, userId: string) {
  const { data: summary, error } = await supabase
    .from('view_channel_health_summary')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ health: summary })
}

async function getCapacityHistory(supabase: any, userId: string, channelId: string | null, days: number) {
  let query = supabase
    .from('channel_capacity_history')
    .select('*')
    .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: true })

  if (channelId) {
    query = query.eq('channel_id', channelId)
  }

  const { data: history, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ history })
}

async function acknowledgeAlert(supabase: any, userId: string, alertId: string) {
  const { data, error } = await supabase
    .from('channel_alerts')
    .update({ 
      acknowledged: true, 
      acknowledged_at: new Date().toISOString() 
    })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, alert: data })
}

async function resolveAlert(supabase: any, userId: string, alertId: string) {
  const { data, error } = await supabase
    .from('channel_alerts')
    .update({ 
      resolved: true, 
      resolved_at: new Date().toISOString() 
    })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, alert: data })
}

async function updateChannelState(supabase: any, userId: string, channelData: any) {
  const {
    channel_id,
    local_balance,
    remote_balance,
    capacity,
    active,
    peer_alias,
    last_forward_at,
    base_fee_msat,
    fee_rate_ppm
  } = channelData

  const { data, error } = await supabase
    .from('live_channels')
    .upsert({
      user_id: userId,
      channel_id,
      local_balance,
      remote_balance,
      capacity,
      active,
      peer_alias,
      last_forward_at,
      base_fee_msat,
      fee_rate_ppm,
      last_update_at: new Date().toISOString()
    }, {
      onConflict: 'channel_id'
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, channel: data })
} 