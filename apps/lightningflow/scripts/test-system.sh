#!/bin/bash

# Lightning AI Platform - Comprehensive System Test
# Validates pages, APIs, TypeScript, and redirect schema

set -e  # Exit on any error

BASE_URL="http://localhost:3000"
FAILED_TESTS=0
TOTAL_TESTS=0
TEST_RESULTS=()

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Lightning AI Platform - Comprehensive System Test${NC}"
echo "=================================================================="

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        TEST_RESULTS+=("✅ $test_name")
    else
        echo -e "${RED}❌ $test_name${NC}"
        if [ -n "$details" ]; then
            echo -e "${RED}   └─ $details${NC}"
        fi
        TEST_RESULTS+=("❌ $test_name: $details")
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test an endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local description="$3"
    
    echo -n "Testing $description... "
    
    # Make request and capture status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url" 2>/dev/null || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        log_test "$description" "PASS"
    else
        log_test "$description" "FAIL" "Expected $expected_status, got $status_code"
    fi
}

# 1. TypeScript Compilation Check
echo -e "\n${PURPLE}🔧 TypeScript Compilation${NC}"
echo "----------------------------------------"

echo -n "Checking TypeScript compilation... "
if cd web && npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    log_test "TypeScript Compilation" "PASS"
    cd ..
else
    log_test "TypeScript Compilation" "FAIL" "TypeScript errors found"
    cd ..
fi

# 2. ESLint Check
echo -e "\n${PURPLE}📝 Code Quality (ESLint)${NC}"
echo "----------------------------------------"

echo -n "Running ESLint... "
if cd web && npx eslint . --ext .ts,.tsx --max-warnings 0 > /dev/null 2>&1; then
    log_test "ESLint Check" "PASS"
    cd ..
else
    log_test "ESLint Check" "FAIL" "Linting errors found"
    cd ..
fi

# 3. Redirect Schema Validation
echo -e "\n${PURPLE}🗺️  Redirect Schema Validation${NC}"
echo "----------------------------------------"

# Check if redirect map file exists and is valid
if [ -f "web/src/lib/redirect-map.ts" ]; then
    # Try to import and validate the redirect map
    if node -e "
        const fs = require('fs');
        const content = fs.readFileSync('web/src/lib/redirect-map.ts', 'utf8');
        if (content.includes('export const redirectMap') && content.includes('RedirectAction')) {
            console.log('Redirect map structure valid');
            process.exit(0);
        } else {
            console.log('Invalid redirect map structure');
            process.exit(1);
        }
    " > /dev/null 2>&1; then
        log_test "Redirect Schema Structure" "PASS"
    else
        log_test "Redirect Schema Structure" "FAIL" "Invalid redirect map structure"
    fi
else
    log_test "Redirect Schema Structure" "FAIL" "Redirect map file not found"
fi

# 4. Environment Variables Check
echo -e "\n${PURPLE}🔐 Environment Configuration${NC}"
echo "----------------------------------------"

# Check for required environment variables
required_vars=("NODE_ENV")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    log_test "Environment Variables" "PASS"
else
    log_test "Environment Variables" "FAIL" "Missing: ${missing_vars[*]}"
fi

# 5. Development Server Check
echo -e "\n${PURPLE}🚀 Development Server Health${NC}"
echo "----------------------------------------"

# Check if server is running
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    log_test "Development Server Running" "PASS"
else
    log_test "Development Server Running" "FAIL" "Server not responding"
    echo -e "${YELLOW}💡 Start the server with: npm run dev${NC}"
    exit 1
fi

# 6. Core Application Routes
echo -e "\n${YELLOW}📱 Core Application Routes${NC}"
echo "----------------------------------------"

test_endpoint "/" "200" "Home Page"
test_endpoint "/dashboard" "200" "Dashboard"
test_endpoint "/onboarding" "200" "Onboarding"
test_endpoint "/receive" "200" "Receive Payments"
test_endpoint "/send" "200" "Send Payments"
test_endpoint "/transactions" "200" "Transaction History"
test_endpoint "/payment-links" "200" "Payment Links"
test_endpoint "/channels" "200" "Lightning Channels"
test_endpoint "/settings" "200" "Settings"

