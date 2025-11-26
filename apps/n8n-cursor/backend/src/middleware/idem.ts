import { createClient } from "redis";

const r = createClient({ url: process.env['REDIS_URL']! });
const conn = r.connect?.() ?? Promise.resolve();

export async function ensureIdempotent(key: string, ttlSec = 3600) {
  await conn;
  const ok = await r.set(`idem:${key}`, "1", { NX: true, EX: ttlSec });
  return ok === "OK";
}

export function extractIdempotencyKey(req: Request): string | null {
  return req.headers.get("idempotency-key");
}
