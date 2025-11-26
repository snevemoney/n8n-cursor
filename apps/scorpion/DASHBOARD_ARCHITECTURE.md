# Scorpion Dashboard Architecture Analysis

## 1. Backend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **API Routes**: Next.js API Routes (`app/api/*`)
- **Database**: Local file-based storage (no external database)
  - RAG Store: Local file storage for knowledge items
  - Ontology Store: Local file storage for entities
  - Storage detection: SSD/HDD auto-detection with fallback

### Key Backend Components

#### Storage System
- **Location**: `lib/storage/`
- **Key Files**:
  - `storage-config.ts` - Manages storage paths and configuration
  - `storage-detector.ts` - Detects SSD vs HDD, external drives
  - `storage-reconnect-monitor.ts` - Monitors SSD reconnection
  - `storage-error-handler.ts` - Handles storage errors with fallback
- **Storage Detection**: Automatically detects SSD and migrates data for performance

#### Shared Stores
- **Location**: `lib/shared-stores.ts`
- **Stores**:
  - `RAGStore` - Knowledge base storage
  - `OntologyStore` - Entity relationship storage
  - `ProjectKnowledgeOrchestrator` - Coordinates knowledge and workflows

#### API Error Handling
- **Location**: `lib/api-error-handler.ts`
- **Pattern**: All API routes use `withErrorHandling` wrapper
- **Response Format**: `{ success: boolean, data?: any, error?: string }`

---

## 2. Dashboard UI Structure

### Main Dashboard Page
- **Route**: `/dashboard`
- **File**: `app/(scorpion)/dashboard/page.tsx`
- **Component**: `DashboardPage`

### Dashboard Sections

#### 1. Overall Status Card
- **Data Source**: `/api/health`
- **Displays**:
  - Overall status: `healthy` | `degraded` | `unhealthy`
  - Summary counts: healthy, warnings, errors
  - Large visual indicator with icon

#### 2. Live Metrics Trend Chart
- **Data Source**: `/api/health` (aggregated over time)
- **Displays**: Area chart showing healthy/warnings/errors over time
- **Updates**: Every 10 seconds (if auto-refresh enabled)

#### 3. System Components Grid
- **Data Source**: `/api/health` → `systems` object
- **Displays**: Individual cards for each system component
- **Components Shown**:
  - `rag` - RAG knowledge store
  - `ontology` - Ontology entity store
  - `orchestrator` - Knowledge orchestrator
  - `trainingData` - Training data collector
  - `mistakeLearner` - Mistake learning system
  - `n8nClient` - n8n workflow client
  - `systemAutomation` - System automation stack
  - `notifications` - Notification system
  - `ollama` - Ollama LLM service

---

## 3. API Endpoints Mapping

### Health Check Endpoint
- **Route**: `GET /api/health`
- **File**: `app/api/health/route.ts`
- **Purpose**: Comprehensive health check of all systems
- **Response Shape**:
```typescript
{
  success: boolean,
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy',
    timestamp: string,
    systems: {
      [systemName: string]: {
        status: 'ok' | 'warning' | 'error',
        message?: string,
        details?: {
          // System-specific details
          knowledgeItems?: number,
          initialized?: boolean,
          entities?: number,
          // ... other system-specific fields
        }
      }
    },
    summary: {
      total: number,
      healthy: number,
      warnings: number,
      errors: number
    }
  }
}
```

### Stats Endpoint (Home Page)
- **Route**: `GET /api/stats`
- **File**: `app/api/stats/route.ts`
- **Purpose**: System-wide statistics for home page
- **Response Shape**:
```typescript
{
  success: boolean,
  data: {
    projects: { total: number; active: number },
    agents: { total: number; active: number },
    workflows: { total: number; active: number },
    knowledge: { total: number },
    operations: { total: number; running: number; completed: number; failed: number },
    llmExperiments?: { total: number; running: number; completed: number; failed: number; pending: number },
    system: { health: string },
    recentActivity: Array<{ type: string; message: string; timestamp: string }>
  }
}
```

