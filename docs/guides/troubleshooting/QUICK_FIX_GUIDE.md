# 🚀 Quick Fix Guide - n8n Workflows

## Current Status: 11/20 Working (55%)

### ✅ What's Working
All authenticated, security, compliance, and monitoring workflows are functioning perfectly!

### ❌ What Needs Fixing (6 workflows)

## Fix Instructions

### 1. Sustainability Dashboard
**Webhook:** `https://n8ncloud.tech/webhook/sustainability-metrics`  
**Edit:** https://n8ncloud.tech/workflow/m8bRs9lBNFvpygty

**Node: "Add Sustainability Metric"**
```
Current: VALUES ($1, $2, $3::timestamptz, $4::numeric, $5, $6...)
Change to: VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}')
```

**Node: "Get Sustainability Metrics"**
```
Current: SELECT * FROM get_sustainability_dashboard($1::text, $2::int);
Change to: SELECT * FROM get_sustainability_dashboard('{{ $json.tenantId }}', 30);
```

### 2. Work Order Management  
**Webhook:** `https://n8ncloud.tech/webhook/work-orders`  
**Edit:** https://n8ncloud.tech/workflow/gLbR8hJGF0Q7UkCw

**Node: "Create Work Order"**
```
Current: VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7::timestamptz, $8::timestamptz)
Change to: VALUES ('{{ $json.tenantId }}', {{ $json.assetId }}, '{{ $json.title }}', '{{ $json.description }}', '{{ $json.priority }}', 'pending', '{{ $json.requestedBy }}', '{{ $json.scheduledDate }}'::timestamptz, '{{ $json.dueDate }}'::timestamptz)
```

### 3. Asset Management
**Webhook:** `https://n8ncloud.tech/webhook/assets`  
**Edit:** https://n8ncloud.tech/workflow/jv7Y59JNJwEiaiJX

**Node: "Create Asset"**
```
Current: VALUES ($1, $2, $3, $4, $5::jsonb, $6::timestamptz...)
Change to: VALUES ('{{ $json.tenantId }}', '{{ $json.assetType }}', '{{ $json.assetName }}', '{{ $json.assetCategory }}', '{{ $json.location }}'::jsonb, '{{ $json.purchaseDate }}'::timestamptz...)
```

## Quick Reference

**Pattern to Find:** Look for `$1, $2, $3...` in PostgreSQL node queries  
**Pattern to Replace:** Use `'{{ $json.fieldName }}'` or `{{ $json.fieldName }}`  
**Always Save** after making changes!

## Testing After Fixes

Run this command to test all workflows:
```bash
cd /Users/evenslouis/n8n-cursor && ./test_working_workflows.sh
```

