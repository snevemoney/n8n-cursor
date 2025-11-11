# 🦂 Scorpion WebUI v1 Release Checklist

## ✅ What's Done and Stable

### Core Features
- ✅ **Navigation**: Complete sidebar navigation with mobile responsiveness
- ✅ **Home Page**: System stats and quick access links
- ✅ **Dashboard**: System health monitoring with auto-refresh
- ✅ **Project Page**: Project status, knowledge ingestion, expandable sections
- ✅ **Workflows Page**: Workflow list, filtering, and viewer
- ✅ **Operations Page**: Operations monitoring, agent radar, control panel
- ✅ **Knowledge Page**: Knowledge base with filtering and preview
- ✅ **Build Page**: Build plan generation with feature management
- ✅ **Agents Page**: Agent roster with activity feed
- ✅ **Chat Page**: Full Chat-AGI interface with streaming, tools, and panels
- ✅ **Council Page**: Multi-agent deliberation interface
- ✅ **LLM Pages**: Experiment tracking, model comparison, prompt management
- ✅ **Research Page**: Research interface with screenshot gallery
- ✅ **Settings Page**: Settings persistence and storage status
- ✅ **Notifications Page**: Notification list and approval system
- ✅ **Logs Page**: System logs with filtering
- ✅ **Observability Page**: Telemetry and monitoring dashboards

### UI/UX Improvements
- ✅ Replaced `alert()` calls with toast notifications
- ✅ Added aria-labels and tooltips to buttons
- ✅ Improved error messages with better context
- ✅ Added loading states throughout
- ✅ Improved confirmation dialogs (double-click for destructive actions)
- ✅ Mobile responsive design
- ✅ Consistent design system usage

### Code Quality
- ✅ No console errors in production code
- ✅ Proper error handling with user-friendly messages
- ✅ TypeScript type safety
- ✅ Consistent component patterns

## ⚠️ Known Issues / Limitations

### Functional Limitations
1. **Knowledge File Preview**: File preview functionality is partially implemented - basic text preview works, but full file rendering (PDF, images, etc.) needs completion
2. **Operations Radar**: Radar visualization shows agent positions but could have deeper real-time integration
3. **Agent Activity Logs**: Currently shows generic system logs - agent-specific activity logs would be more useful
4. **Control Panel Actions**: Some control panel buttons may need additional backend integration
5. **Chat WebSocket**: Connection state verification could be improved to prevent false "connected" indicators

### UI/UX Limitations
1. **Empty States**: Some pages could benefit from more informative empty states
2. **Loading States**: A few pages may show brief loading flashes - could be optimized
3. **Error Recovery**: Some error states could have better recovery options
4. **Mobile Experience**: Some complex pages (like Operations) may be challenging on very small screens

### Performance
1. **Large Knowledge Bases**: Knowledge page may be slow with very large knowledge bases (>1000 items)
2. **Real-time Updates**: Some pages poll frequently - could be optimized with WebSockets
3. **Initial Load**: First page load may take a moment while systems initialize

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Optional: Ollama for local LLM (https://ollama.ai)
- Optional: n8n instance for workflow integration

### Setup Steps

1. **Install dependencies**:
```bash
cd apps/scorpion
pnpm install
```

2. **Configure environment** (optional):
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development server**:
```bash
pnpm dev
```

4. **Access the application**:
- Open http://localhost:3003 in your browser
- The app will be available at `scorpion.local` if you have local DNS configured

### Environment Variables

All services are optional - Scorpion runs fully locally by default!

Key variables:
- `OLLAMA_URL`: Local Ollama service URL (default: http://localhost:11434)
- `OLLAMA_MODEL`: Model to use (default: llama3.2:3b)
- `SCORPION_MODEL_SOURCE`: Model source (ollama, openai, local, custom)
- `N8N_API_KEY`: Your n8n API key (optional)
- `N8N_API_URL`: n8n API URL (optional)

## 🧪 How to Run Tests

### E2E Tests

Run Playwright E2E tests:
```bash
cd apps/scorpion
pnpm run audit:test
```

### Comprehensive Audit

Run full UI audit (crawl + tests + lighthouse):
```bash
cd apps/scorpion
pnpm run audit:all
```

### Individual Audit Steps

```bash
# Just crawl and capture errors
pnpm run audit:crawl

# Just run Playwright tests
pnpm run audit:test

# Just run Lighthouse performance audits
pnpm run audit:lighthouse
```

### Type Checking

```bash
pnpm run typecheck
```

### Linting

```bash
pnpm run lint
```

## 📦 Deployment Instructions

### Production Build

1. **Build the application**:
```bash
cd apps/scorpion
pnpm build
```

2. **Start production server**:
```bash
pnpm start
```

### Docker Deployment

1. **Build Docker image**:
```bash
docker build -t scorpion:latest .
```

2. **Run container**:
```bash
docker run -p 3003:3003 \
  -e OLLAMA_URL=http://host.docker.internal:11434 \
  -v $(pwd)/data:/app/data \
  scorpion:latest
```

### Health Check

The application exposes a health check endpoint:
- **Endpoint**: `/healthz`
- **Method**: GET
- **Response**: 200 OK if healthy

Check health:
```bash
curl http://localhost:3003/healthz
```

### API Health Check

More detailed health information:
- **Endpoint**: `/api/health`
- **Method**: GET
- **Response**: JSON with system status

```bash
curl http://localhost:3003/api/health
```

## 📊 Monitoring

### Health Endpoints
- `/healthz` - Simple health check (200 OK)
- `/api/health` - Detailed system health status

### Logs
- Application logs: Check server console output
- System logs: Available in `/logs` page
- Error logs: Check browser console and server logs

### Metrics
- System metrics: Available in `/dashboard` page
- Operation metrics: Available in `/ops` page
- Agent metrics: Available in `/agents` page

## 🔧 Troubleshooting

### Common Issues

1. **Port 3003 already in use**:
   - Change port in `package.json` scripts or use `PORT` environment variable

2. **Ollama connection errors**:
   - Verify Ollama is running: `curl http://localhost:11434/api/tags`
   - Check `OLLAMA_URL` environment variable

3. **n8n integration not working**:
   - Verify `N8N_API_KEY` and `N8N_API_URL` are set correctly
   - Check n8n instance is accessible

4. **Knowledge ingestion slow**:
   - This is normal for large projects
   - Check `/api/project/knowledge` endpoint for progress

5. **Storage detection issues**:
   - Check external drive is mounted
   - Verify permissions on storage path
   - See README.md for storage configuration details

## 📝 Release Notes Template

When releasing v1, include:
- Summary of features
- Breaking changes (if any)
- Migration guide (if needed)
- Known issues
- Upgrade instructions

## ✅ Pre-Release Checklist

Before tagging v1:
- [ ] All tests passing
- [ ] No console errors
- [ ] All pages load correctly
- [ ] Mobile responsive verified
- [ ] Health endpoints working
- [ ] Documentation updated
- [ ] Release notes prepared
- [ ] Post-v1 backlog documented

