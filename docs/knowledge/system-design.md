# System Design Knowledge Base

## System Design Patterns

### 1. Networking Patterns

#### Load Balancing
**Purpose:** Distribute traffic across multiple servers
**Algorithms:**
- Round Robin: Simple rotation
- Least Connections: Route to least busy server
- IP Hash: Consistent routing based on client IP
- Weighted: Route based on server capacity

**Tools:** Nginx, HAProxy, AWS ELB, Cloudflare

#### CDN (Content Delivery Network)
**Purpose:** Cache static content close to users
**Benefits:**
- Reduced latency
- Lower bandwidth costs
- DDoS protection
- Geographic distribution

**Providers:** Cloudflare, Akamai, AWS CloudFront, Fastly

#### API Gateway
**Purpose:** Single entry point for all API requests
**Features:**
- Authentication/authorization
- Rate limiting
- Request routing
- Response caching
- API versioning

**Tools:** Kong, AWS API Gateway, Nginx, Tyk

### 2. Storage Patterns

#### Database Selection

**SQL (Relational):**
- ACID transactions required
- Complex queries and joins
- Structured data
- Examples: PostgreSQL, MySQL, SQLite

**NoSQL (Non-relational):**
- High scalability required
- Flexible schema
- Simple queries
- Types:
  - Document: MongoDB, CouchDB
  - Key-Value: Redis, DynamoDB
  - Column: Cassandra, HBase
  - Graph: Neo4j, ArangoDB

#### Caching Strategies

**Cache-Aside (Lazy Loading):**
1. App checks cache
2. If miss, load from database
3. Store in cache
4. Return data

**Write-Through:**
1. Write to cache
2. Cache writes to database
3. Ensures consistency

**Write-Behind:**
1. Write to cache
2. Async write to database
3. Better performance, eventual consistency

#### Sharding
**Purpose:** Horizontal partitioning of data
**Strategies:**
- Hash-based: Distribute by hash of key
- Range-based: Distribute by value ranges
- Geographic: Distribute by location
- Directory-based: Lookup table for routing

### 3. Compute Patterns

#### Microservices Architecture
**Principles:**
- Single responsibility per service
- Independently deployable
- Own database per service
- Communicate via APIs

**Benefits:**
- Scalability
- Fault isolation
- Technology flexibility
- Team autonomy

**Challenges:**
- Distributed systems complexity
- Network latency
- Data consistency
- Testing complexity

#### Serverless
**Characteristics:**
- Pay-per-use pricing
- Auto-scaling
- No server management
- Event-driven

**Use Cases:**
- Sporadic workloads
- Rapid prototyping
- Event processing
- API backends

**Providers:** AWS Lambda, Google Cloud Functions, Azure Functions

#### Container Orchestration
**Kubernetes Features:**
- Auto-scaling
- Self-healing
- Load balancing
- Rolling updates
- Service discovery

**Components:**
- Pods: Smallest deployable units
- Services: Stable network endpoints
- Deployments: Desired state management
- ConfigMaps/Secrets: Configuration management

### 4. Security Patterns

#### Authentication Methods

**JWT (JSON Web Tokens):**
- Stateless authentication
- Self-contained tokens
- Signature verification

**OAuth 2.0:**
- Third-party authentication
- Token-based
- Common flows: Authorization Code, Implicit, Client Credentials

**API Keys:**
- Simple authentication
- Per-client keys
- Rate limiting enforcement

#### Rate Limiting
**Strategies:**
- Fixed Window: X requests per time window
- Sliding Window: Rolling time window
- Token Bucket: Consume tokens at request rate
- Leaky Bucket: Process at constant rate

#### Encryption
**At Rest:** Encrypt stored data (AES-256)
**In Transit:** TLS/SSL for network communication
**End-to-End:** Only sender/receiver can decrypt

### 5. Observability Patterns

#### Metrics
**Golden Signals:**
- Latency: Response time
- Traffic: Request rate
- Errors: Error rate
- Saturation: Resource utilization

**Tools:** Prometheus, Grafana, Datadog, New Relic

#### Logging
**Structured Logging:**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "api-gateway",
  "message": "Database connection failed",
  "context": {
    "user_id": "12345",
    "request_id": "abc-123"
  }
}
```

**Log Levels:** DEBUG, INFO, WARN, ERROR, FATAL

**Tools:** ELK Stack (Elasticsearch, Logstash, Kibana), Splunk

#### Tracing
**Distributed Tracing:**
- Track requests across services
- Identify bottlenecks
- Visualize call paths

**Tools:** Jaeger, Zipkin, OpenTelemetry, AWS X-Ray

## Scalability Patterns

### Vertical Scaling
**Definition:** Add more resources to a single machine
**Pros:** Simple, no code changes
**Cons:** Hardware limits, single point of failure

### Horizontal Scaling
**Definition:** Add more machines
**Pros:** No theoretical limit, fault tolerance
**Cons:** Complexity, data consistency challenges

### Database Scaling

**Read Replicas:**
- Offload read queries
- Eventually consistent
- Master-slave replication

**Connection Pooling:**
- Reuse database connections
- Reduce overhead
- Improved performance

**Database Federation:**
- Split database by function
- Users DB, Products DB, Orders DB
- Reduces load per database

## Reliability Patterns

### Circuit Breaker
**States:**
- Closed: Normal operation
- Open: Fail fast, don't attempt
- Half-Open: Test recovery

**Benefits:**
- Prevent cascade failures
- Faster failure detection
- Auto-recovery

### Retry Strategies

**Exponential Backoff:**
```
Attempt 1: Wait 1s
Attempt 2: Wait 2s
Attempt 3: Wait 4s
Attempt 4: Wait 8s
```

**Jitter:** Add randomness to prevent thundering herd

### Graceful Degradation
**Principle:** Maintain core functionality when systems fail
**Examples:**
- Show cached data when database is down
- Disable non-critical features
- Queue requests for later processing

### Health Checks
**Liveness:** Is the service running?
**Readiness:** Is the service ready to accept traffic?
**Implementation:** `/health` or `/healthz` endpoint

## CAP Theorem

**Choose 2 of 3:**
- **Consistency:** All nodes see same data
- **Availability:** System always responds
- **Partition Tolerance:** System works despite network failures

**Real-world:**
- CP: Traditional databases (sacrifice availability)
- AP: NoSQL databases (sacrifice consistency)
- CA: Not possible in distributed systems

