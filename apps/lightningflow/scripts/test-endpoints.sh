#!/bin/bash

# Lightning AI Platform - Endpoint Health Check
# Tests all major routes and API endpoints

BASE_URL="http://localhost:3000"
FAILED_TESTS=0
TOTAL_TESTS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Lightning AI Platform - Endpoint Health Check${NC}"
echo "=================================================="

# Function to test an endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $description... "
    
    # Make request and capture status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $status_code${NC}"
    else
        echo -e "${RED}❌ $status_code (expected $expected_status)${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test main application routes
echo -e "\n${YELLOW}📱 Main Application Routes${NC}"
test_endpoint "/" "200" "Home Page"
test_endpoint "/dashboard" "200" "Dashboard"
test_endpoint "/onboarding" "200" "Onboarding"
test_endpoint "/receive" "200" "Receive Payments"
test_endpoint "/send" "200" "Send Payments"
test_endpoint "/transactions" "200" "Transaction History"
test_endpoint "/payment-links" "200" "Payment Links"
test_endpoint "/channels" "200" "Lightning Channels"
test_endpoint "/settings" "200" "Settings"

# Test AI features
echo -e "\n${YELLOW}🤖 AI Features${NC}"
test_endpoint "/ai-assistant" "200" "AI Assistant"
test_endpoint "/lightning-intelligence" "200" "Lightning Intelligence"

# Test analytics
echo -e "\n${YELLOW}📊 Analytics${NC}"
test_endpoint "/analytics" "200" "Analytics Dashboard"
test_endpoint "/analytics/earnings" "200" "Earnings Analytics"

# Test guides and documentation
echo -e "\n${YELLOW}📚 Guides & Documentation${NC}"
test_endpoint "/guides" "200" "Guides"
test_endpoint "/trust-center" "200" "Trust Center"

# Test API endpoints (these might return different status codes)
echo -e "\n${YELLOW}🔌 API Endpoints${NC}"
test_endpoint "/api/system-check" "200" "System Health Check"
test_endpoint "/api/lightning/node-info" "200" "Lightning Node Info"

# Test special pages
echo -e "\n${YELLOW}🔧 Special Pages${NC}"
test_endpoint "/lightning-test" "200" "Lightning Test Harness"
test_endpoint "/tailwind-test" "200" "Tailwind Test Page"

# Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "=================================================="
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! ($PASSED_TESTS/$TOTAL_TESTS)${NC}"
    echo -e "${GREEN}✅ Your Lightning AI Platform is running perfectly!${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED_TESTS tests failed out of $TOTAL_TESTS${NC}"
    echo -e "${YELLOW}💡 Make sure your development server is running: npm run dev${NC}"
    exit 1
fi 