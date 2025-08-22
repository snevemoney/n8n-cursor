#!/bin/bash

# Import Missing Workflows Script
# ===============================

echo "🚀 Importing Missing Workflows to n8n"
echo "======================================"

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to clean workflow JSON
clean_workflow() {
  local input_file="$1"
  local output_file="${input_file%.json}_clean_import.json"

  echo "🧹 Cleaning $input_file..."

  # Remove read-only properties and clean the JSON
  jq 'del(.id, .versionId, .meta, .pinData, .createdAt, .updatedAt, .isArchived, .triggerCount, .active, .tags, .shared)' "$input_file" >"$output_file"

  echo "✅ Cleaned to $output_file"
  return 0
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

  if echo "$response" | jq -e '.id' >/dev/null 2>&1; then
    workflow_id=$(echo "$response" | jq -r '.id')
    echo "✅ Successfully imported: $workflow_name (ID: $workflow_id)"
  else
    echo "❌ Failed to import $workflow_name:"
    echo "$response" | jq -r '.message // .error // "Unknown error"'
  fi

  echo ""
}

# Main workflow files to import
echo "📋 Processing main workflow files..."
main_workflows=(
  "workflows/ai-content-empire.json"
  "workflows/ai-research-agent.json"
  "workflows/ai-saas-master-scaffold.json"
  "workflows/gpt5-support-agent.json"
  "workflows/master-orchestration-system.json"
  "workflows/simple_slack_notifier.json"
)

# Enhanced workflows
echo "📋 Processing enhanced workflow files..."
enhanced_workflows=(
  "workflows/enhanced/ai-research-agent-enhanced.json"
  "workflows/enhanced/ai-saas-master-scaffold-enhanced.json"
)

# Knowledge chatbot workflows
echo "📋 Processing knowledge chatbot workflow files..."
knowledge_workflows=(
  "workflows/02-knowledge-chatbots/chatbot-interaction.json"
  "workflows/02-knowledge-chatbots/knowledge-ingestion.json"
)

# Vibe coding workflows
echo "📋 Processing vibe coding workflow files..."
vibe_workflows=(
  "workflows/04-vibe-coding/idea-validation-pipeline.json"
)

# Agency operations workflows
echo "📋 Processing agency operations workflow files..."
agency_workflows=(
  "workflows/05-agency-operations/client-onboarding.json"
  "workflows/05-agency-operations/project-delivery.json"
)

# Webhook workflows
echo "📋 Processing webhook workflow files..."
webhook_workflows=(
  "workflows/webhooks/content-creation-webhook.json"
  "workflows/webhooks/support-agent-webhook.json"
)

# Combine all workflows
all_workflows=(
  "${main_workflows[@]}"
  "${enhanced_workflows[@]}"
  "${knowledge_workflows[@]}"
  "${vibe_workflows[@]}"
  "${agency_workflows[@]}"
  "${webhook_workflows[@]}"
)

echo "🔍 Found ${#all_workflows[@]} workflow files to process"
echo ""

# Process each workflow
for workflow_file in "${all_workflows[@]}"; do
  if [[ -f "$workflow_file" ]]; then
    echo "📁 Processing: $workflow_file"

    # Clean the workflow
    if clean_workflow "$workflow_file"; then
      # Import the cleaned workflow
      clean_file="${workflow_file%.json}_clean_import.json"
      if [[ -f "$clean_file" ]]; then
        import_workflow "$clean_file"
        # Clean up temporary file
        rm "$clean_file"
      fi
    fi
  else
    echo "⚠️  File not found: $workflow_file"
  fi

  echo "----------------------------------------"
done

echo "🎉 Workflow import process completed!"
echo "📊 Check n8n for the newly imported workflows"
