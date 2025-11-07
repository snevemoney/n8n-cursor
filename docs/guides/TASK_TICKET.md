# TASK_TICKET.md

## Template for AI Coding Sessions

Copy this template and fill in the details for every coding task. This ensures proper scope, safety, and rollback planning.

---

## Task Information

**PROJECT**: `lfai` | `lightningflow` | `n8n-cursor` | `other`
**ENV**: `int` | `staging` | `prod`
**PRIORITY**: `low` | `medium` | `high` | `critical`

## Scope Definition

**AFFECTED_PATHS**:
```
apps/api/src/payments/**
packages/lightning/**
infra/docker/docker-compose.int.yml
infra/caddy/Caddyfile
```

**EXCLUDED_PATHS**:
```
apps/lightningflow/**  # Keep separate from side hustle workflows
docs/**                # Documentation only
tests/**               # Test files only
```

## Goal & Requirements

**GOAL**: 
```
Implement LNURL-withdraw endpoint with k1 token validation and proper error handling
```

**REQUIREMENTS**:
- [ ] Loopback port bindings only (127.0.0.1:PORT:PORT)
- [ ] Health check endpoint (/healthz)
- [ ] Resource limits (CPU/memory)
- [ ] Proper error handling and logging
- [ ] Input validation and sanitization
- [ ] Authentication/authorization checks
- [ ] Database transaction safety
- [ ] Graceful shutdown handling

## Technical Specifications

**NEW SERVICES**:
- Service Name: `lnbits-api`
- Port: `5678`
- Health Check: `GET /healthz`
- Resource Limits: `1 CPU, 512MB RAM`

**NEW ENDPOINTS**:
- `POST /api/lnurl/withdraw` - LNURL withdraw endpoint
- `GET /api/lnurl/withdraw/:k1` - Validate k1 token
- `GET /healthz` - Health check

**DATABASE CHANGES**:
- New table: `lnurl_withdraw_requests`
- New table: `k1_tokens`
- Migration: `001_add_lnurl_tables.sql`

**ENVIRONMENT VARIABLES**:
- `LNURL_CALLBACK_URL` - Callback URL for LNURL
- `K1_SECRET_KEY` - Secret for k1 token generation
- `LNURL_TIMEOUT_SECONDS` - Request timeout (default: 300)

## Success Criteria

**DONE_WHEN**:
- [ ] `docker compose -f infra/docker/docker-compose.int.yml up -d` succeeds
- [ ] `curl -f http://localhost:5678/healthz` returns 200
- [ ] `ss -Hnlpt | grep -Ev '127\.0\.0\.1:|:80|:443'` shows no public bindings
- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Integration tests pass: `npm run test:integration`
- [ ] Security scan passes: `npm audit`
- [ ] Performance tests pass: `npm run test:performance`

## Rollback Plan

**DOCKER ROLLBACK**:
```bash
# Stop new service
docker compose -f infra/docker/docker-compose.int.yml down

# Restore previous image
docker pull lfai/lnbits-api:prev-sha
docker compose -f infra/docker/docker-compose.int.yml up -d
```

**GIT ROLLBACK**:
```bash
# Revert specific commit
git revert <commit-hash>

# Or reset to previous state
git reset --hard HEAD~1
```

**DATABASE ROLLBACK**:
```bash
# Run down migration
psql -d lightningflow -f migrations/down/001_add_lnurl_tables.sql
```

**CADDY ROLLBACK**:
```bash
# Restore previous Caddyfile
cp infra/caddy/Caddyfile.backup infra/caddy/Caddyfile
docker restart caddy
```

**ENVIRONMENT ROLLBACK**:
```bash
# Remove new environment variables
# Edit .env files to remove new variables
# Restart services
docker compose -f infra/docker/docker-compose.int.yml restart
```

## Verification Steps

**HEALTH CHECKS**:
```bash
# Check service health
curl -f http://localhost:5678/healthz

# Check all services
docker compose -f infra/docker/docker-compose.int.yml ps

# Check port bindings
ss -Hnlpt | sort -u
```

**FUNCTIONAL TESTS**:
```bash
# Test LNURL withdraw endpoint
curl -X POST http://localhost:5678/api/lnurl/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "description": "Test withdraw"}'

# Test k1 validation
curl -f http://localhost:5678/api/lnurl/withdraw/test-k1-token
```

**PERFORMANCE TESTS**:
```bash
# Load test
ab -n 1000 -c 10 http://localhost:5678/healthz

# Memory usage
docker stats --no-stream
```

## Risk Assessment

**HIGH RISK**:
- [ ] Database schema changes
- [ ] Authentication/authorization changes
- [ ] External API integrations
- [ ] Payment processing logic

**MEDIUM RISK**:
- [ ] New service dependencies
- [ ] Configuration changes
- [ ] Logging changes

**LOW RISK**:
- [ ] Documentation updates
- [ ] Test additions
- [ ] Code refactoring

## Dependencies

**REQUIRES**:
- [ ] Database migration completed
- [ ] Environment variables set
- [ ] Docker images built
- [ ] Caddy configuration updated

**BLOCKS**:
- [ ] Other services waiting for this endpoint
- [ ] Frontend integration
- [ ] Mobile app updates

## Testing Strategy

**UNIT TESTS**:
- [ ] LNURL withdraw logic
- [ ] K1 token validation
- [ ] Error handling
- [ ] Input validation

**INTEGRATION TESTS**:
- [ ] Database operations
- [ ] External API calls
- [ ] Authentication flow
- [ ] End-to-end withdraw process

**LOAD TESTS**:
- [ ] Concurrent withdraw requests
- [ ] Database connection limits
- [ ] Memory usage under load
- [ ] Response time benchmarks

---

## Approval

**REVIEWER**: ________________
**APPROVED**: [ ] Yes [ ] No
**COMMENTS**: 
```
```

**DEPLOYMENT APPROVAL**: [ ] Yes [ ] No
**ROLLBACK TESTED**: [ ] Yes [ ] No
