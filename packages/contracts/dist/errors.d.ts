export type ErrorCode = 'LFAI-0001' | 'LFAI-0002' | 'LFAI-0003' | 'LFAI-0004' | 'LFAI-0005' | 'LFAI-0100' | 'LFAI-0101' | 'LFAI-0102' | 'LFAI-0103' | 'LFAI-0104' | 'LFAI-0105' | 'LFAI-0200' | 'LFAI-0201' | 'LFAI-0202' | 'LFAI-0300' | 'LFAI-0301' | 'LFAI-0302' | 'LFAI-0303' | 'LFAI-0304' | 'LFAI-0305' | 'LFAI-0306' | 'LFAI-0400' | 'LFAI-0401' | 'LFAI-0402' | 'LFAI-0403' | 'LFAI-0404' | 'LFAI-0500' | 'LFAI-0501' | 'LFAI-0502' | 'LFAI-0503' | 'LFAI-0504' | 'LFAI-0505' | 'LFAI-0506' | 'LFAI-0507' | 'LFAI-0508' | 'LFAI-0600' | 'LFAI-0601' | 'LFAI-0602' | 'LFAI-0603' | 'LFAI-0604' | 'LFAI-0700' | 'LFAI-0701' | 'LFAI-0702' | 'LFAI-0703' | 'LFAI-0704' | 'LFAI-0800' | 'LFAI-0801' | 'LFAI-0802' | 'LFAI-0803' | 'LFAI-0804' | 'LFAI-0805' | 'LFAI-0900' | 'LFAI-0901' | 'LFAI-0902' | 'LFAI-0903' | 'LFAI-0904' | 'LFAI-0905';
export type ErrorCategory = 'authentication' | 'authorization' | 'validation' | 'rate_limiting' | 'agent' | 'webhook' | 'bitcoin' | 'lightning' | 'database' | 'external_service' | 'system' | 'security';
export interface ErrorDetails {
    [key: string]: any;
}
export interface ErrorResponse {
    error: ErrorCode;
    message: string;
    description?: string;
    category: ErrorCategory;
    retryable: boolean;
    timestamp: string;
    requestId?: string;
    details?: ErrorDetails;
}
export declare const errorCatalog: Record<ErrorCode, {
    http: number;
    message: string;
    description: string;
    category: ErrorCategory;
    retryable: boolean;
}>;
export declare function createErrorResponse(code: ErrorCode, details?: ErrorDetails, requestId?: string): ErrorResponse;
export declare function getErrorInfo(code: ErrorCode): {
    http: number;
    message: string;
    description: string;
    category: ErrorCategory;
    retryable: boolean;
};
export declare function getHttpStatus(code: ErrorCode): number;
export declare function isRetryable(code: ErrorCode): boolean;
export declare function getErrorCategory(code: ErrorCode): ErrorCategory;
export declare function createExpressErrorResponse(code: ErrorCode, details?: ErrorDetails, requestId?: string): {
    status: number;
    body: ErrorResponse;
};
export declare function createNextResponse(code: ErrorCode, details?: ErrorDetails, requestId?: string): import("undici-types").Response;
export declare function isValidErrorCode(code: string): code is ErrorCode;
export declare function validateErrorCode(code: string): ErrorCode;
export declare const errorCategories: Record<ErrorCategory, string>;
export declare const httpStatusCodes: Record<number, string>;
//# sourceMappingURL=errors.d.ts.map