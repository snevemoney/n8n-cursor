/**
 * Scorpion Security Utilities
 *
 * Core security functions for preventing common vulnerabilities:
 * - Directory traversal
 * - SQL injection
 * - XSS attacks
 * - Path manipulation
 */

import path from 'path';
import { z } from 'zod';

// ============================================================================
// 1. SAFE FILE PATH HANDLING
// ============================================================================

export interface SafePathOptions {
  /** Allowed file extensions (e.g., ['.txt', '.pdf', '.json']) */
  allowedExtensions?: string[];
  /** Maximum filename length */
  maxLength?: number;
  /** Custom validation regex */
  customPattern?: RegExp;
}

/**
 * Validates a filename to prevent directory traversal attacks
 *
 * @example
 * ```ts
 * // ✅ Valid
 * validateFilename('document.pdf', { allowedExtensions: ['.pdf'] }); // true
 *
 * // ❌ Invalid - directory traversal
 * validateFilename('../../../etc/passwd'); // false
 *
 * // ❌ Invalid - null bytes
 * validateFilename('file\0.txt'); // false
 * ```
 */
export function validateFilename(
  filename: string,
  options: SafePathOptions = {}
): boolean {
  const {
    allowedExtensions = [],
    maxLength = 255,
    customPattern,
  } = options;

  // Check for null/undefined
  if (!filename || typeof filename !== 'string') {
    return false;
  }

  // Check length
  if (filename.length > maxLength || filename.length === 0) {
    return false;
  }

  // Check for null bytes (common bypass technique)
  if (filename.includes('\0')) {
    return false;
  }

  // Check for directory traversal patterns
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }

  // Check for leading/trailing whitespace or dots
  if (filename !== filename.trim() || filename.startsWith('.') || filename.endsWith('.')) {
    return false;
  }

  // Apply custom pattern if provided
  if (customPattern && !customPattern.test(filename)) {
    return false;
  }

  // Check allowed extensions
  if (allowedExtensions.length > 0) {
    const ext = path.extname(filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return false;
    }
  }

  // Default safe pattern: alphanumeric, dots, hyphens, underscores only
  const safePattern = /^[a-zA-Z0-9._-]+$/;
  return safePattern.test(filename);
}

/**
 * Resolves a safe file path, ensuring it stays within the root directory
 *
 * @throws {Error} If path validation fails
 *
 * @example
 * ```ts
 * // ✅ Safe
 * const safePath = resolveSafePath('/app/uploads', 'document.pdf');
 * // Returns: '/app/uploads/document.pdf'
 *
 * // ❌ Throws error - traversal attempt
 * resolveSafePath('/app/uploads', '../../etc/passwd');
 * ```
 */
export function resolveSafePath(
  rootDir: string,
  filename: string,
  options: SafePathOptions = {}
): string {
  // Validate filename first
  if (!validateFilename(filename, options)) {
    throw new Error(`Invalid filename: ${filename}`);
  }

  // Resolve both paths to absolute
  const root = path.resolve(rootDir);
  const resolved = path.resolve(root, filename);

  // Verify the resolved path is still within root
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error(`Path traversal detected: ${filename}`);
  }

  return resolved;
}

/**
 * Safe path builder that uses IDs instead of user-provided filenames
 * Use this for file APIs where the user provides an ID, not a path
 *
 * @example
 * ```ts
 * // User provides: { id: 'abc123' }
 * // Your DB maps: { id: 'abc123', filepath: '/safe/path/to/file.pdf' }
 *
 * const record = await db.file.findUnique({ where: { id } });
 * if (!record) throw new Error('Not found');
 *
 * // Use the DB path, never the user input
 * const fileData = await fs.readFile(record.filepath);
 * ```
 */
export function safePathFromId(id: string): void {
  throw new Error(
    'safePathFromId is a design pattern reminder: ' +
    'Never accept paths from users. Use IDs that map to paths in your DB.'
  );
}

// ============================================================================
// 2. INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * Common validation schemas using Zod
 */
