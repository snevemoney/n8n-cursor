# 🔍 **TABLE ANALYSIS & CLEANUP PLAN**

## 🚨 **Issues Found:**

### 1. **UNSECURED TABLES** (Security Risk)
- ❌ `documents_pg` - Has tenant_id but no RLS
- ❌ `platform_admins` - Platform admin data, no RLS  
- ❌ `search_memory_nodes` - Empty table, no RLS
- ❌ `user_folder_mapping` - Has tenant_id but no RLS

### 2. **REDUNDANT TABLES** (Data Duplication)
- ❌ `documents` - Contains PDF content (9 records)
- ❌ `documents_pg` - Contains vector embeddings (16 records) 
- ❌ `document_metadata` - Contains file metadata (10 records)

**Problem**: Same data stored in 3 different tables!

### 3. **EMPTY TABLES** (Unnecessary)
- ❌ `search_memory_nodes` - 0 records
- ❌ `website_analytics` - 0 records  
- ❌ `tickets` - 0 records
- ❌ `csat_feedback` - 0 records
- ❌ `domains` - 0 records
- ❌ `owners` - 0 records
- ❌ `user_sessions` - 0 records

### 4. **DATA DISTRIBUTION ISSUES**
- `n8n_chat_histories` - 136 records but no tenant_id visible
- `analytics` - 1 record for ACME_INC only
- `client_overview` - 2 records (ACME_INC, PLATFORM_MASTER)

## 🔧 **CLEANUP PLAN:**

### **Phase 1: Fix Security Issues**
1. Enable RLS on unsecured tables
2. Create proper RLS policies
3. Add tenant_id to tables that need it

### **Phase 2: Consolidate Redundant Tables**
1. Keep `document_metadata` as primary table
2. Merge `documents` and `documents_pg` data
3. Drop redundant tables

### **Phase 3: Clean Empty Tables**
1. Drop truly empty tables
2. Keep tables that will be used in production

### **Phase 4: Fix Data Distribution**
1. Add tenant_id to `n8n_chat_histories`
2. Ensure all tenant-specific data has proper tenant_id

## 📊 **CURRENT TABLE STATUS:**

| Table | Records | RLS | Tenant ID | Status | Action Needed |
|-------|---------|-----|-----------|--------|---------------|
| `document_metadata` | 10 | ✅ | ✅ | **GOOD** | Keep as primary |
| `document_rows` | 0 | ✅ | ✅ | **GOOD** | Keep |
| `documents` | 9 | ✅ | ❌ | **REDUNDANT** | Merge & drop |
| `documents_pg` | 16 | ❌ | ✅ | **REDUNDANT** | Merge & drop |
| `platform_admins` | 4 | ❌ | ❌ | **UNSECURED** | Add RLS |
| `search_memory_nodes` | 0 | ❌ | ❌ | **EMPTY** | Drop |
| `user_folder_mapping` | 2 | ❌ | ✅ | **UNSECURED** | Add RLS |
| `n8n_chat_histories` | 136 | ✅ | ❌ | **MISSING TENANT** | Add tenant_id |
| `website_analytics` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |
| `tickets` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |
| `csat_feedback` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |
| `analytics` | 1 | ✅ | ✅ | **GOOD** | Keep |
| `domains` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |
| `owners` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |
| `client_overview` | 2 | ✅ | ✅ | **GOOD** | Keep |
| `user_sessions` | 0 | ✅ | ✅ | **EMPTY** | Keep for future |

## 🎯 **RECOMMENDED ACTIONS:**

### **Immediate (Security)**
1. Enable RLS on `platform_admins` and `user_folder_mapping`
2. Add tenant_id to `n8n_chat_histories`

### **Data Consolidation**
1. Merge `documents` and `documents_pg` into `document_metadata`
2. Drop redundant tables

### **Cleanup**
1. Drop `search_memory_nodes` (empty)
2. Keep empty tables for future use

**Would you like me to proceed with the cleanup?**
