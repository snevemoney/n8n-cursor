// Shared utility functions for LightningFlow AI and n8n-cursor

// Date utilities
export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return date.toISOString();
    default:
      return date.toLocaleDateString();
  }
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

// Number utilities
export function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}

export function formatBTC(sats: number): string {
  const btc = sats / 100000000;
  return `${btc.toFixed(8)} BTC`;
}

export function formatCurrency(amount: number, currency: 'USD' | 'EUR' = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// String utilities
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidLightningInvoice(invoice: string): boolean {
  // Basic Lightning invoice validation (starts with 'lnbc' or 'lntb')
  return /^ln(bc|tb)[a-zA-Z0-9]+$/.test(invoice);
}

// Error handling
export function createError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

export function isAPIError(error: any): error is { code: string; message: string } {
  return error && typeof error.code === 'string' && typeof error.message === 'string';
}

// Retry utilities
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// UUID generation (simple, not cryptographically secure)
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Deep clone utility
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}
