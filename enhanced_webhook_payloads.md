# 🎯 **Updated Webhook Payloads - Multi-User System**

## 📋 **Enhanced Webhook Payloads with User Roles**

### **1. Chat Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/chat`

```json
{
  "tenantId": "ACME_INC",
  "userEmail": "admin@acme.com",
  "sessionId": "test-session-123",
  "chatInput": "Hello, how can you help me?",
  "passwordHash": "test_hash_2024",
  "userRole": "admin",
  "permissions": {
    "all": true
  },
  "timestamp": "2025-01-21T12:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "response": "Hello! I'm here to help you with ACME Corporation. As an admin, you have full access to all features. How can I assist you today?",
  "messageId": "msg_123456",
  "timestamp": "2025-01-21T12:00:00Z",
  "userRole": "admin",
  "permissions": {
    "all": true
  }
}
```

---

### **2. Pre-Chat Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/pre-chat`

```json
{
  "tenantId": "ACME_INC",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@acme.com",
  "consent": true,
  "sessionId": "session_abc123",
  "sourcePage": "https://acme.com/products",
  "userType": "visitor",
  "timestamp": "2025-01-21T12:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "sessionToken": "sess_xyz789",
  "userData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@acme.com",
    "userRole": "visitor",
    "permissions": {
      "chat": true
    }
  },
  "message": "Welcome! You can now start chatting."
}
```

---

### **3. Tenant Config Webhook - Enhanced**
**Endpoint:** `GET https://n8ncloud.tech/webhook/tenant-config?tenantId=ACME_INC&userEmail=admin@acme.com`

**No JSON payload needed** - GET request with query parameters

**Expected Response (Admin User):**
```json
{
  "tenant_id": "ACME_INC",
  "business_name": "ACME Corporation",
  "admin_email": "admin@acme.com",
  "prompt": "You are a helpful assistant for ACME Corporation...",
  "plan_type": "premium",
  "model": 1,
  "welcome_message": "Welcome to ACME Corporation!...",
  "suggested_prompt1": "Show me recent invoices",
  "suggested_prompt2": "What contracts are expiring soon?",
  "suggested_prompt3": "Help me find a specific document",
  "is_active": true,
  "user_role": "admin",
  "user_permissions": {
    "all": true
  },
  "knowledge_files": [
    {
      "id": 1,
      "topicName": "Product Information",
      "fileName": "acme-product-catalog.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-01-21T12:00:00Z"
    },
    {
      "id": 2,
      "topicName": "Support Documentation",
      "fileName": "acme-faq.docx",
      "fileSize": 512000,
      "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "uploadedAt": "2025-01-21T12:00:00Z"
    }
  ],
  "availability_settings": {
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "workingHours": {"start": "09:00", "end": "17:00"},
    "slotDuration": 30,
    "breakTimes": {"lunch_start": "12:00", "lunch_end": "13:00"},
    "timezone": "America/New_York",
    "minAdvanceMinutes": 120,
    "maxAdvanceDays": 30
  },
  "analytics_summary": {
    "totalEvents": 0,
    "lastEvent": null,
    "totalSessions": 0,
    "totalUsers": 0
  },
  "user_management": {
    "totalUsers": 4,
    "activeUsers": 4,
    "adminUsers": 1,
    "managerUsers": 1,
    "regularUsers": 1,
    "visitors": 1
  }
}
```

**Expected Response (Regular User):**
```json
{
  "tenant_id": "ACME_INC",
  "business_name": "ACME Corporation",
  "admin_email": "admin@acme.com",
  "prompt": "You are a helpful assistant for ACME Corporation...",
  "plan_type": "premium",
  "model": 1,
  "welcome_message": "Welcome to ACME Corporation!...",
  "suggested_prompt1": "Show me recent invoices",
  "suggested_prompt2": "What contracts are expiring soon?",
  "suggested_prompt3": "Help me find a specific document",
  "is_active": true,
  "user_role": "user",
  "user_permissions": {
    "chat": true
  },
  "knowledge_files": [
    {
      "id": 1,
      "topicName": "Product Information",
      "fileName": "acme-product-catalog.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "uploadedAt": "2025-01-21T12:00:00Z"
    }
  ],
  "availability_settings": {
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "workingHours": {"start": "09:00", "end": "17:00"},
    "slotDuration": 30,
    "timezone": "America/New_York"
  },
  "analytics_summary": {
    "restricted": true
  },
  "user_management": {
    "restricted": true
  }
}
```

---

### **4. Knowledge Upload Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/knowledge-upload`

```json
{
  "tenantId": "ACME_INC",
  "userEmail": "admin@acme.com",
  "userRole": "admin",
  "permissions": {
    "all": true
  },
  "topicId": 1,
  "topicName": "Product Information",
  "fileName": "acme-product-catalog-v2.pdf",
  "fileData": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDIgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDc5Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVEQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs1IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDEyMyAwMDAwMCBuIAowMDAwMDAwMjQ4IDAwMDAwIG4gCjAwMDAwMDAzMjcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MjEKJSVFT0YK",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "timestamp": "2025-01-21T12:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "fileData": {
    "id": 4,
    "fileName": "acme-product-catalog-v2.pdf",
    "googleDriveFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "googleDriveUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-01-21T12:00:00Z"
  },
  "message": "File uploaded successfully to knowledge base",
  "userRole": "admin",
  "permissions": {
    "all": true
  }
}
```

