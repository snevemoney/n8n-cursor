# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo workspace** containing multiple projects:
- **Scorpion OS** - Central operations orchestrator and AI dashboard (port 3003)
- **LightningFlow** - Lightning Network SaaS platform with landing, web app, and ops panels
- **n8n-cursor** - n8n workflow automation development tools
- **Portfolio** - Personal portfolio site

The workspace uses **pnpm** with workspaces defined in `pnpm-workspace.yaml`.

## Build & Development Commands

### Workspace-Level Commands
```bash
# Install dependencies (must use pnpm, not npm)
pnpm install

# Build all applications
pnpm build

# Run all tests
pnpm test

# Lint all applications
pnpm lint

# Type check all applications
pnpm typecheck

# Development mode for all apps
pnpm dev
```

### Scorpion (Main Application)
```bash
cd apps/scorpion

# Development
pnpm dev              # Start dev server on port 3003
pnpm dev:turbo        # Start with Turbo mode
pnpm dev:trace        # Start with trace warnings

# Building & Testing
pnpm build            # Production build
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint
pnpm test             # Run vitest tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage

# Specific test suites
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests
pnpm test:e2e         # End-to-end with Playwright
pnpm test:council     # Council system tests
pnpm test:rag         # RAG system tests
pnpm test:chat        # Chat functionality tests

# Health checks
pnpm health           # Check /api/health endpoint
pnpm healthz          # Check /healthz endpoint
pnpm metrics          # View metrics

# Auditing
pnpm audit:install    # Install audit dependencies
pnpm audit:run        # Run comprehensive audit
pnpm audit:lighthouse # Run Lighthouse performance audit
```

### Running Single Tests
```bash
# Unit test for specific file
cd apps/scorpion
pnpm vitest run tests/components/MyComponent.test.ts

# Integration test
pnpm vitest run tests/integration/api.test.ts

# E2E test
pnpm playwright test tests/e2e/chat.spec.ts

# Run specific council test
pnpm tsx server/council/council.test.ts
```

### Migration Commands
```bash
# Create a new migration
pnpm migrate:create

# Run migrations
pnpm migrate:up

# Rollback migrations
pnpm migrate:down

# Check migration status
pnpm migrate:status

# Validate migrations
pnpm migrate:validate
```

### Workflow & Automation Commands
```bash
# Sync n8n workflows
pnpm workflows:sync

# Watch for workflow changes
pnpm workflows:watch

# Promote n8n workflows
pnpm promote
pnpm promote:activate

# Credential sync
pnpm cred:sync
pnpm cred:dry       # Dry run
```

### Contract Generation
```bash
# Generate all contracts
pnpm contracts:generate

# Build contracts
pnpm contracts:build

# Validate contracts
pnpm contracts:validate
```

### Maintenance & Operations
```bash
# Run system diagnostics
make doctor
bash scripts/doctor.sh

# Backup/restore
pnpm backup
pnpm restore
cd apps/scorpion && pnpm backup

# Check consistency
pnpm consistency:check
pnpm consistency:validate
```

## Architecture

### High-Level Structure

```
n8n-cursor/
├── apps/              # Applications
│   ├── scorpion/      # Main Next.js app (port 3003)
│   ├── n8n-cursor/    # n8n development tools
│   ├── lightningflow/ # Lightning Network platform
│   ├── portfolio/     # Portfolio site
│   └── lovable-frontend/
├── packages/          # Shared packages
│   ├── scorpion-core/    # Core Scorpion logic
│   ├── lightning-core/   # Lightning Network utilities
│   ├── agent-factory/    # AI agent factory
│   ├── contracts/        # API contracts
│   ├── shared-types/     # Shared TypeScript types
│   ├── shared-config/    # Shared configuration
│   └── shared-helpers/   # Shared utilities
├── scripts/           # Automation & deployment scripts
├── infra/             # Infrastructure (Docker, Caddy)
└── workflows/         # n8n workflow definitions
```

### Scorpion Application Architecture

**Next.js App Router** structure (`apps/scorpion/`):
- `app/` - Next.js 14 App Router pages and API routes
  - `(scorpion)/` - Main dashboard routes
  - `api/` - API endpoints (50+ routes)
  - `ai/` - AI-related routes
- `server/` - Server-side business logic
  - `council/` - Multi-agent council system (37 files)
  - `orchestrator/` - Workflow orchestration
  - `transformer/` - Data transformation pipeline
  - `strategy/` - Data workflow selection strategies
  - `runtime/` - Runtime execution environment
  - `observatory/` - Observability & monitoring
- `tests/` - Test suites
  - `components/` - Component tests
  - `integration/` - Integration tests
  - `e2e/` - Playwright E2E tests
  - `security/` - Security tests

### Key Architectural Concepts

1. **Multi-Agent Council System** (`server/council/`)
   - Orchestrates multiple AI agents for complex tasks
   - Agents collaborate and vote on decisions
   - Includes specialized councils (AI Foundations, etc.)

2. **RAG (Retrieval-Augmented Generation)**
   - Document ingestion and vectorization
   - Workflow ingestion from n8n
   - Storage error handling and pipeline management

3. **Data Transformation Pipeline** (`server/transformer/`)
   - Transforms data between formats
   - Handles various input sources
   - Validates and cleans data

4. **Workflow Orchestration** (`server/orchestrator/`)
   - Manages workflow execution
   - Integrates with n8n
   - Handles workflow state and transitions

5. **Workspace Architecture**
   - Uses pnpm workspaces with `workspace:*` dependencies
   - Packages import each other via workspace protocol
   - Shared configs in `packages/shared-config/`

