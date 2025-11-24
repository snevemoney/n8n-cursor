'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDeferredDataOptions<T> {
  fetchFn: () => Promise<T>;
  enabled?: boolean;
  delay?: number; // Delay before fetching (for requestIdleCallback fallback)
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseDeferredDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for deferred data loading - renders page immediately, loads data after
 * Uses requestIdleCallback when available, falls back to setTimeout
 * 
 * Use this for pages that should render structure immediately and load data in background
 */
export function useDeferredData<T>(
  options: UseDeferredDataOptions<T>
): UseDeferredDataResult<T> {
  const {
    fetchFn,
    enabled = true,
    delay = 50,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false); // Always start false for instant render
  const [error, setError] = useState<Error | null>(null);
  
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!enabled || loadingRef.current) return;
    
    loadingRef.current = true;
    setError(null);
    
    // Only show loading on initial load
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await fetchFn();
      
      if (controller.signal.aborted) {
        loadingRef.current = false;
        return;
      }

      setData(result);
      hasLoadedOnceRef.current = true;
      loadingRef.current = false;
      setLoading(false);

      if (onSuccess) onSuccess(result);
    } catch (err) {
      if (controller.signal.aborted) {
        loadingRef.current = false;
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      loadingRef.current = false;
      setLoading(false);

      if (onError) onError(error);
    }
  }, [fetchFn, enabled, onSuccess, onError]);

  const refetch = useCallback(async () => {
    hasLoadedOnceRef.current = false;
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!enabled) return;

    // Defer initial load to allow page to render first
    const loadData = () => {
      fetchData();
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = requestIdleCallback(loadData, { timeout: delay });
      return () => cancelIdleCallback(id);
    } else {
      const timeoutId = setTimeout(loadData, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [enabled, fetchData, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