### Storage Status Endpoint
- **Route**: `GET /api/storage/status`
- **File**: `app/api/storage/status/route.ts`
- **Purpose**: Storage type, paths, and performance metrics
- **Response Shape**:
```typescript
{
  success: boolean,
  storageType: 'ssd' | 'hdd',
  dataPath: string,
  mediaTempPath: string,
  isSSD: boolean,
  detectedSSDPath: string | null,  // ⚠️ Can be null
  optimizationsActive: string[],
  performance: {
    readSpeed: string,
    writeSpeed: string,
    latency: string
  } | null,
  storageSpace: {
    freeSpaceGB: string,
    totalSpaceGB: string,
    freeSpaceBytes: number,
    totalSpaceBytes: number
  } | null,
  allDrives: Array<{
    path: string,
    type: 'ssd' | 'hdd' | 'unknown',
    isExternal: boolean,
    readSpeed: string,
    writeSpeed: string
  }>,
  performanceConfig: { ... },
  integrations: { ... },
  performanceComparison: { ... }
}
```

---

## 4. Data Flow for Dashboard

### Health Check Flow
```
Dashboard Page (Client)
  ↓ fetch('/api/health')
API Route: GET /api/health
  ↓ Parallel health checks
checkRAG() → getRAGStore() → initializeStorageConfig()
checkOntology() → getOntologyStore()
checkOrchestrator() → getOrchestrator()
checkTrainingData() → getTrainingDataCollector()
checkMistakeLearner() → getMistakeLearner()
checkN8nClient() → getMCPn8nClient()
checkSystemAutomation() → getSystemAutomation()
checkNotifications() → getNotificationSystem()
checkOllama() → fetch(OLLAMA_URL)
  ↓ Aggregate results
Response: { status, systems, summary }
  ↓ Render in Dashboard
System Components Grid
```

### Storage Initialization Flow
```
getRAGStore() / getStorageConfig()
  ↓
initializeStorageConfig()
  ↓
detectStorage() → Returns DetectionResult
  ↓
DetectionResult {
  isSSD: boolean,
  storageInfo: StorageInfo | null,  // ⚠️ Can be null
  detectedSSDPath: string | null,
  allDrives: StorageInfo[]
}
  ↓
StorageConfig {
  dataDir: string,
  mediaTempDir: string,
  isSSD: boolean,
  storageInfo: DetectionResult  // ⚠️ storageInfo.storageInfo can be null
}
```

---

## 5. Error Location: `detectedSSDPath` Null Access

### Error Message
```
Cannot read properties of null (reading 'detectedSSDPath')
```

### Root Cause
The error occurs in `lib/storage/storage-reconnect-monitor.ts` when accessing `config.storageInfo.detectedSSDPath` without checking if `storageInfo` is null first.

### Problematic Code Locations

#### Location 1: Line 49
```typescript
// lib/storage/storage-reconnect-monitor.ts:49
const config = await getStorageConfig();
this.lastWasSSD = config.isSSD;
this.lastSSDPath = config.storageInfo.detectedSSDPath;  // ⚠️ storageInfo can be null
```

#### Location 2: Line 87
```typescript
// lib/storage/storage-reconnect-monitor.ts:87
const currentConfig = await getStorageConfig();
const currentIsSSD = currentConfig.isSSD;
const currentSSDPath = currentConfig.storageInfo.detectedSSDPath;  // ⚠️ storageInfo can be null
```

### Why This Happens
1. `DetectionResult.storageInfo` can be `null` (see `storage-detector.ts:23`)
2. `StorageConfig.storageInfo` is of type `DetectionResult` (see `storage-config.ts:18`)
3. When `storageInfo` is `null`, accessing `.detectedSSDPath` throws the error
4. The reconnect monitor starts during store initialization (see `shared-stores.ts:98-104`)

### When It Triggers
- During health check initialization
- When RAG store is initialized (which calls `initializeStorageConfig()`)
- When storage detection fails or returns null `storageInfo`
- When external SSD is disconnected and detection hasn't updated yet

---

## 6. TypeScript Interfaces

### SystemHealth (Dashboard)
```typescript
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  systems: Record<string, {
    status: 'ok' | 'warning' | 'error';
    message?: string;
    details?: any;
  }>;
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
}
```

### DetectionResult (Storage)
```typescript
interface DetectionResult {
  isSSD: boolean;
  storageInfo: StorageInfo | null;  // ⚠️ Can be null
  detectedSSDPath: string | null;
  allDrives: StorageInfo[];
}
```

### StorageConfig
```typescript
interface StorageConfig {
  dataDir: string;
  mediaTempDir: string;
  backupDir?: string;
  cacheDir?: string;
  isSSD: boolean;
  storageInfo: DetectionResult;  // ⚠️ storageInfo.storageInfo can be null
}
```

