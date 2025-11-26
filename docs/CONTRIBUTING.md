# 🤝 Contributing Guide

## Development Standards

### Code Style

- **Folders**: kebab-case (`user-management/`, `api-routes/`)
- **Components**: PascalCase (`UserProfile.tsx`, `PaymentForm.tsx`)
- **Files**: kebab-case (`user-service.ts`, `payment-handler.ts`)
- **Tests**: `.test.ts` suffix (`user-service.test.ts`)

### Commit Style

Use conventional commits:

```bash
<type>(scope): <subject>

feat(agents): add sentiment router
fix(api): normalize LNbits payload
chore(repo): align lint rules
docs(readme): update installation steps
test(workflows): add e2e test coverage
```

**Types**: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `build`, `ci`

### Import Rules

**✅ Allowed**:
```typescript
// Import from shared packages
import { UserType } from '@shared/types';
import { formatCurrency } from '@shared/helpers';

// Import from same app
import { UserService } from '../services/user-service';
```

**❌ Forbidden**:
```typescript
// Cross-app imports (will fail CI)
import { DevTool } from 'apps/n8n-cursor/tools/dev-tool';
import { WorkflowHelper } from 'apps/lightningflow/lib/workflow';
```

## Development Workflow

### 1. Setup Environment

```bash
# Install dependencies
make i

# Verify structure
node tooling/scripts/verify-structure.mjs

# Run checks
make check
```

### 2. Make Changes

- **LightningFlow AI**: Product code in `apps/lightningflow/`
- **n8n-cursor**: Dev tools in `apps/n8n-cursor/`
- **Shared code**: Extract to `packages/shared-*`

### 3. Test Changes

```bash
# Run all tests
make test

# Run specific app tests
pnpm -C apps/lightningflow test
pnpm -C apps/n8n-cursor test

# Check structure
node tooling/scripts/verify-structure.mjs
```

### 4. Submit PR

**PR Checklist**:
- [ ] Scope is single-purpose
- [ ] Tests included or rationale provided
- [ ] Structure verification passes
- [ ] No cross-app imports
- [ ] Documentation updated if needed
- [ ] Conventional commit message

## Package Development

### Creating Shared Packages

1. **Identify common code** between apps
2. **Create package structure**:
   ```bash
   packages/shared-types/
   ├── package.json
   ├── src/
   │   └── index.ts
   └── tsconfig.json
   ```

3. **Define clear API** with TypeScript
4. **Add tests** and documentation
5. **Version appropriately** (semantic versioning)

### Package Guidelines

- **Zero external dependencies** for `shared-helpers`
- **Type definitions only** for `shared-types`
- **Clear export interface** in `src/index.ts`
- **README.md** explaining purpose and usage

## Testing Requirements

### Minimum Coverage

- **Services**: Unit tests for business logic
- **Components**: Integration tests for critical flows
- **End-to-end**: One happy path test per major feature
- **Structure**: Automated boundary verification

### Test Structure

```bash
apps/lightningflow/
├── src/
│   ├── services/
│   │   └── user-service.ts
│   └── tests/
│       └── services/
│           └── user-service.test.ts
```

## Code Review Process

### Review Checklist

- [ ] **Functionality**: Does it work as intended?
- [ ] **Architecture**: Follows established patterns?
- [ ] **Boundaries**: No cross-app dependencies?
- [ ] **Testing**: Adequate test coverage?
- [ ] **Documentation**: Clear and up-to-date?
- [ ] **Performance**: No obvious bottlenecks?

### Review Standards

- **Be constructive** and specific
- **Focus on code**, not the person
- **Suggest alternatives** when possible
- **Ask questions** to understand intent
- **Approve only when satisfied**

## Troubleshooting

### Common Issues

**Structure Violations**:
```bash
# Check for forbidden imports
node tooling/scripts/verify-structure.mjs

# Fix cross-app dependencies
# Move shared code to packages/
```

**Test Failures**:
```bash
# Run specific failing test
pnpm test -- --grep "test name"

# Check test environment
cat .env.test
```

**Build Issues**:
```bash
# Clear caches
rm -rf node_modules
pnpm install

# Check TypeScript
pnpm type
```

## Getting Help

- **Documentation**: Check `docs/` folder
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions
- **Code**: Review similar implementations

## Quick Reference

```bash
# Development
make i          # Install dependencies
make check      # Run all checks
make test       # Run tests

# Infrastructure  
make up-lfa     # Start LightningFlow AI
make up-n8n     # Start n8n
make down       # Stop all services

# Validation
node tooling/scripts/verify-structure.mjs  # Check boundaries
make ports      # Check port availability
```
