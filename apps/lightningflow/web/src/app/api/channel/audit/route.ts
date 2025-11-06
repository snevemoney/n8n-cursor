import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channel_id = searchParams.get('channel_id')
  const action_type = searchParams.get('action_type')
  const limit = parseInt(searchParams.get('limit') || '50')
  const success_only = searchParams.get('success_only') === 'true'

  const supabase = createClient()
  
  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let query = supabase
    .from('channel_actions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Apply filters
  if (channel_id) {
    query = query.eq('channel_id', channel_id)
  }
  
  if (action_type) {
    query = query.eq('action_type', action_type)
  }
  
  if (success_only) {
    query = query.eq('success', true)
  }

  const { data: actions, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ actions })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    channel_id,
    peer_alias,
    action_type,
    trigger_source,
    command_executed,
    ai_reasoning,
    confidence_score,
    before_state,
    after_state,
    amount_sats,
    cost_sats,
    success,
    error_message,
    execution_time_ms
  } = body

  const supabase = createClient()
  
  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action_data = {
    user_id: user.id,
    channel_id,
    peer_alias,
    action_type,
    trigger_source,
    command_executed,
    ai_reasoning,
    confidence_score,
    amount_sats,
    cost_sats,
    success,
    error_message,
    execution_time_ms,
    completed_at: new Date().toISOString(),
    // Before state
    before_local_balance: before_state?.local_balance,
    before_remote_balance: before_state?.remote_balance,
    before_fee_rate: before_state?.fee_rate,
    before_base_fee: before_state?.base_fee,
    // After state
    after_local_balance: after_state?.local_balance,
    after_remote_balance: after_state?.remote_balance,
    after_fee_rate: after_state?.fee_rate,
    after_base_fee: after_state?.base_fee,
  }

  const { data, error } = await supabase
    .from('channel_actions')
    .insert([action_data])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ action: data })
} 