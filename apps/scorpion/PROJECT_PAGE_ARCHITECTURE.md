# Project Page Architecture Analysis

## 1. Backend Architecture

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **API Routes**: Next.js API Routes (`app/api/*`)
- **Data Source**: ProjectKnowledgeOrchestrator (from `@scorpion/core`)
- **Storage**: Local file-based storage (RAG Store, Ontology Store)

### Key Backend Components

#### Project Knowledge Orchestrator
- **Location**: `packages/scorpion-core/src/knowledge/project-knowledge.ts`
- **Purpose**: Coordinates all knowledge ingesters to build comprehensive project knowledge
- **Key Methods**:
  - `ingestAll()` - Ingests all project knowledge
  - `getSummary()` - Returns cached summary (30s TTL)

#### Knowledge Ingesters
- **WorkspaceIngester** - Extracts workspace structure (apps, packages)
- **DatabaseIngester** - Extracts database schemas
- **WorkflowIngester** - Extracts workflow information
- **DocumentationIngester** - Extracts documentation
- **InfrastructureIngester** - Extracts service statuses
- **ConversationIngester** - Extracts conversation stats
- **CodeIngester** - Extracts code knowledge
- **N8nCursorIngester** - Extracts n8n-specific knowledge

---

## 2. Project Page UI Structure

### Main Project Page
- **Route**: `/project`
- **File**: `app/(scorpion)/project/page.tsx`
- **Component**: `ProjectPage`

### Page Sections

#### 1. Header Section
- **Displays**:
  - Page title: "Project Dashboard"
  - Last ingestion timestamp
  - Auto-sync status indicator
  - Manual Sync button (triggers `POST /api/project/knowledge`)

#### 2. Overall Health Section (Expandable)
- **Data Source**: `/api/projects` → `health.status`
- **Displays**:
  - Overall health status: `healthy` | `degraded` | `critical`
  - Project status label
  - Metrics grid:
    - **Apps**: `workspace.apps` (from `workspace.totalDirectories`)
    - **Packages**: `workspace.packages` (from `workspace.totalFiles`)
    - **Databases**: `databases.length`
    - **Workflows**: `workflows.synced/workflows.total` with sync percentage

#### 3. Tech Debt Analysis Section (Expandable)
- **Data Source**: `/api/projects` → `techDebt`
- **Displays**:
  - Total tech debt count
  - Critical count
  - High count
  - Medium count
  - Low count

#### 4. Missing Features Section (Expandable)
- **Data Source**: `/api/projects` → `missingFeatures`
- **Displays**:
  - P0 (Critical) count
  - P1 (High) count
  - P2 (Medium) count

#### 5. Infrastructure Services Section (Expandable)
- **Data Source**: `/api/projects` → `infrastructure.services`
- **Displays**: DataTable with columns:
  - Service name
  - Status (online/offline/unknown) with colored indicator
  - URL
  - Last checked timestamp

#### 6. Knowledge Base Section (Expandable)
- **Data Source**: `/api/projects` → `knowledge.totalItems`
- **Displays**:
  - Total knowledge items count
  - Last ingestion timestamp

#### 7. Conversations Section (Expandable)
- **Data Source**: `/api/projects` → `conversations`
- **Displays**:
  - Total conversations count
  - Total messages count
  - Recent conversations (7 days) count

---

## 3. API Endpoints Mapping

