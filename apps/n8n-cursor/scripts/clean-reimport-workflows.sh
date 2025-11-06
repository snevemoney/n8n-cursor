#!/bin/bash

# Clean Re-import Workflows Script
# =================================

echo "🧹 Cleaning and Re-importing Problematic Workflows"
echo "=================================================="

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to clean workflow JSON file
clean_workflow_file() {
    local input_file="$1"
    local output_file="${input_file%.json}_clean.json"
    
    echo "🧹 Cleaning $input_file..."
    
    # Create a clean version without AI expressions
    jq 'walk(if type == "string" and contains("$fromAI") then "{{ $json.default_value }}" else . end)' "$input_file" > "$output_file"
    
    # Additional cleaning for specific patterns
    sed -i 's/\$fromAI([^}]*)/{{ \$json.default_value }}/g' "$output_file"
    sed -i 's/\/\*n8n-auto-generated-fromAI-override\*\/ //g' "$output_file"
    
    echo "✅ Cleaned to $output_file"
    return 0
}

# Function to delete workflow
delete_workflow() {
    local workflow_id="$1"
    local workflow_name="$2"
    
    echo "🗑️  Deleting workflow: $workflow_name (ID: $workflow_id)"
    
    # Try to delete the workflow
    response=$(curl -s -X DELETE "$BASE_URL/api/v1/workflows/$workflow_id" \
        -H "X-N8N-API-KEY: $API_KEY")
    
    if [[ "$response" == "" ]]; then
        echo "✅ Successfully deleted: $workflow_name"
    else
        echo "❌ Failed to delete $workflow_name:"
        echo "$response"
    fi
    
    echo ""
}

# Function to import workflow
import_workflow() {
    local workflow_file="$1"
    local workflow_name=$(jq -r '.name // "Unknown Workflow"' "$workflow_file")
    
    echo "📤 Importing: $workflow_name"
    
    # Import the workflow
    response=$(curl -s -X POST "$BASE_URL/api/v1/workflows" \
        -H "X-N8N-API-KEY: $API_KEY" \
        -H "Content-Type: application/json" \
        -d @"$workflow_file")
    
    if echo "$response" | jq -e '.id' > /dev/null 2>&1; then
        workflow_id=$(echo "$response" | jq -r '.id')
        echo "✅ Successfully imported: $workflow_name (ID: $workflow_id)"
    else
        echo "❌ Failed to import $workflow_name:"
        echo "$response" | jq -r '.message // .error // "Unknown error"'
    fi
    
    echo ""
}

# Main process
echo "📋 Step 1: Deleting problematic workflows..."

# Delete workflows with AI expressions
workflows_to_delete=(
    "Y1lIIdT7MazqNSdy:Ultimate Browser Agent"
    "HENAzQEVlVEfWbOp:🚀 AI Content Empire - Multi-Platform Automation"
    "urQt3hGqOcEbmp9o:🚀 AI SaaS Master Scaffold"
)

for workflow_info in "${workflows_to_delete[@]}"; do
    IFS=':' read -r workflow_id workflow_name <<< "$workflow_info"
    
    if [[ -n "$workflow_id" ]] && [[ -n "$workflow_name" ]]; then
        delete_workflow "$workflow_id" "$workflow_name"
    fi
done

echo "📋 Step 2: Cleaning local workflow files..."

# Clean the local workflow files
workflow_files=(
    "workflows/07-ais-plus-download/Ultimate_Browser_Agent_final.json"
    "workflows/ai-content-empire.json"
    "workflows/ai-saas-master-scaffold.json"
)

for workflow_file in "${workflow_files[@]}"; do
    if [[ -f "$workflow_file" ]]; then
        clean_workflow_file "$workflow_file"
    else
        echo "⚠️  File not found: $workflow_file"
    fi
done

echo "📋 Step 3: Re-importing cleaned workflows..."

# Re-import the cleaned workflows
for workflow_file in "${workflow_files[@]}"; do
    clean_file="${workflow_file%.json}_clean.json"
    if [[ -f "$clean_file" ]]; then
        import_workflow "$clean_file"
        # Clean up temporary file
        rm "$clean_file"
    fi
done

echo "🎉 Clean re-import process completed!"
echo "📊 Check n8n for the newly imported, clean workflows"
echo ""
echo "💡 Note: The workflows should now work without AI expression errors"
