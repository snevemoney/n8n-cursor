export declare function makeRateLimiter(prefix: string, limit?: number, windowSec?: number): (ip: string) => Promise<boolean>;
export declare function extractClientIP(req: Request): string;
//# sourceMappingURL=rateLimit.d.ts.map