#!/bin/bash
# 🦂 Scorpion DevOps Health Check
# Comprehensive validation of all integrations, services, and configurations

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCORPION_PORT=${SCORPION_PORT:-3003}
SCORPION_URL="http://localhost:${SCORPION_PORT}"
TIMEOUT=5

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
}

# Check if curl/jq are available
check_deps() {
    if ! command -v curl &> /dev/null; then
        fail "curl is required but not installed"
        exit 1
    fi
    if ! command -v jq &> /dev/null; then
        warn "jq not found - JSON parsing will be limited"
    fi
}

# HTTP check helper
http_check() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-$TIMEOUT}
    
    local response=$(curl -s -w "\n%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo -e "\n000")
    local body=$(echo "$response" | head -n -1)
    local status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        return 1
    fi
}

# Main checks
section "1. SERVICE AVAILABILITY"

# Check if Scorpion is running
if http_check "${SCORPION_URL}/healthz" 200 2 >/dev/null; then
    pass "Scorpion service is running on port ${SCORPION_PORT}"
else
    fail "Scorpion service is NOT running on port ${SCORPION_PORT}"
    info "Start with: cd apps/scorpion && pnpm dev"
fi

section "2. HEALTH ENDPOINTS"

# Comprehensive health check
health_response=$(http_check "${SCORPION_URL}/api/health" 200 10 2>/dev/null || echo "")
if [ -n "$health_response" ]; then
    if command -v jq &> /dev/null; then
        status=$(echo "$health_response" | jq -r '.data.status // "unknown"' 2>/dev/null || echo "unknown")
        healthy=$(echo "$health_response" | jq -r '.data.summary.healthy // 0' 2>/dev/null || echo "0")
        errors=$(echo "$health_response" | jq -r '.data.summary.errors // 0' 2>/dev/null || echo "0")
        
        if [ "$status" = "healthy" ]; then
            pass "Health check: ${status} (${healthy} systems healthy, ${errors} errors)"
        elif [ "$status" = "degraded" ]; then
            warn "Health check: ${status} (${healthy} systems healthy, ${errors} errors)"
        else
            fail "Health check: ${status} (${healthy} systems healthy, ${errors} errors)"
        fi
    else
        pass "Health endpoint responding"
    fi
else
    fail "Health endpoint not responding"
fi

# n8n health check
n8n_health=$(http_check "${SCORPION_URL}/api/n8n-health" 200 5 2>/dev/null || echo "")
if [ -n "$n8n_health" ]; then
    if command -v jq &> /dev/null; then
        healthy=$(echo "$n8n_health" | jq -r '.data.healthy // false' 2>/dev/null || echo "false")
        if [ "$healthy" = "true" ]; then
            pass "n8n integration: Connected and healthy"
        else
            warn "n8n integration: Configured but connection issue"
        fi
    else
        pass "n8n health endpoint responding"
    fi
else
    warn "n8n health endpoint not responding (n8n may not be configured)"
fi

section "3. CONFIGURATION VALIDATION"

