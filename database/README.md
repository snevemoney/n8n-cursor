# Database Files

This directory contains all database-related files organized by purpose.

## Structure

- `schemas/` - Database schemas organized by domain
  - `saas/` - Multi-tenant SaaS schemas
  - `asset-management/` - Asset management schemas
  - `business-operations/` - Business operations schemas
  - `shared/` - Shared database utilities
- `migrations/` - Database migration scripts
- `seeds/` - Seed data and demo database setups

## Usage

### Schemas
Each domain has its own schema files. Import and run them as needed for your environment.

### Migrations
Run migrations in order to update your database schema:
```bash
psql $DATABASE_URL -f database/migrations/[migration-file].sql
```

### Seeds
Use seed files to populate test/demo databases:
```bash
psql $DATABASE_URL -f database/seeds/[seed-file].sql
```

## Organization

Files were moved from the root directory during project reorganization to improve maintainability and discoverability.

