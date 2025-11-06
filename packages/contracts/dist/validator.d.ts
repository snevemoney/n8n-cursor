export declare const ajv: import("ajv/dist/core").default;
export interface ValidationResult {
    valid: boolean;
    errors?: Array<{
        instancePath: string;
        schemaPath: string;
        keyword: string;
        params: any;
        message: string;
        data?: any;
    }>;
}
export declare function validate<T>(schema: any, data: T): ValidationResult;
export declare class ValidationError extends Error {
    readonly errors: ValidationResult['errors'];
    readonly data: any;
    constructor(message: string, errors: ValidationResult['errors'], data: any);
    toString(): string;
}
export declare function validateOrThrow<T>(schema: any, data: T, context?: string): T;
export declare function validateSatoshis(amount: number): boolean;
export declare function validateDecimalAmount(amount: string | number): boolean;
export declare function validateUTCTimestamp(timestamp: string): boolean;
export declare function validateTimezone(timezone: string): boolean;
export declare function validateUUID(uuid: string): boolean;
export declare function validateLightningInvoice(invoice: string): boolean;
export declare function validateNodePubkey(pubkey: string): boolean;
export declare function validateEmail(email: string): boolean;
export declare function validatePagination(page: number, limit: number): boolean;
export declare function validateFeatureFlagName(name: string): boolean;
export declare function validateErrorCode(code: string): boolean;
export declare const commonSchemas: {
    uuid: {
        type: string;
        format: string;
    };
    email: {
        type: string;
        format: string;
    };
    satoshis: {
        type: string;
        minimum: number;
        currency: string;
    };
    timestamp: {
        type: string;
        format: string;
    };
    timezone: {
        type: string;
        timezone: boolean;
    };
    lightningInvoice: {
        type: string;
        format: string;
    };
    nodePubkey: {
        type: string;
        format: string;
    };
    pagination: {
        type: string;
        properties: {
            page: {
                type: string;
                minimum: number;
            };
            limit: {
                type: string;
                minimum: number;
                maximum: number;
            };
        };
        required: string[];
    };
};
//# sourceMappingURL=validator.d.ts.map