# Check environment file exists
if [ -f "apps/scorpion/.env.local" ]; then
    pass ".env.local file exists"
    
    # Check critical env vars (without exposing values)
    if grep -q "N8N_API_KEY" apps/scorpion/.env.local 2>/dev/null; then
        api_key=$(grep "N8N_API_KEY" apps/scorpion/.env.local | cut -d '=' -f2 | tr -d ' ' | head -1)
        if [ -n "$api_key" ] && [ ${#api_key} -gt 50 ]; then
            pass "N8N_API_KEY is configured (length: ${#api_key})"
        else
            warn "N8N_API_KEY appears to be placeholder or too short"
        fi
    else
        warn "N8N_API_KEY not found in .env.local"
    fi
    
    if grep -q "OLLAMA_URL" apps/scorpion/.env.local 2>/dev/null; then
        pass "OLLAMA_URL is configured"
    else
        info "OLLAMA_URL not set (using default: http://localhost:11434)"
    fi
else
    warn ".env.local file not found (using defaults)"
fi

section "4. CORE INTEGRATIONS"

# Check shared stores integration
project_status=$(http_check "${SCORPION_URL}/api/project/status" 200 10 2>/dev/null || echo "")
if [ -n "$project_status" ]; then
    if command -v jq &> /dev/null; then
        health=$(echo "$project_status" | jq -r '.data.overallHealth // "unknown"' 2>/dev/null || echo "unknown")
        workflows=$(echo "$project_status" | jq -r '.data.workflows.total // 0' 2>/dev/null || echo "0")
        knowledge=$(echo "$project_status" | jq -r '.data.knowledge.total // 0' 2>/dev/null || echo "0")
        
        if [ "$health" = "healthy" ]; then
            pass "Project status: ${health} (${workflows} workflows, ${knowledge} knowledge items)"
        else
            warn "Project status: ${health} (${workflows} workflows, ${knowledge} knowledge items)"
        fi
    else
        pass "Project status endpoint responding"
    fi
else
    fail "Project status endpoint not responding"
fi

# Check workflows endpoint
workflows_response=$(http_check "${SCORPION_URL}/api/workflows" 200 5 2>/dev/null || echo "")
if [ -n "$workflows_response" ]; then
    pass "Workflows API endpoint responding"
else
    fail "Workflows API endpoint not responding"
fi

section "5. STORAGE & PERSISTENCE"

# Check if data directory exists
if [ -d "apps/scorpion/data" ] || [ -d "/Volumes/SSD/scorpion-data" ]; then
    pass "Data storage directory exists"
else
    warn "Data storage directory not found (will be created on first run)"
fi

# Check backups directory
if [ -d "apps/scorpion/backups" ] || [ -d "/Volumes/SSD/scorpion-backups" ]; then
    backup_count=$(find apps/scorpion/backups -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
    if [ "$backup_count" -gt 0 ]; then
        pass "Backups directory exists (${backup_count} backup files found)"
    else
        info "Backups directory exists but empty"
    fi
else
    info "Backups directory not found (will be created on first backup)"
fi

section "6. API ENDPOINTS"

# Test critical endpoints
endpoints=(
    "/api/health"
    "/api/project/status"
    "/api/workflows"
    "/api/stats"
    "/api/notifications"
)

for endpoint in "${endpoints[@]}"; do
    if http_check "${SCORPION_URL}${endpoint}" 200 5 >/dev/null 2>&1; then
        pass "${endpoint} responding"
    else
        fail "${endpoint} not responding"
    fi
done

section "7. ERROR HANDLING & RESILIENCE"

# Check error handler exists
if [ -f "apps/scorpion/lib/api-error-handler.ts" ]; then
    pass "API error handler exists"
else
    fail "API error handler not found"
fi

# Check circuit breaker in n8n client
if grep -q "circuitBreaker" apps/scorpion/lib/mcp-n8n-client.ts 2>/dev/null; then
    pass "Circuit breaker implemented in n8n client"
else
    warn "Circuit breaker not found in n8n client"
fi

section "8. MONITORING & OBSERVABILITY"

# Check telemetry endpoint
telemetry_response=$(http_check "${SCORPION_URL}/api/telemetry/stream" 200 3 2>/dev/null || echo "")
if [ -n "$telemetry_response" ]; then
    pass "Telemetry stream endpoint responding"
else
    warn "Telemetry stream endpoint not responding (may require SSE connection)"
fi

# Check metrics endpoint
metrics_response=$(http_check "${SCORPION_URL}/api/metrics" 200 5 2>/dev/null || echo "")
if [ -n "$metrics_response" ]; then
    pass "Metrics endpoint responding"
else
    warn "Metrics endpoint not responding"
fi

section "9. SECURITY"

# Check for exposed secrets (basic check)
if grep -r "password.*=.*['\"].*password" apps/scorpion --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "example" | grep -v "test" | head -1 | grep -q .; then
    warn "Potential hardcoded passwords found (review code)"
else
    pass "No obvious hardcoded passwords detected"
fi

# Check API key validation
if grep -q "isConfigured\|validate.*api.*key" apps/scorpion/lib/mcp-n8n-client.ts 2>/dev/null; then
    pass "API key validation implemented"
else
    warn "API key validation may be missing"
fi

section "10. SUMMARY"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "Results:"
echo -e "  ${GREEN}Passed:${NC}  ${PASSED}"
echo -e "  ${YELLOW}Warnings:${NC} ${WARNINGS}"
echo -e "  ${RED}Failed:${NC}  ${FAILED}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✓ All checks passed!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠ Checks passed with warnings${NC}"
        exit 0
    fi
else
    echo -e "${RED}✗ Some checks failed${NC}"
    exit 1
fi
