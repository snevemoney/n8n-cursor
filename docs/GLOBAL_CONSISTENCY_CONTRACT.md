# Global Consistency Contract (MANDATORY)

This document defines the mandatory consistency rules that Cursor and all developers MUST follow when working with the LightningFlow AI codebase. These rules are enforced by CI/CD pipelines and automated validation.

## Core Principles

1. **Single Source of Truth**: All contracts, schemas, and configurations are defined once in the `contracts/` directory
2. **Generated Types**: All TypeScript types are generated from contracts, never hand-written
3. **Validation First**: All data must be validated against schemas before processing
4. **Consistent Patterns**: Use established patterns for errors, logging, telemetry, and data handling
5. **No Drift**: Automated checks prevent inconsistencies from entering the codebase

## Mandatory Rules

### 1. API Contracts
- **MUST** conform to `contracts/openapi.yaml`
- **MUST** use generated types from `packages/contracts/src/openapi.ts`
- **MUST** validate all requests/responses against OpenAPI schemas
- **MUST** use error codes from `contracts/errors.yaml`
- **MUST** include proper HTTP status codes and error responses

### 2. Event Schemas
- **MUST** conform to `contracts/events.yaml`
- **MUST** use generated types from `packages/contracts/src/events.ts`
- **MUST** validate all events with `EventValidator` before publishing
- **MUST** include standard event fields (event_id, event_type, version, timestamp, source)
- **MUST** use proper event types and versions

### 3. Feature Flags
- **MUST** exist in `contracts/flags.schema.json`
- **MUST** use `FeatureFlagLoader` from `packages/contracts/src/flags.ts`
- **MUST** validate flag names with `validateFeatureFlagName()`
- **MUST** use environment-specific defaults
- **MUST NOT** create ad-hoc environment variables for flags

### 4. Error Handling
- **MUST** use error codes from `contracts/errors.yaml`
- **MUST** use `LightningFlowError` class from `packages/contracts/src/errors.ts`
- **MUST** include proper HTTP status codes
- **MUST** provide user-facing error messages for client errors
- **MUST NOT** hardcode error messages or codes

### 5. Data and Time
- **MUST** use UTC for all timestamps
- **MUST** use ISO-8601 format for all dates
- **MUST** use `TimeUtils` from `packages/contracts/src/utils.ts`
- **MUST** use integer satoshis for all currency amounts
- **MUST** use `Decimal.js` for currency calculations
- **MUST** use `CurrencyUtils` from `packages/contracts/src/utils.ts`

### 6. Database Schema
- **MUST** update `schema/db.sql` for any schema changes
- **MUST** create migration files for all changes
- **MUST** include proper indexes and constraints
- **MUST** use RLS policies for multi-tenant data
- **MUST** include audit trails for sensitive operations

### 7. Telemetry and Observability
- **MUST** use span names from `contracts/telemetry.yaml`
- **MUST** use metric names from `packages/contracts/src/telemetry.ts`
- **MUST** include proper attributes and tags
- **MUST** use structured logging with consistent format
- **MUST** include correlation IDs for tracing

### 8. Security
- **MUST** validate all inputs against schemas
- **MUST** use proper authentication headers
- **MUST** implement RLS policies for data access
- **MUST** validate webhook signatures
- **MUST NOT** store secrets in code or contracts

## Implementation Requirements

### Before Making Changes
1. **Check Contracts**: Review relevant contracts in `contracts/` directory
2. **Generate Types**: Run `npm run generate:all` in `packages/contracts`
3. **Validate Schema**: Ensure your changes conform to existing schemas
4. **Update Contracts**: If needed, update contracts first, then generate types

### Code Generation
```bash
# Generate all types from contracts
cd packages/contracts
npm run generate:all
npm run build
```

### Validation
```typescript
// Always validate data against schemas
import { validateOrThrow } from '@lightningflow/contracts';

const validatedData = validateOrThrow(schema, data, 'context');
```

