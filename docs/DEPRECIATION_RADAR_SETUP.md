# LightningFlow AI - Depreciation Radar Setup Guide

Complete setup guide for the Depreciation Radar monitoring system that prevents workflow promotion when systems are going stale.

## 🎯 What This Gives You

- **Real-time monitoring** of stale workflows, credential issues, dead letters, and data bloat
- **CI/CD gates** that block promotion if depreciation thresholds are exceeded
- **MCP tools** for quick health checks from within Cursor IDE
- **Grafana dashboard** with visual depreciation tracking
- **Slack alerts** for critical issues
- **Automated cleanup** suggestions

## 📋 Prerequisites

- Supabase/Postgres database with your LightningFlow AI data
- n8n instance running in Queue Mode
- Grafana instance (optional, for visual monitoring)
- Slack webhook for alerts

## 🚀 Quick Start (5 minutes)

### 1. Install SQL Views

```bash
# Connect to your Supabase/Postgres and run:
psql $DATABASE_URL -f sql/depreciation.sql
```

### 2. Import Radar Collector Workflow

```bash
# In n8n, import the workflow:
# File: n8n/W_RADAR_COLLECT.json
# Set credential: Supabase Service
# Schedule: Daily at midnight
```

### 3. Add MCP Tools to Cursor

```bash
# Update .cursor/mcp.json with radar-audit server
# Restart Cursor to see new tools
```

### 4. Test the System

```bash
# Run a quick audit:
npm run radar:audit -- --env local

# Or use MCP tools in Cursor:
# radar_audit_now {env: "local"}
```

## 🔧 Detailed Setup

### Database Schema

The system creates these views:

- `v_stale_workflows` - Workflows not executed in 14+ days
- `v_credential_issues` - Duplicate creds, unused creds, old creds
- `v_deadletters_backlog` - Failed executions by environment
- `v_jobs_bloat` - Old job data (>30 days)
- `v_invoices_stale` - Unpaid/expired Lightning invoices
- `v_memory_bloat` - Old agent memory entries (>90 days)
- `v_depreciation_score` - Overall health score (0-100)

### n8n Workflow

The `W_RADAR_COLLECT` workflow:

1. **Triggers daily** via cron
2. **Queries all views** in parallel
3. **Calculates depreciation score**
4. **Stores snapshot** in `radar_snapshots` table
5. **Sends Slack alert** with severity-based formatting

### MCP Tools

Available in Cursor:

- `radar_audit_now` - Full health check
- `radar_list_deadletters` - List failed executions
- `radar_credential_health` - Credential issues
- `radar_workflow_health` - Stale workflows

### CI/CD Integration

The GitHub Actions workflow:

1. **Preflight checks** - Structure, ports, secrets
2. **Depreciation audit** - Blocks if score > threshold
3. **Credential sync** - Ensures target has required creds
4. **Workflow promotion** - Imports to target environment
5. **Smoke tests** - Validates post-promotion
6. **Slack notification** - Success/failure alerts

## 📊 Monitoring & Alerts

### Depreciation Score Thresholds

| Environment | Max Score | Max Dead Letters | Notes |
|-------------|-----------|------------------|-------|
| Local       | 100       | 100              | Development only |
| Integration | 75        | 75               | Pre-testing |
| Testing     | 50        | 50               | Pre-staging |
| Staging     | 25        | 25               | Pre-production |
| Production  | 10        | 10               | Live system |

### Slack Alert Format

```
🚨 Depreciation Radar - PROD
Score: 45/100 (critical)

Stale Workflows: 2
Credential Issues: 1
Dead Letters: 15
Old Jobs: 150
Stale Invoices: 0
Memory Bloat: 25

Collected at 2025-08-24T20:00:00.000Z
```

### Grafana Dashboard

Import `grafana/depreciation-radar-dashboard.json` to see:

- Depreciation score overview
- Stale workflows table
- Credential issues breakdown
- Dead letters by environment
- Jobs & results bloat
- Stale invoices count
- Memory bloat tracking
- 30-day trend analysis
- Tenant throttling issues

## 🛠️ Configuration

### Environment Variables

```bash
# Required for radar system
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=sbp_...

# Optional for Slack alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# For MCP tools
RADAR_ENABLED=1
```

### Credential Names

Ensure these exist in n8n (names must match exactly):

- `Supabase Service` - For database queries
- `Slack Bot` - For alerts (optional)

### Thresholds

Customize thresholds in `scripts/audit-depreciation.mjs`:

```javascript
// Environment-specific thresholds
const maxScore = isProd ? 25 : 50;
const maxDeadLetters = isProd ? 25 : 50;
```

## 🔍 Usage Examples

### Daily Health Check

```bash
# Run manually
npm run radar:audit -- --env staging

# Check specific metrics
curl -X POST $SUPABASE_URL/rest/v1/rpc/exec_sql \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -d '{"sql": "SELECT * FROM v_depreciation_score"}'
```

### MCP Tools in Cursor

```javascript
// Quick health check
radar_audit_now({env: "staging"})

// List recent failures
radar_list_deadletters({limit: 10, env: "prod"})

// Check credential health
radar_credential_health()

// Workflow health
radar_workflow_health()
```

### CI/CD Manual Trigger

```bash
# GitHub Actions → Workflows → LightningFlow AI CI/CD Pipeline
# Click "Run workflow" → Select environment → Run
```

## 🚨 Troubleshooting

### Common Issues

1. **"Missing env vars"**
   - Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
   - Check credential names match exactly

2. **"Supabase query failed"**
   - Verify database connection
   - Check RPC permissions for `exec_sql`
   - Ensure views exist in database

3. **"Radar collection failed"**
   - Check n8n workflow execution logs
   - Verify Supabase Service credential in n8n
   - Check Slack webhook URL if alerts fail

4. **"Depreciation score too high"**
   - Review stale workflows and disable unused ones
   - Clean up old jobs and dead letters
   - Rotate old credentials
   - Check for stuck Lightning invoices

### Debug Mode

```bash
# Enable debug logging
DEBUG=radar:* npm run radar:audit -- --env local

# Check database views directly
psql $DATABASE_URL -c "SELECT * FROM v_stale_workflows;"
```

## 🔄 Maintenance

### Daily Tasks

- Review Slack alerts
- Check Grafana dashboard
- Address any critical issues

### Weekly Tasks

- Review dead letters and replay/cleanup
- Check credential health
- Review stale workflows

### Monthly Tasks

- Archive old radar snapshots (>90 days)
- Review and adjust thresholds
- Update documentation

### Quarterly Tasks

- Full depreciation audit
- Cleanup old data
- Review monitoring effectiveness

## 📈 Scaling

### High-Volume Systems

- Increase collection frequency (hourly vs daily)
- Add more granular thresholds
- Implement auto-remediation for common issues

### Multi-Environment

- Use environment-specific thresholds
- Separate Slack channels per environment
- Customize cleanup policies per environment

### Team Collaboration

- Add approval workflows for production
- Implement role-based access to radar data
- Create runbooks for common issues

## 🎉 Success Metrics

- **Zero production failures** due to stale systems
- **<5 minute** time to detect issues
- **<1 hour** time to resolve critical issues
- **>95%** workflow promotion success rate

## 📚 Related Documentation

- [LightningFlow AI Setup Guide](../setup/complete-setup-guide.md)
- [n8n Workflow Management](../workflows/workflow-overview.md)
- [CI/CD Pipeline Guide](../workflows/master-orchestration-guide.md)
- [MCP Tools Reference](../setup/cursor-mcp-credential-guide.md)

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
