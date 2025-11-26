# 🛡️ Scorpion Error Prevention Guide

**Purpose:** Ensure zero errors in production by following these patterns

---

## 🎯 Golden Rules

### 1. **ALWAYS Use SafeGuard for External Operations**

```typescript
import { SafeGuard } from '@scorpion/core';

// ❌ BAD
const data = JSON.parse(content);

// ✅ GOOD
const data = SafeGuard.parseJSON(content, {});

// ❌ BAD
const file = await fs.readFile(path, 'utf-8');

// ✅ GOOD
const file = await SafeGuard.safeReadFile(path, {
  fallback: '',
  validateJSON: true
});

// ❌ BAD
const response = await fetch(url);

// ✅ GOOD
const { data, error } = await SafeGuard.safeRequest(url, {
  retries: 3,
  validateStatus: (status) => status < 500
});
```

---

### 2. **ALWAYS Validate Before Accessing**

```typescript
// ❌ BAD
const value = obj.nested.property;

// ✅ GOOD
const value = obj?.nested?.property ?? defaultValue;

// ❌ BAD
if (!schema.relations) return;

// ✅ GOOD
if (!schema || !schema.relations) return;

// ❌ BAD
const result = array[0].property;

// ✅ GOOD
const result = array?.[0]?.property ?? fallback;
```

---

### 3. **ALWAYS Provide Fallbacks**

```typescript
// ❌ BAD
async function fetchData() {
  const response = await api.get();
  return response.data;
}

// ✅ GOOD
async function fetchData() {
  return await SafeGuard.safe(
    async () => {
      const response = await api.get();
      return response.data;
    },
    {
      fallback: [],
      errorMessage: 'Failed to fetch data',
      onError: (error) => {
        // Log to monitoring system
        console.error('Data fetch failed:', error.message);
      }
    }
  );
}
```

---

### 4. **ALWAYS Handle Batch Operations Safely**

```typescript
// ❌ BAD
for (const item of items) {
  await processItem(item); // One failure stops everything
}

// ✅ GOOD
const { results, errors } = await SafeGuard.safeBatch(
  items,
  processItem,
  {
    concurrency: 5,
    continueOnError: true,
    onItemError: (item, error) => {
      console.error(`Failed to process ${item.id}:`, error.message);
    }
  }
);

console.log(`Processed: ${results.length}, Failed: ${errors.length}`);
```

---

### 5. **ALWAYS Validate Environment at Startup**

```typescript
// In instrumentation.ts or app startup
const { valid, missing } = SafeGuard.validateEnv([
  'N8N_API_KEY',
  'N8N_API_URL',
  'OLLAMA_BASE_URL',
  'DATABASE_URL'
]);

if (!valid) {
  console.error('❌ Missing required environment variables:', missing);
  // Proceed with degraded functionality or exit
}
```

---

### 6. **ALWAYS Add Timeouts to External Calls**

```typescript
// ❌ BAD
const response = await fetch(url);

// ✅ GOOD
const response = await fetch(url, {
  signal: AbortSignal.timeout(10000) // 10 seconds
});

// OR using SafeGuard
const { data, error } = await SafeGuard.safeRequest(url, {
  timeout: 10000,
  retries: 3
});
```

---

### 7. **ALWAYS Log Errors Responsibly**

```typescript
// ❌ BAD - Spams logs with repeated errors
console.error('API failed:', error);

// ✅ GOOD - Throttle repeated errors
private lastErrorLog: number = 0;
private errorThrottle: number = 60000; // 1 minute

logError(message: string, error: Error) {
  const now = Date.now();
  if (now - this.lastErrorLog > this.errorThrottle) {
    console.error(message, error.message);
    this.lastErrorLog = now;
  }
}
```

---

### 8. **ALWAYS Validate JSON Before Parsing**

```typescript
// ❌ BAD
const workflow = JSON.parse(content);

// ✅ GOOD
let workflow;
try {
  workflow = JSON.parse(content);
} catch (jsonError) {
  console.error(`Invalid JSON in ${file}:`, jsonError.message);
  continue; // Skip and continue processing
}

// OR using SafeGuard
const workflow = SafeGuard.parseJSON(content, null);
if (!workflow) {
  console.error(`Invalid JSON in ${file}`);
  continue;
}
```

---

### 9. **ALWAYS Check Schema Before Storing in Ontology**

```typescript
// ❌ BAD
await ontologyStore.store({
  id: entity.id,
  type: 'CustomType',
  data: entity // Might not match schema
});

// ✅ GOOD
await ontologyStore.store({
  id: entity.id,
  type: 'CustomType',
  data: {
    // Only include known schema fields
    name: entity.name,
    status: entity.status,
    timestamp: entity.timestamp
  }
});
```

---

### 10. **ALWAYS Wrap API Endpoints with Error Handling**

