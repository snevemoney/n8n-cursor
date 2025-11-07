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
- **Automatic Backups**: Scheduled backups of critical data
- **Database Sync**: Automatic schema and migration sync

### 🔔 Notifications
- **Human-in-the-Loop**: Approval system for dangerous actions
- **Real-time Notifications**: Dashboard notifications for important events
- **Action Management**: Approve/reject proactive actions

## Quick Start

### Prerequisites
- Node.js 18+
- n8n instance (self-hosted or cloud)
- Ollama (optional, for local models)
- PostgreSQL (optional, for database features)

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

See `.env.example` for all configuration options. Key variables:

- `N8N_API_KEY`: Your n8n API key
- `N8N_BASE_URL`: n8n instance URL
- `OLLAMA_URL`: Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL`: Model to use (default: llama3.2:3b)
- `SCORPION_MODEL_SOURCE`: Model source (ollama, openai, local, custom)

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

### Rate Limit Errors
Chat endpoint is rate limited to 20 requests/minute. Check `X-RateLimit-*` headers for limits.

## Contributing

When adding new features:
1. Add initialization to `instrumentation.ts` if needed
2. Use shared stores from `lib/shared-stores.ts`
3. Add error boundaries for UI components
4. Include retry logic for external API calls
5. Add rate limiting for public endpoints

## License

Part of the n8n-cursor workspace.

