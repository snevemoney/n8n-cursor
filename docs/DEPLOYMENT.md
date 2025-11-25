# Deployment Guide

Complete guide for deploying n8n-cursor workflows to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Importing Workflows](#importing-workflows)
- [Credential Configuration](#credential-configuration)
- [Testing & Validation](#testing--validation)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Services

Before deploying these workflows, ensure you have:

#### n8n Platform
- [ ] n8n Cloud account ([n8n.io](https://n8n.io)) OR
- [ ] Self-hosted n8n instance (Docker/npm)
- [ ] n8n version: 1.0.0+ recommended

#### External Services
- [ ] OpenAI API account ([platform.openai.com](https://platform.openai.com))
- [ ] Supabase project ([supabase.com](https://supabase.com))
- [ ] Discord server with webhook access (optional)
- [ ] Twitter/X Developer account (for AI Content Empire workflow)
- [ ] Slack workspace (for notifications)
- [ ] Airtable account (for content tracking)
- [ ] Google account (for Sheets integration)

### Technical Requirements

**For n8n Cloud:**
- Browser with JavaScript enabled
- Stable internet connection

**For Self-Hosted n8n:**
- Node.js 18+ OR Docker
- 2GB+ RAM
- Linux/macOS/Windows
- PostgreSQL database (recommended for production)

---

## Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/snevemoney/n8n-cursor.git
cd n8n-cursor
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```bash
# Example configuration
N8N_API_URL=https://your-n8n-instance.app.n8n.cloud
N8N_API_KEY=n8n_api_YOUR_ACTUAL_KEY

OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY

SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdef...
```

**Security Note:** Never commit your `.env` file to version control!

### Step 3: Obtain API Keys

#### OpenAI API Key
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-` or `sk-`)
4. Set usage limits if desired

#### Supabase Keys
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy `Project URL` → `SUPABASE_URL`
4. Copy `anon/public` key → `SUPABASE_ANON_KEY`
5. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

#### Discord Webhook
1. Open Discord → Server Settings → Integrations → Webhooks
2. Click "New Webhook"
3. Configure channel and name
4. Copy webhook URL

---

## Importing Workflows

### Method 1: n8n Cloud / Web UI

1. **Access n8n interface:**
   ```
   https://your-instance.app.n8n.cloud
   ```

2. **Import workflow:**
   - Click "Workflows" in sidebar
   - Click "+ Add workflow" → "Import from file"
   - Select workflow JSON file from `workflows/` directory
   - Click "Import"

3. **Repeat for all workflows:**
   - `workflows/ai-saas-master-scaffold.json`
   - `workflows/ai-content-empire.json`
   - `workflows/ai-research-agent.json`

### Method 2: n8n API (Automated)

```bash
# Set environment variables
export N8N_API_URL="https://your-instance.app.n8n.cloud"
export N8N_API_KEY="n8n_api_YOUR_KEY"

# Import all workflows
for workflow in workflows/*.json; do
  curl -X POST "$N8N_API_URL/api/v1/workflows" \
    -H "X-N8N-API-KEY: $N8N_API_KEY" \
    -H "Content-Type: application/json" \
    -d @"$workflow"
done
```

### Method 3: Self-Hosted (File Copy)

```bash
# Copy workflows to n8n data directory
cp workflows/*.json ~/.n8n/workflows/

# Restart n8n
docker restart n8n
# OR
pm2 restart n8n
```

---

## Credential Configuration

### Setting Up Credentials in n8n

After importing workflows, configure credentials:

1. **Navigate to Credentials:**
   - Click "Credentials" in n8n sidebar
   - Click "+ Add Credential"

2. **Configure OpenAI:**
   - Type: "OpenAI"
   - Name: "OpenAI account"
   - API Key: `your-openai-key`
   - Test connection
   - Save

3. **Configure Supabase:**
   - Type: "HTTP Request" (generic)
   - Name: "Supabase API"
   - Authentication: Header Auth
   - Header: `apikey`
   - Value: `your-supabase-anon-key`
   - Save

4. **Configure OAuth Services:**

   **Twitter/X:**
   - Type: "Twitter OAuth2"
   - Follow OAuth flow
   - Grant permissions

   **Slack:**
   - Type: "Slack OAuth2"
   - Follow OAuth flow
   - Select workspace

   **Google Sheets:**
   - Type: "Google Sheets OAuth2"
   - Follow OAuth flow
   - Grant spreadsheet permissions

5. **Update Workflow Nodes:**
   - Open each imported workflow
   - Click on nodes with credential warnings (⚠️ icon)
   - Select the appropriate credential from dropdown
   - Save workflow

---

## Testing & Validation

### Pre-Deployment Checklist

Before activating workflows in production:

- [ ] All credentials configured and tested
- [ ] Placeholder values replaced (no "your-" prefixes)
- [ ] Webhook URLs unique and non-guessable
- [ ] Test data available (see `examples/test-payloads.json`)
- [ ] Error handling reviewed
- [ ] Rate limits understood for all APIs

### Test Workflows

#### 1. AI Research Agent Demo

**Manual Test:**
```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/research-agent \
  -H "Content-Type: application/json" \
  -d '{"question": "What is n8n?"}'
```

**Expected Response:**
```json
{
  "question": "What is n8n?",
  "answer": "Based on your question...",
  "timestamp": "2025-11-25T10:30:00.000Z",
  "source": "n8n-MCP Demo Agent"
}
```

#### 2. AI SaaS Master Scaffold

**Test OpenAI Integration:**
```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/ai-saas-hook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "openai",
    "prompt": "Say hello to n8n-cursor!"
  }'
```

**Test Supabase Integration:**
```bash
curl -X POST https://your-n8n-instance.app.n8n.cloud/webhook/ai-saas-hook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "supabase",
    "prompt": "Test database insert"
  }'
```

#### 3. AI Content Empire

**Trigger Manually in n8n:**
1. Open workflow in editor
2. Click "Execute Workflow" button
3. Review execution log
4. Check:
   - RSS feeds fetched successfully
   - AI analysis completed
   - Content filtered correctly
   - Airtable/Google Sheets updated

**Common Issues:**
- OAuth tokens expired → Re-authenticate
- Rate limits hit → Adjust schedule trigger interval
- API errors → Check credential permissions

---

## Production Deployment

### Deployment Strategies

#### Strategy 1: Blue-Green Deployment

1. **Green Environment (New):**
   - Import workflows to new n8n instance
   - Configure credentials
   - Test thoroughly
   - Keep inactive

2. **Blue Environment (Current):**
   - Keep existing production running

3. **Cutover:**
   - Activate workflows in Green
   - Monitor for 24 hours
   - Deactivate Blue workflows
   - Redirect traffic if needed

#### Strategy 2: Canary Deployment

1. Deploy one workflow at a time
2. Monitor for 24-48 hours
3. If stable, deploy next workflow
4. Gradual rollout reduces risk

#### Strategy 3: Direct Deployment (Small Scale)

1. Import all workflows
2. Activate during low-traffic period
3. Monitor closely for first hour

### Activation Steps

1. **Review Workflow Settings:**
   ```
   - Active: false → true
   - Execution order: v1
   - Error workflow: (optional) configure error handler
   - Timezone: Set to your region
   ```

2. **Activate Workflows:**
   - AI Research Agent Demo → Activate first (lowest risk)
   - AI SaaS Master Scaffold → Activate second
   - AI Content Empire → Activate last (highest complexity)

3. **Configure Schedules:**
   - AI Content Empire: Every 6 hours (default)
   - Adjust based on API rate limits and cost

4. **Set Up Alerts:**
   - Configure Slack notifications for errors
   - Set up email alerts in n8n settings
   - Enable workflow execution logging

### Security Hardening

**Webhook Security:**
```javascript
// Add authentication to webhook nodes
// Example: Check for secret token in headers

const authToken = $request.headers['x-auth-token'];
const expectedToken = process.env.WEBHOOK_SECRET;

if (authToken !== expectedToken) {
  return {
    statusCode: 401,
    body: { error: 'Unauthorized' }
  };
}
```

**IP Allowlisting:**
- Configure firewall rules
- Only allow traffic from trusted sources
- Use Cloudflare or similar for DDoS protection

**HTTPS Enforcement:**
- Ensure all webhook URLs use `https://`
- Enable HSTS headers
- Use TLS 1.2+

---

## Monitoring & Maintenance

### Monitoring Checklist

- [ ] Workflow execution logs reviewed daily
- [ ] Error rate < 5% (set alerts)
- [ ] API rate limits monitored (OpenAI, Twitter, etc.)
- [ ] Cost tracking enabled (OpenAI API usage)
- [ ] Uptime monitoring (UptimeRobot, Pingdom, etc.)

### n8n Built-in Monitoring

**Execution Log:**
- View: Workflows → Select workflow → Executions tab
- Check for failed executions (red icons)
- Review error messages

**Metrics to Track:**
- Executions per day
- Success rate (%)
- Average execution time
- Failed node frequency

### External Monitoring Tools

**Recommended Tools:**
- **Uptime:** UptimeRobot (free tier available)
- **Logs:** Logflare, Datadog, Sentry
- **APM:** New Relic (if self-hosted)
- **Costs:** OpenAI usage dashboard

### Maintenance Schedule

**Daily:**
- Review execution logs
- Check error notifications

**Weekly:**
- Review API usage and costs
- Test webhook endpoints
- Check for n8n updates

**Monthly:**
- Rotate API keys (security best practice)
- Review and optimize workflows
- Update dependencies (if self-hosted)
- Backup workflow definitions

### Backup Strategy

**Automated Backups:**
```bash
# Export all workflows via API
curl -X GET "$N8N_API_URL/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  > backup-$(date +%Y%m%d).json
```

**Version Control:**
```bash
# Commit workflow changes to Git
git add workflows/
git commit -m "backup: workflow updates $(date +%Y-%m-%d)"
git push
```

---

## Troubleshooting

### Common Issues

#### Issue: "Invalid credentials" error

**Symptoms:** Red error in workflow execution, "401 Unauthorized"

**Solution:**
1. Check credential configuration in n8n
2. Verify API key is correct (no extra spaces)
3. Test credential connection
4. Re-authenticate OAuth if expired

---

#### Issue: Workflow not triggering on schedule

**Symptoms:** Scheduled workflow doesn't execute

**Solution:**
1. Ensure workflow is **Active** (toggle in top-right)
2. Check timezone settings in schedule trigger
3. Review n8n execution queue (Settings → Executions)
4. Check n8n system logs for errors

---

#### Issue: OpenAI API rate limit exceeded

**Symptoms:** Error "Rate limit reached for requests"

**Solution:**
1. Reduce workflow execution frequency
2. Implement exponential backoff in error handling
3. Upgrade OpenAI plan if needed
4. Cache AI responses where possible

---

#### Issue: Webhook returns 404

**Symptoms:** Curl/HTTP requests to webhook fail

**Solution:**
1. Verify workflow is **Active**
2. Check webhook path: `/webhook/your-path`
3. Ensure n8n instance URL is correct
4. Check firewall/network settings

---

#### Issue: Personal information detected in CI

**Symptoms:** GitHub Actions security scan fails

**Solution:**
1. Review workflow JSON files
2. Replace any real emails with `user@example.com`
3. Replace UUIDs with `00000000-0000-0000-0000-000000000000`
4. Use placeholders like `your-project-id`
5. Re-run CI checks

---

### Getting Help

**Resources:**
- [n8n Documentation](https://docs.n8n.io)
- [n8n Community Forum](https://community.n8n.io)
- [GitHub Issues](https://github.com/snevemoney/n8n-cursor/issues)

**Before Asking:**
1. Check execution logs
2. Review this troubleshooting guide
3. Search community forum
4. Prepare minimal reproduction steps

---

## Production Best Practices

### Performance Optimization

1. **Use Wait Nodes** for rate limiting
2. **Batch Operations** where possible (reduce API calls)
3. **Cache Expensive Operations** (AI responses, API data)
4. **Optimize Schedule Triggers** (balance freshness vs. cost)

### Cost Management

**OpenAI Costs:**
- Use `gpt-4o-mini` for simple tasks
- Reserve `gpt-4` for complex analysis
- Set monthly budget limits in OpenAI dashboard
- Monitor token usage per workflow

**n8n Cloud Costs:**
- Track workflow executions
- Optimize long-running workflows
- Use self-hosted for high-volume scenarios

### Security Checklist

- [ ] All credentials stored in n8n credential system (not hardcoded)
- [ ] `.env` file never committed to Git
- [ ] Webhook paths use authentication or unique tokens
- [ ] HTTPS enforced for all external endpoints
- [ ] API keys rotated every 90 days
- [ ] Audit logs reviewed monthly
- [ ] Error messages don't expose sensitive data

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-25
**Maintained by:** n8n-cursor contributors
