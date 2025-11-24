# Data Connections Audit

## Summary
This document tracks all data connections between UI pages and their respective API endpoints, identifying where data is missing or not displaying correctly.

## Pages with Data (Working)

### ✅ Agents Page (`/agents`)
- **API Endpoint**: `/api/agents`
- **API Status**: ✅ Returns 9 agents
- **UI Status**: ⚠️ Shows "All (0)" - **DATA NOT LOADING IN UI**
- **Issue**: API returns data but UI shows empty state
- **Fix Needed**: Check data fetching logic in `apps/scorpion/app/(scorpion)/agents/page.tsx`

### ✅ Ontology Page (`/ontology`)
- **API Endpoint**: `/api/ontology`
- **API Status**: ✅ Returns 7 entities
- **UI Status**: ✅ Page loads and displays search interface
- **Status**: Working

### ✅ Council Page (`/council`)
- **API Endpoint**: `/api/council`
- **API Status**: ✅ Returns 9 members
- **UI Status**: ✅ Page loads with council interface
- **Status**: Working

### ✅ Research Page (`/research`)
- **API Endpoint**: `/api/research/history`
- **API Status**: ✅ Returns 17 history items
- **UI Status**: ✅ Shows "Show History (17)"
- **Status**: Working

## Pages with No Data (Empty States - Expected or Needs Data Generation)

### ❌ Workflows Page (`/workflows`)
- **API Endpoint**: `/api/workflows`
- **API Status**: Returns 0 workflows (empty array)
- **UI Status**: Shows empty state with "No workflows found"
- **Status**: Empty state is correct - no workflows exist yet
- **Action**: This is expected if no workflows have been created

### ❌ Notifications Page (`/notifications`)
- **API Endpoint**: `/api/notifications`
- **API Status**: Returns 0 unread notifications
- **UI Status**: Shows empty state "No unread notifications"
- **Status**: Empty state is correct - no notifications exist
- **Action**: This is expected if no notifications have been generated

### ❌ Operations Page (`/ops`)
- **API Endpoint**: `/api/operations`
- **API Status**: Returns 0 operations
- **UI Status**: Shows operations interface but no data
- **Status**: Empty state is correct - no operations exist
- **Action**: This is expected if no operations have been executed

### ❌ Knowledge Page (`/knowledge`)
- **API Endpoint**: `/api/project/knowledge`
- **API Status**: Returns 0 knowledge items
- **UI Status**: Shows empty state
- **Status**: Empty state is correct - RAG store may not be initialized or empty
- **Action**: This is expected if knowledge base hasn't been populated

### ❌ Selling Page (`/selling`)
- **API Endpoint**: `/api/selling`
- **API Status**: Returns 0 products
- **UI Status**: Shows "Create Your First Product" empty state
- **Status**: Empty state is correct - no products exist
- **Action**: This is expected if no products have been created

## Critical Issues Found

### 🔴 Issue #1: Agents Page Data Not Loading
- **Problem**: API returns 9 agents but UI shows "All (0)"
- **Location**: `apps/scorpion/app/(scorpion)/agents/page.tsx`
- **Likely Cause**: Data fetching logic not properly updating state, or API response format mismatch
- **Priority**: HIGH - Data exists but not displaying

### ⚠️ Issue #2: Next.js Static Assets 404 Errors
- **Problem**: Multiple 404 errors for CSS and JS files
- **Impact**: May prevent JavaScript from executing, causing data fetching to fail
- **Files Affected**: 
  - `/next/static/css/app/layout.css`
  - `/next/static/css/app/(scorpion)/layout.css`
  - `/next/static/css/app/(scorpion)/council/page.css`
  - `/next/static/chunks/app/error.js`
  - `/next/static/chunks/app-pages-internals.js`
  - And more...
- **Priority**: MEDIUM - May be causing data loading issues

## Recommendations

1. **Fix Agents Page Data Loading**: Investigate why `agents.length` is 0 in UI when API returns 9 agents
2. **Check Next.js Build**: Verify that static assets are being generated correctly
3. **Verify API Response Format**: Ensure UI components are reading the correct response structure
4. **Add Error Handling**: Improve error handling for failed data fetches
5. **Add Loading States**: Ensure loading states are properly managed during data fetching

## Next Steps

1. Fix the Agents page data loading issue
2. Investigate Next.js static asset 404 errors
3. Test all pages after fixes to ensure data displays correctly
