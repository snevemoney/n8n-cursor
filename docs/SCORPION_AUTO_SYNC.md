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
- Ingests all project knowledge if none exists
- Checks for existing knowledge before ingesting

### 2. **Periodic Sync (Every 5 Minutes)**
- Automatically re-ingests project knowledge
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
| **Server Startup** | Once | Initial knowledge ingestion |
| **Periodic Sync** | Every 5 minutes | Re-ingest all knowledge + sync workflows |
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
3. ✅ Knowledge ingestion runs (if needed)
4. ✅ File watcher starts
5. ✅ Periodic sync begins

### No Manual Steps Required

- ❌ No need to click "Sync Knowledge"
- ❌ No need to manually sync workflows
- ✅ Everything happens automatically

---

## 🔍 Monitoring

### Console Logs

Watch for these log messages:

```
🦂 Scorpion auto-sync initialized
🦂 Performing initial knowledge ingestion...
✅ Knowledge already exists: 150 items
🦂 Watching workflow files in /path/to/workflows...
✅ Workflow file watcher started
🦂 Performing periodic sync...
✅ Periodic sync completed: 150 knowledge items
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

## ✅ Benefits

1. **Zero Manual Work** - Everything syncs automatically
2. **Always Up-to-Date** - Knowledge stays current
3. **Real-time Workflow Sync** - Changes sync immediately
4. **Background Processing** - No impact on UI performance
5. **Self-Healing** - Automatically detects and syncs missing items

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

