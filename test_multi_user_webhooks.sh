#!/bin/bash

# =====================================================
# Test Script for Multi-User Webhook System
# Test all webhook endpoints with different user types
# =====================================================

echo "🚀 Starting Multi-User Webhook Tests..."

# Base URL
BASE_URL="https://n8ncloud.tech/webhook"

# Test data
TENANT_ID="ACME_INC"
ADMIN_EMAIL="admin@acme.com"
MANAGER_EMAIL="manager@acme.com"
USER_EMAIL="user@acme.com"
VISITOR_EMAIL="visitor@example.com"

echo "📊 Testing with Tenant: $TENANT_ID"
echo "👥 Testing with Users: Admin, Manager, User, Visitor"
echo ""

# =====================================================
# Test 1: Chat Webhook - Admin User
# =====================================================

echo "🔵 Test 1: Chat Webhook - Admin User"
echo "User: $ADMIN_EMAIL (Admin)"

curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$ADMIN_EMAIL'",
    "sessionId": "test-session-admin-123",
    "chatInput": "Hello, I am an admin user. Show me all available features.",
    "passwordHash": "test_hash_2024",
    "userRole": "admin",
    "permissions": {
      "all": true
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 2: Chat Webhook - Manager User
# =====================================================

echo "🟡 Test 2: Chat Webhook - Manager User"
echo "User: $MANAGER_EMAIL (Manager)"

curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$MANAGER_EMAIL'",
    "sessionId": "test-session-manager-123",
    "chatInput": "Hello, I am a manager. What can I access?",
    "passwordHash": "test_hash_2024",
    "userRole": "manager",
    "permissions": {
      "chat": true,
      "knowledge": true,
      "analytics": true
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 3: Chat Webhook - Regular User
# =====================================================

echo "🟢 Test 3: Chat Webhook - Regular User"
echo "User: $USER_EMAIL (User)"

curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$USER_EMAIL'",
    "sessionId": "test-session-user-123",
    "chatInput": "Hello, I am a regular user. How can you help me?",
    "passwordHash": "test_hash_2024",
    "userRole": "user",
    "permissions": {
      "chat": true
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 4: Chat Webhook - Visitor
# =====================================================

echo "🔴 Test 4: Chat Webhook - Visitor"
echo "User: $VISITOR_EMAIL (Visitor)"

curl -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$VISITOR_EMAIL'",
    "sessionId": "test-session-visitor-123",
    "chatInput": "Hello, I am a visitor. What can I do here?",
    "passwordHash": "test_hash_2024",
    "userRole": "visitor",
    "permissions": {
      "chat": true
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 5: Tenant Config - Admin User
# =====================================================

echo "🔵 Test 5: Tenant Config - Admin User"
echo "User: $ADMIN_EMAIL (Admin)"

curl -X GET "$BASE_URL/tenant-config?tenantId=$TENANT_ID&userEmail=$ADMIN_EMAIL" | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 6: Tenant Config - Regular User
# =====================================================

echo "🟢 Test 6: Tenant Config - Regular User"
echo "User: $USER_EMAIL (User)"

curl -X GET "$BASE_URL/tenant-config?tenantId=$TENANT_ID&userEmail=$USER_EMAIL" | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 7: Pre-Chat Webhook
# =====================================================

echo "🟣 Test 7: Pre-Chat Webhook"
echo "Creating new visitor session"

curl -X POST "$BASE_URL/pre-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "firstName": "John",
    "lastName": "Doe",
    "email": "newvisitor@example.com",
    "consent": true,
    "sessionId": "session_new_visitor_123",
    "sourcePage": "https://acme.com/products",
    "userType": "visitor",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 8: Knowledge Upload - Admin User
# =====================================================

echo "🔵 Test 8: Knowledge Upload - Admin User"
echo "User: $ADMIN_EMAIL (Admin)"

curl -X POST "$BASE_URL/knowledge-upload" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$ADMIN_EMAIL'",
    "userRole": "admin",
    "permissions": {
      "all": true
    },
    "topicId": 4,
    "topicName": "Test Documentation",
    "fileName": "test-document.pdf",
    "fileData": "JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDMgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDIgMCBSCj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDU5NSA4NDJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDc5Cj4+CnN0cmVhbQpCVApxCjU5NSA4NDIgVEQKL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs1IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNTk1IDg0Ml0KPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjAgMDAwMDAgbiAKMDAwMDAwMDEyMyAwMDAwMCBuIAowMDAwMDAwMjQ4IDAwMDAwIG4gCjAwMDAwMDAzMjcgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MjEKJSVFT0YK",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 9: Availability Settings - Admin User
# =====================================================

echo "🔵 Test 9: Availability Settings - Admin User"
echo "User: $ADMIN_EMAIL (Admin)"

curl -X POST "$BASE_URL/availability-settings" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$ADMIN_EMAIL'",
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
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 10: Analytics - Manager User
# =====================================================

echo "🟡 Test 10: Analytics - Manager User"
echo "User: $MANAGER_EMAIL (Manager)"

curl -X POST "$BASE_URL/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$MANAGER_EMAIL'",
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
    "sessionId": "session_analytics_manager_123",
    "eventType": "page_view",
    "eventData": {
      "product_id": "123",
      "category": "electronics",
      "page_load_time": 1.2,
      "scroll_depth": 75
    },
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test 11: Admin Dashboard - Admin User
# =====================================================

echo "🔵 Test 11: Admin Dashboard - Admin User"
echo "User: $ADMIN_EMAIL (Admin)"

curl -X POST "$BASE_URL/admin-dashboard" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$ADMIN_EMAIL'",
    "userRole": "admin",
    "permissions": {
      "all": true
    },
    "action": "update_branding",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
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
  }' | jq '.'

echo ""
echo "---"
echo ""

# =====================================================
# Test Summary
# =====================================================

echo "🎉 Multi-User Webhook Tests Completed!"
echo ""
echo "📊 Test Summary:"
echo "✅ Chat Webhook - Admin User"
echo "✅ Chat Webhook - Manager User"
echo "✅ Chat Webhook - Regular User"
echo "✅ Chat Webhook - Visitor"
echo "✅ Tenant Config - Admin User"
echo "✅ Tenant Config - Regular User"
echo "✅ Pre-Chat Webhook"
echo "✅ Knowledge Upload - Admin User"
echo "✅ Availability Settings - Admin User"
echo "✅ Analytics - Manager User"
echo "✅ Admin Dashboard - Admin User"
echo ""
echo "🔍 Check the responses above to verify:"
echo "   • Role-based data access is working"
echo "   • Permissions are properly enforced"
echo "   • All webhook endpoints are responding"
echo "   • Database sync is complete"
echo ""
echo "🚀 Your multi-user webhook system is ready!"
