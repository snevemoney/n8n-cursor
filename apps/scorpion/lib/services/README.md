# Service Registry & Discovery + Service Mesh

Complete service mesh implementation with registry, discovery, load balancing, circuit breakers, and retries.

## Features

### Service Registry & Discovery
- **Service Registry**: Register and discover service instances
- **Health Checking**: Automatic health checks for service instances
- **Load Balancing**: Multiple load balancing strategies (round-robin, least-connections, random, weighted)
- **Service Client**: Easy-to-use client for making requests to discovered services

### Service Mesh
- **Circuit Breakers**: Fault tolerance with automatic circuit opening/closing
- **Retry Logic**: Multiple retry strategies (exponential, linear, fixed) with jitter
- **Mesh Client**: Enhanced client with integrated circuit breakers and retries
- **Monitoring**: Circuit breaker statistics and health tracking

## Usage

### Basic Service Registration

```typescript
import { getServiceRegistry } from '@/lib/services/registry';

const registry = getServiceRegistry();
const serviceId = await registry.register({
  serviceName: 'scorpion-api',
  version: '1.0.0',
  host: 'localhost',
  port: 3003,
  protocol: 'http',
  status: 'healthy',
});
```

### Service Discovery

```typescript
import { getServiceRegistry } from '@/lib/services/registry';

const registry = getServiceRegistry();
const instances = await registry.discover('scorpion-api', true);
```

### Using Service Mesh Client

```typescript
import { getMeshClient } from '@/lib/services/mesh-client';

const meshClient = getMeshClient();

// Make a request with automatic circuit breaking and retries
const data = await meshClient.request('scorpion-api', '/api/v1/status', {
  method: 'GET',
  config: {
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
    },
    retry: {
      maxAttempts: 3,
      initialDelay: 1000,
      strategy: 'exponential',
    },
    timeout: 10000,
  },
});
```

### Circuit Breaker Management

```typescript
import { getMeshClient } from '@/lib/services/mesh-client';

const meshClient = getMeshClient();

// Get circuit breaker stats
const stats = meshClient.getCircuitBreakerStats('scorpion-api');
console.log(stats.state); // 'closed' | 'open' | 'half-open'

// Reset circuit breaker
meshClient.resetCircuitBreaker('scorpion-api');
```

## API Endpoints

### Service Registry
- `POST /api/services/register` - Register a service
- `GET /api/services/discover` - Discover services
- `GET /api/services/health` - Health check all services

### Service Mesh
- `GET /api/services/mesh/stats` - Get circuit breaker statistics
- `POST /api/services/mesh/reset` - Reset circuit breaker for a service

## Circuit Breaker States

1. **Closed**: Normal operation, requests pass through
2. **Open**: Circuit is open, requests fail immediately
3. **Half-Open**: Testing if service recovered, allows limited requests

## Retry Strategies

- **Exponential**: Delay doubles with each attempt (1s, 2s, 4s...)
- **Linear**: Delay increases linearly (1s, 2s, 3s...)
- **Fixed**: Constant delay between attempts

## Load Balancing Strategies

- **Round-Robin**: Distribute requests evenly
- **Least-Connections**: Route to instance with fewest active connections
- **Random**: Randomly select an instance
- **Weighted**: Select based on instance weights

## Integration

The service mesh integrates with:
- **Event Bus**: Emits service events
- **Monitoring**: Circuit breaker metrics contribute to Golden Signals
- **Cost Tracking**: Services are registered as resources

## Testing

All components are fully tested:
- ✅ Circuit Breaker: 10 tests
- ✅ Retry Handler: 5 tests
- ✅ Service Registry: 6 tests
- ✅ Load Balancer: 8 tests
- ✅ Health Checker: 5 tests

**Total: 34 tests passing**
