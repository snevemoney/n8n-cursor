"use strict";
// LightningFlow AI Contracts - Validator Utilities
// Common validation utilities and helpers
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.validators = exports.ajv = void 0;
exports.validate = validate;
exports.createValidationMiddleware = createValidationMiddleware;
exports.validateRequest = validateRequest;
exports.validateResponse = validateResponse;
exports.compileSchema = compileSchema;
exports.isValidSchema = isValidSchema;
exports.formatValidationErrors = formatValidationErrors;
exports.mergeSchemas = mergeSchemas;
exports.resolveSchemaReferences = resolveSchemaReferences;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const ajv_errors_1 = __importDefault(require("ajv-errors"));
// Create configured Ajv instance
exports.ajv = (0, ajv_errors_1.default)((0, ajv_formats_1.default)(new ajv_1.default({
    allErrors: true,
    strict: false,
    verbose: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true
})));
exports.default = exports.ajv;
// Custom formats
exports.ajv.addFormat('uuid', {
    type: 'string',
    validate: (str) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    }
});
exports.ajv.addFormat('satoshi', {
    type: 'integer',
    validate: (value) => {
        return Number.isInteger(value) && value >= 1;
    }
});
exports.ajv.addFormat('payment-hash', {
    type: 'string',
    validate: (str) => {
        const hashRegex = /^[a-f0-9]{64}$/i;
        return hashRegex.test(str);
    }
});
exports.ajv.addFormat('preimage', {
    type: 'string',
    validate: (str) => {
        const preimageRegex = /^[a-f0-9]{64}$/i;
        return preimageRegex.test(str);
    }
});
// Generic validator function
function validate(schema, data, options = {}) {
    try {
        const validate = exports.ajv.compile(schema);
        const valid = validate(data);
        if (valid) {
            return {
                valid: true,
                data: data
            };
        }
        else {
            return {
                valid: false,
                errors: validate.errors || [],
                errorMessage: exports.ajv.errorsText(validate.errors)
            };
        }
    }
    catch (error) {
        return {
            valid: false,
            errorMessage: error instanceof Error ? error.message : 'Validation error'
        };
    }
}
// Validation middleware for Express
function createValidationMiddleware(schema) {
    return (req, res, next) => {
        const result = validate(schema, req.body);
        if (!result.valid) {
            return res.status(400).json({
                error: 'LFAI-0100',
                message: 'Invalid request parameters',
                details: result.errors,
                timestamp: new Date().toISOString()
            });
        }
        req.validatedData = result.data;
        next();
    };
}
// Request validation helper
function validateRequest(schema, data) {
    const result = validate(schema, data);
    if (result.valid) {
        return {
            success: true,
            data: result.data
        };
    }
    else {
        return {
            success: false,
            error: result.errorMessage || 'Validation failed',
            details: result.errors
        };
    }
}
// Response validation helper
function validateResponse(schema, data) {
    const result = validate(schema, data);
    if (result.valid) {
        return {
            success: true,
            data: result.data
        };
    }
    else {
        return {
            success: false,
            error: result.errorMessage || 'Response validation failed',
            details: result.errors
        };
    }
}
// Schema compilation helper
function compileSchema(schema) {
    try {
        return exports.ajv.compile(schema);
    }
    catch (error) {
        throw new Error(`Schema compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Schema validation helper
function isValidSchema(schema) {
    try {
        exports.ajv.compile(schema);
        return true;
    }
    catch {
        return false;
    }
}
// Custom validation functions
exports.validators = {
    // UUID validation
    isUUID: (value) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(value);
    },
    // Satoshi validation
    isSatoshi: (value) => {
        return Number.isInteger(value) && value >= 1;
    },
    // Payment hash validation
    isPaymentHash: (value) => {
        const hashRegex = /^[a-f0-9]{64}$/i;
        return hashRegex.test(value);
    },
    // Preimage validation
    isPreimage: (value) => {
        const preimageRegex = /^[a-f0-9]{64}$/i;
        return preimageRegex.test(value);
    },
    // Bitcoin address validation (basic)
    isBitcoinAddress: (value) => {
        // Basic validation - in production, use a proper Bitcoin address validator
        const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
        return addressRegex.test(value);
    },
    // Lightning invoice validation (basic)
    isLightningInvoice: (value) => {
        // Basic validation - in production, use a proper Lightning invoice validator
        return value.startsWith('lnbc') || value.startsWith('lntb') || value.startsWith('lnbcrt');
    },
    // Email validation
    isEmail: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    // URL validation
    isURL: (value) => {
        try {
            new URL(value);
            return true;
        }
        catch {
            return false;
        }
    },
    // ISO 8601 date validation
    isISO8601: (value) => {
        const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        return iso8601Regex.test(value) && !isNaN(Date.parse(value));
    },
    // Positive integer validation
    isPositiveInteger: (value) => {
        return Number.isInteger(value) && value > 0;
    },
    // Non-negative integer validation
    isNonNegativeInteger: (value) => {
        return Number.isInteger(value) && value >= 0;
    }
};
// Validation error formatter
function formatValidationErrors(errors) {
    return errors.map(error => {
        const path = error.instancePath || error.schemaPath;
        const message = error.message;
        return `${path}: ${message}`;
    }).join(', ');
}
// Schema merge helper
function mergeSchemas(...schemas) {
    return schemas.reduce((merged, schema) => {
        return {
            ...merged,
            ...schema,
            properties: {
                ...merged.properties,
                ...schema.properties
            },
            required: [
                ...(merged.required || []),
                ...(schema.required || [])
            ]
        };
    }, {});
}
// Schema reference resolver
function resolveSchemaReferences(schema, definitions) {
    if (typeof schema !== 'object' || schema === null) {
        return schema;
    }
    if (schema.$ref) {
        const refPath = schema.$ref.replace('#/', '').split('/');
        let resolved = definitions;
        for (const part of refPath) {
            resolved = resolved[part];
        }
        return resolveSchemaReferences(resolved, definitions);
    }
    const resolved = {};
    for (const [key, value] of Object.entries(schema)) {
        resolved[key] = resolveSchemaReferences(value, definitions);
    }
    return resolved;
}
//# sourceMappingURL=validators.js.map