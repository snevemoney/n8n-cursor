// Universal fetch wrapper with Idempotency-Key for POST/PUT/PATCH/DELETE
// Works in browser and Node (Next.js app router)

type Json = Record<string, any> | any[];

export type IdemStrategy = 
  | { type: "uuid" } // new key each call
  | { type: "hash"; salt?: string } // stable key for (method+url+body)
  | { type: "custom"; make: () => string }; // you provide function

function isServer() {
  // Next.js app router: both client & server supported
  return typeof window === "undefined";
}

async function sha256Base64(s: string) {
  if (!isServer() && "crypto" in window && "subtle" in window.crypto) {
    const data = new TextEncoder().encode(s);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  } else {
    const { createHash } = await import("crypto");
    return createHash("sha256").update(s).digest("base64");
  }
}

function uuid() {
  if (!isServer() && "crypto" in window && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // node fallback
  return require("crypto").randomUUID();
}

async function makeIdemKey(
  method: string,
  url: string,
  body: unknown,
  strat: IdemStrategy
) {
  if (strat.type === "uuid") return uuid();
  if (strat.type === "custom") return strat.make();
  
  // hash (stable for same request shape)
  const salt = strat.salt ?? "";
  const payload = typeof body === "string" ? body : JSON.stringify(body ?? "");
  return sha256Base64(`${method.toUpperCase()}|${url}|${payload}|${salt}`);
}

export interface RequestOptions<TBody = Json> {
  body?: TBody;
  headers?: Record<string, string>;
  // default: stable hash (good for retries / re-clicks)
  idempotency?: IdemStrategy | false;
  // default: 2 retries on 429/500/502/503/504 with backoff
  retries?: number;
  retryBaseMs?: number;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: any;
  
  constructor(status: number, message: string, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Normalizes API errors shaped by contracts/errors.yaml (e.g., {code:"LFAI-...."})
async function normalizeError(res: Response): Promise<never> {
  let msg = `HTTP ${res.status}`;
  let code: string | undefined;
  let details: any;
  
  try {
    const j = await res.json();
    msg = (j?.message || j?.error || msg) as string;
    code = j?.code;
    details = j;
  } catch {}
  
  throw new HttpError(res.status, msg, code, details);
}

async function coreFetch<TRes = any, TBody = Json>(
  method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE",
  url: string,
  opts: RequestOptions<TBody> = {}
): Promise<TRes> {
  const {
    body,
    headers = {},
    idempotency = { type: "hash" as const }, // default: stable per request
    retries = 2,
    retryBaseMs = 200,
    signal,
  } = opts;

  const finalHeaders: Record<string, string> = {
    "Accept": "application/json",
    ...headers,
  };

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (!finalHeaders["Content-Type"]) finalHeaders["Content-Type"] = "application/json";
    payload = finalHeaders["Content-Type"].includes("application/json") 
      ? JSON.stringify(body) 
      : (body as any);
  }

  if (idempotency && method !== "GET") {
    const key = await makeIdemKey(method, url, payload, idempotency);
    finalHeaders["Idempotency-Key"] = key;
  }

  let attempt = 0;
  // simple retry on transient errors
  while (true) {
    const res = await fetch(url, {
      method,
      body: payload,
      headers: finalHeaders,
      cache: "no-store",
      signal,
    });

    if (res.ok) {
      // JSON by default; fall back to text if empty
      const txt = await res.text();
      // empty body
      if (!txt) return undefined as TRes;
      try {
        return JSON.parse(txt) as TRes;
      } catch {
        return txt as unknown as TRes;
      }
    }

    // 409 (conflict) for duplicate idempotency: treat as success if API returns a body
    if (res.status === 409) {
      // Either the API returned last known result, or we surface a friendly error
      try {
        const data = (await res.json()) as any;
        if (data?.ok || data?.result) return data as TRes;
        // else throw normalized error
      } catch {}
      await normalizeError(res);
    }

    // Retry on typical transient errors
    if ([429, 500, 502, 503, 504].includes(res.status) && attempt < retries) {
      const wait = retryBaseMs * Math.pow(2, attempt); // backoff
      await new Promise(r => setTimeout(r, wait));
      attempt++;
      continue;
    }

    // Otherwise, normalize & throw
    await normalizeError(res);
  }
}

export const http = {
  get: <T=any>(url: string, o?: RequestOptions<void>) => coreFetch<T, void>("GET", url, o),
  post: <T=any, B=Json>(url: string, o?: RequestOptions<B>)=> coreFetch<T, B>("POST", url, o),
  put: <T=any, B=Json>(url: string, o?: RequestOptions<B>)=> coreFetch<T, B>("PUT", url, o),
  patch:<T=any, B=Json>(url: string, o?: RequestOptions<B>)=> coreFetch<T, B>("PATCH", url, o),
  del: <T=any>(url: string, o?: RequestOptions<void>) => coreFetch<T, void>("DELETE", url, o),
};