export const SecuritySchemas = {
  /** Validates a safe filename */
  filename: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters')
    .refine((val) => !val.includes('..'), 'Directory traversal not allowed')
    .refine((val) => !val.includes('\0'), 'Null bytes not allowed'),

  /** Validates a UUID */
  uuid: z.string().uuid(),

  /** Validates a safe ID (alphanumeric + hyphens/underscores only) */
  safeId: z.string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, 'ID contains invalid characters'),

  /** Validates user input text (basic sanitization) */
  userText: z.string()
    .min(1)
    .max(10000)
    .transform((val) => val.trim()),

  /** Validates an email */
  email: z.string().email(),

  /** Validates a URL (with protocol whitelist) */
  safeUrl: z.string().url()
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'Only HTTP(S) URLs allowed'
    ),
};

/**
 * Strips all HTML tags and dangerous characters from user input
 * Use this for plain text fields where HTML should never be rendered
 *
 * @example
 * ```ts
 * const userInput = '<script>alert("xss")</script>Hello';
 * const safe = stripHtmlTags(userInput);
 * // Returns: 'Hello'
 * ```
 */
export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
    .replace(/<[^>]+>/g, '') // Remove all HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Basic HTML sanitization for cases where some HTML is needed
 * Allows only safe tags: p, br, strong, em, a (with href validation)
 *
 * ⚠️ For production, use a library like DOMPurify instead
 * This is a minimal implementation for server-side use
 *
 * @example
 * ```ts
 * const userHtml = '<p>Hello</p><script>alert("xss")</script>';
 * const safe = sanitizeHtml(userHtml);
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Allow only specific safe tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'b', 'i', 'u', 'code', 'pre'];
  const tagPattern = new RegExp(
    `<(?!\/?(${allowedTags.join('|')})\\b)[^>]+>`,
    'gi'
  );

  let sanitized = html
    // Remove dangerous tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    // Remove event handlers and javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    // Remove disallowed tags
    .replace(tagPattern, '');

  return sanitized.trim();
}

// ============================================================================
// 3. SQL INJECTION PREVENTION
// ============================================================================

/**
 * Validates that a string is safe to use in a LIKE query
 * Escapes SQL LIKE wildcards (%, _) and checks for injection attempts
 *
 * ⚠️ This is a helper - still use parameterized queries!
 *
 * @example
 * ```ts
 * // ✅ Good - parameterized query with escaped LIKE value
 * const searchTerm = escapeSqlLike(userInput);
 * const results = await db.query(
 *   'SELECT * FROM users WHERE name LIKE $1',
 *   [`%${searchTerm}%`]
 * );
 *
 * // ❌ BAD - never do this
 * const results = await db.query(
 *   `SELECT * FROM users WHERE name LIKE '%${userInput}%'`
 * );
 * ```
 */
export function escapeSqlLike(value: string): string {
  if (!value || typeof value !== 'string') return '';

  return value
    .replace(/[%_\\]/g, '\\$&') // Escape LIKE wildcards
    .replace(/'/g, "''"); // Escape single quotes (defense in depth)
}

/**
 * Type guard to ensure parameterized queries are used
 * This is a compile-time helper to remind developers to use safe queries
 *
 * @example
 * ```ts
 * // ✅ Type checks pass
 * type SafeQuery = EnsureParameterized<[string, any[]]>;
 * const query: SafeQuery = ['SELECT * FROM users WHERE id = $1', [userId]];
 *
 * // ❌ Type error - no parameters
 * const bad: SafeQuery = [`SELECT * FROM users WHERE id = ${userId}`]; // Error!
 * ```
 */
export type EnsureParameterized<T> = T extends [string, any[]] ? T : never;

// ============================================================================
// 4. SECURITY HEADERS
// ============================================================================

/**
 * Security headers configuration for Next.js
 * Add this to your next.config.js
 *
 * @example
 * ```js
 * // next.config.js
 * module.exports = {
 *   async headers() {
 *     return [
 *       {
 *         source: '/:path*',
 *         headers: getSecurityHeaders(),
 *       },
 *     ];
 *   },
 * };
 * ```
 */
export function getSecurityHeaders() {
  return [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on',
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload',
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()',
    },
    {
      key: 'Content-Security-Policy',
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Adjust based on your needs
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'self'",
      ].join('; '),
    },
  ];
}

// ============================================================================
// 5. RATE LIMITING & DOS PROTECTION
// ============================================================================

/**
 * Simple in-memory rate limiter
 * For production, use Redis-backed rate limiting
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter({ windowMs: 60000, maxRequests: 100 });
 *
 * // In your API route:
 * const clientId = request.ip || request.headers.get('x-forwarded-for');
 * if (!limiter.check(clientId)) {
 *   return new Response('Too many requests', { status: 429 });
 * }
 * ```
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private windowMs: number;
  private maxRequests: number;

  constructor(options: { windowMs: number; maxRequests: number }) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(identifier) || [];

    // Filter out timestamps outside the window
    const validTimestamps = timestamps.filter(
      (ts) => now - ts < this.windowMs
    );

    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(
        (ts) => now - ts < this.windowMs
      );
      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validTimestamps);
      }
    }
  }
}

