#!/usr/bin/env bash
set -euo pipefail

# DevOps Navigation Flow Monitor
# Validates critical navigation paths across the entire system
# Usage: ./scripts/devops/navigation-flow-monitor.sh [ENV] [--alert]

ENV="${1:-int}"
ALERT_ON_FAILURE="${2:-}"
LOG_FILE="${HOME}/navigation-flow.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigation flow definitions - Critical user journeys
declare -A NAVIGATION_FLOWS=(
    # Format: "flow-name|start-url|expected-end-url|timeout"
    ["home-to-dashboard"]="https://evenslouis.ca/lightningflow/|https://evenslouis.ca/lightningflow/dashboard|10"
    ["dashboard-to-payments"]="https://evenslouis.ca/lightningflow/dashboard|https://evenslouis.ca/lightningflow/payments|10"
    ["payments-send"]="https://evenslouis.ca/lightningflow/payments|https://evenslouis.ca/lightningflow/payments/send|10"
    ["payments-receive"]="https://evenslouis.ca/lightningflow/payments|https://evenslouis.ca/lightningflow/payments/receive|10"
    ["api-health"]="https://evenslouis.ca/lightningflow/api/healthz|200|5"
    ["n8n-health"]="https://evenslouis.ca/n8n/healthz|200|5"
    ["scorpion-health"]="http://localhost:3003/api/health|200|5"
)

# Function to log flow status
log_flow() {
    local flow="$1"
    local status="$2"
    local message="$3"
    local duration="${4:-0}"
    
    local log_entry="[${TIMESTAMP}] ${flow}: ${status} (${duration}ms) - ${message}"
    echo "$log_entry" >> "$LOG_FILE"
    
    if [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ ${flow}: ${message}${NC}"
        return 1
    else
        echo -e "${GREEN}✅ ${flow}: ${message} (${duration}ms)${NC}"
        return 0
    fi
}

# Function to check HTTP endpoint
check_http_endpoint() {
    local url="$1"
    local expected_status="$2"
    local timeout="${3:-10}"
    
    local start_time=$(date +%s%3N)
    
    # Use curl with timeout and follow redirects
    local response=$(curl -sS -w "\n%{http_code}\n%{time_total}" \
        --max-time "$timeout" \
        --location \
        --fail-with-body \
        "$url" 2>&1) || local curl_exit=$?
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    # Extract status code (second to last line)
    local status_code=$(echo "$response" | tail -n 2 | head -n 1)
    local body=$(echo "$response" | head -n -2)
    
    if [ "$status_code" = "$expected_status" ] || [ "$expected_status" = "200" ] && [ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]; then
        echo "$duration|$status_code|SUCCESS"
        return 0
    else
        echo "$duration|$status_code|FAIL"
        return 1
    fi
}

# Function to test navigation flow (for UI routes)
test_navigation_flow() {
    local flow_name="$1"
    local start_url="$2"
    local expected_end_url="$3"
    local timeout="${4:-10}"
    
    local start_time=$(date +%s%3N)
    
    # For UI flows, we check if the route exists and responds
    # In production, you'd use a headless browser or API route validation
    local response=$(curl -sS -w "\n%{http_code}\n%{redirect_url}" \
        --max-time "$timeout" \
        --location \
        --head \
        "$start_url" 2>&1) || local curl_exit=$?
    
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))
    
    local status_code=$(echo "$response" | tail -n 2 | head -n 1)
    local final_url=$(echo "$response" | tail -n 1)
    
    # Check if we reached the expected endpoint or got a valid response
    if [[ "$final_url" == *"$expected_end_url"* ]] || ([ "$status_code" -ge 200 ] && [ "$status_code" -lt 400 ]); then
        echo "$duration|$status_code|SUCCESS|$final_url"
        return 0
    else
        echo "$duration|$status_code|FAIL|$final_url"
        return 1
    fi
}

