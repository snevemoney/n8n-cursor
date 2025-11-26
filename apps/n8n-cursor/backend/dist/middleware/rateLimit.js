import { createClient } from "redis";
const r = createClient({ url: process.env['REDIS_URL'] });
const conn = r.connect?.() ?? Promise.resolve();
export function makeRateLimiter(prefix, limit = 60, windowSec = 60) {
    return async (ip) => {
        await conn;
        const key = `rl:${prefix}:${ip}`;
        const n = await r.incr(key);
        if (n === 1)
            await r.expire(key, windowSec);
        return n <= limit;
    };
}
export function extractClientIP(req) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
        const firstIp = forwarded.split(",")[0];
        return firstIp ? firstIp.trim() : "0.0.0.0";
    }
    return "0.0.0.0";
}
//# sourceMappingURL=rateLimit.js.map