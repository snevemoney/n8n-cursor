#!/usr/bin/env bash
set -euo pipefail

# Category 3: Documentation & Knowledge Management - Generate comprehensive documentation
# Usage: ./scripts/cursor-categories/generate-docs.sh "Service Name" [Doc Type]

SERVICE_NAME="${1:-}"
DOC_TYPE="${2:-api_reference}"

if [ -z "$SERVICE_NAME" ]; then
    echo "❌ ERROR: Service name required"
    echo "Usage: $0 \"Service Name\" [Doc Type]"
    echo "Doc Types: api_reference, user_guide, architecture, deployment, troubleshooting"
    exit 1
fi

# Convert service name to safe filename
SERVICE_SLUG=$(echo "$SERVICE_NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

echo "📚 Generating $DOC_TYPE documentation for: $SERVICE_NAME"
echo "📁 Service slug: $SERVICE_SLUG"

# Create documentation directory structure
DOC_DIR="docs/services/$SERVICE_SLUG"
mkdir -p "$DOC_DIR"

# Generate documentation based on type
case "$DOC_TYPE" in
    "api_reference")
        generate_api_reference
        ;;
    "user_guide")
        generate_user_guide
        ;;
    "architecture")
        generate_architecture_docs
        ;;
    "deployment")
        generate_deployment_docs
        ;;
    "troubleshooting")
        generate_troubleshooting_docs
        ;;
    *)
        echo "❌ ERROR: Unknown doc type: $DOC_TYPE"
        exit 1
        ;;
esac

echo "✅ Documentation generated successfully!"
echo ""
echo "📁 Files created in: $DOC_DIR"
echo ""
echo "🔧 Next steps:"
echo "  1. Review and customize documentation"
echo "  2. Add service-specific examples"
echo "  3. Update links and references"
echo "  4. Add to main documentation index"
echo "  5. Set up automated doc updates"

