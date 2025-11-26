# 🦂 Scorpion UI Audit System

**Evidence-based systematic debugging for the Scorpion web interface.**

## 🎯 What This Does

This audit system will:
1. **Crawl** all pages in the Scorpion UI (BFS discovery)
2. **Capture** console errors, network failures, and page crashes
3. **Measure** performance with Lighthouse audits
4. **Generate** evidence-based Root Cause Analysis (RCA)
5. **Screenshot** every page for visual inspection
6. **Record** network traffic (HAR files) for debugging

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/evenslouis/n8n-cursor/apps/scorpion

# Install audit dependencies
pnpm add -D tsx lighthouse

# Install Playwright browsers
npx playwright install chromium
```

### 2. Start the Dev Server

Make sure Scorpion is running on port 3003:

```bash
# In one terminal
pnpm dev
```

### 3. Run the Complete Audit

```bash
# In another terminal
cd /Users/evenslouis/n8n-cursor/apps/scorpion

# Run full audit (crawl + tests + lighthouse)
pnpm run audit:all
```

## 📋 Available Commands

### Quick Audits

```bash
# Just crawl and capture errors (fastest)
pnpm run audit:run

# Just run Playwright tests
pnpm run audit:test

# Just run Lighthouse performance audits
pnpm run audit:lighthouse
```

### Individual Steps

```bash
# Step 1: Crawl the UI (discover all pages)
pnpm run audit:crawl

# Step 2: Run detailed tests (console, network, screenshots)
pnpm run audit:test

# Step 3: Run Lighthouse (performance + a11y)
pnpm run audit:lighthouse
```

### Dev Server with Trace

```bash
# Run dev server with enhanced error tracking
pnpm run dev:trace
```

## 📁 Output Structure

After running the audit, you'll find evidence in:

```
audit/out/<timestamp>/
├── INDEX.md                     # Summary report (we'll generate this)
├── RCA.md                       # Root Cause Analysis (we'll generate this)
├── crawl-results.json           # Pages discovered
├── visited.json                 # URLs visited
├── console.json                 # All console messages
├── network-failures.json        # Failed HTTP requests
├── page-errors.json             # Uncaught exceptions
├── summary.json                 # Quick stats
├── network.har                  # Full network recording
├── screenshot-*.png             # Page screenshots
├── audit-*.png                  # Test screenshots
└── lighthouse/
    └── lh-*.html                # Performance reports
```

## 🔍 How to Read Results

### 1. Check the Summary

```bash
cat audit/out/$(ls -t audit/out | head -1)/summary.json
```

Look for:
- `consoleErrors`: Number of console.error() calls
- `networkFailures`: Failed HTTP requests (4xx, 5xx)
- `pageErrors`: Uncaught JavaScript exceptions

### 2. Inspect Console Errors

```bash
cat audit/out/$(ls -t audit/out | head -1)/console.json | grep '"type":"error"' -A 3
```

### 3. Review Network Failures

```bash
cat audit/out/$(ls -t audit/out | head -1)/network-failures.json
```

### 4. Open Lighthouse Reports

```bash
open audit/out/$(ls -t audit/out | head -1)/lighthouse/lh-*.html
```

## 🐛 Common Issues Found

Based on your earlier reports, this audit will systematically check:

1. **Home Page** - Not showing correct stats
2. **Dashboard** - Errors (Mistake Learner, System Automation)
3. **Project Page** - Slow loading
4. **Operations Page** - Mock data instead of real
5. **Workflows Page** - Should show 162 workflows ✅
6. **Build Page** - Not intuitive
7. **Knowledge Page** - Preview not showing files
8. **Research Page** - Not intuitive
9. **Council Page** - Not dynamic
10. **Agents Page** - Now has dossiers ✅
11. **Chat Page** - Says "connected" but isn't
12. **Notifications** - Empty
13. **System Logs** - Mock data
14. **Settings** - Not persisting

## 📊 Next Steps After Audit

1. **Review artifacts** in `audit/out/<timestamp>/`
2. **Read RCA.md** (we'll generate this based on evidence)
3. **Apply minimal fixes** with tests
4. **Re-run audit** to verify fixes
5. **Compare before/after** metrics

## 🎯 Expected Baseline

For a "clean" audit, we expect:
- **0 console errors**
- **0 page crashes**
- **< 5 network failures** (some APIs might be optional)
- **Lighthouse Performance > 80**
- **Lighthouse Accessibility > 90**

## 🛠️ Configuration

### Change Base URL

```bash
AUDIT_BASE_URL=http://localhost:3000 pnpm run audit:run
```

### Adjust Crawl Depth

```bash
AUDIT_DEPTH=3 AUDIT_MAX_PAGES=100 pnpm run audit:crawl
```

### Target Specific Pages

Edit `audit/crawl.ts` and modify the `knownRoutes` array.

## 📝 Creating the RCA

After running the audit, we'll analyze:

1. **Patterns** - What types of errors are most common?
2. **Root Causes** - Not just symptoms
3. **Impact** - Which pages are affected?
4. **Priority** - Critical vs nice-to-have fixes
5. **Fix Plan** - Minimal, tested changes

## 🔥 Emergency: Quick Triage

If the UI is completely broken:

```bash
# 1. Check if server is running
curl http://localhost:3003/api/health

# 2. Run quick crawl only
pnpm run audit:crawl

# 3. Check console errors
cat audit/out/$(ls -t audit/out | head -1)/console.json | grep error -i
```

## 🎓 Learn More

- [Playwright Docs](https://playwright.dev)
- [Lighthouse Docs](https://developers.google.com/web/tools/lighthouse)
- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)

---

**Remember**: Always audit BEFORE and AFTER making changes. Evidence-based fixes are better than guesses! 🦂

