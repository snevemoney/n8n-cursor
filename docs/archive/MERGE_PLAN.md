# 🦂 Scorpion Merge Plan - Execution Log

## Backup Information
- **Backup Branch**: `backup/pre-merge-YYYYMMDD-HHMMSS`
- **Backup Directory**: `~/backups/n8n-cursor-YYYYMMDD-HHMMSS/`
- **Date**: $(date)

## Current State Documentation

### Apps Structure
- `apps/lightningflow/` - LightningFlow side hustle
- `apps/lovable-frontend/` - Workflow testing dashboard (keep separate)
- `apps/ops/` - Internal admin panel
- `apps/landing/` - Landing page
- `apps/n8n-cursor/` - n8n development tools

### Packages Structure
- `packages/shared-types/` - Shared TypeScript types
- `packages/shared-helpers/` - Shared utility functions
- `packages/contracts/` - API contracts
- `packages/lf-sdk/` - LightningFlow SDK

### Workspace Configuration
- Uses pnpm workspaces
- Workspace manifest: `workspace.manifest.json`
- Package manager: pnpm@8.0.0

## Merge Steps

### Phase 1: Fix Local/Cloud URLs ✅
- [x] Fix `webhook-config.ts` to use env-based URLs
- [x] Update `next.config.js` to allow local domains
- [x] Create shared env helper

### Phase 2: Merge lightningflow Packages
- [ ] Compare `lightning-core` implementations
- [ ] Merge to `packages/lightning-core/`
- [ ] Add `packages/auth/`
- [ ] Add `packages/agents/`
- [ ] Add `packages/ui/`
- [ ] Update all imports

### Phase 3: Merge Admin into Ops
- [ ] Compare admin and ops features
- [ ] Merge admin features into ops
- [ ] Update imports

### Phase 4: Integrate Agent Factory
- [ ] Create `packages/agent-factory/` structure
- [ ] Copy templates and scripts
- [ ] Create missing n8n workflows
- [ ] Create missing Python templates

### Phase 5: Create Scorpion App
- [ ] Create `apps/scorpion/` structure
- [ ] Set up basic Next.js app
- [ ] Connect to database
- [ ] Add side hustle launcher
- [ ] Add n8n workflow access

### Phase 6: Update Workspace
- [ ] Update `workspace.manifest.json`
- [ ] Update root `package.json`
- [ ] Update `pnpm-lock.yaml`

### Phase 7: Testing
- [ ] Run `pnpm install`
- [ ] Run `pnpm run typecheck`
- [ ] Run `pnpm run build`
- [ ] Run `pnpm run dev`
- [ ] Test each app individually
- [ ] Test database connections
- [ ] Test webhook endpoints

## Risk Mitigation
- ✅ Backups created
- ✅ Incremental changes
- ✅ Test after each step
- ✅ Rollback plan ready

