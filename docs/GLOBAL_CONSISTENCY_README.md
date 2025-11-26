# LightningFlow AI Global Consistency System

This document provides a comprehensive guide to the LightningFlow AI Global Consistency System, which ensures that all code, configurations, and data structures maintain consistency across the entire codebase.

## 🎯 Overview

The Global Consistency System is designed to prevent drift and maintain uniformity across:
- API contracts and schemas
- Feature flags and configuration
- Error handling and codes
- Database schemas and migrations
- Telemetry and observability
- Currency and time handling
- Security and validation

## 📁 System Architecture

```
lightningflow-ai/
├── contracts/                 # Single source of truth for all contracts
│   ├── openapi.yaml          # API specification
│   ├── events.yaml           # Event schemas
│   ├── flags.schema.json     # Feature flag definitions
│   ├── errors.yaml           # Error catalog
│   └── telemetry.yaml        # Observability schemas
├── schema/
│   └── db.sql               # Canonical database schema
├── packages/contracts/       # Generated types and validators
│   ├── src/
│   │   ├── openapi.ts       # Generated API types
│   │   ├── events.ts        # Generated event types
│   │   ├── flags.ts         # Feature flag utilities
│   │   ├── errors.ts        # Error handling utilities
│   │   ├── telemetry.ts     # Telemetry utilities
│   │   ├── validator.ts     # Validation utilities
│   │   └── utils.ts         # Common utilities
│   └── package.json
├── scripts/migrate/          # Database migration tools
│   ├── create-migration.js   # Create new migrations
│   ├── migrate.js           # Run migrations
│   └── update-schema.js     # Update schema file
├── .github/workflows/
│   └── consistency.yml      # CI/CD consistency validation
└── docs/
    └── GLOBAL_CONSISTENCY_CONTRACT.md  # Mandatory rules
```

## 🚀 Quick Start

### 1. Generate Types from Contracts

```bash
# Generate all types from contracts
npm run contracts:generate

# Build the contracts package
npm run contracts:build

# Validate all contracts
npm run contracts:validate
```

### 2. Create Database Migration

```bash
# Create a new migration
npm run migrate:create add_user_preferences

# Check migration status
npm run migrate:status

# Apply pending migrations
npm run migrate:up

# Rollback a migration
npm run migrate:down <migration-id>
```

### 3. Update Database Schema

```bash
# Update schema file from database
npm run schema:update

# Validate schema file
npm run schema:validate

# Check schema status
npm run schema:status
```

### 4. Run Consistency Checks

```bash
# Run local consistency check
npm run consistency:check

# Validate consistency (CI/CD)
npm run consistency:validate
```

## 📋 Contract Definitions

### API Contracts (`contracts/openapi.yaml`)

Defines all REST API endpoints, request/response schemas, and error responses.

```yaml
paths:
  /users/me:
    get:
      summary: Get current user profile
      responses:
        '200':
          description: User profile retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

### Event Schemas (`contracts/events.yaml`)

Defines all event types, payloads, and validation rules for queues and webhooks.

```yaml
events:
  user.created:
    description: "User account created"
    schema:
      type: object
      required: [user_id, email, created_at]
      properties:
        user_id:
          type: string
          format: uuid
```

### Feature Flags (`contracts/flags.schema.json`)

Defines all feature flags, their types, defaults, and environment-specific values.

```json
{
  "properties": {
    "NEW_DASHBOARD": {
      "type": "boolean",
      "default": false,
      "environments": {
        "int": true,
        "staging": false,
        "prod": false
      }
    }
  }
}
```

### Error Catalog (`contracts/errors.yaml`)

Defines all error codes, messages, HTTP status mappings, and handling policies.

```yaml
errors:
  LFAI-0001:
    http: 400
    message: "Invalid webhook token"
    description: "Webhook signature validation failed"
    category: "authentication"
    retryable: false
    user_facing: false
```

### Telemetry Schema (`contracts/telemetry.yaml`)

Defines OpenTelemetry spans, metrics, and attributes for consistent observability.

```yaml
spans:
  api.request:
    description: "HTTP API request processing"
    attributes:
      required:
        - http.method
        - http.route
        - http.status_code
