# Project Structure

## LightningFlow Project
- `apps/lightningflow/` - Main LightningFlow application
  - `lightning-ui/` - Next.js UI application
  - `web/` - Original web application
  - `api/` - API server
  - `scripts/` - Project-specific scripts

## n8n-Cursor Project  
- `apps/n8n-cursor/` - n8n automation workflows
  - `n8nbuilder/` - n8n workflow builder
  - `scripts/` - n8n-specific scripts

## Shared Packages
- `packages/shared-*/` - Shared utilities and components
- `packages/ui/` - UI components
- `packages/types/` - TypeScript types
- `packages/utils/` - Utility functions

## Infrastructure
- `infra/docker/` - Docker configurations
- `infra/caddy/` - Caddy reverse proxy
- `infra/cloudflare/` - Cloudflare DNS

## Documentation
- `docs/` - Project documentation
- `scripts/` - Build and deployment scripts
