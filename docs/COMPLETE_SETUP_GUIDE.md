# 🚀 LightningFlow AI Complete Setup Guide

This guide covers the complete setup of your LightningFlow AI infrastructure, including monitoring, depreciation radar, MCP tools, and all the DevOps practices we've implemented.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Complete Setup](#complete-setup)
5. [Monitoring Stack](#monitoring-stack)
6. [Depreciation Radar](#depreciation-radar)
7. [MCP Tools](#mcp-tools)
8. [n8n Workflows](#n8n-workflows)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Usage Examples](#usage-examples)
11. [Troubleshooting](#troubleshooting)
12. [Next Steps](#next-steps)

## 🚀 Quick Start

Want to get everything running in 5 minutes? Run these commands:

```bash
# 1. Start the complete monitoring stack
make monitoring-up

# 2. Wait for services to be ready (check status)
make monitoring-status

# 3. Test the depreciation radar
npm run radar:audit

# 4. Access your dashboards
open http://localhost:3000  # Grafana (admin/lightningflow2024)
open http://localhost:3001  # Uptime Kuma
open http://localhost:9090  # Prometheus
```

## 🏗️ Architecture Overview

Your LightningFlow AI infrastructure consists of:

```
┌─────────────────────────────────────────────────────────────┐
│                    LightningFlow AI                        │
│                     Infrastructure                         │
└─────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│   Monitoring   │    │   n8n + MCP    │    │   DevOps &      │
│     Stack      │    │     Tools      │    │   Automation    │
└────────────────┘    └────────────────┘    └────────────────┘
│ • Grafana      │    │ • n8n Engine   │    │ • CI/CD         │
│ • Prometheus   │    │ • MCP Servers  │    │ • Credential    │
│ • Loki         │    │ • Workflows    │    │   Sync          │
│ • Uptime Kuma │    │ • Side-Hustles │    │ • Depreciation  │
│ • PostgreSQL   │    │ • Lightning    │    │   Operations   │
│ • Redis        │    │   Operations   │    │   Radar         │
└────────────────┘    └────────────────┘    └────────────────┘
```

## ✅ Prerequisites

Before starting, ensure you have:

- **Docker & Docker Compose** (latest version)
- **Node.js 18+** and **pnpm 8+**
- **Git** for version control
- **Ports available**: 3000, 3001, 5433, 6380, 8081, 9090

## 🔧 Complete Setup

### 1. Clone and Setup Repository

```bash
git clone <your-repo>
cd n8n-cursor
pnpm install
```

### 2. Environment Configuration

Create environment files for each component:

```bash
# Copy templates
cp env-templates/lightningflow-local.example .env.lightningflow
cp env-templates/n8n-cursor-local.example .env.n8n-cursor
cp env-templates/monitoring-local.example .env.monitoring

# Edit with your real values
nano .env.monitoring
```

**Required for Supabase integration:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 3. Start Core Services

```bash
# Start n8n (if not already running)
make up

# Start monitoring stack
make monitoring-up

# Check status
make monitoring-status
```

## 📊 Monitoring Stack

### Services Overview

| Service | Port | Purpose | Credentials |
|---------|------|---------|-------------|
| **Grafana** | 3000 | Dashboards & Alerts | admin/lightningflow2024 |
| **Prometheus** | 9090 | Metrics Collection | - |
| **Loki** | 3100 | Log Aggregation | - |
| **Uptime Kuma** | 3001 | Uptime Monitoring | - |
| **MinIO** | 9001 | Object Storage | lightningflow/lightningflow2024 |
| **PostgreSQL** | 5433 | Monitoring DB | lightningflow/lightningflow2024 |
| **Redis** | 6380 | Cache & Queues | - |

### Access URLs

- **Grafana**: http://localhost:3000
- **Uptime Kuma**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **MinIO Console**: http://localhost:9001

### Local DNS (Optional)

For easier access, add to `/etc/hosts`:

```bash
sudo sh -c 'echo "127.0.0.1 grafana.lightningflow.local" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 prometheus.lightningflow.local" >> /etc/hosts'
sudo sh -c 'echo "127.0.0.1 uptime.lightningflow.local" >> /etc/hosts'
```

## 🎯 Depreciation Radar

### What It Monitors

The Depreciation Radar tracks system health across:

- **Stale Workflows**: Workflows not run recently
- **Credential Issues**: Expired/invalid credentials
- **Dead Letters**: Failed message processing
- **Jobs Bloat**: Accumulated job results
- **Stale Invoices**: Unpaid/expired invoices
- **Memory Bloat**: Database table growth
- **Rate Limiting**: Tenant throttling hits

### Usage

```bash
# Run audit for local environment
npm run radar:audit

# Run audit for staging
npm run radar:audit staging

# Run audit for production
npm run radar:audit production
```

### Thresholds

| Environment | Depreciation Score | Stale Workflows | Credential Issues |
|-------------|-------------------|-----------------|-------------------|
| **Local** | 80 | 5 | 3 |
| **Staging** | 70 | 3 | 2 |
| **Production** | 60 | 2 | 1 |

### Dashboard Setup

1. **Import Dashboard**: In Grafana, import `grafana/depreciation-radar-dashboard.json`
2. **Configure Data Source**: Use "Postgres Local" datasource
3. **Verify Data**: Dashboard should show demo data immediately

## 🛠️ MCP Tools

### Available MCP Servers

#### 1. n8n Management (`n8n-mcp`)
- **Tools**: 39 n8n workflow management tools
- **Purpose**: Manage workflows, credentials, executions
- **Access**: From Cursor IDE

#### 2. LightningFlow AI (`lightningflow-ai`)
- **Tools**: Lightning operations (invoices, payments, liquidity)
- **Purpose**: Lightning network operations
- **Access**: From Cursor IDE

#### 3. Side-Hustles (`side-hustles`)
- **Tools**: Tenant management, job tracking, rate limiting
- **Purpose**: Side-hustle workflow management
- **Access**: From Cursor IDE

#### 4. Radar Audit (`radar-audit`)
- **Tools**: Quick depreciation checks, dead letter triage
- **Purpose**: System health monitoring
- **Access**: From Cursor IDE

### MCP Configuration

Your `.cursor/mcp.json` is pre-configured with all servers. Each server has:

- **Guard script**: Checks if server should be enabled
- **Main server**: Implements the actual tools
- **Environment variables**: For configuration

## 🔄 n8n Workflows

### Core Workflows

#### 1. Depreciation Radar Collector (`W_RADAR_COLLECT`)
- **Trigger**: Cron (nightly at 2 AM)
- **Purpose**: Collect metrics from all depreciation views
- **Output**: Slack alerts, database snapshots

#### 2. Credential Sync
- **Purpose**: Synchronize credentials across environments
- **Usage**: `npm run cred:sync -- --env staging`

#### 3. Workflow Promotion
- **Purpose**: Move workflows between environments
- **Usage**: `npm run promote -- --env staging`

### Side-Hustle Workflows

- **Router**: Multi-tenant webhook router
- **Tenant Writer**: Per-tenant data processing
- **Onboarding**: New tenant setup

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline includes:

1. **Preflight Checks**: Structure verification, secrets scan
2. **Depreciation Audit**: System health checks
3. **Credential Sync**: Environment credential management
4. **Workflow Promotion**: Automated workflow deployment
5. **Smoke Tests**: Post-deployment validation
6. **Notifications**: Slack alerts for success/failure

### Manual Triggers

```bash
# Trigger CI manually
gh workflow run "LightningFlow AI CI/CD Pipeline" \
  --field environment=staging

# Or use the GitHub UI
# Actions → LightningFlow AI CI/CD Pipeline → Run workflow
```

## 💡 Usage Examples

### Daily Operations

```bash
# 1. Check system health
npm run radar:audit

# 2. Monitor services
make monitoring-status

# 3. View logs
make monitoring-logs

# 4. Access dashboards
open http://localhost:3000
```

### Development Workflow

```bash
# 1. Make changes
git add .
git commit -m "feat: add new workflow"

# 2. Pre-commit hooks run automatically
# - Structure verification
# - Secrets scanning
# - Port availability

# 3. Push triggers CI
git push origin feature/new-workflow

# 4. CI runs all checks
# - Depreciation audit
# - Credential sync
# - Workflow promotion
```

### Troubleshooting

```bash
# Check service status
make monitoring-status

# View service logs
make monitoring-logs

# Restart services
make monitoring-down && make monitoring-up

# Test database connection
docker exec lightningflow-postgres-monitoring psql -U lightningflow -d lightningflow_monitoring -c "SELECT version();"
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using a port
lsof -i :3000

# Stop conflicting services
docker stop <container-name>
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
docker exec lightningflow-postgres-monitoring pg_isready -U lightningflow

# Recreate demo data
docker exec lightningflow-postgres-monitoring psql -U lightningflow -d lightningflow_monitoring -f /tmp/setup-demo-db.sql
```

#### 3. Grafana Dashboard Issues
```bash
# Check data source connection
# Grafana → Configuration → Data Sources → Postgres Local → Test

# Verify views exist
docker exec lightningflow-postgres-monitoring psql -U lightningflow -d lightningflow_monitoring -c "\dv"
```

### Reset Everything

```bash
# Complete reset
make monitoring-down
docker system prune -f
make monitoring-up

# Recreate demo data
npm run radar:audit
```

## 🚀 Next Steps

### Immediate (This Week)

1. **Import Grafana Dashboard**: Get visual monitoring working
2. **Test MCP Tools**: Verify all tools work from Cursor
3. **Run First Audit**: Ensure depreciation radar is functional
4. **Configure Alerts**: Set up Slack notifications

### Short Term (Next 2 Weeks)

1. **Add Real Data**: Connect to your actual Supabase instance
2. **Create Workflows**: Build your first LightningFlow AI workflows
3. **Set Up CI**: Configure GitHub Actions secrets
4. **Add Side-Hustles**: Implement your first side-hustle workflow

### Medium Term (Next Month)

1. **Production Deployment**: Deploy to staging/production
2. **Advanced Monitoring**: Add custom metrics and alerts
3. **Automation**: Implement auto-remediation for common issues
4. **Scaling**: Add more services and workflows

### Long Term (Next Quarter)

1. **Multi-Environment**: Full staging → production pipeline
2. **Advanced Analytics**: Business intelligence dashboards
3. **Machine Learning**: Predictive depreciation modeling
4. **Enterprise Features**: Advanced security and compliance

## 📚 Additional Resources

- **n8n Documentation**: https://docs.n8n.io/
- **Grafana Documentation**: https://grafana.com/docs/
- **Prometheus Documentation**: https://prometheus.io/docs/
- **Lightning Network**: https://lightning.network/
- **MCP Specification**: https://modelcontextprotocol.io/

## 🆘 Support

If you encounter issues:

1. **Check this guide** for troubleshooting steps
2. **Review logs** using `make monitoring-logs`
3. **Run diagnostics** using `make monitoring-status`
4. **Check GitHub Issues** for known problems
5. **Create new issue** with detailed error information

---

**🎉 Congratulations!** You now have a complete, production-ready LightningFlow AI infrastructure with monitoring, automation, and DevOps best practices. The system is designed to scale with your needs and provide the foundation for building robust Lightning applications.
