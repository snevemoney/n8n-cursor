"use client"

import { useState, useEffect } from 'react';

interface UserExperienceState {
  isFirstTime: boolean;
  hasSeenTooltips: string[];
  showHelpText: boolean;
}

const DEFAULT_STATE: UserExperienceState = {
  isFirstTime: true,
  hasSeenTooltips: [],
  showHelpText: true
};

export function useUserExperience() {
  const [state, setState] = useState<UserExperienceState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lightning-ux-state');
      if (stored) {
        const parsedState = JSON.parse(stored);
        setState({ ...DEFAULT_STATE, ...parsedState });
      }
    } catch (error) {
      console.warn('Failed to load UX state from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('lightning-ux-state', JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save UX state to localStorage:', error);
      }
    }
  }, [state, isLoaded]);

  const markTooltipSeen = (tooltipId: string) => {
    setState(prev => ({
      ...prev,
      hasSeenTooltips: [...prev.hasSeenTooltips, tooltipId]
    }));
  };

  const hasSeenTooltip = (tooltipId: string) => {
    return state.hasSeenTooltips.includes(tooltipId);
  };

  const completeOnboarding = () => {
    setState(prev => ({
      ...prev,
      isFirstTime: false
    }));
  };

  const toggleHelpText = () => {
    setState(prev => ({
      ...prev,
      showHelpText: !prev.showHelpText
    }));
  };

  const resetToDefaults = () => {
    setState(DEFAULT_STATE);
  };

  // Determine if this is a power user (has used advanced features)
  const isPowerUser = !state.isFirstTime && state.hasSeenTooltips.length > 5;

  return {
    // State
    mode: 'advanced' as const, // Always advanced mode
    isFirstTime: state.isFirstTime,
    showHelpText: state.showHelpText,
    showAdvancedFeatures: true, // Always true
    isPowerUser,
    isLoaded,

    // Legacy actions for compatibility
    toggleMode: () => {}, // No-op
    setMode: () => {}, // No-op
    markTooltipSeen,
    hasSeenTooltip,
    completeOnboarding,
    toggleHelpText,
    resetToDefaults,

    // Computed values - always advanced mode
    isBeginnerMode: false, // Always false
    isAdvancedMode: true   // Always true
  };
} 