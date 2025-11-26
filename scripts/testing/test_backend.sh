#!/bin/bash

# Backend Testing Script for n8n Workflows
# Run this to test all 20 workflows

# Configuration - EDIT THESE VALUES
BASE_URL="https://your-n8n-instance.com"
TENANT_ID="julianna"
USER_EMAIL="test@julianna.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🧪 BACKEND TESTING SUITE - n8n Workflows"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Helper function to test endpoints
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -e "${BLUE}Testing:${NC} $name"
  
  if [ "$method" == "GET" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/$endpoint")
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL/$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $HTTP_CODE)"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC} (HTTP $HTTP_CODE)"
    echo "$BODY"
    ((FAILED++))
  fi
  echo ""
}

# Test 1: Authentication - Sign Up
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 1: Authentication System (Workflow #8)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "Sign Up" \
  "POST" \
  "webhook/auth" \
  '{
    "action": "signup",
    "email": "'$USER_EMAIL'",
    "password": "SecurePass123!",
    "tenantId": "'$TENANT_ID'",
    "userName": "Test User"
  }'

# Test 2: Chat AI Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 2: Chat AI Agent (Workflow #1)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "Chat Query" \
  "POST" \
  "webhook/chat-assets" \
  '{
    "tenantId": "'$TENANT_ID'",
    "userEmail": "'$USER_EMAIL'",
    "chatInput": "What assets do we have?"
  }'

# Test 3: Get Assets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 3: Asset Management (Workflow #3)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "Get Assets" \
  "GET" \
  "webhook/assets?tenantId=$TENANT_ID"

# Test 4: Create Asset
test_endpoint \
  "Create Asset" \
  "POST" \
  "webhook/assets" \
  '{
    "tenantId": "'$TENANT_ID'",
    "assetType": "equipment",
    "assetName": "Test HVAC System",
    "assetCategory": "HVAC",
    "location": {"building": "Test Building", "floor": "1"},
    "purchaseDate": "2024-01-15",
    "purchasePrice": 5000,
    "currentValue": 4500,
    "conditionStatus": "good",
    "status": "active",
    "manufacturer": "LG",
    "model": "AC-2024",
    "serialNumber": "SN-TEST-001"
  }'

# Test 5: Sustainability Dashboard
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 5: Sustainability Dashboard (Workflow #5)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "Get Sustainability Metrics" \
  "GET" \
  "webhook/sustainability/$TENANT_ID"

# Test 6: Compliance Alerts
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 6: Compliance Alerts (Workflow #6)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "Get Compliance Status" \
  "GET" \
  "webhook/compliance/$TENANT_ID"

# Test 7: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Test 7: Health Check (Workflow #13)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint \
  "System Health" \
  "GET" \
  "webhook/testing/health"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Passed:${NC} $PASSED"
echo -e "${RED}❌ Failed:${NC} $FAILED"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some tests failed. Check logs above.${NC}"
  exit 1
fi

