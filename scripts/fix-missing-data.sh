#!/bin/bash
# 🔧 Fix Missing Frontend Data
# Triggers knowledge ingestion to populate the knowledge base

set -euo pipefail

SCORPION_PORT=${SCORPION_PORT:-3003}
SCORPION_URL="http://localhost:${SCORPION_PORT}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Fixing Missing Frontend Data${NC}"
echo ""

# Check if Scorpion is running
if ! curl -s "${SCORPION_URL}/healthz" > /dev/null 2>&1; then
    echo -e "${RED}✗ Scorpion is not running on port ${SCORPION_PORT}${NC}"
    echo "Start with: cd apps/scorpion && pnpm dev"
    exit 1
fi

echo -e "${GREEN}✓ Scorpion is running${NC}"
echo ""

# Check current knowledge count
echo "Checking current knowledge base..."
current_count=$(curl -s "${SCORPION_URL}/api/stats" 2>/dev/null | jq -r '.data.knowledge.total // 0' 2>/dev/null || echo "0")
echo "Current knowledge items: ${current_count}"
echo ""

if [ "$current_count" -gt 0 ]; then
    echo -e "${GREEN}✓ Knowledge base already has ${current_count} items${NC}"
    echo "If you're still seeing missing data, try refreshing the frontend."
    exit 0
fi

echo -e "${YELLOW}⚠ Knowledge base is empty - triggering ingestion...${NC}"
echo ""

# Trigger ingestion
echo "Calling POST /api/project/knowledge..."
response=$(curl -s -X POST "${SCORPION_URL}/api/project/knowledge" \
    -H "Content-Type: application/json" \
    -w "\n%{http_code}" 2>/dev/null || echo "")

if [ -z "$response" ]; then
    echo -e "${RED}✗ Failed to trigger ingestion - no response${NC}"
    exit 1
fi

# Extract status code and body
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" != "200" ]; then
    echo -e "${RED}✗ Ingestion failed with HTTP ${http_code}${NC}"
    echo "Response: $body"
    exit 1
fi

# Parse response
ingested=$(echo "$body" | jq -r '.data.ingested // 0' 2>/dev/null || echo "0")

if [ "$ingested" -gt 0 ]; then
    echo -e "${GREEN}✓ Successfully ingested ${ingested} knowledge items!${NC}"
    echo ""
    echo "The frontend should now show data. Refresh your browser."
else
    echo -e "${YELLOW}⚠ Ingestion completed but no items were ingested${NC}"
    echo "This might be normal if the project is empty or ingestion is still processing."
    echo ""
    echo "Check the server logs for details."
fi

echo ""
echo "You can also trigger ingestion manually:"
echo "  1. Go to: http://localhost:${SCORPION_PORT}/project"
echo "  2. Click the 'Manual Sync' button"
echo ""
echo "Or via API:"
echo "  curl -X POST http://localhost:${SCORPION_PORT}/api/project/knowledge"

