'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePageDataOptions<T> {
  fetchFn: (signal?: AbortSignal) => Promise<T>;
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
  
  // Callback identity changes on normal renders must not restart initial loading.
  const callbacksRef = useRef({ fetchFn, onSuccess, onError });
  callbacksRef.current = { fetchFn, onSuccess, onError };
  const mountedRef = useRef(true);
  const requestGenRef = useRef(0);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const hasLoadedOnceRef = useRef(false);

  const fetchData = useCallback(async (force = false, retryAttempt = 0, skipCache = false) => {
    if (!mountedRef.current) return;
    // Prevent duplicate requests
    if (loadingRef.current && !force) return;
    const requestGen = ++requestGenRef.current;
    abortControllerRef.current?.abort();
    loadingRef.current = true;

    // Skip if tab not visible and already loaded (unless forced)
    if (!force && hasLoadedOnceRef.current && typeof document !== 'undefined' && 
        document.visibilityState !== 'visible') {
      loadingRef.current = false;
      return;
    }

    // Try cache first (unless forced)
    if (!force && !skipCache && cacheKey && typeof window !== 'undefined') {
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
            setTimeout(() => {
              if (requestGen === requestGenRef.current) fetchData(false, 0, true);
            }, 0);
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
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new Error('Request timed out. Please try again.');
          error.name = 'TimeoutError';
          reject(error);
          controller.abort();
        }, timeout + (retryAttempt * 1000));
      });

      try {
        let result: T;
        try {
          result = await Promise.race([callbacksRef.current.fetchFn(controller.signal), deadline]);
        } finally {
          clearTimeout(timeoutId!);
        }

        // Only the newest request may publish data, cache or loading state.
        if (requestGen !== requestGenRef.current) return;
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

        callbacksRef.current.onSuccess?.(result);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (requestGen !== requestGenRef.current) return;

        if (controller.signal.aborted && fetchError.name !== 'TimeoutError') {
          loadingRef.current = false;
          return;
        }

        // Retry logic
        if (retryAttempt < retry && (fetchError.name === 'AbortError' || fetchError.message?.includes('Failed to fetch'))) {
          const delay = Math.min(retryDelay * Math.pow(2, retryAttempt), 5000);
          retryCountRef.current = retryAttempt + 1;
          setTimeout(() => {
            if (requestGen === requestGenRef.current) fetchData(force, retryAttempt + 1);
          }, delay);
          return;
        }

        // Set error
        let errorMessage = 'Failed to load data';
        if (fetchError.name === 'AbortError' || fetchError.name === 'TimeoutError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (fetchError.message?.includes('Failed to fetch') || fetchError.message?.includes('NetworkError')) {
          errorMessage = 'Unable to connect to server. Please check your connection.';
        } else if (fetchError.message) {
          errorMessage = fetchError.message;
        }

        setError(errorMessage);
        callbacksRef.current.onError?.(new Error(errorMessage));
      } finally {
        if (requestGen === requestGenRef.current) {
          setLoading(false);
          setIsRefreshing(false);
          loadingRef.current = false;
        }
      }
    } catch (err) {
      if (requestGen !== requestGenRef.current) return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setLoading(false);
      setIsRefreshing(false);
      loadingRef.current = false;
      callbacksRef.current.onError?.(new Error(errorMessage));
    }
  }, [cacheKey, cacheMaxAge, timeout, retry, retryDelay]);

  // Initial load - deferred for instant render
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const loadData = () => {
      if (!cancelled) fetchData(false, 0);
    };

    // Defer initial load to allow page to render first
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 100 });
    } else {
      setTimeout(loadData, 50);
    }
    return () => { cancelled = true; };
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

  // Invalidate queued work and publication on unmount (including StrictMode cleanup).
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      ++requestGenRef.current;
      loadingRef.current = false;
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
