import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getUserWorkspace } from '../secure/auth'

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

export async function switchWorkspace(userId: string, workspaceId: string) {
  const supabase = await getSupabaseClient()
  
  // Verify user has access to this workspace
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!profile) {
    throw new Error('Access denied to this workspace')
  }

  // Update user's active workspace
  const { error } = await supabase
    .from('profiles')
    .update({ 
      workspace_id: workspaceId,
      last_active_workspace_id: workspaceId 
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to switch workspace: ${error.message}`)
  }

  return true
}

export async function deleteWorkspace(workspaceId: string) {
  const supabase = await getSupabaseClient()
  
  // Verify current user is owner
  const { role } = await getUserWorkspace()
  if (role !== 'owner') {
    throw new Error('Only workspace owners can delete workspaces')
  }

  // Use the cascade delete function
  const { error } = await supabase.rpc('delete_workspace_cascade', { 
    workspace_id: workspaceId 
  })

  if (error) {
    throw new Error(`Failed to delete workspace: ${error.message}`)
  }

  return true
}

export async function transferOwnership(workspaceId: string, newOwnerId: string) {
  const supabase = await getSupabaseClient()
  
  // Verify current user is owner
  const { role, user } = await getUserWorkspace()
  if (role !== 'owner') {
    throw new Error('Only workspace owners can transfer ownership')
  }

  // Verify new owner exists and is a member
  const { data: newOwner } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', newOwnerId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!newOwner) {
    throw new Error('New owner must be a member of this workspace')
  }

  // Start transaction: demote current owner, promote new owner
  const { error: demoteError } = await supabase
    .from('profiles')
    .update({ role: 'editor' })
    .eq('id', user.id)
    .eq('workspace_id', workspaceId)

  if (demoteError) {
    throw new Error(`Failed to demote current owner: ${demoteError.message}`)
  }

  const { error: promoteError } = await supabase
    .from('profiles')
    .update({ role: 'owner' })
    .eq('id', newOwnerId)
    .eq('workspace_id', workspaceId)

  if (promoteError) {
    // Rollback: restore original owner
    await supabase
      .from('profiles')
      .update({ role: 'owner' })
      .eq('id', user.id)
      .eq('workspace_id', workspaceId)
    
    throw new Error(`Failed to promote new owner: ${promoteError.message}`)
  }

  return true
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, created_at, last_sign_in_at')
    .eq('workspace_id', workspaceId)
    .order('role', { ascending: true }) // owner first
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch workspace members: ${error.message}`)
  }

  return data
}

export async function updateMemberRole(workspaceId: string, memberId: string, newRole: string) {
  const supabase = await getSupabaseClient()
  
  // Verify current user can update roles
  const { role: currentRole } = await getUserWorkspace()
  if (!['owner', 'editor'].includes(currentRole)) {
    throw new Error('Insufficient permissions to update member roles')
  }

  // Can't change owner role (use transfer ownership instead)
  const { data: member } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .single()

  if (member?.role === 'owner') {
    throw new Error('Cannot change owner role. Use transfer ownership instead.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`)
  }

  return true
}

export async function removeMember(workspaceId: string, memberId: string) {
  const supabase = await getSupabaseClient()
  
  // Verify current user can remove members
  const { role: currentRole } = await getUserWorkspace()
  if (!['owner', 'editor'].includes(currentRole)) {
    throw new Error('Insufficient permissions to remove members')
  }

  // Can't remove owner
  const { data: member } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', memberId)
    .eq('workspace_id', workspaceId)
    .single()

  if (member?.role === 'owner') {
    throw new Error('Cannot remove workspace owner')
  }

  // Remove from workspace (set workspace_id to null or default)
  const { error } = await supabase
    .from('profiles')
    .update({ 
      workspace_id: null,
      role: 'viewer' 
    })
    .eq('id', memberId)

  if (error) {
    throw new Error(`Failed to remove member: ${error.message}`)
  }

  return true
} 