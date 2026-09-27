// LightningFlow AI Contracts Utilities
// Common utility functions for working with contracts

const SATS_PER_BTC = 100000000n;

const DURATION_MS: Record<string, number> = {
  millisecond: 1,
  milliseconds: 1,
  second: 1000,
  seconds: 1000,
  minute: 60 * 1000,
  minutes: 60 * 1000,
  hour: 60 * 60 * 1000,
  hours: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000
};

function formatUtc(date: Date, format: string): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const tokens: Record<string, string> = {
    yyyy: String(date.getUTCFullYear()),
    MM: pad(date.getUTCMonth() + 1),
    dd: pad(date.getUTCDate()),
    HH: pad(date.getUTCHours()),
    mm: pad(date.getUTCMinutes()),
    ss: pad(date.getUTCSeconds())
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (token) => tokens[token] ?? token);
}

function shiftTimestamp(timestamp: string, duration: string, sign: 1 | -1): string {
  const date = new Date(timestamp);
  const unit = DURATION_MS[duration];
  if (unit === undefined || Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return new Date(date.getTime() + sign * unit).toISOString();
}

// Currency utilities
export class CurrencyUtils {
  // Convert satoshis to BTC
  static satsToBtc(sats: number): string {
    const negative = sats < 0;
    const abs = BigInt(Math.trunc(Math.abs(sats)));
    const whole = abs / SATS_PER_BTC;
    const fraction = (abs % SATS_PER_BTC).toString().padStart(8, '0');
    return `${negative ? '-' : ''}${whole.toString()}.${fraction}`;
  }

  // Convert BTC to satoshis
  static btcToSats(btc: string | number): number {
    const text = String(btc).trim();
    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(text)) {
      throw new Error(`Invalid BTC amount: ${text}`);
    }
    const negative = text.startsWith('-');
    const unsigned = text.replace(/^[+-]/, '');
    const [whole = '0', fraction = ''] = unsigned.split('.');
    const wholeDigits = whole.length > 0 ? whole : '0';
    const padded = `${fraction}00000000`.slice(0, 8);
    const sats = BigInt(wholeDigits) * SATS_PER_BTC + BigInt(padded);
    const value = Number(sats);
    return negative ? -value : value;
  }

  // Format satoshis for display
  static formatSats(sats: number, showUnit: boolean = true): string {
    const formatted = sats.toLocaleString();
    return showUnit ? `${formatted} sats` : formatted;
  }

  // Validate satoshi amount
  static isValidSats(amount: number): boolean {
    return Number.isInteger(amount) && amount >= 0;
  }

  // Add satoshis (safe math)
  static addSats(a: number, b: number): number {
    return a + b;
  }

  // Subtract satoshis (safe math)
  static subtractSats(a: number, b: number): number {
    return a - b;
  }

  // Multiply satoshis (safe math)
  static multiplySats(amount: number, multiplier: number): number {
    return amount * multiplier;
  }

  // Divide satoshis (safe math)
  static divideSats(amount: number, divisor: number): number {
    return amount / divisor;
  }
}

// Time utilities
export class TimeUtils {
  // Get current UTC timestamp
  static now(): string {
    return new Date().toISOString();
  }

  // Parse timestamp
  static parse(timestamp: string): Date {
    return new Date(timestamp);
  }

  // Format timestamp for display
  static format(timestamp: string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const date = this.parse(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return formatUtc(date, format);
  }

  // Check if timestamp is valid
  static isValid(timestamp: string): boolean {
    return !Number.isNaN(this.parse(timestamp).getTime());
  }

  // Add duration to timestamp
  static add(timestamp: string, duration: string): string {
    return shiftTimestamp(timestamp, duration, 1);
  }

  // Subtract duration from timestamp
  static subtract(timestamp: string, duration: string): string {
    return shiftTimestamp(timestamp, duration, -1);
  }

  // Get time difference in seconds
  static diffInSeconds(start: string, end: string): number {
    return (this.parse(end).getTime() - this.parse(start).getTime()) / 1000;
  }

  // Get time difference in minutes
  static diffInMinutes(start: string, end: string): number {
    return this.diffInSeconds(start, end) / 60;
  }

  // Get time difference in hours
  static diffInHours(start: string, end: string): number {
    return this.diffInMinutes(start, end) / 60;
  }

  // Get time difference in days
  static diffInDays(start: string, end: string): number {
    return this.diffInHours(start, end) / 24;
  }

  // Check if timestamp is in the past
  static isPast(timestamp: string): boolean {
    return this.parse(timestamp).getTime() < Date.now();
  }

  // Check if timestamp is in the future
  static isFuture(timestamp: string): boolean {
    return this.parse(timestamp).getTime() > Date.now();
  }

  // Get relative time (e.g., "2 hours ago")
  static relative(timestamp: string): string {
    const date = this.parse(timestamp);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const seconds = Math.round((date.getTime() - Date.now()) / 1000);
    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const absSeconds = Math.abs(seconds);
    if (absSeconds < 60) return formatter.format(seconds, 'second');
    const minutes = Math.round(seconds / 60);
    if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
    const days = Math.round(hours / 24);
    if (Math.abs(days) < 30) return formatter.format(days, 'day');
    const months = Math.round(days / 30);
    if (Math.abs(months) < 12) return formatter.format(months, 'month');
    return formatter.format(Math.round(months / 12), 'year');
  }
}

// UUID utilities
export class UuidUtils {
  // Generate a new UUID v4
  static generate(): string {
    return crypto.randomUUID();
  }

