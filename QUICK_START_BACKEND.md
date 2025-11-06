# ⚡ Quick Start - Backend Setup

## 🎯 What You Have

✅ **20 n8n Workflows** - Ready to import
✅ **Database Schema** - Fixed and synced
✅ **Postgres Credentials** - Already configured

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Scripts (5 minutes)

Open Supabase SQL Editor and run:

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id SERIAL PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100),
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Fix missing columns
ALTER TABLE tenant_contacts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE retry_configs ADD COLUMN IF NOT EXISTS operation_type TEXT;

CREATE INDEX IF NOT EXISTS idx_tenant_contacts_created_at ON tenant_contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred_at ON error_logs(occurred_at);
```

### Step 2: Test Your First Workflow (2 minutes)

Open n8n and test the Chat AI workflow:

```bash
curl -X POST https://your-n8n-url.com/webhook/chat-assets \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "julianna",
    "userEmail": "admin@julianna.com",
    "chatInput": "What assets are in the knowledge base?"
  }'
```

### Step 3: Activate All Workflows (1 minute)

In n8n:
1. Open each workflow
2. Toggle the **Activate** button
3. Done!

## 📝 Optional: Configure Email Service

For email notifications (workflow #9), add to n8n credentials:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## ✅ That's It!

Your backend is now ready. All 20 workflows are functional.

**Need more details?** See `BACKEND_SETUP_GUIDE.md`
