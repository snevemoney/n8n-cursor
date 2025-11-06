# n8n Enterprise Playbook
## LightningFlow AI - Enterprise-Grade n8n Operations

This playbook defines how to use n8n in an enterprise-grade manner within LightningFlow AI, following the same practices used by Fortune-500 companies.

---

## 🎯 **Core Philosophy**

**n8n is the orchestrator, not the core logic.**

- **Keep in code (API/Worker)**: Security-critical paths, payment validation, high-throughput tasks, complex business logic
- **Use n8n for**: Integration glue, human-in-the-loop, notifications, non-critical automations, prototyping

---

## 🏗️ **Architecture Overview**

```
Frontend (Next.js) ⇄ API (Node/Next Route Handlers) ⇄ Redis + BullMQ (workers)
                           ⬑ n8n as orchestrator via signed webhooks
```

### **Hybrid Flow for workflow(0)**
1. **POST /api/workflows/0/run** (API) → create workflowRunId, enqueue BullMQ job
2. **n8n** (optional) kicks off auxiliary steps (emails, CRM) via signed POST to /api/aux/*
3. **Worker** processes core steps, updates status in Postgres, publishes events
4. **UI** polls GET /api/workflows/0/status/:id every 2s

---

## 🔒 **Enterprise Guardrails**

### **1. Per-Environment Isolation**
- **Separate n8n instances** or namespaces per environment
- **Never point lower envs** at production LNbits
- **Environment-specific credentials** and webhook URLs

### **2. Ingress Security**
- **n8n only on 127.0.0.1:5678** - no public Docker binds
- **Expose via Caddy** with authentication
- **No direct public access** to n8n interface

### **3. Signing & Authentication**
- **n8n → API calls** include X-Workflow-Signature (HMAC)
- **API verifies** + checks domain
- **Refuse unsigned calls** from n8n

### **4. Idempotency**
- **All webhooks** use Redis SETNX keyed by payment hash/run id
- **Prevent duplicate processing** of the same event
- **Atomic operations** for state changes

### **5. Versioning & GitOps**
- **Export workflows** to Git (`/workflows` folder)
- **Each PR** = version bump, reviewed like code
- **CI/CD deploys** them, not manual edits

### **6. Observability**
- **Expose n8n /metrics** to Grafana
- **Alerts** if failed executions > N% in last 5m
- **Execution webhooks** report to /api/events

### **7. Throughput Limits**
- **n8n handles orchestration** + glue
- **Heavy CPU/latency jobs** go to background workers
- **n8n just enqueues** or triggers them

---

## 📋 **What Goes Where**

### **Keep in Code (API/Worker)**
- ✅ `/api/lnbits/webhook` (token + host check, idempotent writes)
- ✅ Payment → state machine (created/settled/failed)
- ✅ Queue fan-out, retries, backpressure control
- ✅ Supabase RLS-guarded data writes
- ✅ Heavy AI calls via OpenAI proxy (cost/timeout control)
- ✅ Security-critical validation
- ✅ High-throughput operations (>50-100 req/min)
- ✅ Sub-200ms latency requirements

### **Use n8n For**
- ✅ Post-payment notifications (email/Discord)
- ✅ CRM/Sheets/Notion sync
- ✅ Generating summaries, marketing follow-ups
- ✅ Webhooks to partners
- ✅ Non-critical cron jobs (reporting, housekeeping)
- ✅ Human-in-the-loop approvals
- ✅ Integration glue between SaaS tools
- ✅ Prototyping new automations

---

## 🚀 **Implementation Guide**

### **1. n8n → API HMAC Middleware**

**Node.js Middleware:**
```typescript
import crypto from 'crypto';

export function verifyWorkflowSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-workflow-signature'];
  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WORKFLOW_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'LFAI-0505', message: 'Invalid webhook token' });
  }
  
  next();
}
```

**n8n Function Node:**
```javascript
const crypto = require('crypto');

const body = JSON.stringify($input.all());
const signature = crypto
  .createHmac('sha256', $env.WORKFLOW_SECRET)
  .update(body)
  .digest('hex');

return {
  headers: {
    'X-Workflow-Signature': signature,
    'Content-Type': 'application/json'
  },
  body: body
};
```

### **2. Workflow Export/Import**

**Export Script:**
```bash
#!/bin/bash
# scripts/export-n8n-workflows.sh

WORKFLOW_DIR="workflows/exported"
mkdir -p "$WORKFLOW_DIR"

# Export all workflows from n8n
curl -H "X-N8N-API-KEY: $N8N_API_KEY" \
  "http://127.0.0.1:5678/api/v1/workflows" \
  | jq '.data[] | {id, name, active, nodes, connections}' \
  > "$WORKFLOW_DIR/$(date +%Y%m%d_%H%M%S)_workflows.json"
```

**Import Script:**
```bash
#!/bin/bash
# scripts/import-n8n-workflows.sh

WORKFLOW_FILE="$1"
if [ -z "$WORKFLOW_FILE" ]; then
  echo "Usage: $0 <workflow-file.json>"
  exit 1
fi

# Import workflow to n8n
curl -X POST \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @"$WORKFLOW_FILE" \
  "http://127.0.0.1:5678/api/v1/workflows"
```

### **3. CI/CD Pipeline**

**.github/workflows/n8n-deploy.yml:**
```yaml
name: n8n Workflow Deployment

on:
  push:
    paths:
      - 'workflows/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate workflow JSON
        run: |
          for file in workflows/*.json; do
            jq empty "$file" || exit 1
          done
      
      - name: Deploy to staging
        run: |
          for file in workflows/*.json; do
            curl -X POST \
              -H "X-N8N-API-KEY: ${{ secrets.N8N_STAGING_API_KEY }}" \
              -H "Content-Type: application/json" \
              -d @"$file" \
              "${{ secrets.N8N_STAGING_URL }}/api/v1/workflows"
          done
      
      - name: Smoke test
        run: |
          curl -f "${{ secrets.N8N_STAGING_URL }}/healthz"
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          for file in workflows/*.json; do
            curl -X POST \
              -H "X-N8N-API-KEY: ${{ secrets.N8N_PROD_API_KEY }}" \
              -H "Content-Type: application/json" \
              -d @"$file" \
              "${{ secrets.N8N_PROD_URL }}/api/v1/workflows"
          done
```

### **4. Monitoring & Alerting**

**Grafana Dashboard Queries:**
```promql
# Failed executions rate
rate(n8n_executions_failed_total[5m]) / rate(n8n_executions_total[5m]) * 100

# Average execution duration
histogram_quantile(0.95, rate(n8n_execution_duration_seconds_bucket[5m]))

# Queue size
n8n_queue_size

# Active workflows
n8n_workflows_active
```

**Alert Rules:**
```yaml
groups:
  - name: n8n
    rules:
      - alert: N8nHighFailureRate
        expr: rate(n8n_executions_failed_total[5m]) / rate(n8n_executions_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "n8n failure rate is high"
          
      - alert: N8nQueueBacklog
        expr: n8n_queue_size > 1000
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "n8n queue backlog is high"
```

---

## 📁 **Directory Structure**

```
workflows/
├── exported/           # Exported workflow JSONs
│   ├── 20240101_120000_workflows.json
│   └── 20240102_140000_workflows.json
├── templates/          # Workflow templates
│   ├── webhook-processor.json
│   ├── notification-sender.json
│   └── data-sync.json
├── staging/           # Staging-specific workflows
│   └── test-notifications.json
└── production/        # Production workflows
    ├── payment-notifications.json
    └── crm-sync.json

scripts/
├── export-n8n-workflows.sh
├── import-n8n-workflows.sh
├── validate-workflows.sh
└── n8n-health-check.sh
```

---

## 🔧 **Operational Procedures**

### **1. Adding a New Workflow**

1. **Create workflow** in n8n UI (staging)
2. **Test thoroughly** with sample data
3. **Export to Git** using export script
4. **Create PR** with workflow JSON
5. **Review** like any other code
6. **Deploy** via CI/CD pipeline
7. **Monitor** execution metrics

### **2. Updating Existing Workflow**

1. **Make changes** in n8n UI (staging)
2. **Test changes** thoroughly
3. **Export updated** workflow
4. **Create PR** with changes
5. **Review** and approve
6. **Deploy** via CI/CD
7. **Verify** in production

### **3. Emergency Rollback**

1. **Identify** problematic workflow
2. **Disable** in n8n UI immediately
3. **Revert** to previous version in Git
4. **Deploy** previous version
5. **Verify** system stability
6. **Post-mortem** and fix

### **4. Performance Tuning**

1. **Monitor** execution metrics
2. **Identify** slow workflows
3. **Profile** execution time
4. **Optimize** or move to worker
5. **Test** performance improvements
6. **Deploy** optimized version

---

## 🚨 **Security Checklist**

### **Before Production**
- [ ] n8n bound to 127.0.0.1 only
- [ ] Caddy authentication configured
- [ ] HMAC signing implemented
- [ ] Environment isolation verified
- [ ] Secrets management configured
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] Backup procedures tested

### **Ongoing Security**
- [ ] Regular security updates
- [ ] Access review quarterly
- [ ] Secret rotation monthly
- [ ] Audit log review weekly
- [ ] Vulnerability scanning daily
- [ ] Incident response plan tested

---

## 📊 **Key Metrics to Monitor**

### **Performance Metrics**
- Execution duration (p50, p95, p99)
- Queue size and wait times
- Throughput (executions/minute)
- Error rates by workflow

### **Business Metrics**
- Workflow success rates
- User engagement with workflows
- Cost per execution
- ROI of automations

### **Operational Metrics**
- System resource usage
- Database connection pools
- External service health
- Alert response times

---

## 🎯 **Success Criteria**

### **Technical Success**
- ✅ <2% workflow failure rate
- ✅ <5s average execution time
- ✅ 99.9% uptime
- ✅ <1s queue wait time

### **Business Success**
- ✅ 50% reduction in manual tasks
- ✅ 90% user satisfaction
- ✅ 25% cost savings
- ✅ 10x faster onboarding

---

## 📚 **Resources**

### **Documentation**
- [n8n Official Docs](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [n8n Community](https://community.n8n.io/)

### **Tools**
- [n8n CLI](https://docs.n8n.io/hosting/cli-commands/)
- [n8n Docker](https://docs.n8n.io/hosting/installation/docker/)
- [n8n Monitoring](https://docs.n8n.io/hosting/monitoring/)

### **Best Practices**
- [n8n Best Practices](https://docs.n8n.io/best-practices/)
- [n8n Security](https://docs.n8n.io/security/)
- [n8n Performance](https://docs.n8n.io/performance/)

---

**This playbook ensures n8n operates at enterprise-grade standards within LightningFlow AI, providing reliability, security, and scalability.**
