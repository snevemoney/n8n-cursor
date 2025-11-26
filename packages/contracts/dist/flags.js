"use strict";
// LightningFlow AI Contracts - Feature Flag Types and Loader
// Generated from contracts/flags.schema.json
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagLoader = void 0;
exports.initializeFlags = initializeFlags;
exports.getFlags = getFlags;
exports.isFlagEnabled = isFlagEnabled;
exports.getFlagValue = getFlagValue;
exports.validateFlags = validateFlags;
exports.loadFlagsForEnvironment = loadFlagsForEnvironment;
exports.validateFlagSchema = validateFlagSchema;
// Flag loader class
class FlagLoader {
    constructor(environment = 'prod') {
        this.environment = environment;
        this.flags = this.loadFlags();
    }
    loadFlags() {
        // Load flags from environment variables
        const env = process.env;
        return {
            NEW_DASHBOARD: this.getBooleanFlag('NEXT_PUBLIC_FF_NEW_DASHBOARD', false),
            BITCOIN_LIGHTNING_INTEGRATION: this.getBooleanFlag('FF_BITCOIN_LIGHTNING_INTEGRATION', true),
            LNbits_WEBHOOK_VALIDATION: this.getBooleanFlag('FF_LNbits_WEBHOOK_VALIDATION', true),
            AGENT_AUTO_SCALING: this.getBooleanFlag('FF_AGENT_AUTO_SCALING', false),
            MAX_CONCURRENT_AGENTS: this.getNumberFlag('FF_MAX_CONCURRENT_AGENTS', 10),
            AGENT_TIMEOUT_MS: this.getNumberFlag('FF_AGENT_TIMEOUT_MS', 30000),
            ENABLE_METRICS_COLLECTION: this.getBooleanFlag('FF_ENABLE_METRICS_COLLECTION', true),
            METRICS_RETENTION_DAYS: this.getNumberFlag('FF_METRICS_RETENTION_DAYS', 30),
            ENABLE_DEBUG_LOGGING: this.getBooleanFlag('FF_ENABLE_DEBUG_LOGGING', false),
            LOG_LEVEL: this.getStringFlag('FF_LOG_LEVEL', 'info'),
            ENABLE_RATE_LIMITING: this.getBooleanFlag('FF_ENABLE_RATE_LIMITING', true),
            RATE_LIMIT_REQUESTS_PER_MINUTE: this.getNumberFlag('FF_RATE_LIMIT_REQUESTS_PER_MINUTE', 100),
            ENABLE_CORS: this.getBooleanFlag('FF_ENABLE_CORS', true),
            CORS_ORIGINS: this.getArrayFlag('FF_CORS_ORIGINS', ['https://lightningflow.online']),
            ENABLE_WEBHOOK_RETRY: this.getBooleanFlag('FF_ENABLE_WEBHOOK_RETRY', true),
            WEBHOOK_MAX_RETRIES: this.getNumberFlag('FF_WEBHOOK_MAX_RETRIES', 3),
            WEBHOOK_RETRY_DELAY_MS: this.getNumberFlag('FF_WEBHOOK_RETRY_DELAY_MS', 5000),
            ENABLE_DATABASE_POOLING: this.getBooleanFlag('FF_ENABLE_DATABASE_POOLING', true),
            DATABASE_POOL_SIZE: this.getNumberFlag('FF_DATABASE_POOL_SIZE', 10),
            ENABLE_REDIS_CACHING: this.getBooleanFlag('FF_ENABLE_REDIS_CACHING', true),
            REDIS_CACHE_TTL_SECONDS: this.getNumberFlag('FF_REDIS_CACHE_TTL_SECONDS', 3600),
            ENABLE_SECURITY_HEADERS: this.getBooleanFlag('FF_ENABLE_SECURITY_HEADERS', true),
            ENABLE_CSRF_PROTECTION: this.getBooleanFlag('FF_ENABLE_CSRF_PROTECTION', true),
            ENABLE_SQL_INJECTION_PROTECTION: this.getBooleanFlag('FF_ENABLE_SQL_INJECTION_PROTECTION', true),
            ENABLE_XSS_PROTECTION: this.getBooleanFlag('FF_ENABLE_XSS_PROTECTION', true),
            ENABLE_CONTENT_SECURITY_POLICY: this.getBooleanFlag('FF_ENABLE_CONTENT_SECURITY_POLICY', true),
            ENABLE_STRICT_TRANSPORT_SECURITY: this.getBooleanFlag('FF_ENABLE_STRICT_TRANSPORT_SECURITY', true),
            ENABLE_AGENT_MONITORING: this.getBooleanFlag('FF_ENABLE_AGENT_MONITORING', true),
            AGENT_HEALTH_CHECK_INTERVAL_MS: this.getNumberFlag('FF_AGENT_HEALTH_CHECK_INTERVAL_MS', 30000),
            ENABLE_AGENT_AUTO_RECOVERY: this.getBooleanFlag('FF_ENABLE_AGENT_AUTO_RECOVERY', true),
            AGENT_MAX_FAILURES: this.getNumberFlag('FF_AGENT_MAX_FAILURES', 5),
            ENABLE_BITCOIN_PRICE_TRACKING: this.getBooleanFlag('FF_ENABLE_BITCOIN_PRICE_TRACKING', true),
            BITCOIN_PRICE_UPDATE_INTERVAL_MS: this.getNumberFlag('FF_BITCOIN_PRICE_UPDATE_INTERVAL_MS', 60000),
            ENABLE_LIGHTNING_NETWORK_MONITORING: this.getBooleanFlag('FF_ENABLE_LIGHTNING_NETWORK_MONITORING', true),
            LIGHTNING_NETWORK_CHECK_INTERVAL_MS: this.getNumberFlag('FF_LIGHTNING_NETWORK_CHECK_INTERVAL_MS', 30000)
        };
    }
    getBooleanFlag(envVar, defaultValue) {
        const value = process.env[envVar];
        if (value === undefined)
            return defaultValue;
        return value.toLowerCase() === 'true';
    }
    getNumberFlag(envVar, defaultValue) {
        const value = process.env[envVar];
        if (value === undefined)
            return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }
    getStringFlag(envVar, defaultValue) {
        return process.env[envVar] || defaultValue;
    }
    getArrayFlag(envVar, defaultValue) {
        const value = process.env[envVar];
        if (value === undefined)
            return defaultValue;
        try {
            return JSON.parse(value);
        }
        catch {
            return value.split(',').map(s => s.trim());
        }
    }
    // Get all flags
    getFlags() {
        return { ...this.flags };
    }
    // Get a specific flag
    getFlag(key) {
        return this.flags[key];
    }
    // Check if a flag is enabled (for boolean flags)
    isEnabled(key) {
        if (typeof this.flags[key] !== 'boolean') {
            throw new Error(`Flag ${key} is not a boolean flag`);
        }
        return this.flags[key];
    }
    // Get flag value with type safety
    getValue(key) {
        return this.flags[key];
    }
    // Check if flag is sunset
    isSunset(key) {
        // This would need to be implemented based on the sunsetOn field
        // For now, return false
        return false;
    }
    // Get environment-specific flag value
    getEnvironmentValue(key, environment) {
        // This would need to be implemented based on the environments field
        // For now, return the current value
        return this.flags[key];
    }
    // Validate flags against schema
    validate() {
        const errors = [];
        // Validate boolean flags
        const booleanFlags = [
            'NEW_DASHBOARD',
            'BITCOIN_LIGHTNING_INTEGRATION',
            'LNbits_WEBHOOK_VALIDATION',
            'AGENT_AUTO_SCALING',
            'ENABLE_METRICS_COLLECTION',
            'ENABLE_DEBUG_LOGGING',
            'ENABLE_RATE_LIMITING',
            'ENABLE_CORS',
            'ENABLE_WEBHOOK_RETRY',
            'ENABLE_DATABASE_POOLING',
            'ENABLE_REDIS_CACHING',
            'ENABLE_SECURITY_HEADERS',
            'ENABLE_CSRF_PROTECTION',
            'ENABLE_SQL_INJECTION_PROTECTION',
            'ENABLE_XSS_PROTECTION',
            'ENABLE_CONTENT_SECURITY_POLICY',
            'ENABLE_STRICT_TRANSPORT_SECURITY',
            'ENABLE_AGENT_MONITORING',
            'ENABLE_AGENT_AUTO_RECOVERY',
            'ENABLE_BITCOIN_PRICE_TRACKING',
            'ENABLE_LIGHTNING_NETWORK_MONITORING'
        ];
        for (const flag of booleanFlags) {
            if (typeof this.flags[flag] !== 'boolean') {
                errors.push(`Flag ${flag} must be a boolean`);
            }
        }
        // Validate number flags
        const numberFlags = [
            'MAX_CONCURRENT_AGENTS',
            'AGENT_TIMEOUT_MS',
            'METRICS_RETENTION_DAYS',
            'RATE_LIMIT_REQUESTS_PER_MINUTE',
            'WEBHOOK_MAX_RETRIES',
            'WEBHOOK_RETRY_DELAY_MS',
            'DATABASE_POOL_SIZE',
            'REDIS_CACHE_TTL_SECONDS',
            'AGENT_HEALTH_CHECK_INTERVAL_MS',
            'AGENT_MAX_FAILURES',
            'BITCOIN_PRICE_UPDATE_INTERVAL_MS',
            'LIGHTNING_NETWORK_CHECK_INTERVAL_MS'
        ];
        for (const flag of numberFlags) {
            if (typeof this.flags[flag] !== 'number' || this.flags[flag] < 0) {
                errors.push(`Flag ${flag} must be a non-negative number`);
            }
        }
        // Validate string flags
        const stringFlags = ['LOG_LEVEL'];
        for (const flag of stringFlags) {
            if (typeof this.flags[flag] !== 'string') {
                errors.push(`Flag ${flag} must be a string`);
            }
        }
        // Validate array flags
        const arrayFlags = ['CORS_ORIGINS'];
        for (const flag of arrayFlags) {
            if (!Array.isArray(this.flags[flag])) {
                errors.push(`Flag ${flag} must be an array`);
            }
        }
        // Validate LOG_LEVEL enum
        if (!['debug', 'info', 'warn', 'error'].includes(this.flags.LOG_LEVEL)) {
            errors.push('LOG_LEVEL must be one of: debug, info, warn, error');
        }
        return {
            valid: errors.length === 0,
            ...(errors.length > 0 && { errors })
        };
    }
}
exports.FlagLoader = FlagLoader;
// Global flag loader instance
let globalFlagLoader = null;
// Initialize global flag loader
function initializeFlags(environment = 'prod') {
    globalFlagLoader = new FlagLoader(environment);
    return globalFlagLoader;
}
// Get global flag loader
function getFlags() {
    if (!globalFlagLoader) {
        globalFlagLoader = new FlagLoader();
    }
    return globalFlagLoader;
}
// Convenience functions
function isFlagEnabled(key) {
    return getFlags().isEnabled(key);
}
function getFlagValue(key) {
    return getFlags().getValue(key);
}
// Flag validation
function validateFlags() {
    return getFlags().validate();
}
// Environment-specific flag loading
function loadFlagsForEnvironment(environment) {
    const loader = new FlagLoader(environment);
    return loader.getFlags();
}
// Flag schema validation
function validateFlagSchema(flags) {
    const errors = [];
    // Check for unknown flags
    const knownFlags = new Set([
        'NEW_DASHBOARD',
        'BITCOIN_LIGHTNING_INTEGRATION',
        'LNbits_WEBHOOK_VALIDATION',
        'AGENT_AUTO_SCALING',
        'MAX_CONCURRENT_AGENTS',
        'AGENT_TIMEOUT_MS',
        'ENABLE_METRICS_COLLECTION',
        'METRICS_RETENTION_DAYS',
        'ENABLE_DEBUG_LOGGING',
        'LOG_LEVEL',
        'ENABLE_RATE_LIMITING',
        'RATE_LIMIT_REQUESTS_PER_MINUTE',
        'ENABLE_CORS',
        'CORS_ORIGINS',
        'ENABLE_WEBHOOK_RETRY',
        'WEBHOOK_MAX_RETRIES',
        'WEBHOOK_RETRY_DELAY_MS',
        'ENABLE_DATABASE_POOLING',
        'DATABASE_POOL_SIZE',
        'ENABLE_REDIS_CACHING',
        'REDIS_CACHE_TTL_SECONDS',
        'ENABLE_SECURITY_HEADERS',
        'ENABLE_CSRF_PROTECTION',
        'ENABLE_SQL_INJECTION_PROTECTION',
        'ENABLE_XSS_PROTECTION',
        'ENABLE_CONTENT_SECURITY_POLICY',
        'ENABLE_STRICT_TRANSPORT_SECURITY',
        'ENABLE_AGENT_MONITORING',
        'AGENT_HEALTH_CHECK_INTERVAL_MS',
        'ENABLE_AGENT_AUTO_RECOVERY',
        'AGENT_MAX_FAILURES',
        'ENABLE_BITCOIN_PRICE_TRACKING',
        'BITCOIN_PRICE_UPDATE_INTERVAL_MS',
        'ENABLE_LIGHTNING_NETWORK_MONITORING',
        'LIGHTNING_NETWORK_CHECK_INTERVAL_MS'
    ]);
    for (const key of Object.keys(flags)) {
        if (!knownFlags.has(key)) {
            errors.push(`Unknown flag: ${key}`);
        }
    }
    return {
        valid: errors.length === 0,
        ...(errors.length > 0 && { errors })
    };
}
//# sourceMappingURL=flags.js.map