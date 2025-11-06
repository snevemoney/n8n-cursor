# Performance Contract for LightningFlow

## Core Performance Rules

### 1. Response Time Requirements
- **Health endpoints**: < 20ms
- **API endpoints**: < 100ms (P95)
- **Web pages**: < 200ms (P95)
- **Database queries**: < 50ms (P95)

### 2. Code Generation Rules

#### API Endpoints
- **MUST** include Big-O complexity analysis
- **MUST** propose database indexes with EXPLAIN ANALYZE
- **MUST** use connection pooling (8-20 connections)
- **MUST** include health check endpoint
- **FORBIDDEN**: N+1 database queries
- **FORBIDDEN**: Synchronous operations in request handlers
- **FORBIDDEN**: Unbounded loops or scans

#### Database Operations
- **MUST** use cursor-based pagination for large datasets
- **MUST** batch operations (IN clauses, bulk inserts)
- **MUST** include proper indexes for WHERE/ORDER BY clauses
- **FORBIDDEN**: OFFSET pagination on large tables
- **FORBIDDEN**: Per-row database calls in loops

#### HTTP Clients
- **MUST** use keep-alive agents with connection pooling
- **MUST** set reasonable timeouts (15s read, 15s write)
- **MUST** batch external API calls
- **FORBIDDEN**: Creating new connections per request
- **FORBIDDEN**: Synchronous external calls in hot paths

#### Queue Operations
- **MUST** specify CONCURRENCY limits (CPU * 2)
- **MUST** include backpressure thresholds
- **MUST** use small job payloads (store data externally)
- **MUST** include queue depth monitoring
- **FORBIDDEN**: Unbounded concurrency
- **FORBIDDEN**: Large payloads in job data

#### Logging
- **MUST** use structured logging (JSON)
- **MUST** avoid logging in hot paths
- **MUST** use appropriate log levels
- **FORBIDDEN**: Console.log in production
- **FORBIDDEN**: Logging request bodies in production

### 3. Infrastructure Requirements

#### Docker Configuration
- **MUST** include health checks
- **MUST** set CPU/memory limits
- **MUST** justify resource increases
- **MUST** use multi-stage builds for optimization

#### Caching Strategy
- **MUST** set Cache-Control headers
- **MUST** use Redis for hot data (2-5s TTL)
- **MUST** implement ISR for static content
- **MUST** cache expensive computations

### 4. Validation Requirements

#### Before Deployment
- **MUST** run `validate_node_minimal()` for all nodes
- **MUST** run `validate_workflow()` for complete workflows
- **MUST** include autocannon load test snippet
- **MUST** verify health endpoints respond < 20ms

#### Performance Testing
- **MUST** include micro-benchmark for new endpoints
- **MUST** test with realistic data volumes
- **MUST** monitor memory usage during tests
- **MUST** verify no memory leaks

### 5. Error Handling

#### Circuit Breakers
- **MUST** implement for external API calls
- **MUST** set reasonable failure thresholds
- **MUST** include fallback mechanisms

#### Rate Limiting
- **MUST** implement for public endpoints
- **MUST** use Redis for distributed rate limiting
- **MUST** include proper error responses

### 6. Monitoring Requirements

#### Metrics
- **MUST** expose Prometheus metrics
- **MUST** track P95/P99 latencies
- **MUST** monitor queue depths
- **MUST** track error rates

#### Alerts
- **MUST** alert on health check failures
- **MUST** alert on high latency (> 200ms P95)
- **MUST** alert on high error rates (> 1%)
- **MUST** alert on queue depth thresholds

## Enforcement Rules

### Code Review Checklist
1. ✅ Big-O complexity documented
2. ✅ Database indexes proposed
3. ✅ Connection pooling configured
4. ✅ Health endpoint included
5. ✅ Load test snippet provided
6. ✅ No N+1 queries
7. ✅ Proper error handling
8. ✅ Caching strategy implemented

### Deployment Gates
- **BLOCK** if health endpoints > 20ms
- **BLOCK** if missing database indexes
- **BLOCK** if no load testing performed
- **BLOCK** if memory leaks detected
- **BLOCK** if error rates > 1%

### Performance Budget
- **API Response Time**: 100ms P95
- **Database Query Time**: 50ms P95
- **Memory Usage**: < 1GB per service
- **CPU Usage**: < 80% sustained
- **Error Rate**: < 1%

## Quick Reference

### Performance Anti-Patterns to Avoid
```typescript
// ❌ BAD: N+1 queries
for (const user of users) {
  const profile = await db.profiles.findByUserId(user.id);
}

// ❌ BAD: No connection pooling
const response = await fetch(url); // Creates new connection

// ❌ BAD: Synchronous logging
console.log('Processing request', requestData); // Blocks event loop

// ❌ BAD: Unbounded concurrency
await Promise.all(requests.map(req => processRequest(req))); // No limit
```

### Performance Best Practices
```typescript
// ✅ GOOD: Batch queries
const profiles = await db.profiles.findByUserIds(userIds);

// ✅ GOOD: Connection pooling
const response = await fetch(url, { agent: httpAgent });

// ✅ GOOD: Structured logging
logger.info('Processing request', { userId, requestId });

// ✅ GOOD: Controlled concurrency
await pLimit(10)(requests.map(req => processRequest(req)));
```

## Emergency Procedures

### If Performance Degrades
1. Run `./scripts/perf_doctor.sh`
2. Check resource usage (CPU, memory, disk)
3. Verify health endpoints
4. Check queue depths
5. Review recent deployments
6. Scale resources if needed

### If Health Checks Fail
1. Check service logs
2. Verify database connectivity
3. Check external API status
4. Restart services if needed
5. Escalate if persistent

This contract ensures all code changes maintain or improve performance standards.
