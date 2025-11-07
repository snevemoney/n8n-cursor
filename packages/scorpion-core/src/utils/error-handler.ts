/**
 * Comprehensive Error Handler
 * Centralized error handling to prevent system failures
 */

export class ScorpionError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, any>,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'ScorpionError';
  }
}

export class SafeGuard {
  /**
   * Safely execute a function with error handling
   */
  static async safe<T>(
    fn: () => Promise<T>,
    options: {
      fallback?: T;
      errorMessage?: string;
      logError?: boolean;
      onError?: (error: Error) => void;
    } = {}
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error: any) {
      const message = options.errorMessage || `Operation failed: ${error.message}`;
      
      if (options.logError !== false) {
        console.error(`❌ ${message}`, {
          error: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
      }

      if (options.onError) {
        try {
          options.onError(error);
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError);
        }
      }

      return options.fallback;
    }
  }

  /**
   * Safely execute a synchronous function
   */
  static safeSync<T>(
    fn: () => T,
    options: {
      fallback?: T;
      errorMessage?: string;
      logError?: boolean;
    } = {}
  ): T | undefined {
    try {
      return fn();
    } catch (error: any) {
      const message = options.errorMessage || `Operation failed: ${error.message}`;
      
      if (options.logError !== false) {
        console.error(`❌ ${message}`, error.message);
      }

      return options.fallback;
    }
  }

  /**
   * Validate required environment variables
   */
  static validateEnv(vars: string[]): { valid: boolean; missing: string[] } {
    const missing = vars.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Safe JSON parse with fallback
   */
  static parseJSON<T = any>(
    json: string,
    fallback: T | null = null
  ): T | null {
    return this.safeSync(
      () => JSON.parse(json),
      {
        fallback,
        errorMessage: 'JSON parse failed',
        logError: false
      }
    );
  }

  /**
   * Safe file read with validation
   */
  static async safeReadFile(
    filePath: string,
    options: {
      encoding?: BufferEncoding;
      fallback?: string;
      validateJSON?: boolean;
    } = {}
  ): Promise<string | undefined> {
    const fs = await import('fs/promises');
    
    return this.safe(
      async () => {
        const content = await fs.readFile(filePath, options.encoding || 'utf-8');
        
        // Validate JSON if requested
        if (options.validateJSON) {
          JSON.parse(content); // Will throw if invalid
        }
        
        return content;
      },
      {
        fallback: options.fallback,
        errorMessage: `Failed to read file: ${filePath}`
      }
    );
  }

  /**
   * Safe API request with retry logic
   */
  static async safeRequest<T>(
    url: string,
    options: RequestInit & {
      retries?: number;
      retryDelay?: number;
      validateStatus?: (status: number) => boolean;
    } = {}
  ): Promise<{ data?: T; error?: string; status?: number }> {
    const {
      retries = 3,
      retryDelay = 1000,
      validateStatus = (status) => status >= 200 && status < 300,
      ...fetchOptions
    } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        
        if (!validateStatus(response.status)) {
          const errorText = await response.text().catch(() => 'Unknown error');
          
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
            continue;
          }
          
          return {
            error: `HTTP ${response.status}: ${errorText}`,
            status: response.status
          };
        }

        const data = await response.json();
        return { data, status: response.status };
      } catch (error: any) {
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }
        
        return { error: error.message };
      }
    }

    return { error: 'Max retries exceeded' };
  }

  /**
   * Create a safe wrapper for any async function
   */
  static wrapAsync<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    defaultValue: R
  ): (...args: T) => Promise<R> {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error: any) {
        console.error(`❌ Wrapped function failed:`, error.message);
        return defaultValue;
      }
    };
  }

  /**
   * Batch process with error tolerance
   */
  static async safeBatch<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    options: {
      concurrency?: number;
      continueOnError?: boolean;
      onItemError?: (item: T, error: Error) => void;
    } = {}
  ): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> {
    const {
      concurrency = 5,
      continueOnError = true,
      onItemError
    } = options;

    const results: R[] = [];
    const errors: Array<{ item: T; error: Error }> = [];

    // Process in batches
    for (let i = 0; i < items.length; i += concurrency) {
      const batch = items.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          try {
            const result = await processor(item);
            return { success: true as const, result };
          } catch (error: any) {
            if (onItemError) {
              try {
                onItemError(item, error);
              } catch (cbError) {
                console.error('Error in item error callback:', cbError);
              }
            }
            
            if (!continueOnError) {
              throw error;
            }
            
            return { success: false as const, item, error };
          }
        })
      );

      batchResults.forEach(result => {
        if (result.success) {
          results.push(result.result);
        } else {
          errors.push({ item: result.item, error: result.error });
        }
      });
    }

    return { results, errors };
  }
}

/**
 * Decorator for safe method execution (for class methods)
 */
export function Safe(fallback?: any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error: any) {
        console.error(`❌ ${target.constructor.name}.${propertyKey} failed:`, error.message);
        return fallback;
      }
    };

    return descriptor;
  };
}

