# 🦂 Scorpion - AI Orchestration System

Scorpion is the central AI orchestration system for the n8n-cursor workspace. It provides comprehensive project knowledge, automated workflows, proactive intelligence, and continuous learning capabilities.

## Features

### 🧠 Knowledge Management
- **RAG (Retrieval Augmented Generation)**: Semantic search across project knowledge
- **Ontology Store**: Entity and relationship management
- **Knowledge Ingestion**: Automatic extraction from code, docs, workflows, and databases
- **Persistent Memory**: All knowledge persisted to disk, never lost

### 🔄 Automated Syncing
- **Bidirectional Workflow Sync**: Filesystem ↔ n8n automatic synchronization
- **Knowledge Auto-Sync**: Continuous knowledge extraction and updates
- **Database Schema Sync**: Automatic migration and schema updates

### 🎓 Continuous Learning
- **Training Data Collection**: High-quality interaction collection
- **Mistake Learning**: Learn from user corrections
- **Auto Fine-Tuning**: Automatic model fine-tuning with Ollama
- **Proactive Intelligence**: Pattern detection and predictive insights

### 🛡️ System Automation
- **Error Detection**: Automatic error monitoring and reporting
- **Health Checks**: Service health monitoring
- **Automatic Backups**: Scheduled backups of critical data (SSD-aware)
- **Database Sync**: Automatic schema and migration sync
- **SSD Auto-Detection**: Automatically detects and uses external SSDs for optimal performance

### 🔔 Notifications
- **Human-in-the-Loop**: Approval system for dangerous actions
- **Real-time Notifications**: Dashboard notifications for important events
- **Action Management**: Approve/reject proactive actions

## Quick Start

### Prerequisites
- Node.js 18+
- **All data stored locally** - No external services required!
- Ollama (optional, for local LLM - install locally: https://ollama.ai)
- n8n (optional, for workflow integration)

### Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development server**:
```bash
pnpm dev
```

### Environment Variables

**All services are optional - Scorpion runs fully locally by default!**

Key variables:
- `OLLAMA_URL`: Local Ollama service URL (default: http://localhost:11434) - Install locally: https://ollama.ai
- `OLLAMA_MODEL`: Model to use (default: llama3.2:3b)
- `SCORPION_MODEL_SOURCE`: Model source (ollama, openai, local, custom)
- `N8N_API_KEY`: Your n8n API key (optional, for workflow integration)
- `N8N_API_URL`: n8n API URL (optional, for workflow integration)

#### Storage Configuration (SSD Auto-Detection)

Scorpion automatically detects and uses external SSDs for optimal performance:

- `SCORPION_SSD_PATH`: Manual override for SSD path (e.g., `/Volumes/SSD`). If set, Scorpion will use this path instead of auto-detection.
- `SCORPION_STORAGE_AUTO_DETECT`: Enable/disable automatic SSD detection (default: `true`). Set to `false` to always use default location.

**How it works:**
1. On startup, Scorpion scans for external drives (macOS: `/Volumes/*`, Linux: `/mnt/*`, `/media/*`)
2. Benchmarks each drive to detect SSDs (read/write speed > 100 MB/s, latency < 5ms)
3. Automatically uses the fastest detected SSD for data storage
4. Creates `/Volumes/SSD/scorpion-data` directory automatically
5. Migrates existing data from default location (if any)
6. Activates performance optimizations (larger batches, higher concurrency)

**Data Location:**
- **With SSD**: `/Volumes/SSD/scorpion-data/` (or custom path)
- **Without SSD**: `apps/scorpion/data/scorpion/` (default)

**Note**: Supabase and Redis are not used - all data is stored locally. With SSD detection, your data automatically moves to the fastest available storage.

## Architecture

### Core Components

- **RAG Store**: Semantic knowledge storage and retrieval
- **Ontology Store**: Entity and relationship management
- **Knowledge Orchestrator**: Coordinates knowledge ingestion
- **Training Data Collector**: Collects high-quality interactions
- **Mistake Learner**: Learns from corrections
- **Auto Fine-Tuner**: Manages model fine-tuning
- **Proactive Intelligence**: Pattern detection and predictions
- **System Automation**: Error detection, backups, health checks
- **Notification System**: Human-in-the-loop approvals

### Data Flow

1. **Knowledge Ingestion**: Project files → Knowledge Extractors → RAG Store → Ontology
2. **Chat Interactions**: User input → RAG Context → Model → Response → Training Data
3. **Mistake Learning**: User correction → Mistake Learner → Training Data → Fine-Tuning
4. **Workflow Sync**: Filesystem changes → n8n API → Knowledge Re-ingestion

## API Endpoints

### Chat
- `POST /api/chat` - Chat with Scorpion AI (rate limited: 20/min)
- `POST /api/chat/correct` - Submit correction for learning

### Project
- `GET /api/project/status` - Get project health status
- `GET /api/project/knowledge` - Get project knowledge
- `POST /api/build` - Trigger knowledge ingestion

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows/sync` - Trigger workflow sync

### Notifications
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications/read` - Mark as read
- `PUT /api/notifications/action` - Perform action (approve/reject)

### Ontology
- `GET /api/ontology` - Query ontology entities
- `POST /api/ontology` - Store entity

## Usage Examples

### Chat with RAG Context
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How do workflows sync?',
    useRAG: true,
    model: 'llama3.2:3b'
  })
});
```

### Submit Correction
```typescript
await fetch('/api/chat/correct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalInput: 'How do workflows sync?',
    wrongOutput: 'Workflows sync manually',
    correctedOutput: 'Workflows sync automatically via bidirectional sync',
    correction: 'Workflows sync automatically, not manually'
  })
});
```

### Get Project Status
```typescript
const status = await fetch('/api/project/status').then(r => r.json());
console.log(`Health: ${status.overallHealth}`);
console.log(`Workflows: ${status.workflows.synced}/${status.workflows.total}`);
```

## Development

### Project Structure
```
apps/scorpion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── (scorpion)/        # Pages
├── components/            # React components
├── lib/                   # Core libraries
│   ├── auto-sync.ts      # Workflow sync
│   ├── fine-tuning/      # Learning system
│   ├── notifications.ts  # Notification system
│   └── system-automation.ts
└── instrumentation.ts    # Startup initialization

