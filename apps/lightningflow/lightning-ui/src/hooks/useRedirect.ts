/**
 * Lightning AI Platform - Unified Redirect Hook
 * Handles all navigation with type safety and external link confirmation
 */

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { redirectMap, RedirectAction, isExternalRedirect, getRedirectPath } from '@/lib/redirect-map';

interface UseRedirectOptions {
  confirmExternal?: boolean;
  trackAnalytics?: boolean;
  showToast?: boolean;
}

export function useRedirect(options: UseRedirectOptions = {}) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const {
    confirmExternal = true,
    trackAnalytics = true,
    showToast = false
  } = options;

  const redirect = useCallback(async (action: RedirectAction, force = false) => {
    try {
      setIsNavigating(true);
      
      const path = getRedirectPath(action);
      
      // Handle external links with confirmation
      if (isExternalRedirect(action) && confirmExternal && !force) {
        const confirmed = window.confirm(
          `This will open an external link: ${path}\n\nDo you want to continue?`
        );
        
        if (!confirmed) {
          setIsNavigating(false);
          return;
        }
        
        // Open external link in new tab
        window.open(path, '_blank', 'noopener,noreferrer');
        setIsNavigating(false);
        return;
      }
      
      // Track analytics if enabled
      if (trackAnalytics && typeof window !== 'undefined') {
        // Analytics tracking would go here
        console.log(`Navigation: ${action} -> ${path}`);
      }
      
      // Handle internal navigation
      if (path.includes('#')) {
        // Handle anchor links
        const [pathname, hash] = path.split('#');
        router.push(pathname);
        
        // Scroll to anchor after navigation
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        router.push(path);
      }
      
      if (showToast) {
        toast.success(`Navigating to ${action.replace('-', ' ')}`);
      }
      
    } catch (error) {
      console.error(`Navigation error for action "${action}":`, error);
      toast.error(`Failed to navigate to ${action.replace('-', ' ')}`);
    } finally {
      setIsNavigating(false);
    }
  }, [router, confirmExternal, trackAnalytics, showToast]);

  const redirectTo = useCallback((path: string) => {
    setIsNavigating(true);
    router.push(path);
    setIsNavigating(false);
  }, [router]);

  const back = useCallback(() => {
    setIsNavigating(true);
    router.back();
    setIsNavigating(false);
  }, [router]);

  const forward = useCallback(() => {
    setIsNavigating(true);
    router.forward();
    setIsNavigating(false);
  }, [router]);

  const refresh = useCallback(() => {
    setIsNavigating(true);
    router.refresh();
    setIsNavigating(false);
  }, [router]);

  return {
    redirect,
    redirectTo,
    back,
    forward,
    refresh,
    isNavigating,
    // Utility functions
    getPath: getRedirectPath,
    isExternal: isExternalRedirect,
    // Available actions for autocomplete
    actions: Object.keys(redirectMap) as RedirectAction[],
  };
} 