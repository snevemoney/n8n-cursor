export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    subscription_tier: 'free' | 'pro' | 'enterprise';
    node_pubkey?: string;
    node_alias?: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
}
export interface Payment {
    id: string;
    amount_sats: number;
    description: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    created_at: string;
    updated_at: string;
    completed_at?: string;
    payment_hash?: string;
    recipient?: string;
    metadata?: Record<string, any>;
}
export interface LNbitsWebhook {
    type: 'payment_received' | 'payment_sent' | 'invoice_created' | 'invoice_paid';
    data: {
        payment_hash: string;
        amount: number;
        description?: string;
        timestamp: string;
        wallet_id: string;
        user_id: string;
    };
}
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
}
export interface Error {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
}
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    services: Record<string, {
        status: 'healthy' | 'degraded' | 'unhealthy';
        response_time_ms: number;
    }>;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
}
export interface UpdateUserRequest {
    full_name?: string;
    avatar_url?: string;
    timezone?: string;
    theme?: 'light' | 'dark' | 'auto';
}
export interface ListPaymentsRequest {
    page?: number;
    limit?: number;
    status?: 'pending' | 'completed' | 'failed' | 'cancelled';
    from_date?: string;
    to_date?: string;
}
export interface ListPaymentsResponse {
    data: Payment[];
    pagination: Pagination;
}
export interface CreatePaymentRequest {
    amount_sats: number;
    description: string;
    recipient?: string;
    metadata?: Record<string, any>;
}
export interface WebhookResponse {
    status: 'processed' | 'ignored';
    message: string;
}
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly RATE_LIMITED: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const API_ENDPOINTS: {
    readonly HEALTH: "/healthz";
    readonly LOGIN: "/auth/login";
    readonly USER_ME: "/users/me";
    readonly PAYMENTS: "/payments";
    readonly PAYMENT_BY_ID: (id: string) => string;
    readonly WEBHOOK_LNBITS: "/webhooks/lnbits";
};
export declare const API_VERSION: "v1";
export interface ApiConfig {
    baseUrl: string;
    version: string;
    timeout: number;
}
export declare const defaultApiConfig: ApiConfig;
export interface ApiRequest<T = any> {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    headers?: Record<string, string>;
    body?: T;
    query?: Record<string, string | number | boolean>;
}
export interface ApiResponse<T = any> {
    data?: T;
    error?: Error;
    status: number;
    headers: Record<string, string>;
}
export declare function validateUser(user: any): user is User;
export declare function validatePayment(payment: any): payment is Payment;
export declare function validatePagination(pagination: any): pagination is Pagination;
export declare function isErrorResponse(response: any): response is {
    error: Error;
};
export declare function isSuccessResponse<T>(response: any): response is {
    data: T;
};
export type { User, Payment, LNbitsWebhook, Pagination, Error, HealthCheckResponse, LoginRequest, LoginResponse, UpdateUserRequest, ListPaymentsRequest, ListPaymentsResponse, CreatePaymentRequest, WebhookResponse, ApiConfig, ApiRequest, ApiResponse };
//# sourceMappingURL=openapi.d.ts.map