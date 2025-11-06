import { createClient } from "redis";
const r = createClient({ url: process.env['REDIS_URL'] });
const conn = r.connect?.() ?? Promise.resolve();
export async function ensureIdempotent(key, ttlSec = 3600) {
    await conn;
    const ok = await r.set(`idem:${key}`, "1", { NX: true, EX: ttlSec });
    return ok === "OK";
}
export function extractIdempotencyKey(req) {
    return req.headers.get("idempotency-key");
}
//# sourceMappingURL=idem.js.map