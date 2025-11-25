import { createClient } from "redis";

const r = createClient({ url: process.env['REDIS_URL']! });
const conn = r.connect?.() ?? Promise.resolve();

export function makeRateLimiter(prefix: string, limit = 60, windowSec = 60) {
  return async (ip: string) => {
    await conn;
    const key = `rl:${prefix}:${ip}`;
    const n = await r.incr(key);
    if (n === 1) await r.expire(key, windowSec);
    return n <= limit;
  };
}

export function extractClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const fallbackIP = process.env['FALLBACK_IP'] || "unknown";
  if (forwarded) {
    const firstIp = forwarded.split(",")[0];
    return firstIp ? firstIp.trim() : fallbackIP;
  }
  return fallbackIP;
}
