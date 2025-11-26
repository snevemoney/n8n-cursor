/**
 * Fetch with timeout utility
 * Provides a safe, reusable pattern for fetch requests with timeout handling
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with automatic timeout handling
 * @param url - URL to fetch
 * @param options - Fetch options (timeout in ms, defaults to 5000)
 * @returns Promise<Response>
 * @throws Error with name 'AbortError' if timeout occurs
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Check if an error is a timeout/abort error
 */
export function isTimeoutError(error: any): boolean {
  return error?.name === 'AbortError' || 
         error?.message?.includes('aborted') ||
         error?.message?.includes('timeout');
}

