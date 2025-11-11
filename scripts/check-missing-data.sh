#!/bin/bash
# 🔍 Check for Missing Frontend Data
# Identifies which APIs are returning empty or missing data

set -euo pipefail

SCORPION_PORT=${SCORPION_PORT:-3003}
SCORPION_URL="http://localhost:${SCORPION_PORT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking for Missing Frontend Data${NC}"
echo ""

# Check if Scorpion is running
if ! curl -s "${SCORPION_URL}/healthz" > /dev/null 2>&1; then
    echo -e "${RED}✗ Scorpion is not running on port ${SCORPION_PORT}${NC}"
    echo "Start with: cd apps/scorpion && pnpm dev"
    exit 1
fi

echo -e "${GREEN}✓ Scorpion is running${NC}"
echo ""

# Function to check API endpoint
check_endpoint() {
    local endpoint=$1
    local name=$2
    local expected_field=$3
    
    echo -n "Checking ${name}... "
    
    response=$(curl -s "${SCORPION_URL}${endpoint}" 2>/dev/null || echo "")
    
    if [ -z "$response" ]; then
        echo -e "${RED}✗ No response${NC}"
        return 1
    fi
    
    # Check if response is valid JSON
    if ! echo "$response" | jq . > /dev/null 2>&1; then
        echo -e "${RED}✗ Invalid JSON${NC}"
        return 1
    fi
    
    # Extract data
    if echo "$response" | jq -e ".data.${expected_field}" > /dev/null 2>&1; then
        value=$(echo "$response" | jq -r ".data.${expected_field}")
    elif echo "$response" | jq -e ".${expected_field}" > /dev/null 2>&1; then
        value=$(echo "$response" | jq -r ".${expected_field}")
    else
        echo -e "${RED}✗ Field '${expected_field}' not found${NC}"
        return 1
    fi
    
    # Check if value is empty/null/0
    if [ "$value" = "null" ] || [ "$value" = "" ] || [ "$value" = "0" ] || [ "$value" = "[]" ]; then
        echo -e "${YELLOW}⚠ Empty or zero${NC} (value: ${value})"
        return 2
    else
        echo -e "${GREEN}✓ OK${NC} (value: ${value})"
        return 0
    fi
}

# Function to check array endpoint
check_array_endpoint() {
    local endpoint=$1
    local name=$2
    local array_field=$3
    
    echo -n "Checking ${name}... "
    
    response=$(curl -s "${SCORPION_URL}${endpoint}" 2>/dev/null || echo "")
    
    if [ -z "$response" ]; then
        echo -e "${RED}✗ No response${NC}"
        return 1
    fi
    
    # Extract array length
    if echo "$response" | jq -e ".data.${array_field} | length" > /dev/null 2>&1; then
        length=$(echo "$response" | jq ".data.${array_field} | length")
    elif echo "$response" | jq -e ".${array_field} | length" > /dev/null 2>&1; then
        length=$(echo "$response" | jq ".${array_field} | length")
    else
        echo -e "${RED}✗ Array '${array_field}' not found${NC}"
        return 1
    fi
    
    if [ "$length" -eq 0 ]; then
        echo -e "${YELLOW}⚠ Empty array${NC} (length: 0)"
        return 2
    else
        echo -e "${GREEN}✓ OK${NC} (length: ${length})"
        return 0
    fi
}

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}API Endpoint Checks${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Critical data checks
check_endpoint "/api/stats" "Stats - Knowledge Total" "knowledge.total"
check_endpoint "/api/stats" "Stats - Workflows Total" "workflows.total"
check_endpoint "/api/stats" "Stats - Agents Total" "agents.total"

echo ""
check_array_endpoint "/api/project/knowledge" "Knowledge Items" "knowledge"
check_array_endpoint "/api/workflows" "Workflows" "workflows"
check_array_endpoint "/api/agents" "Agents" "agents"
check_array_endpoint "/api/operations" "Operations" "operations"

echo ""
check_array_endpoint "/api/notifications" "Notifications" "unread"
check_array_endpoint "/api/logs" "Logs" "logs"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Detailed Analysis${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check knowledge details
echo "Knowledge Base Status:"
knowledge_response=$(curl -s "${SCORPION_URL}/api/project/knowledge" 2>/dev/null || echo "")
if [ -n "$knowledge_response" ]; then
    knowledge_count=$(echo "$knowledge_response" | jq -r '.data.knowledge | length // 0' 2>/dev/null || echo "0")
    echo "  Total items: ${knowledge_count}"
    
    if [ "$knowledge_count" -eq 0 ]; then
        echo -e "  ${YELLOW}⚠ Knowledge base is empty!${NC}"
        echo ""
        echo "  To fix:"
        echo "    1. Go to http://localhost:${SCORPION_PORT}/project"
        echo "    2. Click 'Sync Knowledge' button"
        echo "    3. Wait for ingestion to complete"
    fi
fi

echo ""

# Check workflows
echo "Workflows Status:"
workflows_response=$(curl -s "${SCORPION_URL}/api/workflows" 2>/dev/null || echo "")
if [ -n "$workflows_response" ]; then
    workflows_count=$(echo "$workflows_response" | jq -r '.data.workflows | length // 0' 2>/dev/null || echo "0")
    synced_count=$(echo "$workflows_response" | jq -r '.data.synced // 0' 2>/dev/null || echo "0")
    echo "  Total workflows: ${workflows_count}"
    echo "  Synced: ${synced_count}"
fi

echo ""

# Check agents
echo "Agents Status:"
agents_response=$(curl -s "${SCORPION_URL}/api/agents" 2>/dev/null || echo "")
if [ -n "$agents_response" ]; then
    agents_count=$(echo "$agents_response" | jq -r '.data.agents | length // .agents | length // 0' 2>/dev/null || echo "0")
    active_count=$(echo "$agents_response" | jq -r '.data.summary.active // .summary.active // 0' 2>/dev/null || echo "0")
    echo "  Total agents: ${agents_count}"
    echo "  Active: ${active_count}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Recommendations${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Provide recommendations based on findings
knowledge_count=$(echo "$knowledge_response" | jq -r '.data.knowledge | length // 0' 2>/dev/null || echo "0")
if [ "$knowledge_count" -eq 0 ]; then
    echo -e "${YELLOW}⚠ CRITICAL: Knowledge base is empty${NC}"
    echo ""
    echo "This is why you're seeing missing data in the frontend."
    echo ""
    echo "Fix steps:"
    echo "  1. Navigate to: http://localhost:${SCORPION_PORT}/project"
    echo "  2. Click the 'Sync Knowledge' or 'Ingest Knowledge' button"
    echo "  3. Wait 1-2 minutes for ingestion to complete"
    echo "  4. Refresh the frontend pages"
    echo ""
    echo "Or trigger via API:"
    echo "  curl -X POST http://localhost:${SCORPION_PORT}/api/project/knowledge"
    echo ""
fi

workflows_count=$(echo "$workflows_response" | jq -r '.data.workflows | length // 0' 2>/dev/null || echo "0")
if [ "$workflows_count" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No workflows found${NC}"
    echo "  Check n8n connection: curl http://localhost:${SCORPION_PORT}/api/n8n-health"
    echo ""
fi

agents_count=$(echo "$agents_response" | jq -r '.data.agents | length // .agents | length // 0' 2>/dev/null || echo "0")
if [ "$agents_count" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No agents found${NC}"
    echo "  This may be normal if agents haven't been created yet"
    echo ""
fi

echo "Done!"

