"use client"

import { toast } from 'sonner'
import { useCallback, useEffect } from 'react'

/**
 * Senior-Level Toast Management System
 * 
 * Prevents silent failures and provides consistent UX feedback
 * across the entire application.
 */

export interface ToastOptions {
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  }
  id?: string
  dismissible?: boolean
  description?: string
  important?: boolean
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
  humanFeedback?: string
}

export function useToaster() {
  const success = useCallback((message: string, options?: ToastOptions) => {
    const toastOptions: any = {
      duration: options?.duration || 4000,
      action: options?.action,
      id: options?.id,
      dismissible: options?.dismissible ?? true,
      description: options?.description,
      className: options?.important ? 'border-green-500' : undefined
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.success(message, toastOptions);
  }, [])

  const error = useCallback((message: string, options?: ToastOptions) => {
    const toastOptions: any = {
      duration: options?.duration || 6000,
      action: options?.action,
      id: options?.id,
      dismissible: options?.dismissible ?? true,
      description: options?.description,
      className: 'border-red-500'
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.error(message, toastOptions);
  }, [])

  const warning = useCallback((message: string, options?: ToastOptions) => {
    const toastOptions: any = {
      duration: options?.duration || 5000,
      action: options?.action,
      id: options?.id,
      dismissible: options?.dismissible ?? true,
      description: options?.description,
      className: 'border-amber-500'
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.warning(message, toastOptions);
  }, [])

  const info = useCallback((message: string, options?: ToastOptions) => {
    const toastOptions: any = {
      duration: options?.duration || 4000,
      action: options?.action,
      id: options?.id,
      dismissible: options?.dismissible ?? true,
      description: options?.description
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.info(message, toastOptions);
  }, [])

  const loading = useCallback((message: string, options?: Omit<ToastOptions, 'duration'>) => {
    const toastOptions: any = {
      action: options?.action,
      id: options?.id,
      dismissible: options?.dismissible ?? false,
      description: options?.description
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.loading(message, toastOptions);
  }, [])

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
      ...options
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    } & ToastOptions
  ) => {
    const toastOptions: any = {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
      duration: options.duration,
      action: options.action,
      id: options.id,
      dismissible: options.dismissible,
      description: options.description
    };

    if (options?.cancel?.onClick) {
      toastOptions.cancel = {
        label: options.cancel.label,
        onClick: options.cancel.onClick
      };
    }

    return toast.promise(promise, toastOptions);
  }, [])

  // Smart API response handler
  const handleApiResponse = useCallback((response: ApiResponse, context?: string) => {
    if (response.success) {
      const message = response.humanFeedback || response.message || 'Operation completed successfully'
      success(message, {
        description: context ? `Context: ${context}` : undefined
      })
    } else {
      const message = response.error || 'Operation failed'
      error(message, {
        description: context ? `Context: ${context}` : undefined,
        action: {
          label: 'Retry',
          onClick: () => {
            // Could trigger a retry mechanism here
            info('Retry functionality would be implemented here')
          }
        }
      })
    }
    return response
  }, [success, error, info])

  // Connection status toasts
  const connectionLost = useCallback(() => {
    return warning('Connection lost', {
      id: 'connection-status',
      description: 'Attempting to reconnect...',
      duration: Infinity,
      dismissible: false
    })
  }, [warning])

  const connectionRestored = useCallback(() => {
    toast.dismiss('connection-status')
    return success('Connection restored', {
      description: 'All systems operational'
    })
  }, [success])

  // Autosave status toasts
  const saving = useCallback(() => {
    return loading('Saving changes...', {
      id: 'autosave-status'
    })
  }, [loading])

  const saved = useCallback(() => {
    toast.dismiss('autosave-status')
    return success('All changes saved', {
      duration: 2000,
      description: 'Your data is secure'
    })
  }, [success])

  const saveFailed = useCallback((reason?: string) => {
    toast.dismiss('autosave-status')
    return error('Failed to save changes', {
      description: reason || 'Your changes are stored locally',
      action: {
        label: 'Retry',
        onClick: () => {
          // Trigger save retry
          info('Retrying save...')
        }
      }
    })
  }, [error, info])

  // Payment-specific toasts
  const paymentSent = useCallback((amount: number, recipient?: string) => {
    return success(`Payment sent: ${amount.toLocaleString()} sats`, {
      description: recipient ? `To: ${recipient}` : undefined,
      duration: 6000,
      important: true
    })
  }, [success])

  const paymentReceived = useCallback((amount: number, sender?: string) => {
    return success(`Payment received: ${amount.toLocaleString()} sats`, {
      description: sender ? `From: ${sender}` : undefined,
      duration: 6000,
      important: true
    })
  }, [success])

  const paymentFailed = useCallback((reason?: string) => {
    return error('Payment failed', {
      description: reason || 'Please check your connection and try again',
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to transaction details
          info('Transaction details would open here')
        }
      }
    })
  }, [error, info])

  // Business-specific toasts
  const nodeEarnings = useCallback((amount: number, period: string = 'today') => {
    return success(`Node earned ${amount.toLocaleString()} sats ${period}`, {
      description: 'Your Lightning node is generating revenue',
      duration: 5000,
      important: true
    })
  }, [success])

  const feesSaved = useCallback((amount: number, comparison: string = 'vs traditional payment processors') => {
    return success(`Saved $${amount.toFixed(2)} in fees`, {
      description: `${comparison} • Your node pays for itself`,
      duration: 5000,
      important: true
    })
  }, [success])

  const businessGrowth = useCallback((metric: string, value: string) => {
    return info(`Business growth: ${metric} ${value}`, {
      description: 'Your Lightning business is scaling',
      duration: 4000
    })
  }, [info])

  // AI & Automation toasts
  const aiTaskCompleted = useCallback((task: string, result?: string) => {
    return success(`AI completed: ${task}`, {
      description: result || 'Task executed successfully',
      duration: 4000
    })
  }, [success])

  const automationTriggered = useCallback((workflow: string) => {
    return info(`Automation triggered: ${workflow}`, {
      description: 'Your business is running on autopilot',
      duration: 3000
    })
  }, [info])

  // Security & Trust toasts
  const securityAlert = useCallback((message: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
    const toastFn = severity === 'high' ? error : severity === 'medium' ? warning : info
    return toastFn(`Security: ${message}`, {
      description: 'Your Lightning node security system',
      duration: severity === 'high' ? 10000 : 5000,
      important: severity === 'high'
    })
  }, [error, warning, info])

  const proofGenerated = useCallback((action: string) => {
    return success(`Cryptographic proof generated`, {
      description: `Action: ${action} • Immutable audit trail`,
      duration: 3000
    })
  }, [success])

  // Dismiss functions
  const dismiss = useCallback((id?: string) => {
    toast.dismiss(id)
  }, [])

  const dismissAll = useCallback(() => {
    toast.dismiss()
  }, [])

  return {
    // Basic toasts
    success,
    error,
    warning,
    info,
    loading,
    promise,
    
    // Smart handlers
    handleApiResponse,
    
    // Connection status
    connectionLost,
    connectionRestored,
    
    // Autosave status
    saving,
    saved,
    saveFailed,
    
    // Payment status
    paymentSent,
    paymentReceived,
    paymentFailed,
    
    // Business metrics
    nodeEarnings,
    feesSaved,
    businessGrowth,
    
    // AI & Automation
    aiTaskCompleted,
    automationTriggered,
    
    // Security & Trust
    securityAlert,
    proofGenerated,
    
    // Dismiss
    dismiss,
    dismissAll
  }
}

/**
 * Global error handler hook
 */
export function useErrorHandler() {
  const { error, warning } = useToaster()

  const handleError = useCallback((err: Error | string, context?: string) => {
    const message = typeof err === 'string' ? err : err.message
    
    // Log to console for debugging
    console.error('Error caught by useErrorHandler:', err, { context })
    
    // Show user-friendly toast
    error(message, {
      description: context,
      action: {
        label: 'Report Issue',
        onClick: () => {
          // Could open a bug report modal
          warning('Bug reporting would be implemented here')
        }
      }
    })
  }, [error, warning])

  const handleWarning = useCallback((message: string, context?: string) => {
    warning(message, {
      description: context
    })
  }, [warning])

  return {
    handleError,
    handleWarning
  }
}

/**
 * Connection monitoring hook
 */
export function useConnectionMonitor() {
  const { connectionLost, connectionRestored } = useToaster()

  useEffect(() => {
    const handleOnline = () => connectionRestored()
    const handleOffline = () => connectionLost()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [connectionLost, connectionRestored])
} 