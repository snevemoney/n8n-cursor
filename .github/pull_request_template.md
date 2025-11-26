# Pull Request

## Context Check
**REQUIRED** - Fill out before requesting review:

- **PROJECT**: `lightningflow` | `n8n-cursor` | `shared`
- **ENV**: `local` | `integration` | `staging` | `production`
- **AFFECTED PATHS**: List all changed file patterns (e.g., `apps/lightningflow/**`, `docs/**`)
- **Non-Goals**: List what this PR does NOT change (prevents scope creep)

## What Changed
- [ ] New/updated routes documented in `docs/ROUTES.md`
- [ ] Environment files updated (`.env.int`/`.env.staging`/`.env.production`)
- [ ] Webhook host+token validation covered (if payment path)
- [ ] Port bindings use `127.0.0.1` (not `0.0.0.0`)
- [ ] Feature flags properly configured
- [ ] UI integrity maintained (sidebar, navigation, styling)

## Tests
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Integration tests pass: `npm run test:e2e`
- [ ] UI integrity tests pass: `npm run test:ui`
- [ ] Manual check URL: `https://[env].[domain]`
- [ ] Self-check endpoint: `https://[env].[domain]/__selfcheck`

## Security Checklist
- [ ] No hardcoded secrets or API keys
- [ ] Webhook validation includes host checking
- [ ] Environment variables properly scoped
- [ ] No public port bindings (`0.0.0.0`)
- [ ] CSP headers configured (if applicable)

## Deployment
- [ ] Environment variables validated: `node scripts/validate-env.js [env]`
- [ ] Port conflicts checked: `bash scripts/ports-check.sh`
- [ ] Rollback plan documented (if applicable)
- [ ] Database migrations tested (if applicable)

## Rollback Plan
**If this PR causes issues, how do we rollback?**

1. **Immediate**: 
2. **Data**: 
3. **Configuration**: 

## Screenshots/Evidence
<!-- Add screenshots for UI changes, test results, etc. -->

## Related Issues
<!-- Link to related issues, tickets, or discussions -->

---

**Reviewer Checklist:**
- [ ] Context check completed
- [ ] Scope boundaries respected
- [ ] Tests pass
- [ ] Security checklist verified
- [ ] Rollback plan acceptable