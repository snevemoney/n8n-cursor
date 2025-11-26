'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePageDataOptions<T> {
  fetchFn: () => Promise<T>;
  cacheKey?: string;
  cacheMaxAge?: number; // milliseconds
  timeout?: number; // milliseconds, default 10000
  retry?: number; // max retries, default 0
  retryDelay?: number; // milliseconds, default 1000
  pollInterval?: number; // milliseconds, undefined = no polling
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T; // For optimistic rendering
}

interface UsePageDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (force?: boolean) => Promise<void>;
  isRefreshing: boolean;
}

/**
 * Unified data fetching hook for all pages
 * Ensures consistent behavior: non-blocking initial render, deduplication, caching, timeouts
 */
export function usePageData<T>(options: UsePageDataOptions<T>): UsePageDataResult<T> {
  const {
    fetchFn,
    cacheKey,
    cacheMaxAge = 30000, // 30 seconds default
    timeout = 10000, // 10 seconds default
    retry = 0,
    retryDelay = 1000,
    pollInterval,
    enabled = true,
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false); // Always start false for instant render
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const fetchData = useCallback(async (force = false, retryAttempt = 0) => {
    // Prevent duplicate requests
    if (loadingRef.current && !force) return;
    loadingRef.current = true;

    // Skip if tab not visible and already loaded (unless forced)
    if (!force && hasLoadedOnceRef.current && typeof document !== 'undefined' && 
        document.visibilityState !== 'visible') {
      loadingRef.current = false;
      return;
    }

    // Try cache first (unless forced)
    if (!force && cacheKey && typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime, 10);
          if (age < cacheMaxAge) {
            const parsed = JSON.parse(cached);
            setData(parsed);
            hasLoadedOnceRef.current = true;
            loadingRef.current = false;
            // Still fetch in background for fresh data
            setTimeout(() => fetchData(false, 0), 0);
            return;
          }
        }
      } catch {
        // Cache read failed, continue with fetch
      }
    }

    try {
      setError(null);
      // Only show loading on initial load or forced refresh
      if (!hasLoadedOnceRef.current || force) {
        setLoading(true);
        if (force) setIsRefreshing(true);
      }

      // Create abort controller for timeout
      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), timeout + (retryAttempt * 1000));

      try {
        const result = await fetchFn();

        // Check if aborted
        if (controller.signal.aborted) {
          loadingRef.current = false;
          return;
        }

        clearTimeout(timeoutId);
        setData(result);
        hasLoadedOnceRef.current = true;
        retryCountRef.current = 0;

        // Cache result
        if (cacheKey && typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(result));
            sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
          } catch {
            // Cache write failed, continue
          }
        }

        if (onSuccess) onSuccess(result);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        if (controller.signal.aborted) {
          loadingRef.current = false;
          return;
        }

        // Retry logic
        if (retryAttempt < retry && (fetchError.name === 'AbortError' || fetchError.message?.includes('Failed to fetch'))) {
          const delay = Math.min(retryDelay * Math.pow(2, retryAttempt), 5000);
          retryCountRef.current = retryAttempt + 1;
          setTimeout(() => {
            fetchData(force, retryAttempt + 1);
          }, delay);
          return;
        }

        // Set error
        let errorMessage = 'Failed to load data';
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (fetchError.message) {
          errorMessage = fetchError.message;
        }

        setError(errorMessage);
        if (onError) onError(new Error(errorMessage));
      } finally {
        setLoading(false);
        setIsRefreshing(false);
        loadingRef.current = false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setLoading(false);
      setIsRefreshing(false);
      loadingRef.current = false;
      if (onError) onError(new Error(errorMessage));
    }
  }, [fetchFn, cacheKey, cacheMaxAge, timeout, retry, retryDelay, onSuccess, onError]);

  // Initial load - deferred for instant render
  useEffect(() => {
    if (!enabled) return;

    const loadData = () => {
      fetchData(false, 0);
    };

    // Defer initial load to allow page to render first
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 100 });
    } else {
      setTimeout(loadData, 50);
    }
  }, [enabled, fetchData]);

  // Polling (if enabled)
  useEffect(() => {
    if (!pollInterval || !enabled) return;

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData(false, 0);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, enabled, fetchData]);

  // Visibility change handler
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasLoadedOnceRef.current) {
        // Defer refresh slightly
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => fetchData(false, 0), { timeout: 200 });
        } else {
          setTimeout(() => fetchData(false, 0), 50);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(async (force = true) => {
    await fetchData(force, 0);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isRefreshing,
  };
}