```

## 🔧 Usage Examples

### Using Generated Types

```typescript
import { User, Payment, LightningFlowError } from '@lightningflow/contracts';

// Type-safe API responses
async function getUser(): Promise<User> {
  const response = await fetch('/api/users/me');
  const user: User = await response.json();
  return user;
}

// Type-safe error handling
try {
  await processPayment();
} catch (error) {
  throw new LightningFlowError('LFAI-0300', { reason: 'Insufficient balance' });
}
```

### Using Feature Flags

```typescript
import { FeatureFlagLoader } from '@lightningflow/contracts';

const flags = new FeatureFlagLoader('prod').loadFromEnv(process.env);

if (flags.isEnabled('NEW_DASHBOARD')) {
  // New dashboard logic
}

const maxJobs = flags.getFlag('MAX_CONCURRENT_JOBS');
```

### Using Currency Utilities

```typescript
import { CurrencyUtils } from '@lightningflow/contracts';

// Convert BTC to satoshis
const sats = CurrencyUtils.btcToSats('0.001'); // 100000 sats

// Safe currency math
const total = CurrencyUtils.addSats(amount1, amount2);
const formatted = CurrencyUtils.formatSats(total); // "150,000 sats"
```

### Using Time Utilities

```typescript
import { TimeUtils } from '@lightningflow/contracts';

// Get current UTC timestamp
const now = TimeUtils.now(); // "2024-01-15T10:30:00.000Z"

// Parse and format timestamps
const dt = TimeUtils.parse(now);
const formatted = TimeUtils.format(now, 'yyyy-MM-dd HH:mm:ss');

// Calculate time differences
const diff = TimeUtils.diffInMinutes(startTime, endTime);
```

### Using Event Validation

```typescript
import { EventValidator, createUserCreatedEvent } from '@lightningflow/contracts';

const validator = new EventValidator();

// Create and validate events
const event = createUserCreatedEvent(userId, email, 'pro');
const validatedEvent = validator.validateOrThrow(event);

// Publish validated event
await eventBus.publish(validatedEvent);
```

## 🛠️ Development Workflow

### 1. Making API Changes

```bash
# 1. Update OpenAPI spec
vim contracts/openapi.yaml

# 2. Generate types
npm run contracts:generate

# 3. Update implementation
vim apps/api/src/routes/users.ts

# 4. Validate consistency
npm run consistency:check
```

### 2. Adding Feature Flags

```bash
# 1. Update flags schema
vim contracts/flags.schema.json

# 2. Generate types
npm run contracts:generate

# 3. Use in code
vim apps/web/src/components/Dashboard.tsx

# 4. Validate consistency
npm run consistency:check
```

### 3. Database Schema Changes

```bash
# 1. Create migration
npm run migrate:create add_user_preferences

# 2. Edit migration files
vim migrations/2024-01-15T10-30-00_add_user_preferences/up.sql
vim migrations/2024-01-15T10-30-00_add_user_preferences/down.sql

# 3. Apply migration
npm run migrate:up

# 4. Update schema file
npm run schema:update
```

## 🔍 Validation and Testing

### Local Validation

```bash
# Check all contracts
npm run contracts:validate

# Check database schema
npm run schema:validate

# Run consistency check
npm run consistency:check

# Check migration status
npm run migrate:status
```

### CI/CD Validation

The `.github/workflows/consistency.yml` workflow automatically validates:

- Contract syntax and structure
- Type generation from contracts
- Feature flag consistency
- Error code usage
- Database schema consistency
- Telemetry schema validation
- Security and best practices

### Migration Testing

```bash
# Validate migration syntax
npm run migrate:validate <migration-id>

