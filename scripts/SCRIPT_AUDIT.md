# Script Audit and Consolidation Guide

**Date**: 2025-01-27  
**Purpose**: Document current scripts, identify duplicates, and recommend consolidation

## Script Categories

### ✅ Current/Active Scripts (Keep)

#### Setup & Initialization
- `setup-all.sh` - Main setup script (use this)
- `complete-local-setup.sh` - Complete local environment setup
- `setup-local-hosts.sh` - Configure local hosts file
- `setup-environments.sh` - Setup environment files
- `setup-monitoring.sh` - Setup monitoring tools
- `setup-cursor-enterprise.sh` - Cursor enterprise setup

#### Health & Monitoring
- `health-check.sh` - Main health check script (use this)
- `health-monitor.sh` - Continuous health monitoring
- `doctor.sh` - System diagnostics
- `perf_doctor.sh` - Performance diagnostics

#### Deployment
- `deploy-to-production.sh` - Main production deployment (use this)
- `deploy-simple.sh` - Simplified deployment
- `blue-green-deploy.sh` - Blue/green deployment strategy
- `flip_blue.sh` / `flip_green.sh` - Blue/green switching
- `rollback-prod.sh` - Production rollback

#### Testing & Validation
- `smoke.sh` - Main smoke tests (use this)
- `smoke-int.sh` - Integration smoke tests
- `smoke-staging.sh` - Staging smoke tests
- `green_smoke_local.sh` - Local green environment tests

#### n8n Management
- `promote-n8n.mjs` - Main n8n promotion script (use this)
- `n8n-cred-sync.mjs` - Sync n8n credentials
- `n8n-sync-down.mjs` - Sync n8n workflows down
- `workflows/sync-workflows.mjs` - Sync workflows
- `quick-n8n-status.sh` - Quick n8n status check

#### Backup & Restore
- `backup.sh` - Main backup script (use this)
- `backup-scorpion.sh` - Scorpion-specific backup
- `restore-scorpion.sh` - Scorpion restore
- `restore-test.sh` - Test restore

#### Maintenance
- `consistency-check.js` - Check system consistency
- `audit-depreciation.mjs` - Audit depreciation
- `mcp-status.mjs` - MCP status check

### ⚠️ Potentially Duplicate/Outdated Scripts (Review)

#### n8n Fix Scripts (Many duplicates - consolidate)
- `fix-n8n-command.sh` - ⚠️ Review if still needed
- `fix-n8ncloud-complete.sh` - ⚠️ Review if still needed
- `final-n8n-fix.sh` - ⚠️ Review if still needed
- `n8n-only-fix.sh` - ⚠️ Review if still needed
- `quick-n8n-fix.sh` - ⚠️ Review if still needed
- `brute-force-n8n-fix.sh` - ⚠️ Review if still needed
- `deep-n8n-diagnostic.sh` - ⚠️ Review if still needed
- `deploy-n8n-fix.sh` - ⚠️ Review if still needed
- `diagnose-n8n.sh` - ⚠️ Review if still needed
- `diagnose-port-5678.sh` - ⚠️ Review if still needed
- `try-different-n8n-image.sh` - ⚠️ Review if still needed
- `try-working-n8n-version.sh` - ⚠️ Review if still needed
- `use-working-n8n-version.sh` - ⚠️ Review if still needed
- `cleanup-and-use-best-version.sh` - ⚠️ Review if still needed
- `wait-for-download.sh` - ⚠️ Review if still needed
- `verify-n8ncloud-working.sh` - ⚠️ Review if still needed
- `preserve-n8n-account.sh` - ⚠️ Review if still needed
- `vps-n8n-permission-fix.sh` - ⚠️ Review if still needed
- `vps-n8n-preserve-account-fix.sh` - ⚠️ Review if still needed
- `macbook-n8n-setup.sh` - ⚠️ Review if still needed
- `lightningflow-n8n-integration-fix.sh` - ⚠️ Review if still needed

**Recommendation**: Consolidate into:
- `scripts/n8n/fix.sh` - Main n8n fix script
- `scripts/n8n/diagnose.sh` - n8n diagnostics
- `scripts/n8n/setup.sh` - n8n setup

#### Port Fix Scripts (Duplicates)
- `fix-port-80.sh` - ⚠️ Review if still needed
- `fix-port-80-correct-image.sh` - ⚠️ Review if still needed
- `safe-fix-port-80.sh` - ⚠️ Review if still needed

**Recommendation**: Consolidate into `scripts/fix-port-80.sh`

#### Deployment Scripts (Some duplicates)
- `final-deployment.sh` - ⚠️ Review if still needed
- `deploy-production-caddy.sh` - ⚠️ Review if still needed
- `browser-terminal-deploy.sh` - ⚠️ Review if still needed
- `server-update-and-deploy.sh` - ⚠️ Review if still needed
- `hostinger-api-deploy.sh` - ⚠️ Review if still needed
- `deploy_performance_fixes.sh` - ⚠️ Review if still needed
- `deploy-enhanced-security-remotely.sh` - ⚠️ Review if still needed

**Recommendation**: Use `deploy-to-production.sh` as main, archive others

#### Malware/Security Scripts (Review if still needed)
- `malware-removal-complete.sh` - ⚠️ Review if malware issues persist
- `malware_cordon.sh` - ⚠️ Review if malware issues persist
- `malware_scan.sh` - ⚠️ Review if malware issues persist
- `continuous-malware-prevention.sh` - ⚠️ Review if malware issues persist
- `daily_security_check.sh` - ⚠️ Review if malware issues persist
- `security_hardening.sh` - ⚠️ Review if malware issues persist
- `install-enhanced-security.sh` - ⚠️ Review if malware issues persist
- `validate-security-system.sh` - ⚠️ Review if malware issues persist

**Recommendation**: If malware issues are resolved, archive these. Otherwise, consolidate into `scripts/security/` directory

#### Diagnostic Scripts (Some duplicates)
- `diagnose-502.sh` - ✅ Keep (specific use case)
- `fix-502.sh` - ✅ Keep (specific use case)
- `check-local-services.sh` - ✅ Keep
- `verify-local-setup.sh` - ✅ Keep
- `stabilize.sh` - ⚠️ Review if still needed

### 📁 Organized Structure Recommendation

```
scripts/
├── setup/              # Setup scripts (already exists)
├── deployment/         # Deployment scripts (already exists)
├── n8n/               # n8n-specific scripts (NEW - consolidate here)
│   ├── fix.sh
│   ├── diagnose.sh
│   ├── setup.sh
│   └── sync.sh
├── security/          # Security scripts (already exists)
├── maintenance/       # Maintenance scripts (already exists)
├── testing/           # Testing scripts (already exists)
├── validate/          # Validation scripts (already exists)
├── workflows/         # Workflow scripts (already exists)
├── emergency/         # Emergency scripts (already exists)
└── archive/          # Archived/outdated scripts (NEW)
```

## Action Items

1. **Immediate**: Create `scripts/archive/` directory and move clearly outdated scripts
2. **Short-term**: Consolidate n8n fix scripts into `scripts/n8n/` directory
3. **Medium-term**: Review malware scripts - archive if issues resolved
4. **Long-term**: Create script index/registry with descriptions

## Notes

- Scripts in `deployment/`, `setup/`, `security/`, `maintenance/`, `testing/`, `validate/`, `workflows/`, `emergency/` subdirectories are already organized
- Many scripts in root `scripts/` directory should be moved to appropriate subdirectories
- Scripts with "fix" in name are often one-time fixes and can be archived after verification
- Scripts with dates or version numbers in names are likely outdated

