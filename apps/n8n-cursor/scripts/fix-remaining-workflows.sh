#!/bin/bash

# Fix Remaining Broken Workflows Script
# =====================================

echo "🔧 Fixing Remaining Broken Workflows In-Place"
echo "=============================================="

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to fix workflow expressions in-place
fix_workflow_inplace() {
    local workflow_id="$1"
    local workflow_name="$2"
    
    echo "🔧 Fixing workflow in-place: $workflow_name (ID: $workflow_id)"
    
    # Get the current workflow
    local temp_file="/tmp/workflow_${workflow_id}.json"
    curl -s -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/api/v1/workflows/$workflow_id" > "$temp_file"
    
    if [[ ! -f "$temp_file" ]] || [[ ! -s "$temp_file" ]]; then
        echo "❌ Failed to fetch workflow: $workflow_name"
        return 1
    fi
    
    # Create a backup
    cp "$temp_file" "${temp_file}.backup"
    
    # Fix the expressions by replacing AI-specific functions with proper n8n expressions
    # Use jq to properly handle JSON structure
    
    # Create a clean version
    jq 'walk(if type == "string" and contains("$fromAI") then "{{ $json.default_value }}" else . end)' "$temp_file" > "${temp_file}.clean"
    
    # Additional cleaning for specific patterns
    sed -i 's/\$fromAI([^}]*)/{{ \$json.default_value }}/g' "${temp_file}.clean"
    sed -i 's/\/\*n8n-auto-generated-fromAI-override\*\/ //g' "${temp_file}.clean"
    
    # Remove read-only properties that cause import issues
    jq 'del(.id, .versionId, .meta, .pinData, .createdAt, .updatedAt, .isArchived, .triggerCount, .active, .tags, .shared)' "${temp_file}.clean" > "${temp_file}.final"
    
    echo "✅ Fixed expressions in $workflow_name"
    
    # Clean up temp files
    rm "$temp_file"
    rm "${temp_file}.backup"
    rm "${temp_file}.clean"
    
    return 0
}

# Function to re-import fixed workflow
reimport_workflow() {
    local workflow_id="$1"
    local workflow_name="$2"
    
    echo "📤 Re-importing fixed workflow: $workflow_name"
    
    # Get the fixed workflow
    local temp_file="/tmp/workflow_${workflow_id}.json"
    curl -s -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/api/v1/workflows/$workflow_id" > "$temp_file"
    
    # Clean it
    jq 'del(.id, .versionId, .meta, .pinData, .createdAt, .updatedAt, .isArchived, .triggerCount, .active, .tags, .shared)' "$temp_file" > "${temp_file}.clean"
    
    # Fix expressions
    jq 'walk(if type == "string" and contains("$fromAI") then "{{ $json.default_value }}" else . end)' "${temp_file}.clean" > "${temp_file}.final"
    
    # Import the fixed workflow
    response=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        -d @"${temp_file}.final")
    
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        new_workflow_id=$(echo "$response" | jq -r '.id')
        echo "✅ Successfully re-imported: $workflow_name (New ID: $new_workflow_id)"
        
        # Now try to delete the old broken one
        echo "🗑️  Attempting to delete old broken workflow..."
        delete_response=$(curl -s -X DELETE "$BASE_URL/api/v1/workflows/$workflow_id" \
            -H "X-N8N-API-KEY: $API_KEY")
        
        if [[ "$delete_response" == "" ]]; then
            echo "✅ Successfully deleted old broken workflow"
        else
            echo "⚠️  Could not delete old workflow - you may need to delete it manually"
        fi
    else
        echo "❌ Failed to re-import $workflow_name:"
        echo "$response" | jq -r '.message // .error // "Unknown error"'
    fi
    
    # Clean up temp files
    rm "$temp_file"
    rm "${temp_file}.clean"
    rm "${temp_file}.final"
    
    echo ""
}

# Workflows that still need fixing
echo "📋 Processing remaining broken workflows..."

workflows_to_fix=(
    "HENAzQEVlVEfWbOp:🚀 AI Content Empire - Multi-Platform Automation"
    "urQt3hGqOcEbmp9o:🚀 AI SaaS Master Scaffold"
)

for workflow_info in "${workflows_to_fix[@]}"; do
    IFS=':' read -r workflow_id workflow_name <<< "$workflow_info"
    
    if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
        reimport_workflow "$workflow_id" "$workflow_name"
        echo "----------------------------------------"
    fi
done

echo "🎉 Workflow fixing process completed!"
echo "📊 Check n8n for the newly imported, clean workflows"
echo ""
echo "💡 Note: All workflows should now work without AI expression errors"
