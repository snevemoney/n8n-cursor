# API Gateway

Centralized API management with authentication, rate limiting, and analytics.

## Features

- ✅ API key management (create, revoke, list)
- ✅ Rate limiting (per minute, hour, day)
- ✅ Endpoint permissions (allow/block patterns)
- ✅ Usage tracking and analytics
- ✅ Request authentication
- ✅ Automatic usage logging

## Quick Start

### 1. Run Database Migration

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/scorpion \
  pnpm exec tsx scripts/migrate-api-gateway.ts
```

### 2. Create an API Key

```bash
curl -X POST http://localhost:3003/api/gateway/keys \
  -H "Content-Type: application/json" \
  -d '{
    "keyName": "My API Key",
    "rateLimitPerMinute": 60,
    "rateLimitPerHour": 1000
  }'
```

Response includes the actual key (store it securely - it's only shown once).

### 3. Use API Key

```bash
curl http://localhost:3003/api/v1/chat \
  -H "Authorization: Bearer sk_..."
```

Or:

```bash
curl http://localhost:3003/api/v1/chat \
  -H "X-API-Key: sk_..."
```

## Configuration

Environment variables:

- `API_GATEWAY_ENABLED` - Enable/disable gateway (default: true)
- `API_GATEWAY_REQUIRE_KEY` - Require API key for all requests (default: false)

## API Endpoints

### Key Management

- `GET /api/gateway/keys` - List all API keys
- `POST /api/gateway/keys` - Create new API key
- `DELETE /api/gateway/keys/[id]` - Revoke API key

### Usage Analytics

- `GET /api/gateway/usage` - Get usage statistics
  - Query params: `apiKeyId`, `startTime`, `endTime`, `limit`

## Rate Limiting

Rate limits are checked per:
- **Minute** - Short-term burst protection
- **Hour** - Medium-term usage control
- **Day** - Long-term quota management

Rate limit headers in responses:
- `X-RateLimit-Limit-Minute`
- `X-RateLimit-Remaining-Minute`
- `X-RateLimit-Reset-Minute`
- (Same for Hour and Day)

## Endpoint Permissions

API keys can be restricted to specific endpoints:

```json
{
  "allowedEndpoints": ["/api/v1/chat", "/api/v1/observatory"],
  "blockedEndpoints": ["/api/v1/admin/*"]
}
```

Patterns support `*` wildcard.

## Usage Tracking

All API requests are automatically logged with:
- Endpoint and method
- Status code
- Duration
- User agent and IP
- Timestamp

Query usage via `/api/gateway/usage`.

---

**Status**: Foundation complete ✅  
**Ready for**: Integration into API routes

