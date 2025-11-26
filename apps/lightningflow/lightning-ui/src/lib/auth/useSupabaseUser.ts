/**
 * Supabase User Hook with Development Bypass
 * 
 * Provides user authentication state with admin role detection
 * Includes development bypass for local testing
 */

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface UserWithRole {
  user: User | null
  role: 'admin' | 'user' | null
  workspace_id: string | null
  loading: boolean
}

// Check dev bypass from environment
const getDevBypassStatus = () => {
  try {
    // Check if we're in development and bypass is enabled
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  } catch {
    return false
  }
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
)

export function useSupabaseUser(): UserWithRole {
  const [state, setState] = useState<UserWithRole>({
    user: null,
    role: null,
    workspace_id: null,
    loading: true
  })

  useEffect(() => {
    // 🚀 DEVELOPMENT BYPASS: Mock admin user in dev mode
    const isDevMode = getDevBypassStatus()
    
    if (isDevMode) {
      console.log('🔧 Dev Mode: Using bypass admin user')
      
      const mockAdminUser = {
        id: 'dev-admin-bypass',
        email: 'admin@dev.local',
        user_metadata: {
          role: 'admin',
          workspace_id: 'dev-workspace'
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User

      setState({
        user: mockAdminUser,
        role: 'admin',
        workspace_id: 'dev-workspace',
        loading: false
      })
      return
    }

    // Production: Real Supabase auth
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Auth error:', error)
          setState({
            user: null,
            role: null,
            workspace_id: null,
            loading: false
          })
          return
        }

        // Determine role based on hardcoded admin UID
        const adminUID = process.env.NEXT_PUBLIC_ADMIN_UID
        const role = user?.id === adminUID ? 'admin' : user ? 'user' : null
        const workspace_id = user?.user_metadata?.workspace_id || 'default'

        setState({
          user,
          role,
          workspace_id,
          loading: false
        })

      } catch (error) {
        console.error('User fetch error:', error)
        setState({
          user: null,
          role: null,
          workspace_id: null,
          loading: false
        })
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        getUser()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

// Helper function to check if user is admin
export function useIsAdmin(): boolean {
  const { role, loading } = useSupabaseUser()
  return !loading && role === 'admin'
}

// Helper function to check dev bypass status
export function isDevBypass(): boolean {
  return getDevBypassStatus()
} 