#!/bin/bash

# n8n Workflow Listing and Validation Script
# This script lists all workflows and validates their JSON structure

set -e

WORKFLOWS_DIR="./workflows"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "========================================="
echo "   n8n Workflow Manager"
echo "========================================="
echo ""

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo -e "${RED}Error: workflows/ directory not found${NC}"
    exit 1
fi

# Count workflows
workflow_count=$(find "$WORKFLOWS_DIR" -name "*.json" -type f | wc -l)
echo -e "${BLUE}Found $workflow_count workflow(s)${NC}"
echo ""

# List and validate each workflow
valid_count=0
invalid_count=0

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    if [ -f "$workflow_file" ]; then
        filename=$(basename "$workflow_file")
        echo -e "${YELLOW}Workflow:${NC} $filename"

        # Validate JSON
        if jq empty "$workflow_file" 2>/dev/null; then
            echo -e "${GREEN}✓ Valid JSON${NC}"
            valid_count=$((valid_count + 1))

            # Extract workflow name if it exists
            workflow_name=$(jq -r '.name // "N/A"' "$workflow_file" 2>/dev/null)
            echo -e "  Name: $workflow_name"

            # Count nodes
            node_count=$(jq '.nodes | length' "$workflow_file" 2>/dev/null || echo "0")
            echo -e "  Nodes: $node_count"

            # Check if active
            is_active=$(jq -r '.active // false' "$workflow_file" 2>/dev/null)
            if [ "$is_active" = "true" ]; then
                echo -e "  Status: ${GREEN}Active${NC}"
            else
                echo -e "  Status: ${YELLOW}Inactive${NC}"
            fi
        else
            echo -e "${RED}✗ Invalid JSON${NC}"
            invalid_count=$((invalid_count + 1))
        fi
        echo ""
    fi
done

# Summary
echo "========================================="
echo -e "${GREEN}Valid workflows: $valid_count${NC}"
if [ $invalid_count -gt 0 ]; then
    echo -e "${RED}Invalid workflows: $invalid_count${NC}"
fi
echo "========================================="

exit 0
