# Migration Guide - n8n-cursor Repository Restructuring

## Overview

This document outlines the migration from the legacy repository structure to the new canonical DevOps structure implemented in this setup.

## What Changed

### Before (Legacy Structure)
```
n8n-cursor/
├── docker-compose.yml          # ❌ Root level (forbidden)
├── n8n-manager.sh             # ❌ Root level (forbidden)
├── setup-comprehensive-n8n.sh # ❌ Root level (forbidden)
├── test-remote-n8n.js         # ❌ Root level (forbidden)
├── examples/test-payloads.json # ❌ Root level (forbidden)
└── ... (other files scattered)
```

### After (Canonical Structure)
```
n8n-cursor/
├── infra/docker/               # ✅ Docker compose files
├── scripts/ops/                # ✅ Operational scripts
├── scripts/workflows/          # ✅ Workflow management
├── scripts/safety/             # ✅ Security scripts
├── scripts/utils/              # ✅ Common utilities
├── scripts/bin/                # ✅ Binary scripts
├── workflows/                  # ✅ n8n workflow files
├── templates/                  # ✅ File templates
├── docs/                       # ✅ Documentation
├── reports/                    # ✅ Generated reports
├── apps/repo-brain/            # ✅ AI repository intelligence
├── config/                     # ✅ Configuration files
├── backups/                    # ✅ Backup files
└── logs/                       # ✅ Log files
```

## Migration Steps

### 1. File Relocation

The following files have been moved to their canonical locations:

| Old Path | New Path | Status |
|----------|----------|---------|
| `docker-compose.yml` | `infra/docker/docker-compose.yml` | ✅ Moved |
| `n8n-manager.sh` | `scripts/ops/n8n-manager.sh` | ✅ Moved |
| `setup-comprehensive-n8n.sh` | `scripts/ops/setup-comprehensive-n8n.sh` | ✅ Moved |
| `test-remote-n8n.js` | `tools/test-remote-n8n.js` | ✅ Moved |
| `examples/test-payloads.json` | `workflows/test-payloads.json` | ✅ Moved |

### 2. Script Shim Creation

Legacy root-level scripts have been replaced with shims that call the new Make targets:

```bash
# Old way (deprecated)
./n8n-manager.sh up

# New way (canonical)
make up
```

### 3. Environment Variable Migration

**CRITICAL**: The `MASTER_UNLOCK` string has been removed from code and must now be set as an environment variable:

```bash
# Old way (❌ SECURITY RISK)
export MASTER_UNLOCK="hardcoded_key_in_script"

# New way (✅ SECURE)
export MASTER_UNLOCK="your_key_here"
```

## Safety Features Added

### Structure Guard
- Prevents forbidden file paths
- Blocks hardcoded secrets
- Enforces canonical directory structure

### Doctor System
- Comprehensive health checks
- Configuration validation
- Issue reporting and warnings

### Backup & Recovery
- Automatic database backups
- Workflow safety backups
- Rollback capabilities

## Breaking Changes

### 1. Script Execution
- All scripts now use the Make system
- Direct script execution is deprecated
- Use `make <target>` instead of `./script.sh`

### 2. File Locations
- Docker compose files moved to `infra/docker/`
- Scripts organized by function in `scripts/`
- Templates centralized in `templates/`

### 3. Environment Variables
- `MASTER_UNLOCK` must be set as environment variable
- No hardcoded secrets allowed
- Use `.env` file or export in shell

## Rollback Plan

If you need to rollback to the legacy structure:

1. **Backup current state**:
   ```bash
   make backup
   ```

2. **Restore from backup**:
   ```bash
   make restore
   ```

3. **Manual rollback**:
   ```bash
   git checkout <legacy-commit>
   ```

## Validation

After migration, validate the new structure:

```bash
# Check structure compliance
make guard

# Verify system health
make doctor

# Validate workflows
make wf-validate

# Run all checks
make ci
```

## Troubleshooting

### Common Migration Issues

1. **"Forbidden path" errors**:
   - Move files to canonical locations
   - Update any hardcoded paths in scripts

2. **"MASTER_UNLOCK not found"**:
   - Set `export MASTER_UNLOCK="your_key"`
   - Never hardcode in scripts

3. **Script not found errors**:
   - Use `make <target>` instead of direct script execution
   - Check script exists in canonical location

### Getting Help

1. Check the logs: `make logs`
2. Run diagnostics: `make doctor`
3. Validate structure: `make guard`
4. Review this migration guide
5. Check the main README for current usage

## Next Steps

After successful migration:

1. **Update CI/CD pipelines** to use new structure
2. **Train team members** on new Make targets
3. **Enable branch protections** in GitHub
4. **Set up Repo Brain** for AI-powered insights
5. **Configure monitoring** and alerting

## Support

For migration assistance:
1. Review this guide thoroughly
2. Check the main README for current usage
3. Run validation commands to identify issues
4. Create issues for any blocking problems

---

**Note**: This migration improves security, maintainability, and operational efficiency. The temporary inconvenience is worth the long-term benefits.
