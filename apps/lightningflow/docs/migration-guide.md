# Migration Guide: Implementing Codebase Principles

This guide outlines how to transition the existing Lightning AI Business Node Platform codebase to follow the new [Codebase Principles](./codebase-principles.md). This is an iterative process that can be implemented over time alongside regular feature development.

## Phase 1: Directory Structure Migration

### 1. Create Feature Domains

Start by creating a `features/` directory and migrating existing code into feature-based domains:

```
features/
  payment-links/
    components/
    hooks/
    api/
    types.ts
    utils.ts
  invoices/
    components/
    hooks/
    api/
  transactions/
    components/
    hooks/
    api/
  ai-assistant/
    components/
    hooks/
    api/
```

For example, move code from:
- `web/src/app/payment-links` → `features/payment-links/components`
- `web/src/app/api/payment-links` → `features/payment-links/api`

### 2. Create Background Jobs Directory

Create a `background/` directory to organize async jobs:

```
background/
  invoices/
    check-status.ts
  payments/
    process-webhook.ts
  agents/
    run-ai-tasks.ts
```

Migrate existing worker code from:
- `web/src/workers/` → `background/`

## Phase 2: API Routes Migration

Reorganize API routes to mirror user flows and feature domains:

```
app/
  api/
    payment-links/
      create/
      list/
      [id]/
        route.ts
    invoices/
      create/
      status/
      webhook/
```

Create proxies for existing routes to avoid breaking changes during migration.

## Phase 3: Implement System Checks for Flows

Extend the existing system check functionality to cover all major flows:

1. Add test endpoints for each major user flow
2. Ensure each flow can be verified without UI interaction
3. Add test coverage for these flows

Example: For each feature, create a system check test in `app/api/system-check/[feature]/route.ts` 

## Migration Strategy

1. **Incremental Approach**: Don't refactor everything at once. Start with one feature and migrate it fully.
2. **Feature Toggle**: Use feature flags to gradually roll out restructured code.
3. **Parallel Structure**: During migration, maintain both old and new structures with proxies/redirects.
4. **CI Validation**: Add codebase validation to CI pipeline to enforce principles for new code.

## Checklist for Each Feature Migration

- [ ] Create feature folder with proper structure
- [ ] Move UI components to feature's components folder
- [ ] Move API routes to feature's API folder
- [ ] Create system check test for critical flows
- [ ] Update imports in dependent files
- [ ] Add feature to validator allowlist

## Timeline Recommendation

- **Week 1-2**: Set up structure and migrate one core feature (e.g., payment-links)
- **Week 3-4**: Migrate remaining payment-related features
- **Week 5-6**: Migrate AI agent features
- **Week 7-8**: Migrate remaining features and finalize structure

## Example: Migrating the Payment Links Feature

```bash
# 1. Create feature directory
mkdir -p features/payment-links/{components,api,hooks}

# 2. Move UI components
mv web/src/app/payment-links features/payment-links/components

# 3. Move API routes
mv web/src/app/api/payment-links features/payment-links/api

# 4. Update imports in moved files
# Use search and replace for import paths

# 5. Create system check test
touch app/api/system-check/payment-links/route.ts
``` 