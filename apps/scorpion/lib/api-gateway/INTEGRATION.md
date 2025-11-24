# API Gateway Integration Guide

How to integrate API Gateway into your existing routes.

---

## Quick Start

### 1. Wrap a Route with Gateway

```typescript
import { withGateway } from '@/lib/api-gateway/with-gateway';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withGateway(async (request, context) => {
  // context.apiKey contains the API key if authenticated
  // context.requestId is the unique request ID
  // context.startTime is when the request started
  
  return NextResponse.json({ data: '...' });
});
```

### 2. Optional Gateway (Works With or Without API Key)

```typescript
import { withOptionalGateway } from '@/lib/api-gateway/with-gateway';

export const GET = withOptionalGateway(async (request, context) => {
  // If API key provided, context.apiKey will be set
  // If not, request still works (no authentication required)
  
  if (context.apiKey) {
    // Premium features for authenticated users
  }
  
  return NextResponse.json({ data: '...' });
});
```

---

## Examples

### Example 1: Protected Route

```typescript
// app/api/v1/protected/route.ts
import { withGateway } from '@/lib/api-gateway/with-gateway';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withGateway(async (request, context) => {
  // This route requires an API key
  // Rate limiting is automatically applied
  
  return NextResponse.json({
    message: 'This is a protected route',
    apiKeyName: context.apiKey?.keyName,
    requestId: context.requestId,
  });
});
```

### Example 2: Versioned API

```typescript
// app/api/v1/users/route.ts
import { withGateway } from '@/lib/api-gateway/with-gateway';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withGateway(async (request, context) => {
  // Check endpoint permissions
  const allowedEndpoints = context.apiKey?.allowedEndpoints || [];
  const isAllowed = allowedEndpoints.length === 0 || 
                   allowedEndpoints.some(pattern => 
                     request.url.includes(pattern)
                   );
  
  if (!isAllowed) {
    return NextResponse.json(
      { error: 'API key does not have permission for this endpoint' },
      { status: 403 }
    );
  }
  
  return NextResponse.json({ users: [] });
});
```

### Example 3: Wrapping Existing Route

```typescript
// app/api/v1/chat/stream/route.ts
import { withOptionalGateway } from '@/lib/api-gateway/with-gateway';
import { POST as originalPost } from '../../chat/stream/route';

export const POST = withOptionalGateway(async (request, context) => {
  // Log API key usage
  if (context.apiKey) {
    console.log(`API key ${context.apiKey.keyName} used for chat stream`);
  }
  
  // Call original handler
  return originalPost(request);
});
```

---

## Configuration

### Environment Variables

```bash
# Enable/disable gateway
API_GATEWAY_ENABLED=true

# Require API key for all gateway routes
API_GATEWAY_REQUIRE_KEY=false  # Set to true to require keys
```

### Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit-Minute: 60
X-RateLimit-Remaining-Minute: 45
X-RateLimit-Reset-Minute: 2025-01-27T20:01:00Z

X-RateLimit-Limit-Hour: 1000
X-RateLimit-Remaining-Hour: 987
X-RateLimit-Reset-Hour: 2025-01-27T21:00:00Z
```

---

## Migration Strategy

### Phase 1: Create Versioned Routes (Current)

- Keep existing routes unchanged: `/api/chat/stream`
- Create new versioned routes: `/api/v1/chat/stream`
- New routes use gateway, old routes work as before

### Phase 2: Migrate Existing Routes

- Wrap existing routes with gateway
- Test thoroughly
- Monitor usage

### Phase 3: Enforce Gateway

- Set `API_GATEWAY_REQUIRE_KEY=true`
- All routes require API keys
- Deprecate old routes

---

## Best Practices

1. **Use Versioned Routes** - `/api/v1/*` for gateway routes
2. **Log API Key Usage** - Track which keys are used for what
3. **Check Permissions** - Verify endpoint permissions in handlers
4. **Handle Rate Limits** - Return 429 with helpful message
5. **Monitor Usage** - Use `/api/gateway/usage` to track API usage

---

**Status**: Integration Ready ✅  
**Next**: Migrate more routes to use gateway

