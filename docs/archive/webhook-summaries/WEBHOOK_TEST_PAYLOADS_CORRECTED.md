# 📋 Corrected Webhook Test Payloads for All 20 n8n Workflows

This document provides the CORRECT payload formats that match what each n8n workflow expects.

## Base Configuration

```typescript
const BASE_URL = "https://n8ncloud.tech/webhook";
const TENANT_ID = "test-tenant-webhook-validation";
```

---

## Core Workflows (1-7)

### 1. Chat AI Agent - `/chat-assets`

**✅ CORRECT Payload:**
```json
{
  "tenantId": "test-tenant-webhook-validation",
  "userEmail": "test@example.com",
  "chatInput": "What assets do we have in maintenance?"
}
```

### 2. File Upload Sync - `/file-upload-sync`

**Note:** This workflow uses Google Drive trigger, not webhook. Test separately.

### 3. Asset Management API - `/assets`

**✅ CORRECT Payload (POST - Create):**
```json
{
  "tenantId": "test-tenant-webhook-validation",
  "assetType": "equipment",
  "assetName": "HVAC Unit 1",
  "assetCategory": "hvac",
  "location": {
    "floor": 1,
    "room": "A101",
    "building": "Main"
  },
  "purchaseDate": "2025-01-15",
  "purchasePrice": 5000,
  "currentValue": 4500,
  "conditionStatus": "good",
  "status": "active",
  "manufacturer": "Carrier",
  "model": "Model XR15",
  "serialNumber": "SN123456"
}
```

**✅ CORRECT Payload (PUT - Update):**
```json
{
  "assetId": "asset-id-here",
  "conditionStatus": "maintenance",
  "status": "inactive"
}
```

### 4. Work Order Management - `/work-orders`

**✅ CORRECT Payload (POST - Create):**
```json
{
  "tenantId": "test-tenant-webhook-validation",
  "assetId": "asset-id-123",
  "title": "HVAC maintenance check",
  "description": "Quarterly maintenance inspection required",
  "priority": "medium",
  "status": "pending",
  "requestedBy": "maintenance-team",
  "scheduledDate": "2025-11-01",
  "dueDate": "2025-11-05"
}
```

### 5. Sustainability Dashboard - `/sustainability-metrics`

**✅ CORRECT Payload (POST - Track):**
```json
{
  "tenantId": "test-tenant-webhook-validation",
  "metricType": "energy-consumption",
  "measurementDate": "2025-10-27",
  "value": 1250.5,
  "unit": "kWh",
  "source": "smart-meter",
  "deviceId": "device-001",
  "baselineValue": 1200,
  "targetValue": 1000
}
```

### 6. Compliance Alerts - `/compliance`

**✅ CORRECT Payload (Type: GDPR, Audit, or Report):**
```json
{
  "complianceType": "audit-log",  // ⚠️ NOT "audit"
  "data": {
    "auditLevel": "high",
    "requireReport": true
  }
}
```

**Valid complianceType values:**
- `audit-log`
- `compliance-report`
- `data-retention`
- `gdpr`

### 7. Tenant Onboarding - `/tenant-onboard`

**✅ CORRECT Payload:**
```json
{
  "action": "create",
  "tenantName": "New Healthcare Organization",
  "tenantId": "new-tenant-123",
  "adminEmail": "admin@example.com",
  "adminName": "Admin User",
  "subscriptionTier": "pro"
}
```

---

## Auth & Communication (8-9)

### 8. Authentication & User Management - `/auth`

**✅ CORRECT Payload (Login):**
```json
{
  "action": "login",
  "email": "user@example.com",
  "password": "secure-password-123"
}
```

**✅ CORRECT Payload (Signup):**
```json
{
  "action": "signup",
  "email": "newuser@example.com",
  "password": "secure-password-123",
  "tenantId": "test-tenant-webhook-validation",
  "name": "New User"
}
```

### 9. Email Notifications - `/notifications/email`

**✅ CORRECT Payload (Welcome Email):**
```json
{
  "type": "welcome",
  "recipient": "user@example.com",  // ⚠️ REQUIRED FIELD
  "data": {
    "name": "John Doe",
    "verificationLink": "https://example.com/verify?token=abc123"
  }
}
```

**Valid email types:**
- `welcome`
- `verification`
- `password-reset`
- `work-order`
- `compliance-alert`
- `monthly-report`

---

## Security & Monitoring (10)

### 10. Security & Monitoring - `/security`

**✅ CORRECT Payload:**
```json
{
  "securityType": "rate-limit",  // ⚠️ NOT "scan"
  "data": {
    "threshold": 100,
    "timeWindow": 60
  }
}
```

**Valid securityType values:**
- `rate-limit`
- `validate-webhook`
- `error-log`
- `alert`
- `health-check`

