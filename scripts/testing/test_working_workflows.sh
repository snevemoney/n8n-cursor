#!/bin/bash
BASE_URL="https://n8ncloud.tech"

echo "🧪 Testing Working Workflows"
echo "================================"

# Test 1: Compliance
echo -e "\n1️⃣  Testing Compliance..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/compliance" \
  -H "Content-Type: application/json" \
  -d '{"type":"gdpr","tenantId":"test-tenant","action":"export"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 2: Authentication
echo -e "\n2️⃣  Testing Authentication..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/auth" \
  -H "Content-Type: application/json" \
  -d '{"action":"login","email":"test@test.com","password":"test123"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 3: Security Monitoring
echo -e "\n3️⃣  Testing Security Monitoring..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/security" \
  -H "Content-Type: application/json" \
  -d '{"action":"rate-limit","tenantId":"test-tenant","userId":"user123"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 4: Analytics
echo -e "\n4️⃣  Testing Analytics..."
RESPONSE=$(curl -s -X GET "$BASE_URL/webhook/analytics?tenantId=test-tenant&query.type=response-time" \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 5: Testing Framework
echo -e "\n5️⃣  Testing Framework..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/testing" \
  -H "Content-Type: application/json" \
  -d '{"type":"smoke","tenantId":"test-tenant"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 6: Compliance Audit
echo -e "\n6️⃣  Testing Compliance Audit..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/compliance" \
  -H "Content-Type: application/json" \
  -d '{"type":"audit-log","tenantId":"test-tenant"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 7: API Key Management
echo -e "\n7️⃣  Testing API Key Management..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/api-keys" \
  -H "Content-Type: application/json" \
  -d '{"action":"create","tenantId":"test-tenant","keyName":"test-key"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 8: Backup & Restore
echo -e "\n8️⃣  Testing Backup & Restore..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/backup" \
  -H "Content-Type: application/json" \
  -d '{"action":"schedule-daily","tenantId":"test-tenant"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 9: Advanced Analytics
echo -e "\n9️⃣  Testing Advanced Analytics..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/advanced" \
  -H "Content-Type: application/json" \
  -d '{"type":"multi-language","tenantId":"test-tenant"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 10: Emergency Response
echo -e "\n🔟 Testing Emergency Response..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/emergency" \
  -H "Content-Type: application/json" \
  -d '{"type":"escalate","tenantId":"test-tenant","priority":"high"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

# Test 11: Error Recovery
echo -e "\n1️⃣1️⃣  Testing Error Recovery..."
RESPONSE=$(curl -s -X POST "$BASE_URL/webhook/error-recovery" \
  -H "Content-Type: application/json" \
  -d '{"action":"retry","tenantId":"test-tenant","executionId":"12345"}' \
  -w "\nHTTP:%{http_code}")
echo "$RESPONSE" | head -2

echo -e "\n✅ Testing Complete!"