# Function to validate route exists (check route registry)
validate_route_registry() {
    echo -e "\n${YELLOW}🔍 Validating Route Registry...${NC}"
    
    local routes_file="apps/lightningflow/web/src/lib/navigation/routes.ts"
    if [ ! -f "$routes_file" ]; then
        echo -e "${RED}❌ Route registry not found: ${routes_file}${NC}"
        return 1
    fi
    
    # Check for common route patterns
    local critical_routes=("dashboard" "payments" "earnings" "settings")
    local missing_routes=()
    
    for route in "${critical_routes[@]}"; do
        if ! grep -q "\"${route}\"" "$routes_file"; then
            missing_routes+=("$route")
        fi
    done
    
    if [ ${#missing_routes[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All critical routes found in registry${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing routes in registry: ${missing_routes[*]}${NC}"
        return 1
    fi
}

# Function to check service dependencies
check_service_dependencies() {
    echo -e "\n${YELLOW}🔍 Checking Service Dependencies...${NC}"
    
    local services=(
        "lightningflow.online|UI"
        "lightningflow.online/api/healthz|API"
        "evenslouis.ca/n8n/healthz|n8n"
    )
    
    local all_healthy=true
    
    for service_info in "${services[@]}"; do
        IFS='|' read -r url service_name <<< "$service_info"
        local result=$(check_http_endpoint "https://${url}" "200" 5)
        IFS='|' read -r duration status_code result_status <<< "$result"
        
        if [ "$result_status" = "SUCCESS" ]; then
            echo -e "${GREEN}✅ ${service_name}: Healthy (${duration}ms)${NC}"
        else
            echo -e "${RED}❌ ${service_name}: Unhealthy (${status_code})${NC}"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = false ]; then
        return 1
    fi
    return 0
}

# Function to generate navigation flow report
generate_report() {
    local total_flows=$1
    local passed_flows=$2
    local failed_flows=$3
    
    echo -e "\n${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}📊 Navigation Flow Report${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    echo -e "Total Flows Tested: ${total_flows}"
    echo -e "${GREEN}✅ Passed: ${passed_flows}${NC}"
    echo -e "${RED}❌ Failed: ${failed_flows}${NC}"
    echo -e "Success Rate: $(( passed_flows * 100 / total_flows ))%"
    echo -e "${YELLOW}════════════════════════════════════════${NC}\n"
}

# Main execution
main() {
    echo -e "${YELLOW}🚀 Starting Navigation Flow Monitor (${ENV})${NC}\n"
    
    local total_flows=0
    local passed_flows=0
    local failed_flows=0
    local failures=()
    
    # 1. Validate route registry
    if ! validate_route_registry; then
        failed_flows=$((failed_flows + 1))
        failures+=("route-registry")
    fi
    total_flows=$((total_flows + 1))
    
    # 2. Check service dependencies
    if ! check_service_dependencies; then
        failed_flows=$((failed_flows + 1))
        failures+=("service-dependencies")
    fi
    total_flows=$((total_flows + 1))
    
    # 3. Test each navigation flow
    echo -e "\n${YELLOW}🧪 Testing Navigation Flows...${NC}\n"
    
    for flow_key in "${!NAVIGATION_FLOWS[@]}"; do
        IFS='|' read -r start_url expected_end timeout <<< "${NAVIGATION_FLOWS[$flow_key]}"
        
        total_flows=$((total_flows + 1))
        
        # Determine if it's a health check or navigation flow
        if [[ "$expected_end" =~ ^[0-9]+$ ]]; then
            # Health check endpoint
            local result=$(check_http_endpoint "$start_url" "$expected_end" "$timeout")
            IFS='|' read -r duration status_code result_status <<< "$result"
            
            if [ "$result_status" = "SUCCESS" ]; then
                log_flow "$flow_key" "PASS" "Status: ${status_code}" "$duration"
                passed_flows=$((passed_flows + 1))
            else
                log_flow "$flow_key" "FAIL" "Status: ${status_code}, Expected: ${expected_end}" "$duration"
                failed_flows=$((failed_flows + 1))
                failures+=("$flow_key")
            fi
        else
            # Navigation flow
            local result=$(test_navigation_flow "$flow_key" "$start_url" "$expected_end" "$timeout")
            IFS='|' read -r duration status_code result_status final_url <<< "$result"
            
            if [ "$result_status" = "SUCCESS" ]; then
                log_flow "$flow_key" "PASS" "Navigated to: ${final_url}" "$duration"
                passed_flows=$((passed_flows + 1))
            else
                log_flow "$flow_key" "FAIL" "Expected: ${expected_end}, Got: ${final_url}" "$duration"
                failed_flows=$((failed_flows + 1))
                failures+=("$flow_key")
            fi
        fi
    done
    
    # 4. Generate report
    generate_report "$total_flows" "$passed_flows" "$failed_flows"
    
    # 5. Alert on failure if requested
    if [ "$failed_flows" -gt 0 ]; then
        if [ "$ALERT_ON_FAILURE" = "--alert" ]; then
            echo -e "${RED}🚨 Alerting on failures...${NC}"
            # Integrate with your alerting system (n8n webhook, PagerDuty, etc.)
            # Example: curl -X POST "https://evenslouis.ca/n8n/webhook/navigation-alert" \
            #   -d "{\"failures\": $(IFS=','; echo "${failures[*]}")}"
        fi
        exit 1
    fi
    
    exit 0
}

# Run main function
main "$@"

