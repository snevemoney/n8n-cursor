# n8n-cursor Backend

**Workflow(0) Thin Slice Implementation** - Backend API with n8n integration and BullMQ queue processing.

## 🎯 Purpose

This backend implements the core workflow(0) thin slice with:
- **Express API** for workflow execution and status tracking
- **BullMQ + Redis** for job queue processing
- **n8n Integration** for auxiliary workflow orchestration
- **HMAC Signature Verification** for secure webhook communication

## 🏗️ Architecture

```
Frontend → API (Express) → BullMQ Queue → Worker → n8n Webhooks
                ↓
            Redis (Status)
```

### Core Components

1. **API Server** (`src/index.ts`)
   - Workflow execution endpoint: `POST /api/workflows/0/run`
   - Status tracking endpoint: `GET /api/workflows/0/status/:id`
   - Auxiliary webhook endpoint: `POST /api/aux/*`

2. **Queue Worker** (`src/workers/workflow-worker.ts`)
   - Processes workflow jobs from BullMQ
   - Handles 5 workflow types: ai-saas, research, content, support, analytics
   - Triggers n8n auxiliary workflows via webhooks

3. **Redis Storage**
   - Job queue management
   - Workflow status tracking
   - Auxiliary action logging

## 🚀 Quick Start

```bash
# Install dependencies
cd apps/n8n-cursor/backend
npm install

# Set up environment
cp env.example .env
# Edit .env with your configuration

# Start Redis (required)
redis-server

# Start the API server
npm run dev

# In another terminal, start the worker
npm run worker
```

## 📡 API Endpoints

### Execute Workflow
```bash
POST /api/workflows/0/run
Content-Type: application/json

{
  "service": "ai-saas",
  "sub_service": "lead-generation",
  "user_id": "user123",
  "priority": "normal",
  "service_tier": "pro",
  "features": ["automation", "analytics"],
  "model": "gpt-4",
  "temperature": 0.7,
  "max_tokens": 2000,
  "data": {
    "custom_field": "value"
  }
}
```

### Check Status
```bash
GET /api/workflows/0/status/wf0_1234567890_abcdef123456
```

### Health Check
```bash
GET /health
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password | - |
| `PORT` | API server port | `3001` |
| `N8N_URL` | n8n instance URL | `http://localhost:5678` |
| `N8N_API_KEY` | n8n API key | - |
| `N8N_WEBHOOK_SECRET` | Webhook signature secret | - |

### n8n Integration

The backend sends webhooks to n8n for auxiliary processing:

- **Notifications**: `POST /webhook/aux-notify`
- **Analytics**: `POST /webhook/aux-analytics`  
- **CRM Updates**: `POST /webhook/aux-crm`

All webhooks include HMAC signatures for security.

## 🔄 Workflow Types

### 1. AI SaaS (`ai-saas`)
- Generates AI-powered SaaS solutions
- Provides feature recommendations
- Estimates business value

### 2. Research (`research`)
- Conducts market research
- Analyzes competitive landscape
- Provides strategic insights

### 3. Content (`content`)
- Generates content for multiple platforms
- Optimizes for SEO
- Schedules distribution

### 4. Support (`support`)
- Processes support requests
- Generates AI responses
- Manages escalation

### 5. Analytics (`analytics`)
- Analyzes performance metrics
- Provides insights and recommendations
- Tracks system health

## 🛡️ Security

- **HMAC Signature Verification** for all n8n webhooks
- **Request Validation** using Zod schemas
- **Rate Limiting** and CORS protection
- **Helmet** security headers

## 📊 Monitoring

- **Health Check** endpoint for uptime monitoring
- **Redis Connection** status tracking
- **Job Processing** metrics and error handling
- **Auxiliary Workflow** success/failure tracking

## 🧪 Testing

```bash
# Test workflow execution
curl -X POST http://localhost:3001/api/workflows/0/run \
  -H "Content-Type: application/json" \
  -d '{"service": "ai-saas", "features": ["automation"]}'

# Check status
curl http://localhost:3001/api/workflows/0/status/{workflowRunId}

# Health check
curl http://localhost:3001/health
```

## 🔧 Development

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run worker process
npm run worker
```

## 📝 Notes

- **Queue Processing**: Up to 5 concurrent jobs
- **Job Retention**: 100 completed, 50 failed jobs
- **Retry Logic**: 3 attempts with exponential backoff
- **Auxiliary Workflows**: Non-blocking, don't fail main workflow
- **Status Tracking**: Real-time progress updates in Redis
