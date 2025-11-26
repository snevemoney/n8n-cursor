"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

/**
 * Simplified Mode Management System
 * 
 * Removed beginner/advanced mode distinction - all features are always available.
 * Maintains other useful settings like theme, density, and developer tools.
 */

export type DataMode = 'live' | 'mock' | 'demo'
export type UserLevel = 'intermediate' | 'expert'

interface ModeState {
  // Core modes
  dataMode: DataMode
  userLevel: UserLevel
  
  // Feature flags
  showDeveloperTools: boolean
  enableMockData: boolean
  enableAnalytics: boolean
  
  // UI preferences
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  density: 'compact' | 'comfortable' | 'spacious'
}

interface ModeActions {
  setDataMode: (mode: DataMode) => void
  setUserLevel: (level: UserLevel) => void
  toggleDeveloperTools: () => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setDensity: (density: 'compact' | 'comfortable' | 'spacious') => void
  
  // Legacy helpers (always return advanced mode values)
  isBeginnerMode: () => boolean
  isAdvancedMode: () => boolean
  isMockMode: () => boolean
  isDevMode: () => boolean
  shouldShowFeature: (feature: string) => boolean
  toggleAdvancedFeatures: () => void // No-op for compatibility
}

type ModeContextType = ModeState & ModeActions

const ModeContext = createContext<ModeContextType | undefined>(undefined)

const DEFAULT_STATE: ModeState = {
  dataMode: 'mock',
  userLevel: 'expert',
  showDeveloperTools: false,
  enableMockData: true,
  enableAnalytics: true,
  sidebarCollapsed: false,
  theme: 'dark',
  density: 'comfortable'
}

interface ModeProviderProps {
  children: ReactNode
  initialMode?: Partial<ModeState>
}

export function ModeProvider({ children, initialMode }: ModeProviderProps) {
  const [state, setState] = useState<ModeState>(() => {
    // Load from localStorage on client
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lightning-mode-state')
        if (stored) {
          const parsed = JSON.parse(stored)
          return { ...DEFAULT_STATE, ...parsed, ...initialMode }
        }
      } catch (error) {
        console.warn('Failed to load mode state from localStorage:', error)
      }
    }
    return { ...DEFAULT_STATE, ...initialMode }
  })

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('lightning-mode-state', JSON.stringify(state))
        
        // Broadcast changes to other tabs
        window.dispatchEvent(new CustomEvent('mode-changed', { detail: state }))
      } catch (error) {
        console.warn('Failed to save mode state to localStorage:', error)
      }
    }
  }, [state])

  // Listen for mode changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleModeChange = (event: CustomEvent) => {
      setState(event.detail)
    }

    window.addEventListener('mode-changed', handleModeChange as EventListener)
    return () => window.removeEventListener('mode-changed', handleModeChange as EventListener)
  }, [])

  // Auto-detect environment and adjust modes
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production'
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    setState(prev => ({
      ...prev,
      showDeveloperTools: isDevelopment || prev.showDeveloperTools,
      enableMockData: !isProduction || prev.enableMockData,
      dataMode: isProduction ? 'live' : prev.dataMode
    }))
  }, [])

  const actions: ModeActions = {
    setDataMode: (mode: DataMode) => {
      setState(prev => ({
        ...prev,
        dataMode: mode,
        enableMockData: mode === 'mock' || mode === 'demo'
      }))
    },

    setUserLevel: (level: UserLevel) => {
      setState(prev => ({
        ...prev,
        userLevel: level
      }))
    },

    toggleDeveloperTools: () => {
      setState(prev => ({
        ...prev,
        showDeveloperTools: !prev.showDeveloperTools
      }))
    },

    toggleSidebar: () => {
      setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
    },

    setTheme: (theme: 'light' | 'dark' | 'system') => {
      setState(prev => ({ ...prev, theme }))
    },

    setDensity: (density: 'compact' | 'comfortable' | 'spacious') => {
      setState(prev => ({ ...prev, density }))
    },

    // Legacy helper functions - always return advanced mode values
    isBeginnerMode: () => false, // Always false - no more beginner mode
    isAdvancedMode: () => true,  // Always true - everything is advanced now
    isMockMode: () => state.dataMode === 'mock' || state.enableMockData,
    isDevMode: () => state.showDeveloperTools,
    toggleAdvancedFeatures: () => {}, // No-op for compatibility

    shouldShowFeature: (feature: string) => {
      // All features are now always available
      const featureMap: Record<string, boolean> = {
        // Core business features (always show)
        'payments-hub': true,
        'node-earnings': true,
        'send-payment': true,
        'receive-payment': true,
        'payment-history': true,
        
        // Previously "advanced" features (now always available)
        'advanced-analytics': true,
        'routing-fees': true,
        'channel-management': true,
        'automation': true,
        'ai-assistants': true,
        'client-tools': true,
        'templates': true,
        'developer-tools': state.showDeveloperTools,
        'system-logs': state.showDeveloperTools,
        'api-console': state.showDeveloperTools,
        
        // Data features
        'mock-data': state.enableMockData,
        'live-data': state.dataMode === 'live',
        'demo-mode': state.dataMode === 'demo',
        
        // Analytics
        'analytics': state.enableAnalytics,
        'tracking': state.enableAnalytics
      }
      
      return featureMap[feature] ?? true // Default to true for unknown features
    }
  }

  const contextValue: ModeContextType = {
    ...state,
    ...actions
  }

  return (
    <ModeContext.Provider value={contextValue}>
      {children}
    </ModeContext.Provider>
  )
}

export function useModeContext(): ModeContextType {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useModeContext must be used within a ModeProvider')
  }
  return context
}

// Legacy hooks for compatibility - all return advanced mode values
export function useIsBeginnerMode(): boolean {
  return false // Always false
}

export function useIsAdvancedMode(): boolean {
  return true // Always true
}

export function useIsMockMode(): boolean {
  const { isMockMode } = useModeContext()
  return isMockMode()
}

export function useIsDevMode(): boolean {
  const { isDevMode } = useModeContext()
  return isDevMode()
}

export function useFeatureFlag(feature: string): boolean {
  const { shouldShowFeature } = useModeContext()
  return shouldShowFeature(feature)
}

// Simplified ShowWhen component
interface ShowWhenProps {
  feature?: string
  userLevel?: UserLevel | UserLevel[]
  children: ReactNode
  fallback?: ReactNode
}

export function ShowWhen({ feature, userLevel, children, fallback = null }: ShowWhenProps) {
  const { shouldShowFeature, userLevel: currentUserLevel } = useModeContext()
  
  // Check feature flag
  if (feature && !shouldShowFeature(feature)) {
    return <>{fallback}</>
  }
  
  // Check user level
  if (userLevel) {
    const levels = Array.isArray(userLevel) ? userLevel : [userLevel]
    if (!levels.includes(currentUserLevel)) {
      return <>{fallback}</>
    }
  }
  
  return <>{children}</>
} 