## Important Patterns & Conventions

### Environment Management
- **Never mix environments**: Local uses localhost, production uses 127.0.0.1 + Caddy proxy
- **Port bindings**: Always bind to 127.0.0.1 in production, use Caddy for public ingress
- **Health endpoints**: Every service must have `/healthz` endpoint
- Environment files: `.env.dev`, `.env`, `.env.monitoring`

### Project Boundaries
Per `.cursor-rules.md`, this workspace has strict project boundaries:
- **LightningFlow**: `apps/lightningflow/**`, domains: lightningflow.online
- **n8n-Cursor**: `apps/n8n-cursor/**`, domains: evenslouis.ca/n8n (legacy dual-host: n8ncloud.tech)
- **Shared**: `packages/shared-*/**`
- **Always verify** PROJECT/ENV/AFFECTED PATHS before making changes

### Security Requirements
- No hardcoded secrets or API keys
- No 0.0.0.0 port bindings in production
- Validate webhook hosts
- Check port conflicts before binding
- Use environment variables for all config

### Reliability Contract
From `.cursor-rules.md`:
- **Goal**: lightningflow.online and evenslouis.ca/n8n NEVER break
- Changes to infra/routes/ports/env/Docker MUST:
  1. Preserve /healthz endpoints
  2. Keep containers on 127.0.0.1; public via Caddy only
  3. Include healthchecks and resource caps
  4. Provide rollback steps
  5. Confirm Caddy routes

### n8n Workflow Development
Per `.cursor/rules/n8nbuilder.mdc`:
- ALWAYS start with `tools_documentation()` in new conversations
- Discovery: `search_nodes()`, `list_nodes()`, `list_ai_tools()`
- Configuration: `get_node_essentials()` before full docs
- Pre-validate: Use `validate_node_minimal()` before building
- Post-validate: `validate_workflow()` before deployment
- **USE CODE NODE ONLY WHEN NECESSARY** - prefer standard nodes
- Use diff updates with `n8n_update_partial_workflow()` for 80-90% token savings

### Database Migrations
- Create: `pnpm migrate:create`
- Always validate before running: `pnpm migrate:validate`
- Check status first: `pnpm migrate:status`
- Migrations in `scripts/migrate/`

## Dependencies & Stack

### Core Technologies
- **Runtime**: Node.js >=20.0.0, pnpm >=8.0.0
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (via `pg` package)
- **Cache**: Redis
- **Testing**: Vitest (unit), Playwright (E2E)
- **Automation**: n8n workflows

### Key Libraries
- **AI/Agents**: `@anthropic-ai/claude-agent-sdk`, `@modelcontextprotocol/sdk`
- **Visualization**: Recharts, Cytoscape (with dagre layout)
- **State**: Zustand
- **Validation**: Zod
- **UI**: React 18, Tailwind CSS, Lucide icons

### Infrastructure
- **Containers**: Docker Compose
- **Proxy**: Caddy (with automatic HTTPS)
- **Monitoring**: Custom observability in `server/observatory/`
- **Process Management**: BullMQ workers

## Common Workflows

### Adding a New Feature to Scorpion
1. Read relevant files in `apps/scorpion/` first
2. Check if it touches `server/council/`, `server/orchestrator/`, etc.
3. Update types in `server/types/` if needed
4. Write tests in appropriate `tests/` subdirectory
5. Run `pnpm typecheck` and `pnpm lint`
6. Test with `pnpm test` or specific test command
7. Never commit without validating health endpoints still work

### Debugging Production Issues
1. Run `make doctor` or `bash scripts/doctor.sh`
2. Check health endpoints: `curl http://localhost:3003/healthz`
3. Review logs in `logs/` directory
4. Check container health: `docker ps`
5. Verify environment: `.env` files, port conflicts

### Working with n8n Workflows
1. Sync workflows: `pnpm workflows:sync`
2. Make changes in n8n UI or workflow JSON files
3. Test workflow execution
4. Promote to production: `pnpm promote:activate`
5. Validate with workflow tests

### Database Schema Changes
1. Create migration: `pnpm migrate:create`
2. Edit migration file in `scripts/migrate/`
3. Validate: `pnpm migrate:validate`
4. Check status: `pnpm migrate:status`
5. Run: `pnpm migrate:up`
6. Update schema: `pnpm schema:update`

## Testing Strategy

### Test Organization
- **Unit tests**: `tests/components/`, `tests/utils/` - Fast, isolated component tests
- **Integration tests**: `tests/integration/` - API and service integration
- **E2E tests**: `tests/e2e/` - Full user flows with Playwright
- **System tests**: `server/*/**.test.ts` - Business logic tests (council, strategy, etc.)

### Running Tests Efficiently
- Use `pnpm test:watch` during development
- Run specific test files: `pnpm vitest run path/to/test.ts`
- Use `pnpm test:council:all` for all council tests
- Run E2E selectively: `pnpm playwright test tests/e2e/specific.spec.ts`

## Development Tips

1. **Always use pnpm**, never npm - this is a pnpm workspace
2. **Read before modifying** - Never propose changes to code you haven't read
3. **Respect project boundaries** - Check `.cursor-rules.md` for scope
4. **Validate early** - Run typecheck and tests before committing
5. **Health checks matter** - Always verify `/healthz` endpoints after changes
6. **Use workspace dependencies** - Reference packages with `workspace:*`
7. **Check port availability** - Use `pnpm ports-check` before starting services
8. **Follow migration patterns** - Always use migration scripts for DB changes