// ============================================================================
// 6. AGENT/LLM OUTPUT VALIDATION
// ============================================================================

/**
 * Validates and sanitizes LLM/agent tool responses before execution
 * Prevents the AI from executing dangerous operations
 *
 * @example
 * ```ts
 * const toolCall = {
 *   name: 'readFile',
 *   args: { path: '../../../etc/passwd' }
 * };
 *
 * const result = validateToolCall(toolCall);
 * if (!result.safe) {
 *   throw new Error(result.reason);
 * }
 * ```
 */
export interface ToolCallValidation {
  safe: boolean;
  reason?: string;
  sanitizedArgs?: any;
}

export function validateToolCall(toolCall: {
  name: string;
  args: any;
}): ToolCallValidation {
  const { name, args } = toolCall;

  // Validate file operations
  if (['readFile', 'writeFile', 'deleteFile'].includes(name)) {
    const filePath = args?.path || args?.filePath;

    if (!filePath || typeof filePath !== 'string') {
      return { safe: false, reason: 'Invalid file path' };
    }

    // Check for traversal
    if (filePath.includes('..') || filePath.includes('\0')) {
      return { safe: false, reason: 'Path traversal detected' };
    }

    // Check for sensitive paths
    const sensitivePatterns = [
      /\/etc\//,
      /\/sys\//,
      /\/proc\//,
      /passwd/,
      /shadow/,
      /\.ssh/,
      /\.env/,
      /private.*key/i,
    ];

    if (sensitivePatterns.some((pattern) => pattern.test(filePath))) {
      return { safe: false, reason: 'Access to sensitive path blocked' };
    }
  }

  // Validate shell commands
  if (name === 'executeShell' || name === 'runCommand') {
    const command = args?.command || args?.cmd;

    if (!command || typeof command !== 'string') {
      return { safe: false, reason: 'Invalid command' };
    }

    // Block dangerous commands
    const dangerousCommands = [
      /rm\s+-rf/,
      /sudo/,
      /chmod\s+777/,
      />.*passwd/,
      /curl.*\|.*bash/,
      /wget.*\|.*sh/,
    ];

    if (dangerousCommands.some((pattern) => pattern.test(command))) {
      return { safe: false, reason: 'Dangerous command blocked' };
    }
  }

  // Validate SQL queries
  if (name === 'executeQuery' || name === 'runSql') {
    const query = args?.query || args?.sql;

    if (!query || typeof query !== 'string') {
      return { safe: false, reason: 'Invalid query' };
    }

    // Block dangerous SQL operations (if not using ORM)
    const dangerousSql = [
      /DROP\s+(TABLE|DATABASE)/i,
      /DELETE\s+FROM/i,
      /TRUNCATE/i,
      /--/,
      /;.*--/,
    ];

    if (dangerousSql.some((pattern) => pattern.test(query))) {
      return { safe: false, reason: 'Dangerous SQL operation blocked' };
    }
  }

  return { safe: true };
}

// ============================================================================
// 7. MIDDLEWARE HELPERS
// ============================================================================

/**
 * Next.js middleware to validate request inputs
 *
 * @example
 * ```ts
 * // In your API route:
 * export const POST = withInputValidation(
 *   z.object({
 *     filename: SecuritySchemas.filename,
 *     content: z.string(),
 *   }),
 *   async (request, validatedBody) => {
 *     // validatedBody is type-safe and validated
 *     return NextResponse.json({ success: true });
 *   }
 * );
 * ```
 */
export function withInputValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    request: Request,
    validatedData: z.infer<T>
  ) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await request.json();
      const validated = schema.parse(body);
      return handler(request, validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Validation failed',
            details: error.errors,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw error;
    }
  };
}
