# 🦂 Scorpion Audit Mode - Setup Complete

**Status**: Infrastructure Ready ✅  
**Date**: 2025-11-07  
**Location**: `apps/scorpion/audit/`

---

## ✅ What's Been Created

### 1. Audit Scripts

- **`audit/crawl.ts`** - BFS crawler that discovers all pages
  - Visits all routes automatically
  - Takes full-page screenshots
  - Records page titles and status codes
  - Handles errors gracefully

- **`audit/audit.spec.ts`** - Playwright test suite
  - Captures console errors/warnings
  - Records network failures (4xx, 5xx)
  - Saves HAR files for network debugging
  - Screenshots on failure
  - Traces for playback

- **`audit/run-lighthouse.mjs`** - Performance audits
  - Measures page load times
  - Checks accessibility (a11y)
  - Best practices audit
  - Generates HTML reports

### 2. Configuration

- **`playwright.config.ts`** - Playwright configuration
  - Chromium browser only (fast)
  - Trace recording enabled
  - Screenshots on failure
  - HTML reporter

### 3. Package.json Scripts

```json
"audit:install": "pnpm add -D tsx lighthouse && npx playwright install chromium",
"audit:crawl": "tsx audit/crawl.ts",
"audit:test": "playwright test audit/audit.spec.ts --reporter=list",
"audit:lighthouse": "node audit/run-lighthouse.mjs",
"audit:run": "pnpm run audit:crawl && pnpm run audit:test",
"audit:all": "pnpm run audit:run && pnpm run audit:lighthouse",
"dev:trace": "NODE_OPTIONS='--trace-warnings' next dev -p 3003"
```

### 4. Documentation

- **`audit/README.md`** - Complete usage guide
- **`docs/AUDIT_SYSTEM_SETUP.md`** - This file

---

## 🚀 How to Use

### Step 1: Install Dependencies (One-Time)

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion

# Install audit tools
pnpm add -D tsx lighthouse

# Install Playwright browsers
npx playwright install chromium
```

### Step 2: Ensure Server is Running

```bash
# The dev server should already be running on port 3003
# If not, start it:
pnpm dev
```

### Step 3: Run the Audit

```bash
# Full audit (crawl + errors + performance)
pnpm run audit:all

# Or just errors (faster)
pnpm run audit:run
```

### Step 4: Review Results

```bash
# Check the latest audit output
ls -lt audit/out/ | head -5

# View summary
cat audit/out/$(ls -t audit/out | head -1)/summary.json

# Open Lighthouse reports
open audit/out/$(ls -t audit/out | head -1)/lighthouse/*.html
```

---

## 📊 What the Audit Will Find

Based on your earlier tour, we expect to find:

### Critical Issues:
1. ❌ **Home page** - Stats not loading from API
2. ❌ **Project page** - Slow loading (maybe API timeouts)
3. ❌ **Operations page** - Mock data instead of real
4. ❌ **Knowledge page** - Preview not working
5. ❌ **Council page** - Not dynamic/interactive
6. ❌ **Chat page** - Fake "connected" status
7. ❌ **Notifications** - Empty (not connected to API)
8. ❌ **System Logs** - Mock data

### Working:
1. ✅ **Workflows page** - Shows 162 workflows correctly
2. ✅ **Agents page** - New dossier system working
3. ✅ **Dashboard** - Health checks fixed (8/8 green)

---

## 🔍 Audit Output Structure

```
audit/out/<timestamp>/
├── summary.json              # Quick stats
├── console.json              # All console messages
├── network-failures.json     # Failed requests
├── page-errors.json          # JS crashes
├── network.har               # Full network trace
├── crawl-results.json        # Pages discovered
├── visited.json              # URLs visited
├── screenshot-*.png          # All pages
├── audit-*.png               # Test screenshots
└── lighthouse/
    ├── lh-<hash>.html        # Performance reports
    └── lh-<hash>.json        # Raw data
```

---

## 🎯 Next Steps

### After Running the Audit:

1. **Generate RCA.md** - We'll analyze all the evidence and create a Root Cause Analysis
2. **Prioritize Fixes** - Critical errors first, then UX improvements
3. **Apply Minimal Diffs** - Small, tested changes
4. **Re-run Audit** - Verify fixes with before/after comparison
5. **Repeat** - Until all pages are clean

### Expected Findings:

From the terminal logs, we already know:
- ✅ Infinite loop is FIXED
- ✅ Health checks are working (8/8)
- ✅ Knowledge ingestion successful (395 items)
- ⚠️ Some n8n health check failures (likely timeouts)

The audit will reveal:
- Which pages have console errors
- Which API endpoints are failing
- Which pages are slow to load
- Accessibility issues
- Performance bottlenecks

---

## 🔥 Quick Triage Commands

```bash
# Check if server is healthy
curl http://localhost:3003/api/health | python3 -m json.tool

# Quick crawl only (30 seconds)
pnpm run audit:crawl

# Check console errors from latest audit
cat audit/out/$(ls -t audit/out | head -1)/console.json | \
  python3 -c "import sys, json; errors = [e for e in json.load(sys.stdin) if e['type'] in ['error','pageerror']]; print(f'Found {len(errors)} errors'); [print(f\"  • {e['url']}: {e['text'][:100]}\") for e in errors[:10]]"

# Check network failures
cat audit/out/$(ls -t audit/out | head -1)/network-failures.json | \
  python3 -c "import sys, json; failures = json.load(sys.stdin); print(f'Found {len(failures)} network failures'); [print(f\"  • {f['status']} {f['method']} {f['url']}\") for f in failures[:10]]"
```

---

## 📝 Guardrails

The audit system follows these principles:

1. **Evidence First** - Never guess, always measure
2. **Minimal Changes** - Fix root causes, not symptoms
3. **Test Everything** - Add tests for every fix
4. **No Shotgun Fixes** - One issue at a time
5. **Reproducible** - Re-run audit after each fix

---

## 🎓 Understanding the Output

### Console Errors

- **Type "error"**: console.error() calls - usually bugs
- **Type "pageerror"**: Uncaught exceptions - critical bugs
- **Type "warning"**: console.warn() - issues to investigate

### Network Failures

- **400-499**: Client errors (bad requests, auth, not found)
- **500-599**: Server errors (crashes, timeouts)

### Lighthouse Scores

- **90-100**: Good
- **50-89**: Needs improvement
- **0-49**: Poor

---

## 🛠️ Customization

### Change Pages to Audit

Edit `audit/run-lighthouse.mjs`:

```javascript
const pages = [
  '/',
  '/dashboard',
  '/workflows',
  // Add more pages here
];
```

### Adjust Timeouts

Edit `audit/crawl.ts` and `audit/audit.spec.ts`:

```typescript
timeout: 15000  // milliseconds
```

### Change Screenshot Settings

Edit `audit/audit.spec.ts`:

```typescript
await page.screenshot({ 
  fullPage: true,  // or false for viewport only
  type: 'png',     // or 'jpeg'
});
```

---

## 🔗 Related Docs

- `apps/scorpion/audit/README.md` - Usage guide
- `docs/SCORPION_EMERGENCY_FIXES_COMPLETE.md` - Previous fixes
- `playwright.config.ts` - Test configuration

---

**Ready to Run!** 🦂

The audit infrastructure is complete. Just install dependencies and run:

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion
pnpm run audit:install  # One-time
pnpm run audit:all       # Every time you want to audit
```

This will give us evidence-based insights into all remaining UI issues!

