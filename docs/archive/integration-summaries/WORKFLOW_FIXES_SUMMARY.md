# Workflow Fixes Needed

## Problem
The n8n API is not accepting PATCH/PUT updates for workflow nodes. The workflows need to be updated manually in n8n UI.

## Root Cause
Parameterized SQL queries (`$1, $2, ...`) are not being executed because `queryParameters` field is `null`.

## Fix Required
Change parameterized queries to use expression syntax: `{{ $json.fieldName }}`

## Workflows Needing Fixes

### 1. Sustainability Dashboard (m8bRs9lBNFvpygty)
**Node: "Add Sustainability Metric"**
- Current: `INSERT INTO sustainability_metrics (...) VALUES ($1, $2, ...)`
- Should be: `INSERT INTO sustainability_metrics (tenant_id, metric_type, measurement_date, value, unit, source) VALUES ('{{ $json.tenantId }}', '{{ $json.metricType }}', '{{ $json.measurementDate }}'::timestamptz, {{ $json.value }}::numeric, '{{ $json.unit }}', '{{ $json.source }}') RETURNING *;`

**Node: "Get Sustainability Metrics"**
- Current: `SELECT * FROM get_sustainability_dashboard($1::text, $2::int);`
- Should be: `SELECT * FROM get_sustainability_dashboard('{{ $json.tenantId }}', 30);`

### 2. Email Notification System (QlkWWnxFO1U8S3tn)
**Node: "Route Email Type"**
- Already fixed - uses `$json.type` instead of `$json.body.type`

### 3. Work Order Management (gLbR8hJGF0Q7UkCw)
Add queryParameters OR change to expression syntax for:
- "Create Work Order" node
- "Get Work Orders" node  
- "Update Work Order Status" node

### 4. Asset Management API (jv7Y59JNJwEiaiJX)
Add queryParameters OR change to expression syntax for:
- "Create Asset" node
- "Get Assets" node
- "Update Asset" node
- "Delete Asset" node

### 5. Tenant Onboarding (D0Njug3CtceFtg3T)  
**Node: "Extract Onboarding Data"**
- Already fixed - uses `$json.tenantId` instead of `$json.body.tenantId`

### 6. Chat AI Agent (Adu0BUG3gd9OXWWR)
- Verify "Extract Request Data" node has correct field mappings

## Quick Fix Instructions
1. Open https://n8ncloud.tech
2. Navigate to each failing workflow
3. Edit the Postgres node queries
4. Replace `$1`, `$2`, etc. with `{{ $json.fieldName }}`
5. Save and activate the workflow
6. Test the webhook

## Alternative: Re-import Workflows
The local files in `./workflow_*.json` already have the correct syntax. You can:
1. Delete the existing workflow in n8n UI
2. Import the corresponding workflow_*.json file
3. Activate the workflow

