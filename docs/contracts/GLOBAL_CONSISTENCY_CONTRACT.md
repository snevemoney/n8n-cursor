# GLOBAL CONSISTENCY CONTRACT
## LightningFlow AI - Enterprise-Grade Consistency Enforcement

This contract ensures global consistency across all aspects of the LightningFlow AI platform. Every change must conform to these rules.

---

## 🎯 **Core Principles**

### **Single Sources of Truth**
- **APIs**: `contracts/openapi.yaml` - All REST endpoints, payloads, responses
- **Events**: `contracts/events.yaml` - All webhook/queue message schemas
- **Flags**: `contracts/flags.schema.json` - Feature flag registry with types
- **Errors**: `contracts/errors.yaml` - Error codes, messages, HTTP statuses
- **Telemetry**: `contracts/telemetry.yaml` - Span names, metrics, attributes
- **Database**: `schema/db.sql` - Canonical database schema
- **Routes**: `docs/ROUTES.md` - All API routes and Caddy mappings

### **Generated Code Only**
- **Types**: Generated from contracts, never hand-written
- **Validators**: Generated from schemas, never ad-hoc
- **Constants**: Generated from contracts, never duplicated

---

## 📋 **Mandatory Rules**

### **1. API Consistency**
- **MUST** conform to `contracts/openapi.yaml`
- **MUST** use generated types from `packages/contracts/src/openapi.ts`
- **MUST** validate requests/responses with generated validators
- **MUST** update OpenAPI spec before implementing new endpoints
- **MUST** use consistent error responses from `packages/contracts/src/errors.ts`

### **2. Event/Webhook Consistency**
- **MUST** conform to `contracts/events.yaml` schemas
- **MUST** validate with Ajv validators from `packages/contracts/src/events.ts`
- **MUST** include version field in all messages
- **MUST** use consistent event types and payloads

### **3. Feature Flag Consistency**
- **MUST** exist in `contracts/flags.schema.json`
- **MUST** use typed flags from `packages/contracts/src/flags.ts`
- **MUST** include default values and validation rules
- **MUST** use consistent naming: `NEXT_PUBLIC_FF_*` for client, `FF_*` for server

### **4. Error Handling Consistency**
- **MUST** use error codes from `contracts/errors.yaml`
- **MUST** use error helpers from `packages/contracts/src/errors.ts`
- **MUST** include consistent error response format
- **MUST** map error codes to appropriate HTTP statuses

### **5. Data/Time/Currency Consistency**
- **MUST** use UTC for all timestamps
- **MUST** use ISO-8601 format for date/time
- **MUST** use integer minor units (sats) for currency
- **MUST** use decimal.js for currency math (never float)
- **MUST** store currency as integers in database

### **6. Telemetry Consistency**
- **MUST** use span names from `packages/contracts/src/telemetry.ts`
- **MUST** use metric names from contracts
- **MUST** include consistent attributes and tags
- **MUST** use structured logging with consistent shape

### **7. Database Consistency**
- **MUST** include migration files for all schema changes
- **MUST** update `schema/db.sql` with changes
- **MUST** include rollback plans for all migrations
- **MUST** use consistent naming conventions

### **8. Route Consistency**
- **MUST** update `docs/ROUTES.md` for new endpoints
- **MUST** update Caddy configuration for new routes
- **MUST** use consistent URL patterns and versions

---

## 🔧 **Implementation Requirements**

### **Before Any Change**
1. **Check contracts** - Does this change require contract updates?
2. **Update contracts** - Modify the appropriate contract files
3. **Generate types** - Run type generation from contracts
4. **Update code** - Use generated types and validators
5. **Validate** - Ensure all consistency checks pass

### **Contract Update Process**
1. **Modify contract** (openapi.yaml, events.yaml, etc.)
2. **Generate types** - `npm run generate-types`
3. **Update code** - Use new generated types
4. **Run tests** - Ensure all validations pass
5. **Update docs** - Update relevant documentation

### **Code Generation**
```bash
# Generate all types from contracts
npm run generate-types

# Generate specific types
npm run generate:openapi
npm run generate:events
npm run generate:flags
npm run generate:errors
npm run generate:telemetry
```

---

## 🚫 **Forbidden Patterns**

### **Never Do These**
- ❌ Hand-write API types (use generated types)
- ❌ Create ad-hoc error responses (use error catalog)
- ❌ Use local time (use UTC only)
- ❌ Use float math for currency (use decimal.js)
- ❌ Create new files without updating contracts
- ❌ Use hardcoded strings for telemetry names
- ❌ Skip validation for external inputs
- ❌ Create inconsistent naming patterns

