'use client';
import { apiPath } from '@/lib/base-path';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface OnboardingStep {
  name: string;
  index: number;
  title: string;
  description?: string;
  isRequired?: boolean;
}

interface OnboardingEvent {
  sessionId: string;
  stepName: string;
  stepIndex: number;
  status: 'started' | 'completed' | 'skipped' | 'dropped' | 'error';
  timeSpentSeconds?: number;
  errorDetails?: any;
  metadata?: any;
}

interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  isComplete: boolean;
  progress: number;
  sessionId: string;
}

interface UseOnboardingTrackerProps {
  /** Onboarding steps configuration */
  steps: OnboardingStep[];
  /** Auto-track page navigation as step progression */
  autoTrack?: boolean;
  /** Custom session ID (otherwise auto-generated) */
  sessionId?: string;
  /** Callback when onboarding is completed */
  onComplete?: () => void;
  /** Callback when user drops off */
  onDropOff?: (step: OnboardingStep, reason?: string) => void;
}

/**
 * useOnboardingTracker Hook
 * 
 * Provides comprehensive onboarding analytics:
 * - Automatic step tracking and timing
 * - Drop-off detection and analysis
 * - Session management and persistence
 * - Progress calculation and completion
 * - Error tracking and recovery
 */
export function useOnboardingTracker({
  steps,
  autoTrack = true,
  sessionId: providedSessionId,
  onComplete,
  onDropOff,
}: UseOnboardingTrackerProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // State management
  const [sessionId] = useState(() => 
    providedSessionId || `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timing tracking
  const stepStartTime = useRef<Date | null>(null);
  const pageVisibility = useRef<'visible' | 'hidden'>('visible');
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Progress calculation
  const progress: OnboardingProgress = {
    currentStep,
    completedSteps,
    isComplete: completedSteps.length === steps.length,
    progress: (completedSteps.length / steps.length) * 100,
    sessionId,
  };

  /**
   * Track an onboarding event
   */
  const trackEvent = useCallback(async (event: Partial<OnboardingEvent>) => {
    try {
      const fullEvent: OnboardingEvent = {
        sessionId,
        stepName: steps[currentStep]?.name || 'unknown',
        stepIndex: currentStep,
        status: 'started',
        ...event,
      };

      const response = await fetch(apiPath('/api/analytics/onboarding'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to track onboarding event');
      }

      return await response.json();
    } catch (err) {
      console.error('Onboarding tracking error:', err);
      setError(err instanceof Error ? err.message : 'Tracking failed');
    }
  }, [sessionId, currentStep, steps]);

  /**
   * Start tracking a step
   */
  const startStep = useCallback(async (stepIndex: number, metadata?: any) => {
    if (stepIndex < 0 || stepIndex >= steps.length) {
      console.warn('Invalid step index:', stepIndex);
      return;
    }

    const step = steps[stepIndex];
    setCurrentStep(stepIndex);
    stepStartTime.current = new Date();
    setError(null);

    await trackEvent({
      stepName: step.name,
      stepIndex,
      status: 'started',
      metadata: {
        stepTitle: step.title,
        stepDescription: step.description,
        isRequired: step.isRequired,
        ...metadata,
      },
    });

    // Set up inactivity detection (5 minutes)
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    inactivityTimer.current = setTimeout(() => {
      if (pageVisibility.current === 'visible') {
        handleDropOff('inactivity_timeout');
      }
    }, 5 * 60 * 1000);

  }, [steps, trackEvent]);

  /**
   * Complete a step
   */
  const completeStep = useCallback(async (stepIndex?: number, metadata?: any) => {
    const targetStep = stepIndex ?? currentStep;
    const step = steps[targetStep];
    
    if (!step) {
      console.warn('Cannot complete unknown step:', targetStep);
      return;
    }

    const timeSpent = stepStartTime.current 
      ? Math.round((new Date().getTime() - stepStartTime.current.getTime()) / 1000)
      : undefined;

    await trackEvent({
      stepName: step.name,
      stepIndex: targetStep,
      status: 'completed',
      timeSpentSeconds: timeSpent,
      metadata,
    });

    // Update local state
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      if (!newCompleted.includes(step.name)) {
        newCompleted.push(step.name);
      }
      return newCompleted;
    });

    // Clear inactivity timer
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }

    // Check if onboarding is complete
    const newCompletedCount = completedSteps.length + (completedSteps.includes(step.name) ? 0 : 1);
    if (newCompletedCount === steps.length) {
      onComplete?.();
    }

    // Auto-advance to next step
    if (targetStep === currentStep && targetStep < steps.length - 1) {
      setTimeout(() => startStep(targetStep + 1), 100);
    }

  }, [currentStep, steps, trackEvent, completedSteps, onComplete, startStep]);

  /**
   * Skip a step
   */
  const skipStep = useCallback(async (stepIndex?: number, reason?: string) => {
    const targetStep = stepIndex ?? currentStep;
    const step = steps[targetStep];
    
    if (!step) return;

    const timeSpent = stepStartTime.current 
      ? Math.round((new Date().getTime() - stepStartTime.current.getTime()) / 1000)
      : undefined;

    await trackEvent({
      stepName: step.name,
      stepIndex: targetStep,
      status: 'skipped',
      timeSpentSeconds: timeSpent,
      metadata: { reason },
    });

    // Auto-advance to next step
    if (targetStep === currentStep && targetStep < steps.length - 1) {
      setTimeout(() => startStep(targetStep + 1), 100);
    }

  }, [currentStep, steps, trackEvent, startStep]);

  /**
   * Handle step error
   */
  const recordError = useCallback(async (error: any, stepIndex?: number) => {
    const targetStep = stepIndex ?? currentStep;
    const step = steps[targetStep];
    
    if (!step) return;

    const timeSpent = stepStartTime.current 
      ? Math.round((new Date().getTime() - stepStartTime.current.getTime()) / 1000)
      : undefined;

    await trackEvent({
      stepName: step.name,
      stepIndex: targetStep,
      status: 'error',
      timeSpentSeconds: timeSpent,
      errorDetails: {
        message: error.message || String(error),
        stack: error.stack,
        type: error.name || 'unknown',
        timestamp: new Date().toISOString(),
      },
    });

    setError(error.message || String(error));
  }, [currentStep, steps, trackEvent]);

  /**
   * Handle user drop-off
   */
  const handleDropOff = useCallback(async (reason?: string) => {
    const step = steps[currentStep];
    if (!step) return;

    const timeSpent = stepStartTime.current 
      ? Math.round((new Date().getTime() - stepStartTime.current.getTime()) / 1000)
      : undefined;

    await trackEvent({
      stepName: step.name,
      stepIndex: currentStep,
      status: 'dropped',
      timeSpentSeconds: timeSpent,
      metadata: { reason },
    });

    onDropOff?.(step, reason);
  }, [currentStep, steps, trackEvent, onDropOff]);

  /**
   * Navigate to a specific step
   */
  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    // Complete current step if moving forward
    if (stepIndex > currentStep) {
      await completeStep(currentStep);
    }

    await startStep(stepIndex);
  }, [currentStep, steps.length, completeStep, startStep]);

  /**
   * Reset onboarding progress
   */
  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setError(null);
    stepStartTime.current = null;
    
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  // Auto-track based on pathname changes
  useEffect(() => {
    if (!autoTrack || !pathname) return;

    // Simple path-to-step mapping (you can customize this)
    const pathStepMap: Record<string, number> = {
      '/onboarding': 0,
      '/onboarding/welcome': 0,
      '/onboarding/setup': 1,
      '/onboarding/node': 2,
      '/onboarding/channel': 3,
      '/onboarding/payment': 4,
      '/onboarding/complete': 5,
    };

    const matchedStep = pathStepMap[pathname];
    if (matchedStep !== undefined && matchedStep !== currentStep) {
      startStep(matchedStep, { triggeredBy: 'navigation', pathname });
    }
  }, [pathname, autoTrack, currentStep, startStep]);

  // Page visibility tracking for drop-off detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      pageVisibility.current = document.hidden ? 'hidden' : 'visible';
      
      if (document.hidden) {
        // Page became hidden - pause timers
        if (inactivityTimer.current) {
          clearTimeout(inactivityTimer.current);
        }
      } else {
        // Page became visible - resume tracking
        if (stepStartTime.current) {
          // Restart inactivity timer
          inactivityTimer.current = setTimeout(() => {
            if (pageVisibility.current === 'visible') {
              handleDropOff('inactivity_timeout');
            }
          }, 5 * 60 * 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleDropOff]);

  // Beforeunload detection for drop-off
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stepStartTime.current && !progress.isComplete) {
        // Use sendBeacon for reliable tracking on page unload
        const event = {
          sessionId,
          stepName: steps[currentStep]?.name || 'unknown',
          action: 'dropped_off',
          metadata: {
            reason: 'page_unload',
            time_spent_seconds: Math.round((Date.now() - stepStartTime.current.getTime()) / 1000)
          }
        };

        navigator.sendBeacon('/api/track/onboarding', JSON.stringify(event));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId, currentStep, steps, progress.isComplete]);

  return {
    progress,
    currentStep,
    isComplete: progress.isComplete,
    startStep,
    completeStep,
    skipStep,
    reset,
    getStepProgress: progress.progress,
    trackEvent,
    handleDropOff
  };
}

// Export types for external use
export type OnboardingStepType = 
  | 'landing'
  | 'signup'
  | 'email_verification'
  | 'lightning_basics'
  | 'choose_peer'
  | 'open_channel'
  | 'channel_confirmation'
  | 'loop_out_intro'
  | 'loop_out_attempt'
  | 'loop_out_success'
  | 'dashboard_tour'
  | 'first_payment'
  | 'earnings_setup'
  | 'completed';

export type OnboardingAction = 
  | 'started'
  | 'completed'
  | 'error'
  | 'dropped_off'
  | 'clicked'
  | 'viewed'
  | 'skipped'
  | 'retry';

interface TrackingMetadata {
  error_message?: string;
  time_spent_seconds?: number;
  peer_selected?: string;
  channel_amount?: number;
  loop_amount?: number;
  button_clicked?: string;
  page_referrer?: string;
  user_agent?: string;
  [key: string]: any;
}

// Simple tracking hook for individual events
export function useSimpleOnboardingTracker() {
  const trackEvent = useCallback(async (
    step: OnboardingStepType,
    action: OnboardingAction,
    metadata: TrackingMetadata = {}
  ) => {
    try {
      // Add browser/session metadata
      const enrichedMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        page_referrer: document.referrer
      };

      const response = await fetch(apiPath('/api/track/onboarding'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          step,
          action,
          metadata: enrichedMetadata
        })
      });

      if (!response.ok) {
        console.warn('Failed to track onboarding event:', { step, action });
      }
    } catch (error) {
      console.warn('Error tracking onboarding event:', error);
    }
  }, []);

  // Convenience methods for common tracking patterns
  const trackStepStarted = useCallback((step: OnboardingStepType, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'started', metadata);
  }, [trackEvent]);

  const trackStepCompleted = useCallback((step: OnboardingStepType, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'completed', metadata);
  }, [trackEvent]);

  const trackError = useCallback((step: OnboardingStepType, errorMessage: string, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'error', { 
      error_message: errorMessage,
      ...metadata 
    });
  }, [trackEvent]);

  const trackButtonClick = useCallback((step: OnboardingStepType, buttonName: string, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'clicked', { 
      button_clicked: buttonName,
      ...metadata 
    });
  }, [trackEvent]);

  const trackPageView = useCallback((step: OnboardingStepType, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'viewed', metadata);
  }, [trackEvent]);

  const trackDropOff = useCallback((step: OnboardingStepType, timeSpent: number, metadata?: TrackingMetadata) => {
    return trackEvent(step, 'dropped_off', { 
      time_spent_seconds: timeSpent,
      ...metadata 
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackStepStarted,
    trackStepCompleted,
    trackError,
    trackButtonClick,
    trackPageView,
    trackDropOff
  };
}

// Higher-order component for automatic page view tracking
export function withOnboardingTracking<T extends {}>(
  Component: React.ComponentType<T>,
  step: OnboardingStepType
): React.ComponentType<T> {
  return function TrackedComponent(props: T) {
    const { trackPageView } = useSimpleOnboardingTracker();
    
    useEffect(() => {
      trackPageView(step);
    }, [trackPageView]);

    return <Component {...props} />;
  };
}

// Hook for tracking time spent on a step
export function useStepTimer(step: OnboardingStepType) {
  const { trackDropOff } = useSimpleOnboardingTracker();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) { // Only track if user spent more than 5 seconds
        trackDropOff(step, timeSpent);
      }
    };
  }, [step, trackDropOff]);

  const getTimeSpent = useCallback(() => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  return { getTimeSpent };
} 