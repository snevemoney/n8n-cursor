"use strict";
// LightningFlow AI OpenAPI Types
// Generated from contracts/openapi.yaml
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultApiConfig = exports.API_VERSION = exports.API_ENDPOINTS = exports.HTTP_STATUS = void 0;
exports.validateUser = validateUser;
exports.validatePayment = validatePayment;
exports.validatePagination = validatePagination;
exports.isErrorResponse = isErrorResponse;
exports.isSuccessResponse = isSuccessResponse;
// HTTP Status codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    RATE_LIMITED: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};
// API endpoints
exports.API_ENDPOINTS = {
    HEALTH: '/healthz',
    LOGIN: '/auth/login',
    USER_ME: '/users/me',
    PAYMENTS: '/payments',
    PAYMENT_BY_ID: (id) => `/payments/${id}`,
    WEBHOOK_LNBITS: '/webhooks/lnbits'
};
// API versions
exports.API_VERSION = 'v1';
exports.defaultApiConfig = {
    baseUrl: 'https://lightningflow.online/api',
    version: exports.API_VERSION,
    timeout: 30000
};
// Validation helpers
function validateUser(user) {
    return (typeof user === 'object' &&
        typeof user.id === 'string' &&
        typeof user.email === 'string' &&
        typeof user.created_at === 'string' &&
        typeof user.updated_at === 'string' &&
        ['free', 'pro', 'enterprise'].includes(user.subscription_tier) &&
        ['light', 'dark', 'auto'].includes(user.theme));
}
function validatePayment(payment) {
    return (typeof payment === 'object' &&
        typeof payment.id === 'string' &&
        typeof payment.amount_sats === 'number' &&
        typeof payment.description === 'string' &&
        ['pending', 'completed', 'failed', 'cancelled'].includes(payment.status) &&
        typeof payment.created_at === 'string' &&
        typeof payment.updated_at === 'string');
}
function validatePagination(pagination) {
    return (typeof pagination === 'object' &&
        typeof pagination.page === 'number' &&
        typeof pagination.limit === 'number' &&
        typeof pagination.total === 'number' &&
        typeof pagination.total_pages === 'number' &&
        typeof pagination.has_next === 'boolean' &&
        typeof pagination.has_prev === 'boolean');
}
// Type guards
function isErrorResponse(response) {
    return response && typeof response.error === 'object' && typeof response.error.code === 'string';
}
function isSuccessResponse(response) {
    return response && typeof response.data !== 'undefined' && !response.error;
}
//# sourceMappingURL=openapi.js.map