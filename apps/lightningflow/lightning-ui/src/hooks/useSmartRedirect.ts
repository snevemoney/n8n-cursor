"use client"

import { useRouter } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ROUTES, REDIRECT_MAP, getRedirectPath, parseRoute, type RedirectAction } from '../lib/routes';

interface UseSmartRedirectOptions {
  confirmExternal?: boolean;
  trackAnalytics?: boolean;
  showToast?: boolean;
  context?: string; // Track where the redirect came from
}

// Helper to get route path from nested structure
function getRoutePath(route: string): string {
  // Handle direct routes
  if (route.startsWith('/')) return route;
  
  // Handle nested routes like 'PAYMENTS.SEND'
  if (route.includes('.')) {
    const [section, subsection] = route.split('.');
    const sectionRoutes = (ROUTES as any)[section];
    if (sectionRoutes && typeof sectionRoutes === 'object' && sectionRoutes[subsection]) {
      return sectionRoutes[subsection];
    }
  }
  
  // Handle top-level routes
  const topLevelRoute = (ROUTES as any)[route];
  if (typeof topLevelRoute === 'string') {
    return topLevelRoute;
  }
  
  // Fallback to dashboard
  return ROUTES.DASHBOARD;
}

export function useSmartRedirect(options: UseSmartRedirectOptions = {}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNavigationRef = useRef<string | null>(null);
  
  const {
    confirmExternal = true,
    trackAnalytics = true,
    showToast = false,
    context = 'unknown'
  } = options;

  // Debounced navigation to prevent double-clicks
  const setNavigatingWithTimeout = useCallback((navigating: boolean, timeout: number = 2000) => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    
    setIsNavigating(navigating);
    
    if (navigating) {
      navigationTimeoutRef.current = setTimeout(() => {
        setIsNavigating(false);
        navigationTimeoutRef.current = null;
      }, timeout);
    }
  }, []);

  // Smart redirect using action mapping
  const redirect = useCallback(async (action: RedirectAction, params?: Record<string, string>) => {
    try {
      // Prevent double navigation
      if (isNavigating) {
        console.log('Navigation already in progress, skipping...');
        return;
      }

      const path = getRedirectPath(action);
      
      // Prevent navigating to the same path multiple times
      if (lastNavigationRef.current === path) {
        console.log('Already navigated to this path, skipping...');
        return;
      }

      setNavigatingWithTimeout(true);
      lastNavigationRef.current = path;
      
      const { route, section } = parseRoute(path);
      
      // Build query string with context and params
      const queryParams = new URLSearchParams();
      if (context) queryParams.set('from', context);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          queryParams.set(key, value);
        });
      }
      
      const queryString = queryParams.toString();
      const finalPath = queryString ? `${route}?${queryString}${section ? `#${section}` : ''}` : path;
      
      // Track analytics if enabled
      if (trackAnalytics && typeof window !== 'undefined') {
        console.log(`Smart Redirect: ${action} -> ${finalPath} (from: ${context})`);
        // Add your analytics tracking here
      }
      
      // Handle anchor scrolling
      if (section) {
        router.push(route + (queryString ? `?${queryString}` : ''));
        
        // Scroll to section after navigation
        setTimeout(() => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        router.push(finalPath);
      }
      
      if (showToast) {
        toast.success(`Navigating to ${action.replace('-', ' ')}`);
      }
      
      // Reset navigation reference after successful navigation
      setTimeout(() => {
        lastNavigationRef.current = null;
      }, 1000);
      
    } catch (error) {
      console.error(`Smart redirect error for action "${action}":`, error);
      toast.error(`Failed to navigate to ${action.replace('-', ' ')}`);
      setIsNavigating(false);
      lastNavigationRef.current = null;
    }
  }, [router, confirmExternal, trackAnalytics, showToast, context, isNavigating, setNavigatingWithTimeout]);

  // Direct route navigation - now handles both string paths and route keys
  const goTo = useCallback((route: string | RedirectAction, params?: Record<string, string>) => {
    try {
      // Prevent double navigation
      if (isNavigating) {
        console.log('Navigation already in progress, skipping...');
        return;
      }
      
      // If it's a redirect action, use the redirect function
      if (typeof route === 'string' && route in REDIRECT_MAP) {
        redirect(route as RedirectAction, params);
        return;
      }
      
      // Get the actual path
      const path = getRoutePath(route as string);
      
      // Prevent navigating to the same path multiple times
      if (lastNavigationRef.current === path) {
        console.log('Already navigated to this path, skipping...');
        return;
      }

      setNavigatingWithTimeout(true);
      lastNavigationRef.current = path;
      
      const queryParams = new URLSearchParams();
      
      if (context) queryParams.set('from', context);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          queryParams.set(key, value);
        });
      }
      
      const queryString = queryParams.toString();
      const finalPath = queryString ? `${path}?${queryString}` : path;
      
      router.push(finalPath);
      
      if (trackAnalytics) {
        console.log(`Direct Navigation: ${route} -> ${finalPath} (from: ${context})`);
      }
      
      // Reset navigation reference after successful navigation
      setTimeout(() => {
        lastNavigationRef.current = null;
      }, 1000);
      
    } catch (error) {
      console.error(`Direct navigation error for route "${route}":`, error);
      toast.error(`Failed to navigate to ${route}`);
      setIsNavigating(false);
      lastNavigationRef.current = null;
    }
  }, [router, trackAnalytics, context, redirect, isNavigating, setNavigatingWithTimeout]);

  // Navigation with context (for dashboard cards, quick actions, etc.)
  const goToWithContext = useCallback((route: string, contextData?: Record<string, any>) => {
    const params: Record<string, string> = {};
    
    if (contextData) {
      // Convert context data to URL params
      Object.entries(contextData).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          params[key] = String(value);
        }
      });
    }
    
    goTo(route, params);
  }, [goTo]);

  // Quick actions for common flows
  const quickActions = {
    sendPayment: (amount?: number, memo?: string) => {
      const params: Record<string, string> = {};
      if (amount) params.amount = String(amount);
      if (memo) params.memo = memo;
      redirect('send-payment', params);
    },
    
    createInvoice: (amount?: number, description?: string) => {
      const params: Record<string, string> = {};
      if (amount) params.amount = String(amount);
      if (description) params.description = description;
      redirect('generate-invoice', params);
    },
    
    viewEarnings: () => {
      redirect('earnings-analytics');
    },
    
    checkChannels: () => {
      redirect('lightning-channels');
    },
    
    verifyTransaction: (txId?: string) => {
      const params: Record<string, string> = {};
      if (txId) params.tx = txId;
      redirect('trust-check', params);
    }
  };

  // Standard navigation methods with debouncing
  const back = useCallback(() => {
    if (isNavigating) return;
    setNavigatingWithTimeout(true, 1000);
    router.back();
  }, [router, isNavigating, setNavigatingWithTimeout]);

  const forward = useCallback(() => {
    if (isNavigating) return;
    setNavigatingWithTimeout(true, 1000);
    router.forward();
  }, [router, isNavigating, setNavigatingWithTimeout]);

  const refresh = useCallback(() => {
    if (isNavigating) return;
    setNavigatingWithTimeout(true, 1000);
    router.refresh();
  }, [router, isNavigating, setNavigatingWithTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Smart navigation
    redirect,
    goTo,
    goToWithContext,
    quickActions,
    
    // Standard navigation
    back,
    forward,
    refresh,
    
    // State
    isNavigating,
    
    // Available actions for autocomplete
    actions: Object.keys(REDIRECT_MAP) as RedirectAction[],
  };
} 