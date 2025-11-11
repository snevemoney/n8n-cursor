# Local-Only Setup Guide

Scorpion is designed to run **100% locally** with no external dependencies. All data is stored on your local filesystem, with automatic SSD detection for optimal performance.

## ✅ What Runs Locally

### Data Storage (SSD-Aware)
Scorpion automatically detects and uses external SSDs when available. Data locations:

**With SSD detected:**
- **RAG Store**: `/Volumes/SSD/scorpion-data/rag-store.json`
- **Ontology Store**: `/Volumes/SSD/scorpion-data/ontology-store.json`
- **Training Data**: `/Volumes/SSD/scorpion-data/training-data.json`
- **Mistakes Log**: `/Volumes/SSD/scorpion-data/mistakes.json`
- **Agent Operations**: `/Volumes/SSD/scorpion-data/operations.json`

**Without SSD (default):**
- **RAG Store**: `apps/scorpion/data/scorpion/rag-store.json`
- **Ontology Store**: `apps/scorpion/data/scorpion/ontology-store.json`
- **Training Data**: `apps/scorpion/data/scorpion/training-data.json`
- **Mistakes Log**: `apps/scorpion/data/scorpion/mistakes.json`
- **Agent Operations**: `apps/scorpion/data/scorpion/operations.json`

**Other:**
- **Conversations**: Client-side localStorage + server-side files
- **Cache**: In-memory (no Redis needed)

### Services
- **Ollama**: Local LLM service (install: https://ollama.ai)
  - Runs on `http://localhost:11434`
  - Completely local - no external API calls
  - Optional but recommended for LLM features

- **n8n**: Optional workflow integration
  - Can be self-hosted locally
  - Not required for core Scorpion functionality

## ❌ What We DON'T Use

### Supabase
- **Not used** - All data stored locally
- Environment variables exist but are ignored
- No database connection needed

### Redis
- **Not used** - In-memory cache is sufficient
- Environment variable exists but falls back to in-memory EventEmitter
- No Redis server needed

## Quick Start (Local Only)

1. **Install dependencies**:
```bash
pnpm install
```

2. **Start development server**:
```bash
pnpm dev
```

That's it! No external services needed.

## Optional: Install Ollama (for LLM features)

If you want to use local LLM features:

1. **Install Ollama**: https://ollama.ai
2. **Pull a model**:
```bash
ollama pull llama3.2:3b-instruct-q4_K_M
```
3. **Start Ollama** (usually auto-starts):
```bash
ollama serve
```

Scorpion will automatically detect and use Ollama if it's running.

## Data Location

Scorpion automatically detects and uses the best available storage:

### With External SSD (Auto-Detected)
If an external SSD is detected, data is stored at:
```
/Volumes/SSD/scorpion-data/
├── rag-store.json          # Knowledge base
├── ontology-store.json     # Entity relationships
├── training-data.json      # Training examples
├── mistakes.json          # Learned mistakes
└── operations.json        # Agent operations history
```

**Benefits:**
- 🚀 Faster I/O operations
- ⚡ Optimized performance settings (larger batches, higher concurrency)
- 📦 Better for large knowledge bases and media processing

### Without SSD (Default)
If no SSD is detected, data is stored at:
```
apps/scorpion/data/scorpion/
├── rag-store.json          # Knowledge base
├── ontology-store.json     # Entity relationships
├── training-data.json      # Training examples
├── mistakes.json          # Learned mistakes
└── operations.json        # Agent operations history
```

### Manual Override
Set `SCORPION_SSD_PATH` environment variable to use a custom path:
```bash
export SCORPION_SSD_PATH=/custom/path/to/ssd
```

## Backup

To backup all your local data:
```bash
pnpm backup
```

This creates a timestamped backup in `backups/scorpion/`. The backup script automatically detects whether you're using SSD or default storage.

**Backup Features:**
- ✅ Automatically detects SSD location
- ✅ Backs up from correct data directory
- ✅ Creates compressed archives
- ✅ Keeps last 7 days of backups
- ✅ Safe restore (creates backup before restoring)

## Migration from External Services

If you were using Supabase or Redis before:

1. **No migration needed** - Scorpion never actually used them
2. **Remove environment variables** - They're now optional
3. **All data already local** - Nothing to migrate

## Troubleshooting

### "Ollama not reachable" warning
- This is normal if you haven't installed Ollama
- Install: https://ollama.ai
- Or ignore the warning - Scorpion works without it

### "Supabase not configured" warning
- This warning can be ignored - Supabase is not used
- All data is stored locally

### "Redis not configured" warning
- This warning can be ignored - Redis is not used
- In-memory cache is used instead

## Performance

Local-only setup is actually **faster** than external services:
- No network latency
- No API rate limits
- Instant data access
- Full control over your data

## Privacy

With local-only setup:
- ✅ All data stays on your machine
- ✅ No external API calls (except optional Ollama)
- ✅ No cloud services
- ✅ Complete privacy

