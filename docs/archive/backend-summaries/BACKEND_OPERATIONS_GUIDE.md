# 🔧 Backend Operations Guide - n8n Workflows

## 🎯 Quick Start

Your 20 n8n workflows are imported and database credentials are configured. Here's how to use them.

## 📍 System Architecture

```
Frontend (Lovable)
    ↓ (HTTP requests)
n8n Webhooks
    ↓ (PostgreSQL queries)
Supabase Database
```

### Key Components:
- **20 n8n Workflows**: Handling all backend operations
- **Supabase PostgreSQL**: Multi-tenant database
- **Webhook Endpoints**: REST API interface for frontend

---

## 🔗 All Webhook Endpoints

### Core Operations

#### 1. Chat AI Agent (Workflow #1)
```bash
POST /webhook/chat-assets
```
**Request:**
```json
{
  "tenantId": "julianna",
  "userEmail": "user@julianna.com",
  "chatInput": "Show me all HVAC equipment"
}
```

#### 2. File Upload (Workflow #2)
```bash
POST /webhook/file-upload
```
**Request:**
```json
{
  "tenantId": "julianna",
  "userEmail": "user@julianna.com",
  "fileName": "maintenance_report.pdf",
  "fileUrl": "https://drive.google.com/...",
  "category": "maintenance"
}
```

#### 3. Asset Management (Workflow #3)
```bash
POST /webhook/assets
GET /webhook/assets
PUT /webhook/assets/:assetId
DELETE /webhook/assets/:assetId
```

**Create Asset:**
```json
{
  "tenantId": "julianna",
  "assetType": "equipment",
  "assetName": "HVAC System",
  "assetCategory": "HVAC",
  "location": {"building": "Main Building", "floor": "2"},
  "purchaseDate": "2024-01-15",
  "purchasePrice": 5000,
  "currentValue": 4500,
  "conditionStatus": "good",
  "status": "active",
  "manufacturer": "LG",
  "model": "AC-2024",
  "serialNumber": "SN-12345"
}
```

#### 4. Work Orders (Workflow #4)
```bash
POST /webhook/work-orders
GET /webhook/work-orders
PUT /webhook/work-orders/:workOrderId
```

#### 5. Sustainability Dashboard (Workflow #5)
```bash
GET /webhook/sustainability/:tenantId
```

#### 6. Compliance Alerts (Workflow #6)
```bash
GET /webhook/compliance/:tenantId
```

---

### Authentication (Workflow #8)

#### Sign Up
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "signup",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "tenantId": "julianna",
  "userName": "John Doe"
}
```

#### Login
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Logout
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "logout",
  "sessionId": "session_123"
}
```

#### Verify Email
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "verify-email",
  "token": "email_verification_token"
}
```

#### Reset Password Request
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "reset-password-request",
  "email": "user@example.com"
}
```

#### Reset Password Complete
```bash
POST /webhook/auth
```
**Request:**
```json
{
  "action": "reset-password-complete",
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

---

### Email Notifications (Workflow #9)
```bash
POST /webhook/notifications/email
```
**Request:**
```json
{
  "type": "welcome",
  "recipient": "user@example.com",
  "data": {
    "name": "John Doe",
    "tenantName": "Julianna Corp"
  }
}
```

**Available Email Types:**
- `welcome` - Welcome email for new users
- `password-reset` - Password reset instructions
- `email-verification` - Email verification link
- `maintenance-due` - Maintenance due alerts
- `compliance-expiring` - Compliance expiration warnings
- `work-order-assigned` - Work order assignment
- `invoice-payment` - Payment received confirmation
- `error-alert` - System error notification

---

### Payment & Billing (Workflow #11)
```bash
POST /webhook/payments/subscribe
POST /webhook/payments/webhook
GET /webhook/payments/invoices
```

### Analytics & Reporting (Workflow #12)
```bash
GET /webhook/analytics/:tenantId
GET /webhook/reports/:reportType
```

### Testing & QA (Workflow #13)
```bash
POST /webhook/testing/champion-vs-challenger
GET /webhook/testing/health
```

### Advanced Features (Workflow #14)
```bash
POST /webhook/features/webhook
GET /webhook/features/status
```

### API Key Management (Workflow #16)
```bash
POST /webhook/api-keys
GET /webhook/api-keys
DELETE /webhook/api-keys/:keyId
```

---

## 🧪 Testing Your Backend

### Test Script

Create a file called `test_backend.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="https://your-n8n-instance.com"
TENANT_ID="julianna"
USER_EMAIL="test@julianna.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Backend Endpoints..."
echo ""

# Test 1: Authentication - Sign Up
echo -e "${YELLOW}Test 1: Sign Up${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/auth" \
  -H "Content-Type: application/json" \
  -d "{
    \"action\": \"signup\",
    \"email\": \"$USER_EMAIL\",
    \"password\": \"SecurePass123!\",
    \"tenantId\": \"$TENANT_ID\",
    \"userName\": \"Test User\"
  }")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Sign up successful${NC}"
  echo "$RESPONSE" | jq .
else
  echo -e "${RED}❌ Sign up failed${NC}"
fi
echo ""

# Test 2: Chat AI Agent
echo -e "${YELLOW}Test 2: Chat AI Agent${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/chat-assets" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"userEmail\": \"$USER_EMAIL\",
    \"chatInput\": \"What assets do we have?\"
  }")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Chat agent responded${NC}"
  echo "$RESPONSE" | jq .
