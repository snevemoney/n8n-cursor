"use strict";
// LightningFlow AI Contracts Utilities
// Common utility functions for working with contracts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUtils = exports.ObjectUtils = exports.StringUtils = exports.ValidationUtils = exports.UuidUtils = exports.TimeUtils = exports.CurrencyUtils = void 0;
const luxon_1 = require("luxon");
const decimal_js_1 = __importDefault(require("decimal.js"));
// Currency utilities
class CurrencyUtils {
    // Convert satoshis to BTC
    static satsToBtc(sats) {
        const decimal = new decimal_js_1.default(sats).div(100000000);
        return decimal.toFixed(8);
    }
    // Convert BTC to satoshis
    static btcToSats(btc) {
        const decimal = new decimal_js_1.default(btc).mul(100000000);
        return decimal.toNumber();
    }
    // Format satoshis for display
    static formatSats(sats, showUnit = true) {
        const formatted = sats.toLocaleString();
        return showUnit ? `${formatted} sats` : formatted;
    }
    // Validate satoshi amount
    static isValidSats(amount) {
        return Number.isInteger(amount) && amount >= 0;
    }
    // Add satoshis (safe math)
    static addSats(a, b) {
        return new decimal_js_1.default(a).add(b).toNumber();
    }
    // Subtract satoshis (safe math)
    static subtractSats(a, b) {
        return new decimal_js_1.default(a).sub(b).toNumber();
    }
    // Multiply satoshis (safe math)
    static multiplySats(amount, multiplier) {
        return new decimal_js_1.default(amount).mul(multiplier).toNumber();
    }
    // Divide satoshis (safe math)
    static divideSats(amount, divisor) {
        return new decimal_js_1.default(amount).div(divisor).toNumber();
    }
}
exports.CurrencyUtils = CurrencyUtils;
// Time utilities
class TimeUtils {
    // Get current UTC timestamp
    static now() {
        return luxon_1.DateTime.utc().toISO();
    }
    // Parse timestamp to DateTime
    static parse(timestamp) {
        return luxon_1.DateTime.fromISO(timestamp, { zone: 'utc' });
    }
    // Format timestamp for display
    static format(timestamp, format = 'yyyy-MM-dd HH:mm:ss') {
        return this.parse(timestamp).toFormat(format);
    }
    // Check if timestamp is valid
    static isValid(timestamp) {
        return this.parse(timestamp).isValid;
    }
    // Add duration to timestamp
    static add(timestamp, duration) {
        return this.parse(timestamp).plus({ [duration]: 1 }).toISO();
    }
    // Subtract duration from timestamp
    static subtract(timestamp, duration) {
        return this.parse(timestamp).minus({ [duration]: 1 }).toISO();
    }
    // Get time difference in seconds
    static diffInSeconds(start, end) {
        return this.parse(end).diff(this.parse(start), 'seconds').seconds;
    }
    // Get time difference in minutes
    static diffInMinutes(start, end) {
        return this.parse(end).diff(this.parse(start), 'minutes').minutes;
    }
    // Get time difference in hours
    static diffInHours(start, end) {
        return this.parse(end).diff(this.parse(start), 'hours').hours;
    }
    // Get time difference in days
    static diffInDays(start, end) {
        return this.parse(end).diff(this.parse(start), 'days').days;
    }
    // Check if timestamp is in the past
    static isPast(timestamp) {
        return this.parse(timestamp) < luxon_1.DateTime.utc();
    }
    // Check if timestamp is in the future
    static isFuture(timestamp) {
        return this.parse(timestamp) > luxon_1.DateTime.utc();
    }
    // Get relative time (e.g., "2 hours ago")
    static relative(timestamp) {
        return this.parse(timestamp).toRelative() || '';
    }
}
exports.TimeUtils = TimeUtils;
// UUID utilities
class UuidUtils {
    // Generate a new UUID v4
    static generate() {
        return crypto.randomUUID();
    }
    // Validate UUID format
    static isValid(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    // Extract timestamp from UUID (if available)
    static getTimestamp(uuid) {
        if (!this.isValid(uuid)) {
            return null;
        }
        // This is a simplified implementation
        // Real UUID timestamp extraction would depend on the UUID version
        return null;
    }
}
exports.UuidUtils = UuidUtils;
// Validation utilities
class ValidationUtils {
    // Validate email format
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Validate URL format
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    // Validate Lightning invoice format
    static isValidLightningInvoice(invoice) {
        return invoice.startsWith('lnbc') && invoice.length > 20;
    }
    // Validate Lightning node pubkey
    static isValidNodePubkey(pubkey) {
        const pubkeyRegex = /^[0-9a-f]{66}$/i;
        return pubkeyRegex.test(pubkey);
    }
    // Validate pagination parameters
    static isValidPagination(page, limit) {
        return Number.isInteger(page) && page >= 1 &&
            Number.isInteger(limit) && limit >= 1 && limit <= 100;
    }
    // Validate feature flag name
    static isValidFeatureFlagName(name) {
        const flagNameRegex = /^[A-Z_]+$/;
        return flagNameRegex.test(name);
    }
    // Validate error code format
    static isValidErrorCode(code) {
        const errorCodeRegex = /^LFAI-[0-9]{4}$/;
        return errorCodeRegex.test(code);
    }
    // Validate timezone
    static isValidTimezone(timezone) {
        try {
            return luxon_1.DateTime.now().setZone(timezone).isValid;
        }
        catch {
            return false;
        }
    }
    // Validate subscription tier
    static isValidSubscriptionTier(tier) {
        return ['free', 'pro', 'enterprise'].includes(tier);
    }
    // Validate payment status
    static isValidPaymentStatus(status) {
        return ['pending', 'completed', 'failed', 'cancelled'].includes(status);
    }
    // Validate agent type
    static isValidAgentType(type) {
        return ['research', 'content', 'automation', 'analysis'].includes(type);
    }
    // Validate agent status
    static isValidAgentStatus(status) {
        return ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(status);
    }
    // Validate health status
    static isValidHealthStatus(status) {
        return ['healthy', 'degraded', 'unhealthy'].includes(status);
    }
    // Validate environment
    static isValidEnvironment(env) {
        return ['int', 'staging', 'prod'].includes(env);
    }
}
exports.ValidationUtils = ValidationUtils;
// String utilities
class StringUtils {
    // Convert string to kebab-case
    static toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/[\s_]+/g, '-')
            .toLowerCase();
    }
    // Convert string to camelCase
    static toCamelCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
            .replace(/\s+/g, '');
    }
    // Convert string to PascalCase
    static toPascalCase(str) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
            return word.toUpperCase();
        })
            .replace(/\s+/g, '');
    }
    // Convert string to snake_case
    static toSnakeCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .replace(/[\s-]+/g, '_')
            .toLowerCase();
    }
    // Truncate string to specified length
    static truncate(str, length, suffix = '...') {
        if (str.length <= length) {
            return str;
        }
        return str.substring(0, length - suffix.length) + suffix;
    }
    // Capitalize first letter
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    // Remove extra whitespace
    static normalizeWhitespace(str) {
        return str.replace(/\s+/g, ' ').trim();
    }
    // Generate random string
    static random(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.StringUtils = StringUtils;
// Object utilities
class ObjectUtils {
    // Deep clone object
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    // Deep merge objects
    static deepMerge(target, ...sources) {
        if (!sources.length)
            return target;
        const source = sources.shift();
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key])
                        Object.assign(target, { [key]: {} });
                    this.deepMerge(target[key], source[key]);
                }
                else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return this.deepMerge(target, ...sources);
    }
    // Check if value is an object
    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
    // Get nested property value
    static getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    // Set nested property value
    static setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key])
                current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }
    // Remove undefined values
    static removeUndefined(obj) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                result[key] = value;
            }
        }
        return result;
    }
    // Pick specific properties
    static pick(obj, keys) {
        const result = {};
        for (const key of keys) {
            if (key in obj) {
                result[key] = obj[key];
            }
        }
        return result;
    }
    // Omit specific properties
    static omit(obj, keys) {
        const result = { ...obj };
        for (const key of keys) {
            delete result[key];
        }
        return result;
    }
}
exports.ObjectUtils = ObjectUtils;
// Array utilities
class ArrayUtils {
    // Remove duplicates from array
    static unique(array) {
        return [...new Set(array)];
    }
    // Group array by key
    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = String(item[key]);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(item);
            return groups;
        }, {});
    }
    // Sort array by key
    static sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal)
                return direction === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    // Chunk array into smaller arrays
    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    // Flatten nested arrays
    static flatten(array) {
        return array.reduce((flat, item) => {
            return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
        }, []);
    }
    // Get random item from array
    static random(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    // Shuffle array
    static shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
exports.ArrayUtils = ArrayUtils;
//# sourceMappingURL=utils.js.map