### Projects Endpoint (Main Data Source)
- **Route**: `GET /api/projects`
- **File**: `app/api/projects/route.ts`
- **Purpose**: Get comprehensive project details and statistics
- **Response Shape**:
```typescript
{
  success: boolean,
  data: {
    name: string,
    description: string,
    status: string,
    created: string,
    lastUpdated: string,
    
    // Workspace stats
    workspace: {
      totalFiles: number,        // Packages count
      totalDirectories: number, // Apps count
      languages: string[],
      frameworks: string[]
    },
    
    // Database stats
    databases: Array<{
      name: string,
      tables: number,
      schema: string
    }>,
    
    // Workflow stats
    workflows: {
      total: number,
      active: number,  // Synced workflows count
      categories: Record<string, number>
    },
    
    // Documentation stats
    documentation: {
      totalFiles: number,
      totalSize: number,
      categories: string[]
    },
    
    // Infrastructure
    infrastructure: {
      services: Array<{
        name: string,
        status: 'online' | 'offline' | 'unknown',
        url?: string,
        lastChecked: string
      }>,
      containers: any[],
      networks: any[]
    },
    
    // Knowledge stats
    knowledge: {
      totalItems: number,
      entities: number,
      relationships: number
    },
    
    // Conversation stats
    conversations: {
      total: number,
      totalMessages: number,
      recentConversations: number
    },
    
    // Health
    health: {
      status: 'healthy' | 'degraded' | 'critical',
      message: string,
      issues: any[],
      lastCheck: string
    },
    
    // Tech Debt
    techDebt: {
      total: number,
      critical: number,
      high: number,
      medium: number,
      low: number
    },
    
    // Missing Features
    missingFeatures: {
      p0: number,
      p1: number,
      p2: number
    },
    
    // Last Ingestion
    lastIngestion: string
  }
}
```

### Project Knowledge Endpoint (Ingestion)
- **Route**: `POST /api/project/knowledge`
- **File**: `app/api/project/knowledge/route.ts`
- **Purpose**: Trigger manual knowledge ingestion
- **Timeout**: 300 seconds (5 minutes)
- **Response Shape**:
```typescript
{
  success: boolean,
  data: {
    ingested: number,
    summary: {
      workspace: number,
      databases: number,
      workflows: number,
      services: number,
      status: ProjectStatus
    },
    ingestedAt: string
  }
}
```

### Project Knowledge GET Endpoint
- **Route**: `GET /api/project/knowledge`
- **File**: `app/api/project/knowledge/route.ts`
- **Purpose**: Get project knowledge summary and items
- **Response Shape**:
```typescript
{
  success: boolean,
  data: {
    summary: {
      totalKnowledge: number,
      workspace: WorkspaceStructure | null,
      databases: DatabaseSchema[],
      workflows: WorkflowInfo[],
      services: ServiceStatus[],
      conversations: {
        total: number,
        totalMessages: number,
        recentConversations: number
      },
      status: ProjectStatus
    },
    knowledge: Array<{
      id: string,
      source: string,
      type: string,
      category: string,
      title: string,
      description: string,
      tags: string[],
      extracted: string,
      filePath?: string,
      contentUrl?: string,
      codeSnippets: any[]
    }>
  }
}
```

---

## 4. Data Flow for Project Page

### Initial Load Flow
```
Project Page (Client)
  ↓ fetch('/api/projects')
API Route: GET /api/projects
  ↓
getOrchestrator()
  ↓
orchestrator.getSummary() [cached 30s]
  ↓
Parallel ingestion:
  - workspaceIngester.getWorkspaceStructure()
  - databaseIngester.getDatabaseStructure()
  - workflowIngester.getWorkflows()
  - infrastructureIngester.getServiceStatuses()
  - conversationIngester.getConversationStats()
  - ragStore.getAllKnowledge()
  ↓
calculateProjectStatus()
  ↓
Format response with mapping
  ↓
Response: ProjectData
  ↓
Render in ProjectPage component
```

### Manual Sync Flow
```
User clicks "Manual Sync"
  ↓
handleIngest() → fetch('/api/project/knowledge', { method: 'POST' })
  ↓
API Route: POST /api/project/knowledge
  ↓
orchestrator.ingestAll()
  ↓
Parallel ingestion of all knowledge sources:
  - Workspace knowledge
  - Database schemas
  - Workflows
  - Documentation
  - Infrastructure
  - Conversations
  - Code
  - n8n Cursor data
  ↓
Store in RAG Store
  ↓
Invalidate summary cache
  ↓
Response: { ingested, summary, ingestedAt }
  ↓
Reload status (loadStatus())
```

---

## 5. TypeScript Interfaces