```typescript
// ❌ BAD
export async function GET(request: NextRequest) {
  const data = await fetchData();
  return NextResponse.json(data);
}

// ✅ GOOD
export async function GET(request: NextRequest) {
  try {
    const data = await SafeGuard.safe(
      () => fetchData(),
      {
        fallback: [],
        errorMessage: 'Failed to fetch data'
      }
    );
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('API error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

---

## 🔍 Common Error Patterns to Avoid

### Pattern 1: Assuming Data Exists

```typescript
// ❌ DON'T
const name = user.profile.name;

// ✅ DO
const name = user?.profile?.name ?? 'Unknown';
```

### Pattern 2: Not Handling Empty Arrays

```typescript
// ❌ DON'T
const first = items[0];

// ✅ DO
const first = items?.[0];
if (!first) {
  console.warn('No items found');
  return defaultValue;
}
```

### Pattern 3: Not Validating External Data

```typescript
// ❌ DON'T
const workflows = await n8nClient.listWorkflows();
workflows.forEach(w => process(w));

// ✅ DO
const workflows = await n8nClient.listWorkflows();
if (!Array.isArray(workflows)) {
  console.error('Invalid workflows response');
  return;
}
workflows.forEach(w => {
  if (w && w.id && w.name) {
    process(w);
  }
});
```

### Pattern 4: Not Handling Network Failures

```typescript
// ❌ DON'T
const response = await fetch(url);
const data = await response.json();

// ✅ DO
const { data, error } = await SafeGuard.safeRequest(url, {
  retries: 3,
  retryDelay: 1000
});

if (error) {
  console.error('Request failed after retries:', error);
  return fallbackData;
}
```

### Pattern 5: Not Handling File System Errors

```typescript
// ❌ DON'T
const files = await fs.readdir(directory);

// ✅ DO
const files = await SafeGuard.safe(
  () => fs.readdir(directory),
  {
    fallback: [],
    errorMessage: `Failed to read directory: ${directory}`
  }
);
```

---

## 📋 Pre-Deployment Checklist

Before deploying code, ensure:

- [ ] All external API calls use `SafeGuard.safeRequest()`
- [ ] All JSON parsing uses `SafeGuard.parseJSON()`
- [ ] All file operations use `SafeGuard.safeReadFile()`
- [ ] All batch operations use `SafeGuard.safeBatch()`
- [ ] All object property accesses use optional chaining (`?.`)
- [ ] All arrays checked with `.length` or `?.[index]` before access
- [ ] All environment variables validated at startup
- [ ] All timeouts set on external calls
- [ ] All error logs throttled for repeated errors
- [ ] All API endpoints wrapped with try/catch
- [ ] All schemas validated before ontology storage
- [ ] All null/undefined checks in place

---

## 🧪 Testing Error Scenarios

### Test Missing Environment Variables

```typescript
// Temporarily unset env vars
delete process.env.N8N_API_KEY;

// Verify graceful degradation
const result = await operation();
expect(result).toBe(fallbackValue);
```

### Test Network Failures

```typescript
// Mock fetch to fail
jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

// Verify retry logic works
const { error } = await SafeGuard.safeRequest(url, { retries: 3 });
expect(error).toBeTruthy();
```

### Test Invalid JSON

```typescript
const invalidJSON = '{ "name": "test" /* comment */ }';
const result = SafeGuard.parseJSON(invalidJSON, null);
expect(result).toBeNull();
```

### Test Missing Files

```typescript
const content = await SafeGuard.safeReadFile('/nonexistent/file.json', {
  fallback: '{}'
});
expect(content).toBe('{}');
```

---

## 🎓 When to Use Each SafeGuard Method

| Operation | Method | Use Case |
|-----------|--------|----------|
| Async function | `SafeGuard.safe()` | Any async operation that might fail |
| Sync function | `SafeGuard.safeSync()` | Pure functions that might throw |
| JSON parsing | `SafeGuard.parseJSON()` | Parsing JSON from any source |
| File reading | `SafeGuard.safeReadFile()` | Reading files with validation |
| API calls | `SafeGuard.safeRequest()` | HTTP requests with retry |
| Batch processing | `SafeGuard.safeBatch()` | Processing arrays with error tolerance |
| Env validation | `SafeGuard.validateEnv()` | Startup configuration check |

---

## 🚨 Emergency Patterns

### If System Crashes:

1. Check logs for stack traces
2. Identify the missing null check or validation
3. Add SafeGuard wrapping
4. Add fallback value
5. Test with invalid inputs
6. Deploy fix

### If Performance Degrades:

1. Check for excessive logging
2. Add error throttling
3. Reduce retry attempts
4. Increase timeouts
5. Monitor with metrics

---

## ✅ Success Criteria

A well-protected system should:

- ✅ Never crash from missing data
- ✅ Always return sensible defaults
- ✅ Log errors without spam
- ✅ Retry transient failures
- ✅ Validate all inputs
- ✅ Timeout long operations
- ✅ Continue processing on individual failures
- ✅ Degrade gracefully when services are unavailable

---

**Remember:** It's better to return a fallback value and log an error than to crash the entire system.  
**Motto:** "Fail gracefully, log responsibly, recover automatically."

🦂 **Scorpion is resilient by design.**

