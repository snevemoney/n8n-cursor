# Retention Enforcement Scheduling

This document describes how to schedule daily retention enforcement for Data Governance.

## Option 1: n8n Workflow (Recommended)

A workflow is available at `workflows/shared/governance_retention_enforcement.json` that can be imported into n8n.

### Setup Steps:

1. **Import the workflow into n8n:**
   - Open n8n UI
   - Go to Workflows → Import from File
   - Select `workflows/shared/governance_retention_enforcement.json`
   - Activate the workflow

2. **Configure the workflow:**
   - The workflow runs daily at midnight (00:00)
   - It calls `POST /api/governance/enforce-retention`
   - Results are logged to the n8n execution logs

3. **Customize the schedule:**
   - Edit the "Daily Cron Trigger" node
   - Adjust the cron expression to your preferred schedule
   - Example: `0 2 * * *` runs at 2 AM daily

## Option 2: System Cron Job

If you prefer a system-level cron job instead of n8n:

```bash
# Add to crontab (crontab -e)
# Run daily at 2 AM
0 2 * * * curl -X POST http://localhost:3003/api/governance/enforce-retention
```

## Option 3: Node.js Scheduler

You can also use a Node.js scheduler library like `node-cron`:

```typescript
import cron from 'node-cron';
import { getGovernanceService } from '@/lib/governance/governanceService';

// Run daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  const service = getGovernanceService();
  const result = await service.enforceRetention();
  console.log(`Retention enforcement: ${result.deleted} deleted, ${result.flagged} flagged`);
});
```

## Monitoring

- Check n8n execution logs for retention enforcement results
- View retention rules and enforcement history in `/admin/ops` (Governance tab)
- Access logs are available via `/api/governance/access-logs`





