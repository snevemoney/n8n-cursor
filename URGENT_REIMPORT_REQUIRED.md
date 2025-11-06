# ⚠️ URGENT: Re-import These Workflows to n8n

## Critical Fix Required

The workflow files have been updated locally but **MUST be re-imported to n8n** to take effect.

---

## 📋 Workflows That Need Re-import:

### 1. **Workflow #1 - Chat AI Agent** ✅ FIXED
**File**: `workflow_1_chat_ai_agent.json`
**Changes**: Removed `$json.body.` references in Set node assignments
**Status**: Ready to import

### 2. **Workflow #3 - Asset Management** ✅ FIXED  
**File**: `workflow_3_asset_management_api.json`
**Changes**: Updated 3 SQL queries to use `$json.field` instead of `$json.body.field`
**Status**: Ready to import

### 3. **Workflow #4 - Work Orders** ✅ FIXED
**File**: `workflow_4_work_order_management.json`  
**Changes**: Updated 3 SQL queries to use `$json.field` instead of `$json.body.field`
**Status**: Ready to import

### 4. **Workflow #5 - Sustainability** ✅ FIXED
**File**: `workflow_5_sustainability_dashboard.json`
**Changes**: Updated 1 SQL query to use `$json.field` instead of `$json.body.field`
**Status**: Ready to import

### 5. **Workflow #7 - Tenant Onboarding** ✅ FIXED
**File**: `workflow_7_tenant_onboarding.json`
**Changes**: Removed `$json.body.` references in Set node assignments (4 fields)
**Status**: Ready to import

### 6. **Workflow #9 - Email Notifications** ✅ FIXED
**File**: `workflow_9_email_notifications.json`
**Changes**: Updated email sender to `noreply@n8ncloud.tech`
**Status**: Ready to import

---

## 🔧 How to Re-import to n8n:

### Option 1: Via n8n UI
1. Go to `https://n8ncloud.tech`
2. Find each workflow listed above
3. Click on workflow → "..." menu → "Import from file"
4. Upload the corresponding JSON file
5. Save and activate

### Option 2: Via n8n API (if you have API access)
```bash
# Example for Workflow #1
curl -X PUT 'https://n8ncloud.tech/api/v1/workflows/[WORKFLOW_ID]' \
  -H 'Content-Type: application/json' \
  -H 'X-N8N-API-KEY: YOUR_API_KEY' \
  -d @workflow_1_chat_ai_agent.json
```

---

## ⚠️ Why Re-import is Needed:

The workflows currently running in n8n still have the old SQL queries and Set node assignments that expect:
- `$json.body.field` ❌
- `$json.data.field` (in some cases)

But the frontend is now sending flattened payloads with fields directly at the root:
- `$json.field` ✅

Without re-importing, these 6 workflows will continue to crash with 500 errors.

---

## 📊 Expected Results After Re-import:

**Current Status**: 11/20 workflows working (55%)  
**After Re-import**: 17/20 workflows should work (85%)

### Workflows That Will Start Working:
- #1 Chat Assets ✅
- #3 Assets ✅  
- #4 Work Orders ✅
- #5 Sustainability ✅
- #7 Tenant Onboard ✅
- #9 Email ✅

### Workflows Still Needing Manual Fixes in n8n UI:
- #6 Knowledge (CORS/workflow status)
- #11 Payment (CORS/workflow status)
- #18 Refunds (CORS/workflow status)

---

## ✅ Quick Checklist:

- [ ] Run `fix_missing_tables.sql` in Supabase PostgreSQL
- [ ] Re-import Workflow #1 to n8n
- [ ] Re-import Workflow #3 to n8n  
- [ ] Re-import Workflow #4 to n8n
- [ ] Re-import Workflow #5 to n8n
- [ ] Re-import Workflow #7 to n8n
- [ ] Re-import Workflow #9 to n8n
- [ ] Test all 20 webhook endpoints
- [ ] Verify success rate improved to 85%+

---

**Priority**: 🔴 HIGH - Re-import these 6 workflows ASAP to fix the 500 errors.