### ProjectStatus (Frontend)
```typescript
interface ProjectStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  techDebt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  missingFeatures: {
    p0: number;
    p1: number;
    p2: number;
  };
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'unknown';
    url?: string;
    lastChecked: string;
  }>;
  workspace: {
    apps: number;
    packages: number;
  };
  databases: number;
  workflows: {
    total: number;
    synced: number;
  };
  knowledge: {
    total: number;
  };
  conversations: {
    total: number;
    totalMessages: number;
    recent: number;
  };
  lastIngestion: string;
}
```

### ProjectStatus (Backend - from orchestrator)
```typescript
interface ProjectStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  techDebt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  missingFeatures: {
    p0: number;
    p1: number;
    p2: number;
  };
  services: ServiceStatus[];
  lastIngestion: string;
}
```

### WorkspaceStructure
```typescript
interface WorkspaceStructure {
  apps: Record<string, AppInfo> | AppInfo[];
  packages: PackageInfo[];
  languages: string[];
  frameworks: string[];
  // ... other workspace metadata
}
```

### WorkflowInfo
```typescript
interface WorkflowInfo {
  name: string;
  category: string;
  trigger: string;
  syncedToN8n?: boolean;
  n8nId?: string;
  lastSync?: string;
  active?: boolean;
  // ... other workflow metadata
}
```

### DatabaseSchema
```typescript
interface DatabaseSchema {
  name: string;
  schema: string;
  tables: TableInfo[];
  // ... other database metadata
}
```

---

## 6. Dashboard Section → API Endpoint Mapping

| Dashboard Section | API Endpoint | Data Path | Notes |
|------------------|--------------|-----------|-------|
| Header - Last Ingestion | `GET /api/projects` | `data.lastIngestion` | ISO timestamp string |
| Header - Auto-sync Status | Client-side | Static "Auto-sync enabled" | Not from API |
| Overall Health Status | `GET /api/projects` | `data.health.status` | Maps to `overallHealth` |
| Apps Count | `GET /api/projects` | `data.workspace.totalDirectories` | Frontend maps to `apps` |
| Packages Count | `GET /api/projects` | `data.workspace.totalFiles` | Frontend maps to `packages` |
| Databases Count | `GET /api/projects` | `data.databases.length` | Array length |
| Workflows Count | `GET /api/projects` | `data.workflows.total` | Total workflows |
| Workflows Synced | `GET /api/projects` | `data.workflows.active` | Synced workflows count |
| Sync Percentage | Client-side | Calculated: `(synced/total)*100` | Derived metric |
| Tech Debt Total | `GET /api/projects` | `data.techDebt.total` | |
| Tech Debt Critical | `GET /api/projects` | `data.techDebt.critical` | |
| Tech Debt High | `GET /api/projects` | `data.techDebt.high` | |
| Tech Debt Medium | `GET /api/projects` | `data.techDebt.medium` | |
| Tech Debt Low | `GET /api/projects` | `data.techDebt.low` | |
| Missing Features P0 | `GET /api/projects` | `data.missingFeatures.p0` | |
| Missing Features P1 | `GET /api/projects` | `data.missingFeatures.p1` | |
| Missing Features P2 | `GET /api/projects` | `data.missingFeatures.p2` | |
| Infrastructure Services | `GET /api/projects` | `data.infrastructure.services` | Array of service objects |
| Knowledge Total Items | `GET /api/projects` | `data.knowledge.totalItems` | |
| Conversations Total | `GET /api/projects` | `data.conversations.total` | |
| Conversations Total Messages | `GET /api/projects` | `data.conversations.totalMessages` | |
| Conversations Recent | `GET /api/projects` | `data.conversations.recentConversations` | Last 7 days |
| Manual Sync Action | `POST /api/project/knowledge` | Response triggers reload | Ingests all knowledge |

---

## 7. Data Transformation Mapping

### API Response → Frontend State

The frontend performs data transformation in `loadStatus()`:

```typescript
// API Response Format
{
  health: { status: 'healthy' | 'degraded' | 'critical' },
  workspace: { totalDirectories: 4, totalFiles: 6 },
  databases: [{ name: '...', tables: 0, schema: 'public' }, ...],
  workflows: { total: 187, active: 64 },
  knowledge: { totalItems: 59 },
  conversations: { total: 0, totalMessages: 0, recentConversations: 0 },
  techDebt: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
  missingFeatures: { p0: 0, p1: 0, p2: 0 },
  infrastructure: { services: [...] },
  lastIngestion: '2025-11-10T11:23:07.000Z'
}

// Transformed to Frontend State
{
  overallHealth: 'healthy',
  workspace: { apps: 4, packages: 6 },
  databases: 4,
  workflows: { total: 187, synced: 64 },
  knowledge: { total: 59 },
  conversations: { total: 0, totalMessages: 0, recent: 0 },
  techDebt: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
  missingFeatures: { p0: 0, p1: 0, p2: 0 },
  services: [...],
  lastIngestion: '2025-11-10T11:23:07.000Z'
}
```

### Key Transformations:
1. `health.status` → `overallHealth`
2. `workspace.totalDirectories` → `workspace.apps`
3. `workspace.totalFiles` → `workspace.packages`
4. `databases.length` → `databases` (number)
5. `workflows.active` → `workflows.synced`
6. `knowledge.totalItems` → `knowledge.total`
7. `conversations.recentConversations` → `conversations.recent`
8. `infrastructure.services` → `services`

---

## 8. Caching Strategy

### Summary Cache (Orchestrator)
- **Location**: `ProjectKnowledgeOrchestrator.summaryCache`
- **TTL**: 30 seconds
- **Invalidation**: After `ingestAll()` completes
- **Purpose**: Avoid expensive re-computation of summary

### API Response Cache
- **Location**: `lib/cache.ts` → `responseCache`
- **TTL**: Not explicitly set for `/api/projects` (relies on orchestrator cache)
- **Purpose**: Reduce API calls

### Frontend State
- **Location**: React state (`useState`)
- **TTL**: Until page reload or manual refresh
- **Refresh**: Manual sync button or page reload

---

## 9. Error Handling

### API Error Handling
- All routes use `withErrorHandling` wrapper
- Returns `{ success: false, error: string }` on error
- Frontend checks `response.ok` before processing

### Frontend Error Handling
```typescript
try {
  const response = await fetch('/api/projects');
  if (response.ok) {
    const result = await response.json();
    const data = result.success && result.data ? result.data : result;
    // Transform and set state
  }
} catch (error) {
  console.error('Failed to load project status:', error);
  // Loading state is cleared, but no error UI shown
}
```

### Fallback Values
- All fields have fallback defaults (0, empty arrays, etc.)
- Prevents UI crashes if API returns partial data
- Example: `data.techDebt || { total: 0, critical: 0, ... }`

---

## 10. Performance Considerations

### Summary Caching
- 30-second cache reduces orchestrator calls
- Multiple page loads within 30s use cached data
- Cache invalidated after ingestion

### Parallel Ingestion
- `getSummary()` runs ingesters in parallel where possible
- Reduces total time for summary computation

### Timeout Protection
- `GET /api/project/knowledge` has 5-second timeout for RAG store
- `GET /api/project/knowledge` has 3-second timeout for summary
- Prevents hanging requests

### Lazy Loading
- Expandable sections load data on demand
- Only Overall Health section expanded by default

---

## 11. Summary

### Backend
- **Framework**: Next.js 14 with App Router
- **API Pattern**: API Routes with error handling wrapper
- **Data Source**: ProjectKnowledgeOrchestrator (from `@scorpion/core`)
- **Caching**: 30-second summary cache in orchestrator

### Frontend
- **Main Page**: `/project` → `ProjectPage` component
- **Data Source**: `GET /api/projects` for main data
- **Actions**: `POST /api/project/knowledge` for manual sync
- **Sections**: 7 expandable sections with various metrics

### Key Features
- **Auto-sync**: Enabled indicator (static, not from API)
- **Manual Sync**: Triggers full knowledge ingestion
- **Real-time Metrics**: Apps, packages, databases, workflows, knowledge
- **Health Status**: Overall health with detailed breakdown
- **Tech Debt**: Categorized by severity
- **Missing Features**: Prioritized (P0, P1, P2)
- **Infrastructure**: Service status monitoring
- **Knowledge Base**: Total items and last ingestion time
- **Conversations**: Total and recent conversation stats