# Function to generate API reference documentation
generate_api_reference() {
    cat > "$DOC_DIR/README.md" << EOF
# ${SERVICE_NAME} API Reference

## Overview
This document provides comprehensive API reference for the ${SERVICE_NAME} service.

## Base URL
\`\`\`
https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG
\`\`\`

## Authentication
All API requests require authentication using Bearer tokens:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_TOKEN" \\
     https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/endpoint
\`\`\`

## Endpoints

### Health Check
\`\`\`http
GET /healthz
\`\`\`

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
\`\`\`

### Main Endpoint
\`\`\`http
POST /execute
\`\`\`

**Request Body:**
\`\`\`json
{
  "action": "string",
  "parameters": {
    "key": "value"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "result": "string"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
\`\`\`

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "code": 400
}
\`\`\`

### 401 Unauthorized
\`\`\`json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token",
  "code": 401
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": 500
}
\`\`\`

## Rate Limiting
- **Limit**: 100 requests per minute
- **Headers**: 
  - \`X-RateLimit-Limit\`
  - \`X-RateLimit-Remaining\`
  - \`X-RateLimit-Reset\`

## Examples

### cURL
\`\`\`bash
# Health check
curl -X GET https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz

# Execute action
curl -X POST https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/execute \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "action": "example",
    "parameters": {
      "input": "test"
    }
  }'
\`\`\`

### JavaScript
\`\`\`javascript
const response = await fetch('https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    action: 'example',
    parameters: {
      input: 'test'
    }
  })
});

const data = await response.json();
console.log(data);
\`\`\`

### Python
\`\`\`python
import requests

url = 'https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/execute'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
}
data = {
    'action': 'example',
    'parameters': {
        'input': 'test'
    }
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)
\`\`\`

## SDKs
- **JavaScript/TypeScript**: \`npm install @lightningflow/$SERVICE_SLUG\`
- **Python**: \`pip install lightningflow-$SERVICE_SLUG\`
- **Go**: \`go get github.com/lightningflow/$SERVICE_SLUG\`

## Support
- **Documentation**: https://docs.lightningflow.online/$SERVICE_SLUG
- **Issues**: https://github.com/lightningflow/lightningflow-ai/issues
- **Discord**: https://discord.gg/lightningflow
EOF

    # Generate OpenAPI specification
    cat > "$DOC_DIR/openapi.yaml" << EOF
openapi: 3.0.3
info:
  title: ${SERVICE_NAME} API
  description: API reference for ${SERVICE_NAME} service
  version: 1.0.0
  contact:
    name: LightningFlow AI Support
    url: https://evenslouis.ca/lightningflow/support
    email: support@evenslouis.ca

servers:
  - url: https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG
    description: Production server
  - url: https://staging.lightningflow.online/api/$SERVICE_SLUG
    description: Staging server

paths:
  /healthz:
    get:
      summary: Health check
      description: Check service health status
      tags:
        - Health
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: healthy
                  timestamp:
                    type: string
                    format: date-time
                  version:
                    type: string
                    example: 1.0.0

  /execute:
    post:
      summary: Execute action
      description: Execute a specific action with parameters
      tags:
        - Actions
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - action
              properties:
                action:
                  type: string
                  description: Action to execute
                  example: example
                parameters:
                  type: object
                  description: Action parameters
                  example:
                    input: test
      responses:
        '200':
          description: Action executed successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      result:
                        type: string
                  timestamp:
                    type: string
                    format: date-time
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                \$ref: '#/components/schemas/Error'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                \$ref: '#/components/schemas/Error'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                \$ref: '#/components/schemas/Error'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Error:
      type: object
      properties:
        error:
          type: string
        message:
          type: string
        code:
          type: integer
      required:
        - error
        - message
        - code
EOF
}

# Function to generate user guide documentation
generate_user_guide() {
    cat > "$DOC_DIR/README.md" << EOF
# ${SERVICE_NAME} User Guide

## Getting Started

### Prerequisites
- LightningFlow AI account
- API access token
- Basic understanding of REST APIs

### Installation
\`\`\`bash
# Install the SDK
npm install @lightningflow/$SERVICE_SLUG

# Or with yarn
yarn add @lightningflow/$SERVICE_SLUG
\`\`\`

### Quick Start
\`\`\`javascript
import { ${SERVICE_NAME//[^a-zA-Z0-9]/} } from '@lightningflow/$SERVICE_SLUG';

const client = new ${SERVICE_NAME//[^a-zA-Z0-9]/}({
  apiKey: 'your-api-key',
  baseUrl: 'https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG'
});

// Execute an action
const result = await client.execute({
  action: 'example',
  parameters: {
    input: 'Hello World'
  }
});

console.log(result);
\`\`\`

## Configuration

### Environment Variables
\`\`\`bash
LIGHTNINGFLOW_API_KEY=your-api-key
LIGHTNINGFLOW_BASE_URL=https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG
LIGHTNINGFLOW_TIMEOUT=30000
\`\`\`

### Configuration Options
\`\`\`javascript
const config = {
  apiKey: 'your-api-key',
  baseUrl: 'https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG',
  timeout: 30000,
  retries: 3,
  debug: false
};
\`\`\`

## Usage Examples

### Basic Usage
\`\`\`javascript
// Initialize the client
const client = new ${SERVICE_NAME//[^a-zA-Z0-9]/}(config);

// Check service health
const health = await client.healthCheck();
console.log('Service status:', health.status);

// Execute an action
const result = await client.execute({
  action: 'process',
  parameters: {
    data: 'example data'
  }
});
\`\`\`

### Error Handling
\`\`\`javascript
try {
  const result = await client.execute({
    action: 'example',
    parameters: { input: 'test' }
  });
  console.log('Success:', result);
} catch (error) {
  if (error.status === 401) {
    console.error('Authentication failed');
  } else if (error.status === 429) {
    console.error('Rate limit exceeded');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
\`\`\`

### Advanced Usage
\`\`\`javascript
// Batch operations
const operations = [
  { action: 'process', parameters: { input: 'data1' } },
  { action: 'process', parameters: { input: 'data2' } },
  { action: 'process', parameters: { input: 'data3' } }
];

const results = await Promise.all(
  operations.map(op => client.execute(op))
);
\`\`\`

## Best Practices

### 1. Error Handling
Always implement proper error handling:

\`\`\`javascript
try {
  const result = await client.execute(action);
  // Handle success
} catch (error) {
  // Handle error appropriately
  console.error('Operation failed:', error.message);
}
\`\`\`

### 2. Rate Limiting
Respect rate limits and implement backoff:

\`\`\`javascript
const executeWithRetry = async (action, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.execute(action);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
};
\`\`\`

### 3. Caching
Implement caching for frequently accessed data:

\`\`\`javascript
const cache = new Map();

const getCachedResult = async (action) => {
  const key = JSON.stringify(action);
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await client.execute(action);
  cache.set(key, result);
  return result;
};
\`\`\`

## Troubleshooting

### Common Issues

#### Authentication Errors
\`\`\`
Error: 401 Unauthorized
\`\`\`
**Solution**: Check your API key and ensure it's valid.

#### Rate Limit Exceeded
\`\`\`
Error: 429 Too Many Requests
\`\`\`
**Solution**: Implement exponential backoff or reduce request frequency.

#### Timeout Errors
\`\`\`
Error: Request timeout
\`\`\`
**Solution**: Increase timeout value or check network connectivity.

### Debug Mode
Enable debug mode for detailed logging:

\`\`\`javascript
const client = new ${SERVICE_NAME//[^a-zA-Z0-9]/}({
  ...config,
  debug: true
});
\`\`\`

## Support

### Getting Help
- **Documentation**: https://docs.lightningflow.online/$SERVICE_SLUG
- **GitHub Issues**: https://github.com/lightningflow/lightningflow-ai/issues
- **Discord Community**: https://discord.gg/lightningflow
- **Email Support**: support@evenslouis.ca

### Reporting Bugs
When reporting bugs, please include:
1. SDK version
2. Node.js version
3. Error message and stack trace
4. Steps to reproduce
5. Expected vs actual behavior
EOF
}

# Function to generate architecture documentation
generate_architecture_docs() {
    cat > "$DOC_DIR/README.md" << EOF
# ${SERVICE_NAME} Architecture

## Overview
This document describes the architecture and design decisions for the ${SERVICE_NAME} service.

## System Architecture

\`\`\`mermaid
graph TB
    A[Client] --> B[API Gateway]
    B --> C[${SERVICE_NAME} Service]
    C --> D[Database]
    C --> E[Redis Cache]
    C --> F[External APIs]
    
    G[Monitoring] --> C
    H[Logging] --> C
    I[Metrics] --> C
\`\`\`

## Components

### API Gateway
- **Purpose**: Request routing, authentication, rate limiting
- **Technology**: Caddy
- **Configuration**: \`infra/caddy/Caddyfile\`

### ${SERVICE_NAME} Service
- **Purpose**: Core business logic and data processing
- **Technology**: Node.js, TypeScript
- **Port**: 127.0.0.1:PORT
- **Health Check**: \`/healthz\`

### Database
- **Purpose**: Persistent data storage
- **Technology**: Supabase (PostgreSQL)
- **Connection**: Connection pooling, SSL enabled

### Redis Cache
- **Purpose**: Session storage, rate limiting, temporary data
- **Technology**: Redis
- **Configuration**: Clustering, persistence

### External APIs
- **Purpose**: Third-party integrations
- **Examples**: LNbits, Lightning Network, Bitcoin APIs

## Data Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant G as API Gateway
    participant S as ${SERVICE_NAME} Service
    participant D as Database
    participant R as Redis
    participant E as External API
    
    C->>G: HTTP Request
    G->>G: Authenticate & Rate Limit
    G->>S: Forward Request
    S->>R: Check Cache
    alt Cache Hit
        R->>S: Return Cached Data
    else Cache Miss
        S->>D: Query Database
        D->>S: Return Data
        S->>R: Update Cache
    end
    S->>E: Call External API
    E->>S: Return Response
    S->>G: Return Response
    G->>C: HTTP Response
\`\`\`

## Security Architecture

### Authentication
- **Method**: JWT Bearer tokens
- **Storage**: Redis (with expiration)
- **Validation**: Signature verification, expiration check

### Authorization
- **Method**: Role-based access control (RBAC)
- **Implementation**: Middleware-based permission checking
- **Audit**: All actions logged with user context

### Data Protection
- **Encryption**: TLS 1.3 for transport, AES-256 for storage
- **Secrets**: Environment variables, no hardcoded secrets
- **Input Validation**: Schema validation, sanitization

## Performance Considerations

### Caching Strategy
- **Redis**: Session data, frequently accessed data
- **Application**: In-memory caching for static data
- **CDN**: Static assets, API responses

### Database Optimization
- **Indexing**: Optimized indexes for common queries
- **Connection Pooling**: PgBouncer for connection management
- **Query Optimization**: Prepared statements, query analysis

### Scalability
- **Horizontal**: Load balancing, multiple instances
- **Vertical**: Resource limits, monitoring
- **Auto-scaling**: Based on CPU/memory usage

## Monitoring & Observability

### Metrics
- **Application**: Response times, error rates, throughput
- **Infrastructure**: CPU, memory, disk, network
- **Business**: User actions, conversion rates

### Logging
- **Format**: Structured JSON logs
- **Levels**: DEBUG, INFO, WARN, ERROR
- **Aggregation**: Centralized logging with search

### Alerting
- **Thresholds**: Response time > 1s, error rate > 5%
- **Channels**: Slack, email, PagerDuty
- **Escalation**: Automatic escalation for critical alerts

## Deployment Architecture

### Environment Strategy
- **Development**: Local development, hot reloading
- **Staging**: Production-like environment, testing
- **Production**: High availability, monitoring

### Container Strategy
- **Base Image**: Node.js official image
- **Security**: Non-root user, minimal dependencies
- **Size**: Optimized image size, multi-stage builds

### Infrastructure as Code
- **Docker Compose**: Service orchestration
- **Caddy**: Reverse proxy, SSL termination
- **Monitoring**: Prometheus, Grafana, Loki

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups
- **Configuration**: Version controlled, automated deployment
- **Secrets**: Encrypted backup, secure storage

### Recovery Procedures
- **RTO**: 15 minutes (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Testing**: Monthly disaster recovery drills

## Future Considerations

### Planned Improvements
- **Microservices**: Break down into smaller services
- **Event Sourcing**: Implement event-driven architecture
- **GraphQL**: Add GraphQL API layer

### Scalability Roadmap
- **Kubernetes**: Container orchestration
- **Service Mesh**: Istio for service communication
- **Multi-region**: Global deployment strategy
EOF
}

# Function to generate deployment documentation
generate_deployment_docs() {
    cat > "$DOC_DIR/README.md" << EOF
# ${SERVICE_NAME} Deployment Guide

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: Minimum 2 cores, Recommended 4 cores+
- **Disk**: Minimum 20GB free space
- **Network**: Internet access for package downloads

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (for development)
- **Git**: Latest version

### Access Requirements
- **SSH**: Access to target server
- **Domain**: Configured DNS records
- **SSL**: SSL certificate (Let's Encrypt recommended)

## Installation

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/lightningflow/lightningflow-ai.git
cd lightningflow-ai
\`\`\`

### 2. Environment Configuration
\`\`\`bash
# Copy environment template
cp env-templates/lightningflow-production.example .env

# Edit environment variables
nano .env
\`\`\`

**Required Environment Variables:**
\`\`\`bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lightningflow
REDIS_URL=redis://localhost:6379

# API Keys
LIGHTNINGFLOW_API_KEY=your-secret-api-key
LNbits_API_KEY=your-lnbits-api-key

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# External Services
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

### 3. Build and Deploy
\`\`\`bash
# Build the application
make build

# Deploy to production
make deploy-prod
\`\`\`

## Configuration

### Docker Compose
\`\`\`yaml
version: "3.9"

name: lfai_prod

services:
  ${SERVICE_SLUG}:
    image: lfai/${SERVICE_SLUG}:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_URL=\${REDIS_URL}
    ports:
      - "127.0.0.1:PORT:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    networks:
      - internal

networks:
  internal:
    driver: bridge
\`\`\`

### Caddy Configuration
\`\`\`caddy
lightningflow.online {
    reverse_proxy /api/$SERVICE_SLUG/* 127.0.0.1:PORT
    
    # Health check
    handle /healthz {
        reverse_proxy 127.0.0.1:PORT
    }
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
    }
}
\`\`\`

## Deployment Strategies

### Blue-Green Deployment
\`\`\`bash
# Deploy to blue environment
make deploy-blue

# Test blue environment
make test-blue

# Switch traffic to blue
make switch-to-blue

# Keep green as backup
make keep-green-backup
\`\`\`

### Rolling Deployment
\`\`\`bash
# Deploy with zero downtime
make deploy-rolling

# Monitor deployment
make monitor-deployment

# Rollback if needed
make rollback
\`\`\`

## Monitoring

### Health Checks
\`\`\`bash
# Check service health
curl -f https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz

# Check all services
make health-check
\`\`\`

### Logs
\`\`\`bash
# View service logs
docker compose logs -f ${SERVICE_SLUG}

# View all logs
make logs
\`\`\`

### Metrics
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **Loki**: http://localhost:3100

## Maintenance

### Updates
\`\`\`bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
make build
make deploy-prod
\`\`\`

### Backups
\`\`\`bash
# Create backup
make backup

# Restore from backup
make restore
\`\`\`

### Cleanup
\`\`\`bash
# Clean up old containers
docker system prune -f

# Clean up old images
docker image prune -f
\`\`\`

## Troubleshooting

### Common Issues

#### Service Won't Start
\`\`\`bash
# Check logs
docker compose logs ${SERVICE_SLUG}

# Check configuration
docker compose config

# Restart service
docker compose restart ${SERVICE_SLUG}
\`\`\`

#### Database Connection Issues
\`\`\`bash
# Test database connection
docker compose exec ${SERVICE_SLUG} npm run test:db

# Check database status
docker compose ps database
\`\`\`

#### High Memory Usage
\`\`\`bash
# Check memory usage
docker stats

# Restart service
docker compose restart ${SERVICE_SLUG}
\`\`\`

### Performance Issues
\`\`\`bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz

# Check resource usage
make resource-check
\`\`\`

## Security

### SSL/TLS
- **Certificate**: Let's Encrypt (automatic renewal)
- **Protocol**: TLS 1.3
- **Ciphers**: Modern, secure ciphers only

### Firewall
\`\`\`bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
\`\`\`

### Updates
\`\`\`bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
\`\`\`

## Support

### Getting Help
- **Documentation**: https://docs.lightningflow.online
- **GitHub Issues**: https://github.com/lightningflow/lightningflow-ai/issues
- **Discord**: https://discord.gg/lightningflow
- **Email**: support@evenslouis.ca

### Emergency Contacts
- **Critical Issues**: support@evenslouis.ca
- **Security Issues**: security@evenslouis.ca
- **Outage**: +1-XXX-XXX-XXXX
EOF
}

# Function to generate troubleshooting documentation
generate_troubleshooting_docs() {
    cat > "$DOC_DIR/README.md" << EOF
# ${SERVICE_NAME} Troubleshooting Guide

## Quick Diagnostics

### Service Status
\`\`\`bash
# Check if service is running
docker compose ps ${SERVICE_SLUG}

# Check service health
curl -f https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz

# Check service logs
docker compose logs -f ${SERVICE_SLUG}
\`\`\`

### System Resources
\`\`\`bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU usage
top
\`\`\`

## Common Issues

### 1. Service Won't Start

#### Symptoms
- Service shows as "Exited" in \`docker compose ps\`
- Health check fails
- No response from API endpoints

#### Diagnosis
\`\`\`bash
# Check container logs
docker compose logs ${SERVICE_SLUG}

# Check container status
docker inspect \$(docker compose ps -q ${SERVICE_SLUG})

# Check resource limits
docker stats \$(docker compose ps -q ${SERVICE_SLUG})
\`\`\`

#### Solutions
1. **Check logs for errors**:
   \`\`\`bash
   docker compose logs ${SERVICE_SLUG} | grep -i error
   \`\`\`

2. **Verify environment variables**:
   \`\`\`bash
   docker compose config
   \`\`\`

3. **Check resource limits**:
   \`\`\`bash
   # Increase memory limit if needed
   docker compose up -d --scale ${SERVICE_SLUG}=1
   \`\`\`

4. **Restart service**:
   \`\`\`bash
   docker compose restart ${SERVICE_SLUG}
   \`\`\`

### 2. Database Connection Issues

#### Symptoms
- "Database connection failed" errors
- Timeout errors
- Connection pool exhausted

#### Diagnosis
\`\`\`bash
# Test database connection
docker compose exec ${SERVICE_SLUG} npm run test:db

# Check database status
docker compose ps database

# Check database logs
docker compose logs database
\`\`\`

#### Solutions
1. **Check database status**:
   \`\`\`bash
   docker compose ps database
   \`\`\`

2. **Restart database**:
   \`\`\`bash
   docker compose restart database
   \`\`\`

3. **Check connection string**:
   \`\`\`bash
   echo \$DATABASE_URL
   \`\`\`

4. **Increase connection pool**:
   \`\`\`bash
   # Update environment variable
   export DATABASE_POOL_SIZE=20
   docker compose up -d
   \`\`\`

### 3. High Memory Usage

#### Symptoms
- Service consumes excessive memory
- Out of memory errors
- System becomes unresponsive

#### Diagnosis
\`\`\`bash
# Check memory usage
docker stats

# Check service memory
docker stats \$(docker compose ps -q ${SERVICE_SLUG})

# Check system memory
free -h
\`\`\`

#### Solutions
1. **Restart service**:
   \`\`\`bash
   docker compose restart ${SERVICE_SLUG}
   \`\`\`

2. **Increase memory limit**:
   \`\`\`yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
   \`\`\`

3. **Check for memory leaks**:
   \`\`\`bash
   # Monitor memory over time
   watch -n 5 'docker stats --no-stream'
   \`\`\`

### 4. Slow Response Times

#### Symptoms
- API responses take > 1 second
- Timeout errors
- High latency

#### Diagnosis
\`\`\`bash
# Test response time
curl -w "@curl-format.txt" -o /dev/null -s https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz

# Check CPU usage
top

# Check network latency
ping lightningflow.online
\`\`\`

#### Solutions
1. **Check CPU usage**:
   \`\`\`bash
   top
   \`\`\`

2. **Scale service**:
   \`\`\`bash
   docker compose up -d --scale ${SERVICE_SLUG}=2
   \`\`\`

3. **Check database performance**:
   \`\`\`bash
   docker compose exec database psql -c "SELECT * FROM pg_stat_activity;"
   \`\`\`

### 5. Authentication Issues

#### Symptoms
- 401 Unauthorized errors
- Token validation failures
- Session expired errors

#### Diagnosis
\`\`\`bash
# Check authentication logs
docker compose logs ${SERVICE_SLUG} | grep -i auth

# Test with valid token
curl -H "Authorization: Bearer VALID_TOKEN" https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz
\`\`\`

#### Solutions
1. **Check JWT secret**:
   \`\`\`bash
   echo \$JWT_SECRET
   \`\`\`

2. **Verify token format**:
   \`\`\`bash
   # Token should be valid JWT
   echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | base64 -d
   \`\`\`

3. **Check Redis connection**:
   \`\`\`bash
   docker compose exec redis redis-cli ping
   \`\`\`

## Performance Tuning

### Database Optimization
\`\`\`bash
# Check slow queries
docker compose exec database psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Analyze table statistics
docker compose exec database psql -c "ANALYZE;"
\`\`\`

### Redis Optimization
\`\`\`bash
# Check Redis memory usage
docker compose exec redis redis-cli info memory

# Check Redis performance
docker compose exec redis redis-cli --latency
\`\`\`

### Application Optimization
\`\`\`bash
# Enable debug mode
export DEBUG=*
docker compose up -d

# Check application metrics
curl https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/metrics
\`\`\`

## Monitoring & Alerting

### Health Checks
\`\`\`bash
# Automated health check
#!/bin/bash
if ! curl -f https://evenslouis.ca/lightningflow/api/$SERVICE_SLUG/healthz >/dev/null 2>&1; then
    echo "Service is down!" | mail -s "Alert: ${SERVICE_SLUG} down" admin@evenslouis.ca
fi
\`\`\`

### Log Monitoring
\`\`\`bash
# Monitor error logs
tail -f /var/log/lightningflow/${SERVICE_SLUG}.log | grep -i error

# Monitor access logs
tail -f /var/log/lightningflow/access.log | grep "/api/$SERVICE_SLUG"
\`\`\`

### Metrics Collection
\`\`\`bash
# Check Prometheus metrics
curl http://localhost:9090/api/v1/query?query=up

# Check Grafana dashboards
open http://localhost:3000
\`\`\`

## Emergency Procedures

### Service Outage
1. **Check service status**:
   \`\`\`bash
   docker compose ps
   \`\`\`

2. **Restart service**:
   \`\`\`bash
   docker compose restart ${SERVICE_SLUG}
   \`\`\`

3. **Check logs**:
   \`\`\`bash
   docker compose logs -f ${SERVICE_SLUG}
   \`\`\`

4. **Scale up**:
   \`\`\`bash
   docker compose up -d --scale ${SERVICE_SLUG}=2
   \`\`\`

### Data Corruption
1. **Stop service**:
   \`\`\`bash
   docker compose stop ${SERVICE_SLUG}
   \`\`\`

2. **Restore from backup**:
   \`\`\`bash
   make restore
   \`\`\`

3. **Restart service**:
   \`\`\`bash
   docker compose start ${SERVICE_SLUG}
   \`\`\`

### Security Incident
1. **Isolate service**:
   \`\`\`bash
   docker compose stop ${SERVICE_SLUG}
   \`\`\`

2. **Check logs**:
   \`\`\`bash
   docker compose logs ${SERVICE_SLUG} | grep -i security
   \`\`\`

3. **Update secrets**:
   \`\`\`bash
   # Generate new secrets
   openssl rand -hex 32
   \`\`\`

4. **Restart with new secrets**:
   \`\`\`bash
   docker compose up -d
   \`\`\`

## Support

### Getting Help
- **Documentation**: https://docs.lightningflow.online/$SERVICE_SLUG
- **GitHub Issues**: https://github.com/lightningflow/lightningflow-ai/issues
- **Discord**: https://discord.gg/lightningflow
- **Email**: support@evenslouis.ca

### Escalation
- **Level 1**: Community support (Discord, GitHub)
- **Level 2**: Email support (support@evenslouis.ca)
- **Level 3**: Emergency support (security@evenslouis.ca)
EOF
}
