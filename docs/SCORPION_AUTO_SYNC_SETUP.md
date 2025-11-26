# 🦂 Scorpion Automatic Sync - Setup Complete

**Status**: ✅ **AUTOMATIC SYNC ENABLED**  
**Date**: 2025-11-06

---

## ✅ What's Automatic Now

### 1. **Knowledge Ingestion**
- ✅ **On Startup**: Automatically ingests all project knowledge if none exists
- ✅ **Every 5 Minutes**: Periodically re-ingests to catch changes
- ✅ **No Manual Steps**: Everything happens in the background

### 2. **Workflow Syncing**
- ✅ **File Watching**: Automatically watches `workflows/` directory
- ✅ **On Change**: Syncs workflows to n8n when files are added/changed/removed
- ✅ **Debounced**: Waits 2 seconds after last change to avoid multiple syncs
- ✅ **Periodic Check**: Also checks sync status every 5 minutes

---

## 🔧 How It Works

### Instrumentation Hook
**File**: `apps/scorpion/instrumentation.ts`

Runs automatically when Next.js server starts:
```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    initializeAutoSync();
  }
}
```

### Auto-Sync Module
**File**: `apps/scorpion/lib/auto-sync.ts`

Handles:
- Initial knowledge ingestion on startup
- Periodic sync every 5 minutes
- File watching for workflow changes
- Automatic workflow sync to n8n

### Next.js Config
**File**: `apps/scorpion/next.config.js`

Enabled instrumentation:
```javascript
experimental: {
  instrumentationHook: true,
}
```

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
4. ✅ File watcher starts monitoring workflows
5. ✅ Periodic sync begins (every 5 minutes)

### No Manual Steps Required

- ❌ **No need to click "Sync Knowledge"** - happens automatically
- ❌ **No need to manually sync workflows** - happens automatically
- ✅ **Everything syncs in the background**

---

## 📊 Sync Schedule

| Event | Frequency | Action |
|-------|-----------|--------|
| **Server Startup** | Once | Initial knowledge ingestion |
| **Periodic Sync** | Every 5 minutes | Re-ingest knowledge + sync workflows |
| **Workflow File Change** | On file change | Sync workflows to n8n (debounced 2s) |

---

## 🎨 UI Updates

### Project Dashboard (`/project`)
- Shows "Auto-sync enabled" indicator
- Manual sync button is optional (forced sync only)
- Status updates automatically

### Workflows Page (`/workflows`)
- Shows "Auto-sync enabled" indicator
- Manual sync button is optional
- Sync status updates automatically

### Home Page (`/`)
- Shows project health status
- Quick stats update automatically

---

## 🔍 Monitoring

### Console Logs

Watch for these messages:

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

### Sync Intervals

Currently set in `apps/scorpion/lib/auto-sync.ts`:

- **Periodic Sync**: 5 minutes (`5 * 60 * 1000`)
- **File Watch Debounce**: 2 seconds (`2000`)

To change, edit the file:
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

## 🛠️ Manual Override (Optional)

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

1. **Configurable Intervals** - Make sync intervals configurable via UI
2. **Selective Sync** - Only sync changed items (not full re-ingestion)
3. **Sync Status API** - Track sync progress and history
4. **Notifications** - Alert on sync failures
5. **Sync History** - Track all sync events

---

**Status**: ✅ **AUTOMATIC SYNC OPERATIONAL**

Scorpion now syncs everything automatically - no manual intervention needed!

