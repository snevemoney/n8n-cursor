# Manual Workflow Fixes Required

The n8n API is rejecting PATCH/PUT updates. You need to fix these workflows manually in the UI.

## 🔗 Direct Links to Edit Workflows

1. **Sustainability Dashboard** - https://n8ncloud.tech/workflow/m8bRs9lBNFvpygty
2. **Email Notifications** - https://n8ncloud.tech/workflow/QlkWWnxFO1U8S3tn  
3. **Work Order Management** - https://n8ncloud.tech/workflow/gLbR8hJGF0Q7UkCw
4. **Asset Management** - https://n8ncloud.tech/workflow/jv7Y59JNJwEiaiJX
5. **Tenant Onboarding** - https://n8ncloud.tech/workflow/D0Njug3CtceFtg3T
6. **Chat AI Agent** - https://n8ncloud.tech/workflow/Adu0BUG3gd9OXWWR

## 🎯 Issue
Parameterized queries (`$1, $2, ...`) need `queryParameters` but it's set to `null`, causing empty responses.

## ✅ Solution Options

### Option 1: Convert to Expression Syntax (Recommended)
Replace `$1, $2, ...` with n8n expressions like `{{ $json.tenantId }}`

### Option 2: Add Query Parameters
For each Postgres node with `$1`, add `queryParameters.values` array

## 📋 Exact Fixes Needed

### Sustainability Dashboard
**Node: "Add Sustainability Metric"**
```
Change query to:
INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source) 
VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}') 
RETURNING *;
```

**Node: "Get Sustainability Metrics"**
```
Change query to:
SELECT * FROM get_sustainability_dashboard('{{ $json.tenantId }}', 30);
```

### Other Workflows
Apply same pattern - convert `$1, $2, $3...` to expressions using `{{ $json.fieldName }}`

