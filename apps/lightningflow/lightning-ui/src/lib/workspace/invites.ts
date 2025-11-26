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

export async function inviteUser(email: string, workspaceId: string, role = 'viewer') {
  const supabase = await getSupabaseClient()
  
  // Verify the current user can invite (must be owner or editor)
  const { role: currentRole } = await getUserWorkspace()
  if (!['owner', 'editor'].includes(currentRole)) {
    throw new Error('Insufficient permissions to invite users')
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .eq('workspace_id', workspaceId)
    .single()

  if (existingMember) {
    throw new Error('User is already a member of this workspace')
  }

  // Check if there's already a pending invite
  const { data: existingInvite } = await supabase
    .from('workspace_invites')
    .select('id')
    .eq('email', email)
    .eq('workspace_id', workspaceId)
    .eq('accepted', false)
    .single()

  if (existingInvite) {
    throw new Error('Invitation already sent to this email')
  }

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert([{ email, workspace_id: workspaceId, role }])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`)
  }

  // TODO: Send email with invitation link
  // const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${data.token}`
  // await sendInviteEmail(email, inviteUrl)

  return data
}

export async function acceptInvite(token: string, userId: string) {
  const supabase = await getSupabaseClient()
  
  const { data: invite, error: inviteError } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('token', token)
    .eq('accepted', false)
    .single()

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invitation token')
  }

  // Update user's profile with new workspace
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      workspace_id: invite.workspace_id,
      role: invite.role
    })
    .eq('id', userId)

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`)
  }

  // Mark invite as accepted
  const { error: updateError } = await supabase
    .from('workspace_invites')
    .update({ accepted: true })
    .eq('id', invite.id)

  if (updateError) {
    throw new Error(`Failed to update invitation: ${updateError.message}`)
  }

  return invite
}

export async function getWorkspaceInvites(workspaceId: string) {
  const supabase = await getSupabaseClient()
  
  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('accepted', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch invites: ${error.message}`)
  }

  return data
}

export async function cancelInvite(inviteId: string) {
  const supabase = await getSupabaseClient()
  
  const { error } = await supabase
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId)

  if (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`)
  }

  return true
} 