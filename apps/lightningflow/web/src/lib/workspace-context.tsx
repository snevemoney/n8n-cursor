'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  settings?: any
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  isLoading: boolean
  switchWorkspace: (workspaceId: string) => Promise<void>
  refreshWorkspaces: () => Promise<void>
  userRole: string | null
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()

  const fetchWorkspaces = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's current workspace and role
      const { data: profile } = await supabase
        .from('profiles')
        .select('workspace_id, role')
        .eq('id', user.id)
        .single()

      if (profile?.workspace_id) {
        // Get current workspace details
        const { data: workspace } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', profile.workspace_id)
          .single()

        if (workspace) {
          setCurrentWorkspace(workspace)
          setUserRole(profile.role)
        }
      }

      // Get all workspaces user has access to (for future multi-workspace support)
      const { data: allWorkspaces } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', profile?.workspace_id)

      if (allWorkspaces) {
        setWorkspaces(allWorkspaces)
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchWorkspace = async (workspaceId: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/workspace/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId })
      })

      if (!response.ok) {
        throw new Error('Failed to switch workspace')
      }

      await fetchWorkspaces()
      router.refresh()
    } catch (error) {
      console.error('Error switching workspace:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const refreshWorkspaces = async () => {
    await fetchWorkspaces()
  }

  useEffect(() => {
    fetchWorkspaces()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchWorkspaces()
      } else if (event === 'SIGNED_OUT') {
        setCurrentWorkspace(null)
        setWorkspaces([])
        setUserRole(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    currentWorkspace,
    workspaces,
    isLoading,
    switchWorkspace,
    refreshWorkspaces,
    userRole
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}

// Convenience hook for getting current workspace ID
export function useWorkspaceId() {
  const { currentWorkspace } = useWorkspace()
  return currentWorkspace?.id || null
}

// Hook for role-based access control
export function useWorkspaceRole() {
  const { userRole } = useWorkspace()
  return userRole
}

// Hook for checking permissions
export function useWorkspacePermissions() {
  const { userRole } = useWorkspace()
  
  return {
    canEdit: userRole === 'owner' || userRole === 'editor',
    canManageMembers: userRole === 'owner' || userRole === 'editor',
    canDelete: userRole === 'owner',
    canTransferOwnership: userRole === 'owner',
    isOwner: userRole === 'owner',
    isEditor: userRole === 'editor',
    isViewer: userRole === 'viewer'
  }
} 