### **Always Do These**
- ✅ Use generated types from contracts
- ✅ Validate all inputs with generated validators
- ✅ Use error helpers from contracts
- ✅ Use typed feature flags
- ✅ Use consistent telemetry names
- ✅ Update contracts before implementing features
- ✅ Include rollback plans for all changes

---

## 📊 **Validation Gates**

### **CI/CD Checks**
- **Contract validation** - All contracts must be valid
- **Type generation** - Generated types must compile
- **Consistency checks** - No ad-hoc patterns allowed
- **Error catalog** - All error codes must be documented
- **Flag validation** - All flags must be in schema
- **OpenAPI linting** - API spec must be valid

### **Local Development**
- **Pre-commit hooks** - Validate contracts before commit
- **Type checking** - Ensure all types are generated
- **Linting** - Enforce consistent patterns
- **Testing** - Validate all consistency rules

---

## 🎯 **Cursor Integration**

### **System Prompt Addition**
```
## Global Consistency Contract (MANDATORY)
Before making any changes:
1. Check if contracts need updates (openapi/events/flags/errors/telemetry/schema)
2. Update contracts first, then generate types
3. Use generated types and validators in code
4. Follow all consistency rules
5. Include rollback plans for all changes

### Output Format
1) Context Check (PROJECT, ENV, AFFECTED_PATHS)
2) Contract Updates (which contracts changed + diffs)
3) Generated Types (what types were generated)
4) Code Changes (using generated types)
5) Validation (consistency checks)
6) Rollback (revert contract + code)
```

### **Task Ticket Format**
```
PROJECT=lfai ENV=int AFFECTED_PATHS=apps/**,packages/**,contracts/**
GOAL=<what to build>
CONSTRAINTS=Global Consistency Contract; use generated types only
CONTRACTS_IMPACTED=openapi/events/flags/errors/telemetry/schema
```

---

## 🚀 **Quick Start**

### **1. Set Up Contracts**
```bash
# Create contracts directory
mkdir -p contracts
mkdir -p packages/contracts/src

# Add initial contract files
touch contracts/openapi.yaml
touch contracts/events.yaml
touch contracts/flags.schema.json
touch contracts/errors.yaml
touch contracts/telemetry.yaml
```

### **2. Generate Types**
```bash
# Install dependencies
npm install openapi-typescript ajv ajv-formats

# Generate types
npm run generate-types
```

### **3. Use in Code**
```typescript
// Use generated types
import { ApiTypes } from 'packages/contracts/src/openapi';
import { validateRequest } from 'packages/contracts/src/validators';
import { err } from 'packages/contracts/src/errors';
import { flags } from 'packages/contracts/src/flags';
```

### **4. Validate Changes**
```bash
# Run consistency checks
npm run consistency-check

# Run all validations
npm run validate-all
```

---

## 📚 **Documentation**

### **Contract Files**
- `contracts/openapi.yaml` - API specification
- `contracts/events.yaml` - Event schemas
- `contracts/flags.schema.json` - Feature flag registry
- `contracts/errors.yaml` - Error catalog
- `contracts/telemetry.yaml` - Telemetry specification
- `schema/db.sql` - Database schema

### **Generated Code**
- `packages/contracts/src/openapi.ts` - API types and validators
- `packages/contracts/src/events.ts` - Event types and validators
- `packages/contracts/src/flags.ts` - Typed feature flags
- `packages/contracts/src/errors.ts` - Error helpers
- `packages/contracts/src/telemetry.ts` - Telemetry helpers

### **Documentation**
- `docs/ROUTES.md` - API routes and mappings
- `docs/CONFIG_MAP.md` - Configuration locations
- `docs/PROJECT_SCOPE.md` - Project boundaries

---

## 🎉 **Benefits**

### **For Developers**
- **Consistent APIs** - No more guessing about request/response shapes
- **Type Safety** - Generated types prevent runtime errors
- **Clear Contracts** - Single source of truth for all interfaces
- **Easy Validation** - Generated validators for all inputs

### **For the Project**
- **No Drift** - Contracts prevent inconsistent implementations
- **Easy Onboarding** - New developers understand the system quickly
- **Reliable Changes** - All changes follow consistent patterns
- **Better Testing** - Generated types enable better test coverage

### **For Users**
- **Stable APIs** - Consistent behavior across all endpoints
- **Better Errors** - Clear, consistent error messages
- **Reliable Features** - Feature flags work consistently
- **Better Performance** - Consistent telemetry enables optimization

---

**This contract is non-negotiable. All changes must conform to these rules.**