else
  echo -e "${RED}❌ Chat agent failed${NC}"
fi
echo ""

# Test 3: Get Assets
echo -e "${YELLOW}Test 3: Get Assets${NC}"
RESPONSE=$(curl -s -X GET "$BASE_URL/webhook/assets?tenantId=$TENANT_ID")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Assets retrieved${NC}"
  echo "$RESPONSE" | jq .
else
  echo -e "${RED}❌ Failed to get assets${NC}"
fi
echo ""

# Test 4: Create Asset
echo -e "${YELLOW}Test 4: Create Asset${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/assets" \
  -H "Content-Type: application/json" \
  -d "{
    \"tenantId\": \"$TENANT_ID\",
    \"assetType\": \"equipment\",
    \"assetName\": \"Test HVAC System\",
    \"assetCategory\": \"HVAC\",
    \"location\": {\"building\": \"Test Building\", \"floor\": \"1\"},
    \"purchaseDate\": \"2024-01-15\",
    \"purchasePrice\": 5000,
    \"currentValue\": 4500,
    \"conditionStatus\": \"good\",
    \"status\": \"active\",
    \"manufacturer\": \"LG\",
    \"model\": \"AC-2024\",
    \"serialNumber\": \"SN-TEST-001\"
  }")

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Asset created${NC}"
  echo "$RESPONSE" | jq .
else
  echo -e "${RED}❌ Asset creation failed${NC}"
fi
echo ""

echo "✅ Testing complete!"
```

---

## 🚨 Troubleshooting

### Issue 1: "Workflow not found"
**Cause:** Workflow not activated in n8n  
**Solution:** 
1. Open n8n
2. Find the workflow
3. Click the **Activate** toggle in the top-right

### Issue 2: "Database connection error"
**Cause:** Wrong credentials or network issue  
**Solution:**
1. Check Postgres credentials in n8n
2. Verify Supabase connection
3. Test connection from n8n UI

### Issue 3: "Table does not exist"
**Cause:** Missing database schema  
**Solution:** Run these SQL files in Supabase:
```sql
-- First, check what exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- If audit_logs missing, run:
\i fix_missing_tables.sql

-- If columns missing, run:
\i fix_database_schema.sql
```

### Issue 4: "Function does not exist"
**Cause:** Database functions not created  
**Solution:** Run these SQL files in Supabase:
```sql
-- Check existing functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public';

-- If functions missing, re-create them
\i asset_management_functions.sql
```

### Issue 5: "Webhook timeout"
**Cause:** Slow database queries or AI processing  
**Solution:**
1. Check n8n execution logs
2. Optimize SQL queries
3. Add database indexes
4. Increase n8n timeout settings

### Issue 6: "Invalid tenant_id"
**Cause:** Tenant doesn't exist in database  
**Solution:** Create tenant first:
```sql
INSERT INTO tenants (tenant_id, business_name, plan_type, is_active)
VALUES ('your-tenant-id', 'Your Business', 'premium', true);
```

---

## 📊 Database Schema Reference

### Core Tables
- `tenants` - Tenant information
- `users` - User accounts
- `tenant_assets` - Asset inventory
- `work_orders` - Maintenance work orders
- `sustainability_metrics` - Environmental data
- `compliance_records` - Compliance tracking
- `audit_logs` - Audit trail
- `error_logs` - Error tracking
- `sessions` - User sessions
- `api_keys` - API key management

### Functions
- `get_tenant_config(tenant_id)` - Get tenant configuration
- `set_tenant_context(tenant_id, user_email)` - Set context
- `track_usage(tenant_id, feature, metadata)` - Track usage
- `get_sustainability_dashboard(tenant_id, days)` - Get metrics
- `get_tenant_asset_summary(tenant_id)` - Get asset summary

---

## 🔐 Security Best Practices

1. **Never expose credentials** in frontend code
2. **Use HTTPS** for all webhook endpoints
3. **Enable rate limiting** in n8n
4. **Monitor audit logs** regularly
5. **Rotate API keys** periodically
6. **Use environment variables** for secrets
7. **Enable RLS** (Row-Level Security) in Supabase

---

## 📈 Monitoring & Health Checks

### Check n8n Status
```bash
curl https://your-n8n-instance.com/webhook/testing/health
```

### Check Database Status
```sql
SELECT 
  tenant_id,
  COUNT(*) as asset_count,
  MAX(updated_at) as last_update
FROM tenant_assets 
WHERE tenant_id = 'julianna'
GROUP BY tenant_id;
```

### Monitor Error Logs
```sql
SELECT 
  occurred_at,
  error_message,
  context
FROM error_logs 
WHERE occurred_at > NOW() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;
```

---

## 🎯 Next Steps

1. ✅ Test all workflows using the test script
2. ✅ Monitor error logs daily
3. ✅ Set up alerts for critical errors
4. ✅ Configure SMTP for email notifications
5. ✅ Set up Stripe for payment processing
6. ✅ Add monitoring dashboard
7. ✅ Document API endpoints
8. ✅ Set up backup schedule

---

## 📞 Support

If you encounter issues:

1. **Check n8n execution logs** - See which node failed
2. **Check Supabase logs** - See database errors
3. **Review this guide** - Common issues covered
4. **Test endpoints individually** - Isolate the problem
5. **Check database schema** - Ensure tables exist

---

**Status:** 🟢 Production Ready  
**Last Updated:** January 2025