---

### **5. Availability Settings Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/availability-settings`

```json
{
  "tenantId": "ACME_INC",
  "userEmail": "admin@acme.com",
  "userRole": "admin",
  "permissions": {
    "all": true
  },
  "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  },
  "slotDuration": 30,
  "breakTimes": {
    "lunch_start": "12:00",
    "lunch_end": "13:00",
    "coffee_start": "15:00",
    "coffee_end": "15:15"
  },
  "timezone": "America/New_York",
  "minAdvanceMinutes": 120,
  "maxAdvanceDays": 30,
  "timestamp": "2025-01-21T12:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "availability": {
    "workingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "workingHours": {"start": "09:00", "end": "17:00"},
    "slotDuration": 30,
    "breakTimes": {
      "lunch_start": "12:00",
      "lunch_end": "13:00",
      "coffee_start": "15:00",
      "coffee_end": "15:15"
    },
    "timezone": "America/New_York",
    "minAdvanceMinutes": 120,
    "maxAdvanceDays": 30,
    "updatedAt": "2025-01-21T12:00:00Z"
  },
  "message": "Availability settings updated successfully",
  "userRole": "admin",
  "permissions": {
    "all": true
  }
}
```

---

### **6. Analytics Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/analytics`

```json
{
  "tenantId": "ACME_INC",
  "userEmail": "manager@acme.com",
  "userRole": "manager",
  "permissions": {
    "chat": true,
    "knowledge": true,
    "analytics": true
  },
  "websiteDomain": "acme.com",
  "pageUrl": "/products",
  "referrer": "https://google.com/search?q=acme+products",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "sessionId": "session_analytics_123",
  "eventType": "page_view",
  "eventData": {
    "product_id": "123",
    "category": "electronics",
    "page_load_time": 1.2,
    "scroll_depth": 75
  },
  "timestamp": "2025-01-21T12:00:00Z"
}
```

**Expected Response:**
```json
{
  "success": true,
  "analytics": {
    "eventId": "evt_789",
    "tenantId": "ACME_INC",
    "eventType": "page_view",
    "timestamp": "2025-01-21T12:00:00Z",
    "processed": true
  },
  "message": "Analytics event tracked successfully",
  "userRole": "manager",
  "permissions": {
    "chat": true,
    "knowledge": true,
    "analytics": true
  }
}
```

---

### **7. Admin Dashboard Webhook - Enhanced**
**Endpoint:** `POST https://n8ncloud.tech/webhook/admin-dashboard`

```json
{
  "tenantId": "ACME_INC",
  "userEmail": "admin@acme.com",
  "userRole": "admin",
  "permissions": {
    "all": true
  },
  "action": "update_branding",
  "timestamp": "2025-01-21T12:00:00Z",
  "data": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "logoUrl": "https://drive.google.com/file/d/new_logo_id/view",
    "avatarUrl": "https://drive.google.com/file/d/new_avatar_id/view",
    "welcomeMessage": "Welcome to ACME Corporation! How can I help you today?",
    "suggestedPrompts": [
      "What products do you offer?",
      "How can I contact support?",
      "What are your business hours?",
      "Can I schedule a demo?"
    ]
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "updatedData": {
    "primaryColor": "#3B82F6",
    "secondaryColor": "#1E40AF",
    "logoUrl": "https://drive.google.com/file/d/new_logo_id/view",
    "avatarUrl": "https://drive.google.com/file/d/new_avatar_id/view",
    "welcomeMessage": "Welcome to ACME Corporation! How can I help you today?",
    "suggestedPrompts": [
      "What products do you offer?",
      "How can I contact support?",
      "What are your business hours?",
      "Can I schedule a demo?"
    ],
    "updatedAt": "2025-01-21T12:00:00Z"
  },
  "message": "Branding settings updated successfully",
  "userRole": "admin",
  "permissions": {
    "all": true
  }
}
```

---

## 🎯 **User Role Permissions Matrix**

| User Role | Chat | Knowledge | Analytics | Admin | Description |
|-----------|------|-----------|-----------|-------|-------------|
| **admin** | ✅ | ✅ | ✅ | ✅ | Full access to everything |
| **manager** | ✅ | ✅ | ✅ | ❌ | Access to chat, knowledge, analytics |
| **user** | ✅ | ❌ | ❌ | ❌ | Access to chat only |
| **visitor** | ✅ | ❌ | ❌ | ❌ | Limited chat access |

---

## 🔧 **Testing Instructions**

### **Test Different User Types:**

1. **Admin User** (`admin@acme.com`)
   - Should see all data including user management
   - Can upload files, update settings, view analytics

2. **Manager User** (`manager@acme.com`)
   - Should see knowledge files and analytics
   - Cannot see user management data

3. **Regular User** (`user@acme.com`)
   - Should see only chat and basic knowledge files
   - Cannot see analytics or admin features

4. **Visitor** (`visitor@example.com`)
   - Should see only chat functionality
   - Limited access to other features

### **Success Criteria:**
- ✅ **Role-based data access** - Users see only what they're allowed
- ✅ **Permission validation** - Actions restricted by user role
- ✅ **Complete data sync** - All tables populated and accessible
- ✅ **Security** - No unauthorized data exposure

**These enhanced payloads provide complete multi-user functionality with proper role-based access control!** 🚀
