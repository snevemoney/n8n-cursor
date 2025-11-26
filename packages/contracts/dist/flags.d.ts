export type FlagValue = boolean | number | string | string[];
export interface FlagConfig {
    type: 'boolean' | 'integer' | 'string' | 'array';
    default: FlagValue;
    description: string;
    environments?: {
        int?: FlagValue;
        staging?: FlagValue;
        prod?: FlagValue;
    };
    sunsetOn?: string;
}
export interface FeatureFlags {
    NEW_DASHBOARD: boolean;
    BITCOIN_LIGHTNING_INTEGRATION: boolean;
    LNbits_WEBHOOK_VALIDATION: boolean;
    AGENT_AUTO_SCALING: boolean;
    MAX_CONCURRENT_AGENTS: number;
    AGENT_TIMEOUT_MS: number;
    ENABLE_METRICS_COLLECTION: boolean;
    METRICS_RETENTION_DAYS: number;
    ENABLE_DEBUG_LOGGING: boolean;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    ENABLE_RATE_LIMITING: boolean;
    RATE_LIMIT_REQUESTS_PER_MINUTE: number;
    ENABLE_CORS: boolean;
    CORS_ORIGINS: string[];
    ENABLE_WEBHOOK_RETRY: boolean;
    WEBHOOK_MAX_RETRIES: number;
    WEBHOOK_RETRY_DELAY_MS: number;
    ENABLE_DATABASE_POOLING: boolean;
    DATABASE_POOL_SIZE: number;
    ENABLE_REDIS_CACHING: boolean;
    REDIS_CACHE_TTL_SECONDS: number;
    ENABLE_SECURITY_HEADERS: boolean;
    ENABLE_CSRF_PROTECTION: boolean;
    ENABLE_SQL_INJECTION_PROTECTION: boolean;
    ENABLE_XSS_PROTECTION: boolean;
    ENABLE_CONTENT_SECURITY_POLICY: boolean;
    ENABLE_STRICT_TRANSPORT_SECURITY: boolean;
    ENABLE_AGENT_MONITORING: boolean;
    AGENT_HEALTH_CHECK_INTERVAL_MS: number;
    ENABLE_AGENT_AUTO_RECOVERY: boolean;
    AGENT_MAX_FAILURES: number;
    ENABLE_BITCOIN_PRICE_TRACKING: boolean;
    BITCOIN_PRICE_UPDATE_INTERVAL_MS: number;
    ENABLE_LIGHTNING_NETWORK_MONITORING: boolean;
    LIGHTNING_NETWORK_CHECK_INTERVAL_MS: number;
}
export type Environment = 'int' | 'staging' | 'prod';
export declare class FlagLoader {
    private flags;
    private environment;
    constructor(environment?: Environment);
    private loadFlags;
    private getBooleanFlag;
    private getNumberFlag;
    private getStringFlag;
    private getArrayFlag;
    getFlags(): FeatureFlags;
    getFlag<K extends keyof FeatureFlags>(key: K): FeatureFlags[K];
    isEnabled<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] extends boolean ? boolean : never;
    getValue<K extends keyof FeatureFlags>(key: K): FeatureFlags[K];
    isSunset(key: keyof FeatureFlags): boolean;
    getEnvironmentValue<K extends keyof FeatureFlags>(key: K, environment: Environment): FeatureFlags[K];
    validate(): {
        valid: boolean;
        errors?: string[];
    };
}
export declare function initializeFlags(environment?: Environment): FlagLoader;
export declare function getFlags(): FlagLoader;
export declare function isFlagEnabled<K extends keyof FeatureFlags>(key: K): FeatureFlags[K] extends boolean ? boolean : never;
export declare function getFlagValue<K extends keyof FeatureFlags>(key: K): FeatureFlags[K];
export declare function validateFlags(): {
    valid: boolean;
    errors?: string[];
};
export declare function loadFlagsForEnvironment(environment: Environment): FeatureFlags;
export declare function validateFlagSchema(flags: Partial<FeatureFlags>): {
    valid: boolean;
    errors?: string[];
};
//# sourceMappingURL=flags.d.ts.map