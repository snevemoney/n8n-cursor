import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {}
      }
    }
  )
}

export async function checkQuota(workspaceId: string, limit = 50000) {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('workspace_usage')
    .select('used_tokens, last_reset')
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    // Create usage record if it doesn't exist
    await supabase
      .from('workspace_usage')
      .insert([{ workspace_id: workspaceId, used_tokens: 0 }])
    return true
  }

  // Reset monthly usage if needed
  const lastReset = new Date(data.last_reset)
  const now = new Date()
  const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                          (now.getMonth() - lastReset.getMonth())

  if (monthsSinceReset >= 1) {
    await supabase
      .from('workspace_usage')
      .update({ used_tokens: 0, last_reset: now.toISOString() })
      .eq('workspace_id', workspaceId)
    return true
  }

  if (data.used_tokens >= limit) {
    throw new Error('Usage limit exceeded. Upgrade required.')
  }

  return true
}

export async function incrementUsage(workspaceId: string, tokens: number) {
  const supabase = await getSupabaseClient()
  
  await supabase.rpc('increment_workspace_usage', {
    workspace_id: workspaceId,
    token_count: tokens
  })
}

export async function getUsageStats(workspaceId: string) {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('workspace_usage')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()

  if (error) {
    return { used_tokens: 0, last_reset: new Date().toISOString() }
  }

  return data
} 