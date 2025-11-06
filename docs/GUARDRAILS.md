# 🚦 Guardrails - Foolproof Development Rules

**These rules are enforced by CI and local hooks. Breaking them will block your PR.**

## 🚫 **NEVER DO THESE THINGS**

### ❌ Cross-App Imports
```typescript
// FORBIDDEN - Will fail CI
import { DevTool } from 'apps/n8n-cursor/tools/dev-tool';
import { WorkflowHelper } from 'apps/lightningflow/lib/workflow';
```

### ❌ Unregistered Ports
```yaml
# FORBIDDEN - Port not in tooling/ports.yml
ports:
  - "9999:3000"  # ❌ Port 9999 not registered
```

### ❌ Real Secrets in Git
```bash
# FORBIDDEN - Never commit real secrets
SUPABASE_KEY=sk-real-secret-key-123  # ❌
OPENAI_API_KEY=sk-real-key-456       # ❌

# ALLOWED - Only example files
SUPABASE_KEY=your-supabase-key-here  # ✅
OPENAI_API_KEY=your-openai-key-here  # ✅
```

### ❌ Long Files
- **Maximum file length**: 400 lines of code
- **Action**: Split into smaller, focused files
- **Exception**: Generated files, configuration files

## ✅ **ALWAYS DO THESE THINGS**

### ✅ Use Shared Packages
```typescript
// CORRECT - Import from shared packages
import { UserType } from '@shared/types';
import { formatCurrency } from '@shared/helpers';
```

### ✅ Follow Naming Conventions
```bash
# Folders: kebab-case
user-management/     # ✅
userManagement/      # ❌

# Components: PascalCase
UserProfile.tsx      # ✅
user-profile.tsx     # ❌

# Tests: .test.ts suffix
user-service.test.ts # ✅
user-service.spec.ts # ❌
```

### ✅ Register New Ports
```yaml
# Add to tooling/ports.yml
new_service: 8080

# Then use in docker-compose.yml
ports:
  - "8080:8080"  # ✅ Port is registered
```

### ✅ Environment Files
```bash
# CORRECT - Only commit example files
.env.local.example      # ✅
.env.integration.example # ✅
.env.staging.example    # ✅

# FORBIDDEN - Never commit real env files
.env.local              # ❌
.env.production         # ❌
```

## 🔒 **Pre-commit Checks (Automatic)**

Every commit runs these checks locally:

1. **Lint & Type Check** - Code quality
2. **Structure Verification** - No cross-app imports
3. **Port Validation** - Only registered ports
4. **Test Suite** - Basic functionality
5. **Secrets Scan** - No real secrets

## 🚨 **CI Blockers (PR Won't Merge)**

These checks must pass in CI:

- ✅ **Structure Verification** - `node tooling/scripts/verify-structure.mjs`
- ✅ **Port Linting** - `node tooling/scripts/ports-lint.mjs`
- ✅ **Secrets Scan** - `bash tooling/scripts/scan-secrets.sh`
- ✅ **Tests Pass** - `pnpm -w test`
- ✅ **Lint Pass** - `pnpm -w lint`
- ✅ **Type Check** - `pnpm -w typecheck`

## 🛠️ **Safe Scripts Pattern**

Every destructive script must support:

```bash
#!/usr/bin/env bash
set -euo pipefail

: "${DRY_RUN:=1}"   # 1=dry, 0=apply
: "${BACKUP:=./tooling/backups/$(date +%F_%H%M)}"
mkdir -p "$BACKUP"

log(){ echo "[$(date +%T)] $*"; }
doit(){ 
  if [ "$DRY_RUN" = "1" ]; then 
    log "DRY $*"; 
  else 
    eval "$@"; 
  fi 
}

# Usage examples
log "Starting operation..."
doit "rm -rf /tmp/test"
doit "cp file.txt $BACKUP/"

# Run with: DRY_RUN=0 ./script.sh
```

## 🔄 **Environment Boundaries**

### Local Development
- **Branch**: `feature/*`
- **Env File**: `.env.local`
- **Docker Profile**: `dev`
- **Purpose**: Quick iteration, mocks

### Integration
- **Branch**: `integrate`
- **Env File**: `.env.integration`
- **Docker Profile**: `int`
- **Purpose**: Services talk together

### Testing
- **Branch**: `test`
- **Env File**: `.env.test`
- **Docker Profile**: `test`
- **Purpose**: Automated testing

### Staging
- **Branch**: `release/*`
- **Env File**: `.env.staging`
- **Docker Profile**: `stg`
- **Purpose**: Production-like testing

### Production
- **Branch**: `main` (tagged)
- **Env File**: `.env.production`
- **Docker Profile**: `prod`
- **Purpose**: Live users

## 🚀 **Quick Commands**

```bash
# Safety checks
make check                    # Run all checks
node tooling/scripts/verify-structure.mjs  # Verify boundaries
bash tooling/scripts/scan-secrets.sh       # Check for secrets
node tooling/scripts/ports-lint.mjs        # Validate ports

# Environment management
make up-lfa                  # Start LightningFlow AI
make up-n8n                  # Start n8n
make down                    # Stop all services

# Recovery
make reset                   # Reset to clean state
```

## 🆘 **When Things Go Wrong**

### Structure Violations
```bash
# Check what's wrong
node tooling/scripts/verify-structure.mjs

# Fix cross-imports by moving code to packages/
# Never import between apps
```

### Port Conflicts
```bash
# Check port usage
make ports

# Add new ports to tooling/ports.yml
# Use different ports for different environments
```

### Secret Leaks
```bash
# Scan for secrets
bash tooling/scripts/scan-secrets.sh

# Remove real secrets from git history
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env.production' --prune-empty --tag-name-filter cat -- --all
```

## 📚 **Resources**

- [Installation Guide](INSTALLATION.md) - Setup and configuration
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and fixes
- [Contributing](CONTRIBUTING.md) - Development standards
- [Workspace Manifest](../workspace.manifest.json) - Machine-readable policies

---

**Remember: These guardrails protect both you and your codebase. Follow them, and you'll never break things accidentally! 🛡️**
