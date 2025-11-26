# 🚀 SAAS Master Database Setup Complete!

## ✅ What's Been Set Up

### 1. **Master Database Structure**
- **`saas_chatbot`** files are now assigned to `PLATFORM_MASTER` tenant
- **Platform admin user** created: `admin@yourplatform.com`
- **Tenant isolation** enforced with Row-Level Security (RLS)

### 2. **New Functions Created**
- `get_tenant_knowledge_base(tenant_id)` - Get files for specific tenant
- `add_file_to_tenant_knowledge_base()` - Add files to tenant knowledge base
- `get_platform_master_data()` - Get platform-wide statistics
- `validate_tenant_file_upload()` - Validate file uploads

### 3. **Database Tables**
- ✅ `platform_admins` - For platform administrators
- ✅ `tenants` - With `PLATFORM_MASTER` tenant
- ✅ `users` - With platform admin user
- ✅ `document_metadata` - With saas_chatbot files
- ✅ `knowledge_base_files` - For tenant-specific files

## 🔧 N8N Workflow Fixes Needed

### **Fix 1: "Insert Table Rows" Node**
**Current Issue**: Processing admin data instead of document data

**Fix**: Change the SQL query to:
```sql
-- For admin data (if this node should handle admin data)
INSERT INTO platform_admins (admin_id, admin_name, admin_email, role, permissions, is_active, created_at)
VALUES (
  '{{ $json.adminId }}',
  '{{ $json.adminName }}',
  '{{ $json.adminEmail }}',
  '{{ $json.role }}',
  '{{ $json.permissions }}',
  {{ $json.isActive }},
  '{{ $json.createdAt }}'
)
ON CONFLICT (admin_id) DO UPDATE SET
  admin_name = EXCLUDED.admin_name,
  admin_email = EXCLUDED.admin_email,
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active;
```

### **Fix 2: "Create Document Metadata Table" Node**
**Current Issue**: Trying to CREATE TABLE instead of INSERT data

**Fix**: Change the SQL query to:
```sql
INSERT INTO document_metadata (id, title, url, created_at, schema, tenant_id, user_id)
VALUES (
  '{{ $json.file_id }}',
  '{{ $json.file_title }}',
  '{{ $json.file_url }}',
  NOW(),
  '{{ $json.schema }}',
  '{{ $json.tenant_id }}',
  '{{ $json.user_id }}'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  url = EXCLUDED.url,
  schema = EXCLUDED.schema,
  tenant_id = EXCLUDED.tenant_id,
  user_id = EXCLUDED.user_id;
```

### **Fix 3: "Create Document Rows Table" Node**
**Current Issue**: Trying to CREATE TABLE instead of INSERT data

**Fix**: Change the SQL query to:
```sql
INSERT INTO document_rows (dataset_id, row_data, tenant_id, user_id)
VALUES (
  '{{ $json.file_id }}',
  '{{ $json.row_data }}'::jsonb,
  '{{ $json.tenant_id }}',
  '{{ $json.user_id }}'
);
```

## 🎯 How Tenant File Uploads Work Now

### **For Tenant Files**:
1. **File uploaded** → Webhook receives `tenantId`, `fileId`, `fileName`, etc.
2. **Validate tenant** → Check if tenant exists and is active
3. **Add to knowledge base** → Use `add_file_to_tenant_knowledge_base()` function
4. **Process content** → Extract and store in `document_rows` table
5. **Tenant isolation** → Files are automatically isolated by `tenant_id`

### **For Platform Master Data**:
1. **saas_chatbot files** → Assigned to `PLATFORM_MASTER` tenant
2. **Platform admin access** → Can see all tenant data
3. **Master functions** → Use `get_platform_master_data()` for statistics

## 📊 Testing the Setup

### **Test 1: Check Platform Master Data**
```sql
SELECT * FROM get_platform_master_data();
```

### **Test 2: Check Tenant Knowledge Base**
```sql
SELECT * FROM get_tenant_knowledge_base('ACME_INC');
```

### **Test 3: Add File to Tenant**
```sql
SELECT add_file_to_tenant_knowledge_base(
  'ACME_INC',
  'test_file_123',
  'Test Document.pdf',
  'https://drive.google.com/file/d/test_file_123',
  'application/pdf',
  'admin@acme.com'
);
```

## 🚨 Next Steps

1. **Fix the n8n workflow nodes** with the SQL queries above
2. **Test file upload** for a specific tenant
3. **Verify tenant isolation** works correctly
4. **Process the saas_chatbot sheet** to populate `document_rows`

## 📋 Webhook Payload Examples

### **Tenant File Upload**:
```json
{
  "tenantId": "ACME_INC",
  "fileId": "1abc123def456",
  "fileName": "Company Policies.pdf",
  "fileUrl": "https://drive.google.com/file/d/1abc123def456",
  "fileType": "application/pdf",
  "userId": "admin@acme.com"
}
```

### **Platform Admin Access**:
```json
{
  "tenantId": "PLATFORM_MASTER",
  "action": "get_platform_stats"
}
```

Your SAAS is now properly configured with tenant isolation and master database structure! 🎉