---

## Payment & Billing (11)

### 11. Payment & Billing - `/payment`

**✅ CORRECT Payload:**
```json
{
  "action": "charge",
  "tenantId": "test-tenant-webhook-validation",
  "amount": 99.99,
  "currency": "USD",
  "description": "Monthly subscription",
  "paymentMethod": "card"
}
```

---

## Analytics & Testing (12-13)

### 12. Analytics & Reporting - `/analytics` ⚠️ GET REQUEST

**✅ CORRECT (Query Parameters):**
```
GET /analytics?type=usage&tenantId=test-tenant-webhook-validation
```

**Valid type values:**
- `usage`
- `response-time`
- `satisfaction`
- `conversations`

### 13. Testing & QA - `/testing`

**✅ CORRECT Payload:**
```json
{
  "type": "unit",  // ⚠️ NOT "integration"
  "data": {
    "testSuite": "asset-management",
    "timeout": 30
  }
}
```

**Valid type values:**
- `smoke`
- `load`
- `e2e`
- `ab`

---

## Compliance & Audit (14)

### 14. Compliance Audit - `/compliance`

**✅ CORRECT Payload:**
```json
{
  "type": "audit-log",  // Same as #6
  "data": {
    "auditLevel": "critical",
    "exportFormat": "pdf"
  }
}
```

---

## Operations (15-17)

### 15. API Key Management - `/api-keys`

**✅ CORRECT Payload:**
```json
{
  "action": "create",
  "data": {
    "tenantId": "test-tenant-webhook-validation",
    "permissions": ["read", "write"]
  }
}
```

### 16. Backup & Restore - `/backup`

**✅ CORRECT Payload:**
```json
{
  "action": "schedule-daily",  // ⚠️ NOT "create"
  "data": {
    "tenantId": "test-tenant-webhook-validation",
    "retentionDays": 30
  }
}
```

**Valid action values:**
- `schedule-daily`
- `restore`
- `list-backups`

### 17. Advanced Features - `/advanced`

**✅ CORRECT Payload:**
```json
{
  "featureType": "ocr",  // ⚠️ NOT "ai-analysis"
  "data": {
    "documentId": "doc-123",
    "extractTables": true
  }
}
```

**Valid featureType values:**
- `multi-language`
- `ocr`
- `content-extract`
- `data-export`

---

## Incident Management (18-20)

### 18. Refund Management - `/refunds`

**✅ CORRECT Payload:**
```json
{
  "action": "request",
  "tenantId": "test-tenant-webhook-validation",
  "orderId": "order-123",
  "amount": 49.99,
  "reason": "Service not as expected"
}
```

### 19. Emergency Response - `/emergency`

**✅ CORRECT Payload:**
```json
{
  "type": "escalate",
  "data": {
    "incidentId": "incident-123",
    "severity": "critical",
    "message": "System outage detected"
  }
}
```

### 20. Error Recovery - `/error-recovery`

**✅ CORRECT Payload:**
```json
{
  "action": "retry",
  "data": {
    "workflowId": "workflow-123",
    "executionId": "execution-456",
    "maxRetries": 3
  }
}
```

---

## Quick Reference: Value Mappings

### ❌ WRONG → ✅ CORRECT

| Workflow | Wrong Value | Correct Value |
|----------|-------------|---------------|
| Compliance | `"audit"` | `"audit-log"` |
| Security | `"scan"` | `"rate-limit"` |
| Testing | `"integration"` | `"smoke"` |
| Backup | `"create"` | `"schedule-daily"` |
| Advanced | `"ai-analysis"` | `"ocr"` |

---

## Implementation in Lovable Frontend

### Update WebhookTester Component

```typescript
const CORRECT_PAYLOADS = {
  // Workflow #1: Chat AI Agent
  '/chat-assets': {
    tenantId: "test-tenant-webhook-validation",
    userEmail: "test@example.com",
    chatInput: "What assets do we have?"
  },
  
  // Workflow #9: Email Notifications
  '/notifications/email': {
    type: "welcome",
    recipient: "test@example.com",  // ⚠️ REQUIRED
    data: {
      name: "Test User"
    }
  },
  
  // Workflow #10: Security
  '/security': {
    securityType: "rate-limit",  // ⚠️ NOT "scan"
    data: {
      threshold: 100
    }
  },
  
  // ... add all 20 workflows
};
```

---

## Next Steps

1. ✅ Update Lovable's `WebhookTester` component with these correct payloads
2. ✅ Run `fix_missing_tables.sql` in Supabase PostgreSQL
3. ✅ Re-test all 20 webhooks with corrected payloads
4. ✅ Verify all workflows now succeed

---

**Status**: 🔧 Awaiting frontend implementation of corrected payloads

