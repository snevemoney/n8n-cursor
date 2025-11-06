# ⚡ LightningFlow AI

**Product App** - Sovereign financial operating system built on Bitcoin Lightning Network with AI-powered automation.

## 🎯 Purpose

LightningFlow AI enables freelancers, creators, and small businesses to:
- 🏦 Launch sovereign AI-enhanced business nodes
- ⚡ Accept Bitcoin payments instantly via Lightning Network
- 🤖 Automate operations with cryptographically-signed AI agents
- 📊 View real-time dashboards for finances, clients, and performance

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **Backend**: Node.js with BullMQ workers
- **Database**: Supabase with Row Level Security (RLS)
- **Queue**: Redis + BullMQ for background jobs
- **Payments**: LNbits + LND/Core Lightning for Lightning Network
- **AI**: OpenAI API proxy with usage tracking

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your actual keys

# Start development server
pnpm dev
```

## 📁 Structure

```
apps/lightningflow/
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   ├── agents/             # AI agents (SentiBit, BitBalance, etc.)
│   ├── services/           # External service clients
│   ├── workflows/          # n8n workflow definitions
│   ├── lib/                # Local utilities
│   └── tests/              # Test files
├── .env.example            # Environment template
└── README.md               # This file
```

## 🔐 Environment Variables

Required environment variables (see `.env.example`):
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `LIGHTNING_NETWORK` - Network (testnet/mainnet)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test -- --grep "test name"

# Run with coverage
pnpm test -- --coverage
```

## 🚀 Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📚 API Endpoints

- `POST /api/payments/create` - Create Lightning invoice
- `POST /api/ai/execute` - Queue AI job
- `GET /api/payments/lnurl/callback` - LNURL callback

## 🔗 Dependencies

- **Shared packages**: `@shared/types`, `@shared/helpers`
- **External**: Supabase, OpenAI, LNbits, Redis, BullMQ
- **Framework**: Next.js 15, React 19, TypeScript

## 🚫 Boundaries

**DO NOT** import from:
- `apps/n8n-cursor/*` (dev tools)
- Any other app directories

**ONLY** import from:
- `packages/shared-*` (shared utilities)
- Same app directory (`./`, `../`)

## 📊 Health Checks

- **Web UI**: `http://localhost:3000/health`
- **API**: `http://localhost:3000/api/health`
- **Database**: Supabase connection test
- **Redis**: Queue health check 