# Test migration (up and down)
cd migrations/<migration-id>
./test.sh
```

## 🚨 Common Issues and Solutions

### Issue: Generated types are out of sync

**Solution:**
```bash
npm run contracts:generate
npm run contracts:build
```

### Issue: Feature flag not found

**Solution:**
1. Add flag to `contracts/flags.schema.json`
2. Run `npm run contracts:generate`
3. Use `FeatureFlagLoader` in code

### Issue: Error code not in catalog

**Solution:**
1. Add error to `contracts/errors.yaml`
2. Use `LightningFlowError` class
3. Run consistency check

### Issue: Database schema out of sync

**Solution:**
```bash
npm run schema:update
npm run schema:validate
```

### Issue: Migration fails

**Solution:**
1. Check migration syntax: `npm run migrate:validate <id>`
2. Test migration: `cd migrations/<id> && ./test.sh`
3. Check database connection
4. Review rollback plan

## 📚 Best Practices

### 1. Always Update Contracts First

When making changes, always update the relevant contract file first, then generate types:

```bash
# ❌ Wrong: Update code first
vim apps/api/src/routes/users.ts
npm run contracts:generate

# ✅ Correct: Update contracts first
vim contracts/openapi.yaml
npm run contracts:generate
vim apps/api/src/routes/users.ts
```

### 2. Use Generated Types

Always use generated types instead of hand-written interfaces:

```typescript
// ❌ Wrong: Hand-written types
interface User {
  id: string;
  email: string;
}

// ✅ Correct: Generated types
import { User } from '@lightningflow/contracts';
```

### 3. Validate All Data

Always validate data against schemas:

```typescript
// ❌ Wrong: No validation
const user = await request.json();

// ✅ Correct: Validate first
import { validateOrThrow } from '@lightningflow/contracts';
const user = validateOrThrow(userSchema, await request.json(), 'createUser');
```

### 4. Use Utility Functions

Use utility functions for common operations:

```typescript
// ❌ Wrong: Manual currency math
const amount = 0.001 * 100000000;

// ✅ Correct: Use utilities
import { CurrencyUtils } from '@lightningflow/contracts';
const amount = CurrencyUtils.btcToSats('0.001');
```

### 5. Follow Error Handling Patterns

Use the error catalog for consistent error handling:

```typescript
// ❌ Wrong: Hardcoded errors
throw new Error('User not found');

// ✅ Correct: Use error catalog
import { LightningFlowError } from '@lightningflow/contracts';
throw new LightningFlowError('LFAI-0201');
```

## 🔧 Troubleshooting

### Contracts Package Issues

```bash
# Reinstall dependencies
cd packages/contracts
npm install

# Regenerate types
npm run generate:all

# Build package
npm run build
```

### Migration Issues

```bash
# Check database connection
psql "postgresql://user:pass@host:port/db" -c "SELECT 1"

# Validate migration
npm run migrate:validate <migration-id>

# Check migration status
npm run migrate:status
```

### Consistency Check Failures

```bash
# Run detailed check
npm run consistency:check

# Check specific contracts
npm run contracts:validate

# Check database schema
npm run schema:validate
```

## 📖 Additional Resources

- [Global Consistency Contract](GLOBAL_CONSISTENCY_CONTRACT.md) - Mandatory rules
- [API Documentation](contracts/openapi.yaml) - Complete API specification
- [Event Schemas](contracts/events.yaml) - Event definitions
- [Feature Flags](contracts/flags.schema.json) - Flag definitions
- [Error Catalog](contracts/errors.yaml) - Error definitions
- [Database Schema](schema/db.sql) - Database structure

## 🤝 Contributing

When contributing to the LightningFlow AI codebase:

1. **Read the Global Consistency Contract** - Understand the mandatory rules
2. **Update contracts first** - Always modify contracts before code
3. **Generate types** - Run type generation after contract changes
4. **Validate consistency** - Run consistency checks before submitting
5. **Test migrations** - Validate and test database migrations
6. **Follow patterns** - Use established patterns and utilities

## 📞 Support

For questions or issues with the Global Consistency System:

1. Check this documentation first
2. Review the Global Consistency Contract
3. Run consistency checks to identify issues
4. Check CI/CD logs for validation failures
5. Contact the LightningFlow AI team

---

**Remember**: Consistency is not optional. Every change must follow the Global Consistency Contract to maintain the integrity and reliability of the LightningFlow AI system.
