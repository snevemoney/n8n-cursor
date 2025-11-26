export declare const ajv: import("ajv/dist/core").default;
export interface ValidationResult<T = any> {
    valid: boolean;
    data?: T;
    errors?: Ajv.ErrorObject[];
    errorMessage?: string;
}
export declare function validate<T = any>(schema: any, data: any, options?: {
    coerceTypes?: boolean;
    removeAdditional?: boolean;
    useDefaults?: boolean;
}): ValidationResult<T>;
export declare function createValidationMiddleware<T = any>(schema: any): (req: any, res: any, next: any) => any;
export declare function validateRequest<T = any>(schema: any, data: any): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    details?: any;
};
export declare function validateResponse<T = any>(schema: any, data: any): {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
    details?: any;
};
export declare function compileSchema(schema: any): import("ajv").ValidateFunction<unknown>;
export declare function isValidSchema(schema: any): boolean;
export declare const validators: {
    isUUID: (value: string) => boolean;
    isSatoshi: (value: number) => boolean;
    isPaymentHash: (value: string) => boolean;
    isPreimage: (value: string) => boolean;
    isBitcoinAddress: (value: string) => boolean;
    isLightningInvoice: (value: string) => boolean;
    isEmail: (value: string) => boolean;
    isURL: (value: string) => boolean;
    isISO8601: (value: string) => boolean;
    isPositiveInteger: (value: number) => boolean;
    isNonNegativeInteger: (value: number) => boolean;
};
export declare function formatValidationErrors(errors: Ajv.ErrorObject[]): string;
export declare function mergeSchemas(...schemas: any[]): any;
export declare function resolveSchemaReferences(schema: any, definitions: any): any;
export { ajv as default };
//# sourceMappingURL=validators.d.ts.map