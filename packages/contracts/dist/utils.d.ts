import { DateTime } from 'luxon';
export declare class CurrencyUtils {
    static satsToBtc(sats: number): string;
    static btcToSats(btc: string | number): number;
    static formatSats(sats: number, showUnit?: boolean): string;
    static isValidSats(amount: number): boolean;
    static addSats(a: number, b: number): number;
    static subtractSats(a: number, b: number): number;
    static multiplySats(amount: number, multiplier: number): number;
    static divideSats(amount: number, divisor: number): number;
}
export declare class TimeUtils {
    static now(): string;
    static parse(timestamp: string): DateTime;
    static format(timestamp: string, format?: string): string;
    static isValid(timestamp: string): boolean;
    static add(timestamp: string, duration: string): string;
    static subtract(timestamp: string, duration: string): string;
    static diffInSeconds(start: string, end: string): number;
    static diffInMinutes(start: string, end: string): number;
    static diffInHours(start: string, end: string): number;
    static diffInDays(start: string, end: string): number;
    static isPast(timestamp: string): boolean;
    static isFuture(timestamp: string): boolean;
    static relative(timestamp: string): string;
}
export declare class UuidUtils {
    static generate(): string;
    static isValid(uuid: string): boolean;
    static getTimestamp(uuid: string): Date | null;
}
export declare class ValidationUtils {
    static isValidEmail(email: string): boolean;
    static isValidUrl(url: string): boolean;
    static isValidLightningInvoice(invoice: string): boolean;
    static isValidNodePubkey(pubkey: string): boolean;
    static isValidPagination(page: number, limit: number): boolean;
    static isValidFeatureFlagName(name: string): boolean;
    static isValidErrorCode(code: string): boolean;
    static isValidTimezone(timezone: string): boolean;
    static isValidSubscriptionTier(tier: string): boolean;
    static isValidPaymentStatus(status: string): boolean;
    static isValidAgentType(type: string): boolean;
    static isValidAgentStatus(status: string): boolean;
    static isValidHealthStatus(status: string): boolean;
    static isValidEnvironment(env: string): boolean;
}
export declare class StringUtils {
    static toKebabCase(str: string): string;
    static toCamelCase(str: string): string;
    static toPascalCase(str: string): string;
    static toSnakeCase(str: string): string;
    static truncate(str: string, length: number, suffix?: string): string;
    static capitalize(str: string): string;
    static normalizeWhitespace(str: string): string;
    static random(length?: number): string;
}
export declare class ObjectUtils {
    static deepClone<T>(obj: T): T;
    static deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T;
    static isObject(item: any): boolean;
    static getNestedProperty(obj: any, path: string): any;
    static setNestedProperty(obj: any, path: string, value: any): void;
    static removeUndefined<T extends Record<string, any>>(obj: T): Partial<T>;
    static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
    static omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
}
export declare class ArrayUtils {
    static unique<T>(array: T[]): T[];
    static groupBy<T extends Record<string, any>, K extends keyof T>(array: T[], key: K): Record<string, T[]>;
    static sortBy<T extends Record<string, any>, K extends keyof T>(array: T[], key: K, direction?: 'asc' | 'desc'): T[];
    static chunk<T>(array: T[], size: number): T[][];
    static flatten<T>(array: (T | T[])[]): T[];
    static random<T>(array: T[]): T | undefined;
    static shuffle<T>(array: T[]): T[];
}
export { CurrencyUtils, TimeUtils, UuidUtils, ValidationUtils, StringUtils, ObjectUtils, ArrayUtils };
//# sourceMappingURL=utils.d.ts.map