  // Validate UUID format
  static isValid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Extract timestamp from UUID (if available)
  static getTimestamp(uuid: string): Date | null {
    if (!this.isValid(uuid)) {
      return null;
    }
    
    // This is a simplified implementation
    // Real UUID timestamp extraction would depend on the UUID version
    return null;
  }
}

// Validation utilities
export class ValidationUtils {
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL format
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Validate Lightning invoice format
  static isValidLightningInvoice(invoice: string): boolean {
    return invoice.startsWith('lnbc') && invoice.length > 20;
  }

  // Validate Lightning node pubkey
  static isValidNodePubkey(pubkey: string): boolean {
    const pubkeyRegex = /^[0-9a-f]{66}$/i;
    return pubkeyRegex.test(pubkey);
  }

  // Validate pagination parameters
  static isValidPagination(page: number, limit: number): boolean {
    return Number.isInteger(page) && page >= 1 && 
           Number.isInteger(limit) && limit >= 1 && limit <= 100;
  }

  // Validate feature flag name
  static isValidFeatureFlagName(name: string): boolean {
    const flagNameRegex = /^[A-Z_]+$/;
    return flagNameRegex.test(name);
  }

  // Validate error code format
  static isValidErrorCode(code: string): boolean {
    const errorCodeRegex = /^LFAI-[0-9]{4}$/;
    return errorCodeRegex.test(code);
  }

  // Validate timezone
  static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat('en-US', { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  // Validate subscription tier
  static isValidSubscriptionTier(tier: string): boolean {
    return ['free', 'pro', 'enterprise'].includes(tier);
  }

  // Validate payment status
  static isValidPaymentStatus(status: string): boolean {
    return ['pending', 'completed', 'failed', 'cancelled'].includes(status);
  }

  // Validate agent type
  static isValidAgentType(type: string): boolean {
    return ['research', 'content', 'automation', 'analysis'].includes(type);
  }

  // Validate agent status
  static isValidAgentStatus(status: string): boolean {
    return ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status);
  }

  // Validate health status
  static isValidHealthStatus(status: string): boolean {
    return ['healthy', 'degraded', 'unhealthy'].includes(status);
  }

  // Validate environment
  static isValidEnvironment(env: string): boolean {
    return ['int', 'staging', 'prod'].includes(env);
  }
}

// String utilities
export class StringUtils {
  // Convert string to kebab-case
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  // Convert string to camelCase
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  // Convert string to PascalCase
  static toPascalCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
        return word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  // Convert string to snake_case
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  // Truncate string to specified length
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length - suffix.length) + suffix;
  }

  // Capitalize first letter
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Remove extra whitespace
  static normalizeWhitespace(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }

  // Generate random string
  static random(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Object utilities
export class ObjectUtils {
  // Deep clone object
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  // Deep merge objects
  static deepMerge<T extends Record<string, unknown>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      this.mergeInto(target, source);
    }

    return this.deepMerge(target, ...sources);
  }

  private static mergeInto(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key in source) {
      const sourceValue = source[key];
      if (this.isObject(sourceValue)) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        const nested = target[key];
        if (this.isObject(nested)) {
          this.mergeInto(nested, sourceValue);
        }
      } else {
        Object.assign(target, { [key]: sourceValue });
      }
    }
  }

  // Check if value is an object
  static isObject(item: unknown): item is Record<string, unknown> {
    return Boolean(item) && typeof item === 'object' && !Array.isArray(item);
  }

  // Get nested property value
  static getNestedProperty(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (typeof current !== 'object' || current === null) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
  }

  // Set nested property value
  static setNestedProperty(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (lastKey === undefined) return;
    const target = keys.reduce<Record<string, unknown>>((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key] as Record<string, unknown>;
    }, obj);
    target[lastKey] = value;
  }

  // Remove undefined values
  static removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key as keyof T] = value as T[keyof T];
      }
    }
    return result;
  }

  // Pick specific properties
  static pick<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  // Omit specific properties
  static omit<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  }
}

// Array utilities
export class ArrayUtils {
  // Remove duplicates from array
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  // Group array by key
  static groupBy<T extends Record<string, unknown>, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  // Sort array by key
  static sortBy<T extends Record<string, unknown>, K extends keyof T>(
    array: T[],
    key: K,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key] as string | number;
      const bVal = b[key] as string | number;

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Chunk array into smaller arrays
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Flatten nested arrays
  static flatten<T>(array: (T | T[])[]): T[] {
    return array.reduce<T[]>((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  }

  // Get random item from array
  static random<T>(array: T[]): T | undefined {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Shuffle array
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const left = shuffled[i];
      const right = shuffled[j];
      if (left === undefined || right === undefined) {
        continue;
      }
      shuffled[i] = right;
      shuffled[j] = left;
    }
    return shuffled;
  }
}