# 7. AI Features
echo -e "\n${YELLOW}🤖 AI Features${NC}"
echo "----------------------------------------"

test_endpoint "/ai-assistant" "200" "AI Assistant"
test_endpoint "/lightning-intelligence" "200" "Lightning Intelligence"

# 8. Analytics
echo -e "\n${YELLOW}📊 Analytics${NC}"
echo "----------------------------------------"

test_endpoint "/analytics" "200" "Analytics Dashboard"
test_endpoint "/analytics/earnings" "200" "Earnings Analytics"

# 9. Security & Trust
echo -e "\n${YELLOW}🔐 Security & Trust${NC}"
echo "----------------------------------------"

test_endpoint "/trust-center" "200" "Trust Center"
test_endpoint "/backups" "200" "Backup Vault"

# 10. API Endpoints
echo -e "\n${YELLOW}🔌 API Endpoints${NC}"
echo "----------------------------------------"

test_endpoint "/api/system-check" "200" "System Health Check"
test_endpoint "/api/lightning/node-info" "200" "Lightning Node Info"

# 11. Special Pages
echo -e "\n${YELLOW}🔧 Special Pages${NC}"
echo "----------------------------------------"

test_endpoint "/lightning-test" "200" "Lightning Test Harness"
test_endpoint "/tailwind-test" "200" "Tailwind Test Page"

# 12. Error Handling
echo -e "\n${YELLOW}🚨 Error Handling${NC}"
echo "----------------------------------------"

test_endpoint "/non-existent-page" "404" "404 Error Page"

# 13. Security Headers Check
echo -e "\n${PURPLE}🛡️  Security Headers${NC}"
echo "----------------------------------------"

security_headers=$(curl -s -I "$BASE_URL" | grep -E "(X-Frame-Options|X-Content-Type-Options|Referrer-Policy)" | wc -l)
if [ "$security_headers" -gt 0 ]; then
    log_test "Security Headers Present" "PASS"
else
    log_test "Security Headers Present" "FAIL" "Missing security headers"
fi

# 14. Performance Check
echo -e "\n${PURPLE}⚡ Performance Check${NC}"
echo "----------------------------------------"

# Measure response time for dashboard
response_time=$(curl -o /dev/null -s -w "%{time_total}" "$BASE_URL/dashboard")
if (( $(echo "$response_time < 2.0" | bc -l) )); then
    log_test "Dashboard Response Time" "PASS"
else
    log_test "Dashboard Response Time" "FAIL" "Response time: ${response_time}s (>2s)"
fi

# 15. Bundle Size Check (if build exists)
echo -e "\n${PURPLE}📦 Bundle Analysis${NC}"
echo "----------------------------------------"

if [ -d ".next" ]; then
    # Check if .next/static exists and has reasonable size
    if [ -d ".next/static" ]; then
        static_size=$(du -sh .next/static 2>/dev/null | cut -f1)
        log_test "Build Artifacts Present" "PASS" "Static size: $static_size"
    else
        log_test "Build Artifacts Present" "FAIL" "No static build found"
    fi
else
    log_test "Build Artifacts Present" "SKIP" "No build directory found"
fi

# Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "=================================================================="
PASSED_TESTS=$((TOTAL_TESTS - FAILED_TESTS))

echo -e "${CYAN}Total Tests: $TOTAL_TESTS${NC}"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Your Lightning AI Platform is solid!${NC}"
    echo -e "${GREEN}✅ System is ready for development and deployment${NC}"
    exit 0
else
    echo -e "\n${RED}❌ $FAILED_TESTS tests failed${NC}"
    echo -e "${YELLOW}💡 Review the failed tests above and fix the issues${NC}"
    
    # Show failed tests summary
    echo -e "\n${YELLOW}Failed Tests Summary:${NC}"
    for result in "${TEST_RESULTS[@]}"; do
        if [[ $result == ❌* ]]; then
            echo -e "${RED}  $result${NC}"
        fi
    done
    
    exit 1
fi 