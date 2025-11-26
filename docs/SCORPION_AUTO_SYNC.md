# 🦂 Scorpion Automatic Sync System

**Status**: ✅ **AUTOMATIC SYNC ENABLED**  
**Date**: 2025-11-06

---

## 🎯 Overview

Scorpion now automatically syncs everything - no manual intervention needed. Knowledge ingestion and workflow syncing happen automatically in the background.

---

## ⚡ Automatic Features

### 1. **Auto-Ingestion on Startup**
- Runs automatically when Scorpion starts
- **Always runs full ingestion** including:
  - All project knowledge (workspace, code, docs, workflows, infrastructure)
  - **Tech debt analysis** - Analyzes codebase for technical debt and missing features
  - **Recommendations** - Generates intelligent recommendations for improvements
- Ensures recommendations and tech debt analysis are always up-to-date

### 2. **Periodic Sync (Every 5 Minutes)**
- Automatically re-ingests **all project knowledge** including:
  - **Tech debt analysis** - Re-analyzes codebase for changes
  - **Recommendations** - Regenerates recommendations based on latest codebase state
- Catches any changes to workspace, database, docs, etc.
- Syncs workflows to n8n

### 3. **File Watching**
- Watches `workflows/` directory for changes
- Automatically syncs workflows when files are added/changed/removed
- Debounced to avoid multiple syncs for rapid changes

---

## 🔧 Implementation

### Instrumentation Hook
**File**: `apps/scorpion/instrumentation.ts`

Runs on Next.js server startup:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeAutoSync } = await import('./lib/auto-sync');
    initializeAutoSync();
  }
}
```

### Auto-Sync Module
**File**: `apps/scorpion/lib/auto-sync.ts`

Handles all automatic syncing:
- Initial sync on startup
- Periodic sync every 5 minutes
- File watching for workflows
- Automatic workflow sync to n8n

### Next.js Config
**File**: `apps/scorpion/next.config.js`

Enabled instrumentation hook:
```javascript
experimental: {
  instrumentationHook: true,
}
```

---

## 📊 Sync Schedule

| Event | Frequency | Action |
|-------|-----------|--------|
| **Server Startup** | Once | Full knowledge ingestion (including recommendations & tech debt) |
| **Periodic Sync** | Every 5 minutes | Full re-ingest (recommendations & tech debt) + sync workflows |
| **Workflow File Change** | On file change | Sync workflows to n8n (debounced 2s) |

---

## 🎨 UI Updates

### Project Dashboard
- Shows "Auto-sync enabled" indicator
- Manual sync button is now optional (forced sync only)
- Status updates automatically

### Workflows Page
- Shows "Auto-sync enabled" indicator
- Manual sync button is now optional
- Sync status updates automatically

---

## 🚀 Usage

### Starting Scorpion

```bash
cd apps/scorpion
pnpm dev
```

**What happens automatically**:
1. ✅ Server starts
2. ✅ Auto-sync initializes
3. ✅ **Full knowledge ingestion runs** (including recommendations & tech debt analysis)
4. ✅ File watcher starts monitoring workflows
5. ✅ Periodic sync begins (every 5 minutes, includes recommendations & tech debt)

### No Manual Steps Required

- ❌ No need to click "Sync Knowledge"
- ❌ No need to manually sync workflows
- ✅ Everything happens automatically

---

## 🔍 Monitoring

### Console Logs

Watch for these log messages:

```
🦂 Automatic syncing enabled (bidirectional)
🦂 Performing initial knowledge ingestion (including recommendations)...
🦂 Running full ingestion (this may take a few minutes)...
💻 Ingesting source code...
🔍 Analyzing codebase for tech debt and missing features...
✅ Found 45 tech debt/missing feature items
🧠 Generating intelligent recommendations...
✅ Generated 23 recommendations
✅ Initial ingestion complete: 150 knowledge items (including recommendations and tech debt analysis)
🦂 Watching workflow files in /path/to/workflows...
✅ Workflow file watcher started
🦂 Performing periodic sync (including recommendations and tech debt analysis)...
✅ Periodic sync completed: 150 knowledge items (recommendations and tech debt updated)
📥 Workflow file added: workflow_new.json
🔄 Found 1 unsynced workflows, triggering sync...
✅ Workflow sync completed
```

---

## ⚙️ Configuration

### Environment Variables

- `N8N_API_KEY` - Required for workflow syncing
- `OLLAMA_URL` - Default: `http://localhost:11434`
- `N8N_BASE_URL` - Default: from shared-config

### Sync Intervals

Currently hardcoded:
- **Periodic Sync**: 5 minutes
- **File Watch Debounce**: 2 seconds

To change, edit `apps/scorpion/lib/auto-sync.ts`:
```typescript
// Change periodic sync interval
syncInterval = setInterval(() => {
  performPeriodicSync();
}, 10 * 60 * 1000); // 10 minutes

// Change debounce time
syncTimeout = setTimeout(() => {
  syncWorkflows();
}, 5000); // 5 seconds
```

---

## 🛠️ Manual Override

If you need to manually trigger sync:

### Via UI
- **Project Dashboard**: Click "Manual Sync" button
- **Workflows Page**: Click "Force Sync" button

### Via API
```bash
# Force knowledge ingestion
POST /api/project/knowledge/ingest

# Force workflow sync
POST /api/workflows
Body: { "action": "sync" }
```

---

## 🧠 Recommendations & Tech Debt Analysis

### Automatic Analysis
- **Tech Debt Detection**: Automatically analyzes codebase for technical debt issues
- **Missing Features**: Identifies missing features based on codebase patterns
- **Intelligent Recommendations**: Generates actionable recommendations for improvements
- **Always Current**: Both analyses run on every sync (startup + every 5 minutes)

### What Gets Analyzed
- Code structure and architecture
- Security vulnerabilities
- Performance issues
- Testing gaps
- Documentation needs
- Error handling patterns
- Type safety issues
- Missing features based on patterns

### Accessing Results
- View recommendations in the Project Dashboard
- Tech debt items appear in knowledge base searches
- Both are automatically included in RAG store for AI queries

## ✅ Benefits

1. **Zero Manual Work** - Everything syncs automatically
2. **Always Up-to-Date** - Knowledge, recommendations, and tech debt analysis stay current
3. **Automatic Insights** - Recommendations and tech debt analysis run automatically
4. **Real-time Workflow Sync** - Changes sync immediately
5. **Background Processing** - No impact on UI performance
6. **Self-Healing** - Automatically detects and syncs missing items

---

## 🔮 Future Enhancements

1. **Configurable Intervals** - Make sync intervals configurable
2. **Selective Sync** - Only sync changed items
3. **Sync Status API** - Track sync progress
4. **Notifications** - Alert on sync failures
5. **Sync History** - Track sync events

---

**Status**: ✅ **AUTOMATIC SYNC OPERATIONAL**

Scorpion now syncs everything automatically - no manual intervention needed!

