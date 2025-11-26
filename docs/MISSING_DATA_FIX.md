# 🔧 Fix Missing Frontend Data

## Problem

Frontend pages are showing empty data or "No data available" messages.

## Root Cause

The knowledge base is empty (`knowledge.total: 0`). This happens when:
1. Scorpion was just installed/started
2. Knowledge ingestion hasn't run yet
3. Data directory was cleared/reset

## Quick Fix

### Option 1: Automated Script (Recommended)

```bash
./scripts/fix-missing-data.sh
```

This script will:
- Check if Scorpion is running
- Check current knowledge count
- Trigger ingestion if needed
- Show results

### Option 2: Manual via UI

1. Navigate to: `http://localhost:3003/project`
2. Click the **"Manual Sync"** button
3. Wait 1-2 minutes for ingestion to complete
4. Refresh frontend pages

### Option 3: Via API

```bash
curl -X POST http://localhost:3003/api/project/knowledge
```

## Verification

After ingestion, verify data is populated:

```bash
# Check knowledge count
curl http://localhost:3003/api/stats | jq '.data.knowledge.total'

# Check knowledge items
curl http://localhost:3003/api/project/knowledge | jq '.data.knowledge | length'
```

Expected: Should show > 0 knowledge items.

## What Gets Ingested

The knowledge ingestion process extracts:

- **Code files** - All TypeScript, JavaScript, Python, etc.
- **Documentation** - All markdown files, READMEs, guides
- **Workflows** - n8n workflow definitions
- **Database schemas** - SQL schema files
- **Configuration** - Config files, environment templates
- **API endpoints** - Route handlers and API definitions

## Troubleshooting

### Ingestion Takes Too Long

- Normal: 1-5 minutes depending on project size
- If > 10 minutes: Check server logs for errors
- Large projects: May take longer, be patient

### Still No Data After Ingestion

1. **Check server logs:**
   ```bash
   # Look for ingestion errors
   tail -f apps/scorpion/.next/server.log | grep -i "ingest\|knowledge"
   ```

2. **Check data directory:**
   ```bash
   # Verify data is being saved
   ls -la apps/scorpion/data/scorpion/
   # or
   ls -la /Volumes/SSD/scorpion-data/  # if using SSD
   ```

3. **Check RAG store:**
   ```bash
   # Verify RAG store has data
   curl http://localhost:3003/api/project/knowledge | jq '.data.knowledge | length'
   ```

4. **Force re-ingestion:**
   ```bash
   # Clear and re-ingest
   rm -rf apps/scorpion/data/scorpion/rag-store.json
   curl -X POST http://localhost:3003/api/project/knowledge
   ```

### Frontend Still Shows Empty

1. **Hard refresh browser:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear browser cache**
3. **Check browser console** for API errors
4. **Verify API is responding:**
   ```bash
   curl http://localhost:3003/api/project/knowledge | jq '.success'
   ```

## Prevention

Knowledge ingestion should happen automatically on startup, but if it doesn't:

1. **Check auto-sync is enabled:**
   - Look for "Auto-sync enabled" message in server logs
   - Check `apps/scorpion/instrumentation.ts` - should call `ingestAll()` if knowledge is empty

2. **Manual trigger on startup:**
   - Add to your startup script or use the fix script

3. **Monitor knowledge count:**
   ```bash
   # Add to monitoring
   ./scripts/check-missing-data.sh
   ```

## Related Files

- **Ingestion API:** `apps/scorpion/app/api/project/knowledge/route.ts`
- **Orchestrator:** `packages/scorpion-core/src/knowledge/orchestrator.ts`
- **Auto-sync:** `apps/scorpion/lib/auto-sync.ts`
- **Startup:** `apps/scorpion/instrumentation.ts`

## Status Check Script

Run this to check all data sources:

```bash
./scripts/check-missing-data.sh
```

This will show:
- Which APIs are returning empty data
- Current knowledge count
- Workflow count
- Agent count
- Recommendations for fixes

