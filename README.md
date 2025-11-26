# 🦂 Scorpion OS

**Central Operations Orchestrator** - Your personal AI stack dashboard for managing operations, workflows, and side hustles.

> **Note**: This workspace contains Scorpion (central orchestrator), LightningFlow (side hustle), and supporting development tools.

## 🚀 Quick Start

### Local Development (macOS)

```bash
# One-command setup
./scripts/setup-all.sh

# Access your services
open http://lightningflow.local
open http://app.lightningflow.local
open http://n8n.local
```

### Production Deployment (VPS)

```bash
# Upload to VPS and run
./scripts/setup-all.sh

# Fix 502 issues
./scripts/fix-502.sh

# Health check
./scripts/health-check.sh
```

## 🏗️ Architecture

### Central System
- **🦂 Scorpion** (`scorpion.local` / port 3003) - Main operations console and orchestrator
  - Operations monitoring
  - Workflow builder
  - Knowledge base
  - Multi-agent council
  - Agent management
  - Chat interface

### Side Hustles
- **💰 LightningFlow** - Lightning Network SaaS platform
  - **Landing** (`lightningflow.local` / port 3000) - Public marketing site
  - **Web** (`app.lightningflow.local` / port 3001) - Customer dashboard  
  - **Ops** (`ops.lightningflow.local` / port 3002) - Internal admin panel

### Supporting Tools
- **🔧 Lovable Frontend** - n8n workflows testing dashboard
- **🔧 n8n-cursor** - n8n development tools and scripts

### Services
- **API** - Express.js backend with BullMQ workers
- **n8n** - Workflow automation engine
- **Redis** - Job queue and caching
- **Caddy** - Reverse proxy and SSL termination

## 🛠️ Development

### Local Development Stack
```bash
# Start all services
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Check health
./scripts/health-check.sh

# View logs
docker compose -f infra/docker/docker-compose.dev.yml logs -f
```

### Environment Variables
```bash
# Copy template
cp env.dev.example .env.dev

# Edit with your values
nano .env.dev
```

Required values:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE` - Your Supabase service role key
- `LNBITS_API_KEY` - Your LNbits dev wallet key

## 🚀 Production

### VPS Deployment
```bash
# Deploy production stack
docker compose -f infra/docker/docker-compose.prod.yml up -d

# Configure Caddy
sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
sudo systemctl reload caddy

# Health check
./scripts/smoke.sh
```

### Blue/Green Deployment
```bash
# Deploy to GREEN
./scripts/flip_green.sh

# Rollback to BLUE
./scripts/flip_blue.sh
```

## 🔧 Troubleshooting

### 502 Bad Gateway
```bash
# Diagnose the issue
./scripts/diagnose-502.sh

# Auto-fix common issues
./scripts/fix-502.sh
```

### Common Issues
1. **Services not running** - Check `docker ps`
2. **Caddy misconfigured** - Check `/etc/caddy/Caddyfile`
3. **Port conflicts** - Check `ss -Hlnpt | grep -E ':80|:443|:3000|:3001|:3002|:4000|:5678'`
4. **Cloudflare SSL mode** - Set to "Full (strict)"

## 📁 Project Structure

```
n8n-cursor/
├── apps/
│   ├── landing/          # Public marketing site
│   ├── lightningflow/web/ # Customer dashboard
│   ├── ops/              # Internal admin panel
│   └── n8n-cursor/backend/ # API and workers
├── infra/
│   ├── docker/           # Docker Compose files
│   └── caddy/            # Caddy configurations
├── scripts/              # Deployment and utility scripts
└── packages/             # Shared packages
```

## 🔒 Security Features

- **Idempotency** - All POST requests are idempotent
- **Rate Limiting** - Per-IP and per-tenant limits
- **HMAC Signatures** - Webhook validation
- **RLS Policies** - Row-level security in Supabase
- **Security Headers** - CSP, HSTS, XSS protection
- **Secrets Management** - Environment-based configuration

## 📊 Monitoring

### Health Endpoints
- `http://lightningflow.local/healthz`
- `http://api.lightningflow.local/healthz`
- `http://n8n.local/healthz`

### Logs
- **Dozzle**: `http://logs.local`
- **Caddy**: `sudo journalctl -u caddy -f`
- **Docker**: `docker compose logs -f`

## 🚀 CI/CD

### GitHub Actions
- **Guards** - Prevent env file changes, enforce API contracts
- **Deploy** - Blue/green deployment with health gates
- **Security** - Trivy vulnerability scanning

### Deployment Flow
1. **Integration** - Auto-deploy on `int` branch
2. **Staging** - Manual deploy on `staging` branch  
3. **Production** - Blue/green deploy on `main` branch

## 📚 Documentation

- [Setup Instructions](SETUP_INSTRUCTIONS.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourorg/n8n-cursor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/n8n-cursor/discussions)
- **Documentation**: [Wiki](https://github.com/yourorg/n8n-cursor/wiki)

---

**Built with ❤️ for the Lightning Network community**