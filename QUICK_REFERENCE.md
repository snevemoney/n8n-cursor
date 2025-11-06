# 🚀 Quick Reference - Backend Operations

## 📋 Prerequisites Checklist

Before using the backend, ensure:

- [ ] All 20 n8n workflows imported
- [ ] Postgres credentials configured: `qKFQKlLBm0LkPAxq`
- [ ] Database tables created (run SQL files)
- [ ] Workflows activated in n8n
- [ ] API keys configured (OpenAI, Stripe, SMTP, etc.)

---

## 🔑 Critical Workflows

### Workflow #1 - Chat AI Agent
**Endpoint:** `POST /webhook/chat-assets`
```json
{
  "tenantId": "julianna",
  "userEmail": "user@julianna.com",
  "chatInput": "What assets do we have?"
}
```

### Workflow #3 - Asset Management  
**Endpoints:** `POST/GET/PUT/DELETE /webhook/assets`
```json
{
  "tenantId": "julianna",
  "assetType": "equipment",
  "assetName": "HVAC System",
  "status": "active"
}
```

### Workflow #8 - Authentication
**Endpoint:** `POST /webhook/auth`
```json
{
  "action": "signup|login|logout",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Workflow #9 - Email Notifications
**Endpoint:** `POST /webhook/notifications/email`
```json
{
  "type": "welcome",
  "recipient": "user@example.com",
  "data": {"name": "John Doe"}
}
```

---

## 🧪 Quick Test

```bash
# 1. Update test_backend.sh with your n8n URL
BASE_URL="https://your-n8n-instance.com"

# 2. Run tests
./test_backend.sh
```

---

## 🚨 Common Issues

### "Workflow not found" 
→ Activate workflow in n8n (top-right toggle)

### "Table does not exist"
→ Run SQL files in Supabase:
```sql
\i fix_missing_tables.sql
\i fix_database_schema.sql
```

### "Invalid tenant_id"
→ Create tenant first:
```sql
INSERT INTO tenants (tenant_id, business_name, plan_type, is_active)
VALUES ('your-tenant-id', 'Business Name', 'premium', true);
```

---

## 📊 Database Tables

**Core:**
- `tenants` - Tenant data
- `users` - User accounts  
- `tenant_assets` - Assets
- `work_orders` - Work orders
- `sustainability_metrics` - Metrics
- `compliance_records` - Compliance
- `audit_logs` - Audit trail
- `error_logs` - Errors
- `sessions` - User sessions

---

## 🔐 Database Functions

- `get_tenant_config(tenant_id)` - Get tenant config
- `set_tenant_context(tenant_id, user_email)` - Set context
- `track_usage(tenant_id, feature, metadata)` - Track usage
- `get_sustainability_dashboard(tenant_id, days)` - Get metrics
- `get_tenant_asset_summary(tenant_id)` - Get asset summary

---

## 📞 Need Help?

1. Check `BACKEND_OPERATIONS_GUIDE.md` for full documentation
2. Run `./test_backend.sh` to test all endpoints
3. Check n8n execution logs for errors
4. Check Supabase query logs for database errors

---

**Status:** 🟢 Ready to Use  
**Last Updated:** January 2025

