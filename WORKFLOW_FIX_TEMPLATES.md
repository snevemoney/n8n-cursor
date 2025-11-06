# 🔧 Workflow Fix Templates - Copy & Paste Ready

## Quick Summary
Replace parameterized queries (`$1, $2, $3...`) with expression syntax (`{{ $json.fieldName }}`)

---

## 1. Sustainability Dashboard
**Workflow ID:** `m8bRs9lBNFvpygty`  
**Edit URL:** https://n8ncloud.tech/workflow/m8bRs9lBNFvpygty  
**Test URL:** https://n8ncloud.tech/webhook/sustainability-metrics

### Fix Node: "Add Sustainability Metric"
**Current Query:**
```sql
INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source, device_id, baseline_value, target_value) VALUES ($1, $2, $3::timestamptz, $4::numeric, $5, $6, $7::bigint, $8::numeric, $9::numeric) RETURNING *;
```

**Replace With:**
```sql
INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source) VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}') RETURNING *;
```

### Fix Node: "Get Sustainability Metrics"
**Current Query:**
```sql
SELECT * FROM get_sustainability_dashboard($1::text, $2::int);
```

**Replace With:**
```sql
SELECT * FROM get_sustainability_dashboard('{{ $json.tenantId }}', 30);
```

---

## 2. Work Order Management
**Workflow ID:** `gLbR8hJGF0Q7UkCw`  
**Edit URL:** https://n8ncloud.tech/workflow/gLbR8hJGF0Q7UkCw  
**Test URL:** https://n8ncloud.tech/webhook/work-orders

### Fix Node: "Create Work Order"
**Replace With:**
```sql
INSERT INTO work_orders (tenant_id, asset_id, title, description, priority, status, requested_by, scheduled_date, due_date) VALUES ('{{ $json.tenantId }}', {{ $json.assetId }}, '{{ $json.title }}', '{{ $json.description }}', '{{ $json.priority }}', 'pending', '{{ $json.requestedBy }}', '{{ $json.scheduledDate }}'::timestamptz, '{{ $json.dueDate }}'::timestamptz) RETURNING *;
```

### Fix Node: "Get Work Orders"
**Replace With:**
```sql
SELECT wo.*, ta.asset_name, ta.asset_category, v.vendor_name FROM work_orders wo LEFT JOIN tenant_assets ta ON wo.asset_id = ta.id LEFT JOIN vendors v ON wo.vendor_id = v.id WHERE wo.tenant_id = '{{ $json.tenantId }}' ORDER BY wo.created_at DESC;
```

### Fix Node: "Update Work Order Status"
**Replace With:**
```sql
UPDATE work_orders SET status = '{{ $json.status }}', completed_date = CASE WHEN '{{ $json.status }}' = 'completed' THEN NOW() ELSE completed_date END, resolution_notes = '{{ $json.resolutionNotes }}', updated_at = NOW() WHERE id = {{ $json.orderId }} RETURNING *;
```

---

## 3. Asset Management API
**Workflow ID:** `jv7Y59JNJwEiaiJX`  
**Edit URL:** https://n8ncloud.tech/workflow/jv7Y59JNJwEiaiJX  
**Test URL:** https://n8ncloud.tech/webhook/assets

### Fix Node: "Create Asset"
**Replace With:**
```sql
INSERT INTO tenant_assets (tenant_id, asset_type, asset_name, asset_category, location, purchase_date, purchase_price, current_value, condition_status, status, manufacturer, model, serial_number) VALUES ('{{ $json.tenantId }}', '{{ $json.assetType }}', '{{ $json.assetName }}', '{{ $json.assetCategory }}', '{{ $json.location }}'::jsonb, '{{ $json.purchaseDate }}'::timestamptz, {{ $json.purchasePrice }}::numeric, {{ $json.currentValue }}::numeric, '{{ $json.conditionStatus }}', '{{ $json.status }}', '{{ $json.manufacturer }}', '{{ $json.model }}', '{{ $json.serialNumber }}') RETURNING *;
```

### Fix Node: "Get Assets"
**Replace With:**
```sql
SELECT * FROM tenant_assets WHERE tenant_id = '{{ $json.tenantId }}' ORDER BY created_at DESC;
```

### Fix Node: "Update Asset"
**Replace With:**
```sql
UPDATE tenant_assets SET asset_name = '{{ $json.assetName }}', location = '{{ $json.location }}'::jsonb, condition_status = '{{ $json.conditionStatus }}', status = '{{ $json.status }}', updated_at = NOW() WHERE id = {{ $json.pathParameters.assetId }} RETURNING *;
```