packages/scorpion-core/
├── src/
│   ├── knowledge/        # Knowledge extraction
│   ├── rag/              # RAG store
│   ├── ontology/         # Ontology store
│   └── llm/              # Model adapter
```

### Key Files
- `instrumentation.ts`: Initializes all systems on startup
- `lib/shared-stores.ts`: Singleton store instances
- `lib/auto-sync.ts`: Bidirectional workflow sync
- `lib/fine-tuning/`: Learning and fine-tuning system

## Troubleshooting

### Systems Not Initializing
Check server logs for initialization errors. Systems are initialized independently, so failures are isolated.

### Workflows Not Syncing
1. Check `N8N_API_KEY` is set correctly
2. Verify n8n instance is accessible
3. Check `workflows/` directory exists
4. Review auto-sync logs

### Model Not Responding
1. Verify Ollama is running (if using local model)
2. Check `OLLAMA_URL` and `OLLAMA_MODEL` settings
3. Review model adapter logs for errors

### Storage Detection Issues
1. **SSD not detected**: Check that external drive is mounted and accessible
2. **Wrong storage location**: Set `SCORPION_SSD_PATH` environment variable to override
3. **Migration failed**: Check logs for permission errors, ensure SSD has enough space
4. **Performance not improved**: Verify SSD meets speed thresholds (read/write > 100 MB/s)

### Rate Limit Errors
Chat endpoint is rate limited to 20 requests/minute. Check `X-RateLimit-*` headers for limits.

## Testing

Scorpion includes comprehensive test coverage for the WebUI using Vitest (unit/integration) and Playwright (E2E).

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run E2E tests (requires dev server running)
pnpm test:e2e

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Test Structure

- **Unit Tests** (`tests/components/`): Test individual components in isolation
- **Integration Tests** (`tests/integration/`): Test component interactions and API integration
- **E2E Tests** (`tests/e2e/`): Test complete user journeys in a real browser

### Test Coverage

Current test coverage includes:
- **Components**: DataTable, Forms, Modals
- **User Journeys**: Agent creation, Settings persistence, Workflow triggers
- **Critical Actions**: Form validation, API error handling, Modal confirmations

See `tests/README.md` for detailed testing guidelines.

## Contributing

When adding new features:
1. Add initialization to `instrumentation.ts` if needed
2. Use shared stores from `lib/shared-stores.ts`
3. Add error boundaries for UI components
4. Include retry logic for external API calls
5. Add rate limiting for public endpoints
6. Write tests for new components and features

## Post-v1 Backlog

The following items are planned for post-v1 releases. These are larger features or improvements that require more significant development work.

### High Priority

- **Operations Page - Connect Radar to Real Agents**: Currently the radar visualization shows agent positions but needs deeper integration with real-time agent activity data
- **Agents Page - Real Activity Logs**: Replace generic system logs with agent-specific activity logs showing actual agent operations and executions
- **Knowledge Page - File Preview Implementation**: Complete the file preview functionality for various file types (PDF, images, code files, etc.)
- **Operations - Wire Up Control Panel Buttons**: Connect all control panel buttons to actual backend operations with proper feedback

### Medium Priority

- **Council - Dynamic Real-time Deliberations**: Enhance the council page with more dynamic real-time updates and better visualization of deliberation process
- **Notifications - Connect to Manager**: Improve notification system integration with the notification manager for better real-time updates
- **Chat WebSocket - Verify Connection State**: Add proper WebSocket connection state verification to prevent false "connected" indicators

## License

Part of the n8n-cursor workspace.

