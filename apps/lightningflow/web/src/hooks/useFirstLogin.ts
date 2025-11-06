'use client'

import { useState, useEffect } from 'react'

export interface FirstLoginState {
  isFirstLogin: boolean
  hasCompletedOnboarding: boolean
  nodeData: any
}

export function useFirstLogin() {
  const [state, setState] = useState<FirstLoginState>({
    isFirstLogin: true,
    hasCompletedOnboarding: false,
    nodeData: null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for onboarding completion
    const checkOnboardingStatus = () => {
      try {
        const hasCompleted = localStorage.getItem('lightning-onboarding-complete') === 'true'
        const nodeDataStr = localStorage.getItem('lightning-node-data')
        const nodeData = nodeDataStr ? JSON.parse(nodeDataStr) : null

        setState({
          isFirstLogin: !hasCompleted,
          hasCompletedOnboarding: hasCompleted,
          nodeData
        })
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        // Default to first login if there's an error
        setState({
          isFirstLogin: true,
          hasCompletedOnboarding: false,
          nodeData: null
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  const markOnboardingComplete = (nodeData: any) => {
    try {
      localStorage.setItem('lightning-onboarding-complete', 'true')
      localStorage.setItem('lightning-node-data', JSON.stringify(nodeData))
      
      setState({
        isFirstLogin: false,
        hasCompletedOnboarding: true,
        nodeData
      })
    } catch (error) {
      console.error('Error saving onboarding completion:', error)
    }
  }

  const resetOnboarding = () => {
    try {
      localStorage.removeItem('lightning-onboarding-complete')
      localStorage.removeItem('lightning-node-data')
      
      setState({
        isFirstLogin: true,
        hasCompletedOnboarding: false,
        nodeData: null
      })
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }

  return {
    ...state,
    isLoading,
    markOnboardingComplete,
    resetOnboarding
  }
} 