### Fix Node: "Delete Asset"
**Replace With:**
```sql
DELETE FROM tenant_assets WHERE id = {{ $json.pathParameters.assetId }};
```

---

## 4. Tenant Onboarding
**Workflow ID:** `D0Njug3CtceFtg3T`  
**Edit URL:** https://n8ncloud.tech/workflow/D0Njug3CtceFtg3T  
**Test URL:** https://n8ncloud.tech/webhook/tenant-onboard

### Fix Node: "Extract Onboarding Data"
**Update assignments:**
```json
[
  {"name": "tenantId", "value": "={{ $json.tenantId }}"},
  {"name": "businessName", "value": "={{ $json.businessName }}"},
  {"name": "adminEmail", "value": "={{ $json.adminEmail }}"},
  {"name": "planType", "value": "={{ $json.planType }}"}
]
```

### Fix Node: "Create Tenant"
**Replace With:**
```sql
INSERT INTO tenants (tenant_id, business_name, admin_email, prompt, plan_type, model, welcome_message, suggested_prompt1, suggested_prompt2, suggested_prompt3, is_active) VALUES ('{{ $('Extract Onboarding Data').item.json.tenantId }}', '{{ $('Extract Onboarding Data').item.json.businessName }}', '{{ $('Extract Onboarding Data').item.json.adminEmail }}', 'You are a helpful assistant for {{ $('Extract Onboarding Data').item.json.businessName }}. Help customers with their questions and provide excellent service.', '{{ $('Extract Onboarding Data').item.json.planType }}', 1, 'Welcome to {{ $('Extract Onboarding Data').item.json.businessName }}! How can I help you today?', 'What services do you offer?', 'How can I contact support?', 'What are your business hours?', true) RETURNING *;
```

---

## 5. Email Notifications
**Workflow ID:** `QlkWWnxFO1U8S3tn`  
**Edit URL:** https://n8ncloud.tech/workflow/QlkWWnxFO1U8S3tn  
**Test URL:** https://n8ncloud.tech/webhook/notifications/email

### Fix Node: "Route Email Type"
**Update Code:**
```javascript
// Route to different email types based on type
const emailType = $json.type ?? 'generic';

// Map email types to templates
const templateMap = {
  'welcome': 'welcome_email',
  'verification': 'verification_email',
  'password-reset': 'password_reset_email',
  'work-order': 'work_order_notification',
  'compliance-alert': 'compliance_alert_email',
  'monthly-report': 'monthly_report_email'
};

return {
  json: {
    emailType,
    template: templateMap[emailType] ?? 'generic_email',
    recipient: $json.recipient,
    data: $json.data ?? {}
  }
};
```

---

## 6. Chat AI Agent
**Workflow ID:** `Adu0BUG3gd9OXWWR`  
**Edit URL:** https://n8ncloud.tech/workflow/Adu0BUG3gd9OXWWR  
**Test URL:** https://n8ncloud.tech/webhook/chat-assets

### Fix Node: "Extract Request Data"
**Update assignments:**
```json
[
  {"name": "tenantId", "value": "={{ $json.tenantId }}"},
  {"name": "userEmail", "value": "={{ $json.userEmail }}"},
  {"name": "chatInput", "value": "={{ $json.chatInput }}"}
]
```

---

## How to Apply These Fixes

1. **Open the workflow** in n8n at the Edit URL
2. **Click on the node** you need to fix
3. **Find the Query field** (for Postgres nodes) or Code field (for Code nodes)
4. **Replace the entire query/code** with the "Replace With" version
5. **Click Save** on the node
6. **Save the workflow** (Ctrl+S or Cmd+S)
7. **Test the webhook** using the Test URL

---

## Expected Results

After applying these fixes:
- ✅ All 6 failing workflows will return valid JSON responses
- ✅ Status will improve from 11/20 (55%) to 17/20 (85%)
- ✅ Only 3 workflows will remain with CORS/network issues (need separate investigation)

---

## Field Mappings Reference

### For Frontend Developers:
These are the field names your frontend should send:

**Sustainability:** `tenantId`, `metricType`, `measurementDate`, `value`, `unit`, `source`  
**Work Orders:** `tenantId`, `assetId`, `title`, `description`, `priority`, `requestedBy`, `scheduledDate`, `dueDate`, `status`  
**Assets:** `tenantId`, `assetType`, `assetName`, `assetCategory`, `location`, `purchaseDate`, `purchasePrice`, `currentValue`, `conditionStatus`, `status`  
**Tenant Onboarding:** `tenantId`, `businessName`, `adminEmail`, `planType`  
**Email:** `type`, `recipient`, `data`  
**Chat:** `tenantId`, `userEmail`, `chatInput`