### StorageInfo
```typescript
interface StorageInfo {
  path: string;
  type: 'ssd' | 'hdd' | 'unknown';
  readSpeed: number; // MB/s
  writeSpeed: number; // MB/s
  latency: number; // ms
  isExternal: boolean;
  freeSpace: number; // bytes
  totalSpace: number; // bytes
}
```

---

## 7. Dashboard Section → API Endpoint Mapping

| Dashboard Section | API Endpoint | Data Shape | Notes |
|------------------|--------------|------------|-------|
| Overall Status | `GET /api/health` | `SystemHealth` | Shows aggregated health |
| System Components (Rag) | `GET /api/health` → `systems.rag` | `{ status, details: { knowledgeItems, initialized } }` | ⚠️ Error occurs during initialization |
| System Components (Ontology) | `GET /api/health` → `systems.ontology` | `{ status, details: { entities, initialized } }` | |
| System Components (Orchestrator) | `GET /api/health` → `systems.orchestrator` | `{ status, details: { totalKnowledge, workflows, projectHealth } }` | |
| System Components (Training Data) | `GET /api/health` → `systems.trainingData` | `{ status, details: { totalExamples, highQuality, averageQuality } }` | |
| System Components (Mistake Learner) | `GET /api/health` → `systems.mistakeLearner` | `{ status, details: { mistakesTracked, learned, patternsDetected } }` | |
| System Components (n8n Client) | `GET /api/health` → `systems.n8nClient` | `{ status, details: { configured } }` | |
| System Components (System Automation) | `GET /api/health` → `systems.systemAutomation` | `{ status, details: { recentErrors, stackHealth } }` | |
| System Components (Notifications) | `GET /api/health` → `systems.notifications` | `{ status, details: { pendingActions, hasUrgent } }` | |
| System Components (Ollama) | `GET /api/health` → `systems.ollama` | `{ status, details: { url, version, reachable } }` | |
| Live Metrics Chart | `GET /api/health` (aggregated) | `MetricPoint[]` | Client-side aggregation |

---

## 8. Recommended Fixes

### Fix 1: Storage Reconnect Monitor (Critical)
Add null checks before accessing `detectedSSDPath`:

```typescript
// Line 49
const config = await getStorageConfig();
this.lastWasSSD = config.isSSD;
this.lastSSDPath = config.storageInfo?.detectedSSDPath ?? null;  // ✅ Safe access

// Line 87
const currentConfig = await getStorageConfig();
const currentIsSSD = currentConfig.isSSD;
const currentSSDPath = currentConfig.storageInfo?.detectedSSDPath ?? null;  // ✅ Safe access
```

### Fix 2: Storage Config Type Safety
Consider making `storageInfo` non-nullable in `StorageConfig` or add validation:

```typescript
// In storage-config.ts
if (!detection.storageInfo) {
  console.warn('⚠️ Storage detection returned null storageInfo, using defaults');
  // Create a default StorageInfo or handle gracefully
}
```

### Fix 3: Error Handling in Health Check
Add try-catch around storage initialization in health checks:

```typescript
async function checkRAG() {
  try {
    const ragStore = await getRAGStore();
    const knowledge = ragStore.getAllKnowledge();
    return {
      status: 'ok' as const,
      details: {
        knowledgeItems: knowledge.length,
        initialized: true
      }
    };
  } catch (error: any) {
    // Check if error is related to storage
    if (error.message?.includes('detectedSSDPath')) {
      return {
        status: 'warning' as const,
        message: 'Storage detection in progress',
        details: { initialized: false }
      };
    }
    return {
      status: 'error' as const,
      message: error.message
    };
  }
}
```

---

## 9. Summary

### Backend
- **Framework**: Next.js 14 with App Router
- **API Pattern**: API Routes in `app/api/*` with error handling wrapper
- **Storage**: Local file-based with SSD/HDD auto-detection
- **Stores**: RAG, Ontology, Orchestrator (all local file-based)

### Dashboard
- **Main Page**: `/dashboard` → `DashboardPage` component
- **Data Source**: `GET /api/health` for system health
- **Auto-refresh**: Every 10 seconds (configurable)
- **Sections**: Overall Status, Live Metrics Chart, System Components Grid

### Error
- **Location**: `lib/storage/storage-reconnect-monitor.ts` lines 49 and 87
- **Cause**: Accessing `detectedSSDPath` on potentially null `storageInfo`
- **Fix**: Add optional chaining (`?.`) and null coalescing (`??`)

