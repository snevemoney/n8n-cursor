'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataFetchOptions {
  retry?: number;
  retryDelay?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDataFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseDataFetchOptions = {}
): UseDataFetchResult<T> {
  const {
    retry = 0,
    retryDelay = 1000,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      setData(result);
      retryCountRef.current = 0;
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current += 1;
        setTimeout(() => {
          if (!abortController.signal.aborted) {
            fetchData();
          }
        }, retryDelay);
      } else {
        retryCountRef.current = 0;
        if (onError) {
          onError(error);
        }
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFn, retry, retryDelay, onSuccess, onError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }

    // Cleanup: abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled, fetchData]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

