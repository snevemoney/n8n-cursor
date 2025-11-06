// LightningFlow AI Contracts Utilities
// Common utility functions for working with contracts

import { DateTime } from 'luxon';
import Decimal from 'decimal.js';

// Currency utilities
export class CurrencyUtils {
  // Convert satoshis to BTC
  static satsToBtc(sats: number): string {
    const decimal = new Decimal(sats).div(100000000);
    return decimal.toFixed(8);
  }

  // Convert BTC to satoshis
  static btcToSats(btc: string | number): number {
    const decimal = new Decimal(btc).mul(100000000);
    return decimal.toNumber();
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
    return new Decimal(a).add(b).toNumber();
  }

  // Subtract satoshis (safe math)
  static subtractSats(a: number, b: number): number {
    return new Decimal(a).sub(b).toNumber();
  }

  // Multiply satoshis (safe math)
  static multiplySats(amount: number, multiplier: number): number {
    return new Decimal(amount).mul(multiplier).toNumber();
  }

  // Divide satoshis (safe math)
  static divideSats(amount: number, divisor: number): number {
    return new Decimal(amount).div(divisor).toNumber();
  }
}

// Time utilities
export class TimeUtils {
  // Get current UTC timestamp
  static now(): string {
    return DateTime.utc().toISO();
  }

  // Parse timestamp to DateTime
  static parse(timestamp: string): DateTime {
    return DateTime.fromISO(timestamp, { zone: 'utc' });
  }

  // Format timestamp for display
  static format(timestamp: string, format: string = 'yyyy-MM-dd HH:mm:ss'): string {
    return this.parse(timestamp).toFormat(format);
  }

  // Check if timestamp is valid
  static isValid(timestamp: string): boolean {
    return this.parse(timestamp).isValid;
  }

  // Add duration to timestamp
  static add(timestamp: string, duration: string): string {
    return this.parse(timestamp).plus({ [duration]: 1 }).toISO();
  }

  // Subtract duration from timestamp
  static subtract(timestamp: string, duration: string): string {
    return this.parse(timestamp).minus({ [duration]: 1 }).toISO();
  }

  // Get time difference in seconds
  static diffInSeconds(start: string, end: string): number {
    return this.parse(end).diff(this.parse(start), 'seconds').seconds;
  }

  // Get time difference in minutes
  static diffInMinutes(start: string, end: string): number {
    return this.parse(end).diff(this.parse(start), 'minutes').minutes;
  }

  // Get time difference in hours
  static diffInHours(start: string, end: string): number {
    return this.parse(end).diff(this.parse(start), 'hours').hours;
  }

  // Get time difference in days
  static diffInDays(start: string, end: string): number {
    return this.parse(end).diff(this.parse(start), 'days').days;
  }

  // Check if timestamp is in the past
  static isPast(timestamp: string): boolean {
    return this.parse(timestamp) < DateTime.utc();
  }

  // Check if timestamp is in the future
  static isFuture(timestamp: string): boolean {
    return this.parse(timestamp) > DateTime.utc();
  }

  // Get relative time (e.g., "2 hours ago")
  static relative(timestamp: string): string {
    return this.parse(timestamp).toRelative() || '';
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
      return DateTime.now().setZone(timezone).isValid;
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
  static deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  }

  // Check if value is an object
  static isObject(item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Get nested property value
  static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Set nested property value
  static setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Remove undefined values
  static removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const result: Partial<T> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key as keyof T] = value;
      }
    }
    return result;
  }

  // Pick specific properties
  static pick<T extends Record<string, any>, K extends keyof T>(
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
  static omit<T extends Record<string, any>, K extends keyof T>(
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
  static groupBy<T extends Record<string, any>, K extends keyof T>(
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
  static sortBy<T extends Record<string, any>, K extends keyof T>(
    array: T[],
    key: K,
    direction: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
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
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export all utility classes
export {
  CurrencyUtils,
  TimeUtils,
  UuidUtils,
  ValidationUtils,
  StringUtils,
  ObjectUtils,
  ArrayUtils
};