### Error Handling
```typescript
// Use the error catalog
import { LightningFlowError } from '@lightningflow/contracts';

throw new LightningFlowError('LFAI-0100', { field: 'email', reason: 'Invalid format' });
```

### Feature Flags
```typescript
// Use the feature flag system
import { FeatureFlagLoader } from '@lightningflow/contracts';

const flags = new FeatureFlagLoader('prod').loadFromEnv(process.env);
if (flags.isEnabled('NEW_DASHBOARD')) {
  // Feature logic
}
```

### Currency Handling
```typescript
// Use currency utilities
import { CurrencyUtils } from '@lightningflow/contracts';

const amountSats = CurrencyUtils.btcToSats('0.001');
const formatted = CurrencyUtils.formatSats(amountSats);
```

### Time Handling
```typescript
// Use time utilities
import { TimeUtils } from '@lightningflow/contracts';

const now = TimeUtils.now();
const formatted = TimeUtils.format(now, 'yyyy-MM-dd HH:mm:ss');
```

## Validation Checklist

Before submitting any changes, verify:

- [ ] All API endpoints conform to OpenAPI spec
- [ ] All events use proper schemas and validation
- [ ] All feature flags are defined in the schema
- [ ] All errors use codes from the error catalog
- [ ] All timestamps are UTC and ISO-8601 format
- [ ] All currency amounts are in satoshis (integers)
- [ ] All database changes include migrations
- [ ] All telemetry uses proper span/metric names
- [ ] All inputs are validated against schemas
- [ ] All secrets are properly handled

## Automated Enforcement

The following automated checks enforce these rules:

1. **CI/CD Pipeline**: `.github/workflows/consistency.yml`
2. **Type Generation**: Automatic type generation from contracts
3. **Schema Validation**: AJV validation for all data
4. **Error Code Validation**: Ensures all error codes exist in catalog
5. **Feature Flag Validation**: Prevents ad-hoc flag creation
6. **Currency Validation**: Ensures proper satoshi handling
7. **Time Validation**: Ensures UTC timestamps
8. **Security Validation**: Checks for secrets and proper validation

## Violation Consequences

Violations of this contract will:

1. **Block PRs**: CI/CD pipeline will fail
2. **Prevent Deployment**: No code can be deployed with violations
3. **Require Fixes**: All violations must be resolved before merge
4. **Generate Reports**: Detailed violation reports are created

## Getting Help

If you need to:

- **Add a new API endpoint**: Update `contracts/openapi.yaml` first
- **Add a new event type**: Update `contracts/events.yaml` first
- **Add a new feature flag**: Update `contracts/flags.schema.json` first
- **Add a new error code**: Update `contracts/errors.yaml` first
- **Change database schema**: Update `schema/db.sql` and create migration
- **Add telemetry**: Use names from `contracts/telemetry.yaml`

## Examples

### ✅ Correct API Implementation
```typescript
import { User, CreateUserRequest, LightningFlowError } from '@lightningflow/contracts';

export async function createUser(request: CreateUserRequest): Promise<User> {
  // Validate input
  const validatedRequest = validateOrThrow(createUserSchema, request, 'createUser');
  
  try {
    // Business logic
    const user = await userService.create(validatedRequest);
    return user;
  } catch (error) {
    throw new LightningFlowError('LFAI-0206', { email: request.email });
  }
}
```

### ❌ Incorrect Implementation
```typescript
// DON'T: Hand-written types
interface User {
  id: string;
  email: string;
  // ...
}

// DON'T: Hardcoded error messages
throw new Error('User already exists');

// DON'T: Hardcoded feature flags
if (process.env.NEW_DASHBOARD === 'true') {
  // ...
}

// DON'T: Float currency math
const amount = 0.001 * 100000000; // Wrong!
```

## Maintenance

This contract is maintained by the LightningFlow AI team. Updates to the contract require:

1. Team review and approval
2. Update to all affected contracts
3. Regeneration of all types
4. Update to CI/CD validation rules
5. Communication to all developers

---

**Remember**: Consistency is not optional. Every change must follow these rules to maintain the integrity and reliability of the LightningFlow AI system.








