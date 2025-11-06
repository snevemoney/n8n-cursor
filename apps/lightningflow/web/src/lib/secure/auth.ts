import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getUserWorkspace() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
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
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized - no user found')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('workspace_id, role, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile) {
    throw new Error('Unauthorized - no profile found')
  }

  return { 
    user, 
    workspaceId: profile.workspace_id, 
    role: profile.role,
    isAdmin: profile.is_admin 
  }
}

export async function requireRole(allowedRoles: string[]) {
  const { role } = await getUserWorkspace()
  
  if (!allowedRoles.includes(role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(', ')}`)
  }
  
  return true
}

export async function requireAdmin() {
  const { isAdmin } = await getUserWorkspace()
  
  if (!isAdmin) {
    throw new Error('Admin access required')
  }
  
  return true
} 