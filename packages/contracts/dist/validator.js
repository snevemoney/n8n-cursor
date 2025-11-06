"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.ValidationError = exports.ajv = void 0;
exports.validate = validate;
exports.validateOrThrow = validateOrThrow;
exports.validateSatoshis = validateSatoshis;
exports.validateDecimalAmount = validateDecimalAmount;
exports.validateUTCTimestamp = validateUTCTimestamp;
exports.validateTimezone = validateTimezone;
exports.validateUUID = validateUUID;
exports.validateLightningInvoice = validateLightningInvoice;
exports.validateNodePubkey = validateNodePubkey;
exports.validateEmail = validateEmail;
exports.validatePagination = validatePagination;
exports.validateFeatureFlagName = validateFeatureFlagName;
exports.validateErrorCode = validateErrorCode;
// AJV validator setup for LightningFlow AI contracts
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const luxon_1 = require("luxon");
const decimal_js_1 = __importDefault(require("decimal.js"));
// Configure AJV with formats and custom keywords
exports.ajv = (0, ajv_formats_1.default)(new ajv_1.default({
    allErrors: true,
    strict: false,
    verbose: true,
    removeAdditional: false
}));
// Add custom format validators
exports.ajv.addFormat('date-time-utc', {
    type: 'string',
    validate: (data) => {
        try {
            const dt = luxon_1.DateTime.fromISO(data);
            return dt.isValid && dt.zoneName === 'UTC';
        }
        catch {
            return false;
        }
    }
});
exports.ajv.addFormat('satoshis', {
    type: 'number',
    validate: (data) => {
        return Number.isInteger(data) && data >= 0;
    }
});
exports.ajv.addFormat('uuid-v4', {
    type: 'string',
    validate: (data) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(data);
    }
});
exports.ajv.addFormat('lightning-invoice', {
    type: 'string',
    validate: (data) => {
        // Basic Lightning invoice validation (starts with lnbc)
        return data.startsWith('lnbc') && data.length > 20;
    }
});
exports.ajv.addFormat('node-pubkey', {
    type: 'string',
    validate: (data) => {
        // Lightning node pubkey validation (66 hex characters)
        const pubkeyRegex = /^[0-9a-f]{66}$/i;
        return pubkeyRegex.test(data);
    }
});
// Add custom keywords
exports.ajv.addKeyword({
    keyword: 'currency',
    type: 'number',
    validate: (schema, data) => {
        if (schema === 'sats') {
            return Number.isInteger(data) && data >= 0;
        }
        return true;
    }
});
exports.ajv.addKeyword({
    keyword: 'timezone',
    type: 'string',
    validate: (schema, data) => {
        try {
            return luxon_1.DateTime.now().setZone(data).isValid;
        }
        catch {
            return false;
        }
    }
});
// Generic validation function
function validate(schema, data) {
    const validate = exports.ajv.compile(schema);
    const valid = validate(data);
    return {
        valid,
        errors: valid ? undefined : validate.errors || []
    };
}
// Validation error class
class ValidationError extends Error {
    constructor(message, errors, data) {
        super(message);
        this.name = 'ValidationError';
        this.errors = errors;
        this.data = data;
    }
    toString() {
        return `${this.message}\n${this.errors?.map(e => `  ${e.instancePath}: ${e.message}`).join('\n') || ''}`;
    }
}
exports.ValidationError = ValidationError;
// Utility function to validate and throw on error
function validateOrThrow(schema, data, context) {
    const result = validate(schema, data);
    if (!result.valid) {
        const message = context ? `Validation failed for ${context}` : 'Validation failed';
        throw new ValidationError(message, result.errors, data);
    }
    return data;
}
// Currency validation utilities
function validateSatoshis(amount) {
    return Number.isInteger(amount) && amount >= 0;
}
function validateDecimalAmount(amount) {
    try {
        const decimal = new decimal_js_1.default(amount);
        return decimal.gte(0) && decimal.isFinite();
    }
    catch {
        return false;
    }
}
// Time validation utilities
function validateUTCTimestamp(timestamp) {
    try {
        const dt = luxon_1.DateTime.fromISO(timestamp);
        return dt.isValid && dt.zoneName === 'UTC';
    }
    catch {
        return false;
    }
}
function validateTimezone(timezone) {
    try {
        return luxon_1.DateTime.now().setZone(timezone).isValid;
    }
    catch {
        return false;
    }
}
// UUID validation utilities
function validateUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
// Lightning Network validation utilities
function validateLightningInvoice(invoice) {
    return invoice.startsWith('lnbc') && invoice.length > 20;
}
function validateNodePubkey(pubkey) {
    const pubkeyRegex = /^[0-9a-f]{66}$/i;
    return pubkeyRegex.test(pubkey);
}
// Email validation utility
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Pagination validation utilities
function validatePagination(page, limit) {
    return Number.isInteger(page) && page >= 1 &&
        Number.isInteger(limit) && limit >= 1 && limit <= 100;
}
// Feature flag validation utilities
function validateFeatureFlagName(name) {
    const flagNameRegex = /^[A-Z_]+$/;
    return flagNameRegex.test(name);
}
// Error code validation utilities
function validateErrorCode(code) {
    const errorCodeRegex = /^LFAI-[0-9]{4}$/;
    return errorCodeRegex.test(code);
}
// Export commonly used schemas for validation
exports.commonSchemas = {
    uuid: { type: 'string', format: 'uuid-v4' },
    email: { type: 'string', format: 'email' },
    satoshis: { type: 'integer', minimum: 0, currency: 'sats' },
    timestamp: { type: 'string', format: 'date-time-utc' },
    timezone: { type: 'string', timezone: true },
    lightningInvoice: { type: 'string', format: 'lightning-invoice' },
    nodePubkey: { type: 'string', format: 'node-pubkey' },
    pagination: {
        type: 'object',
        properties: {
            page: { type: 'integer', minimum: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100 }
        },
        required: ['page', 'limit']
    }
};
//# sourceMappingURL=validator.js.map