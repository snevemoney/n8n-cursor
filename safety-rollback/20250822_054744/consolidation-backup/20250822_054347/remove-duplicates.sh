#!/bin/bash

# Remove Duplicate Workflows Script
# =================================

echo "🧹 Removing Duplicate Workflows from n8n"
echo "========================================"

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

# Function to remove workflow
remove_workflow() {
  local workflow_id="$1"
  local workflow_name="$2"

  echo "🗑️  Removing duplicate: $workflow_name (ID: $workflow_id)"

  # Archive the workflow first (safer than immediate deletion)
  archive_response=$(curl -s -X PATCH "$BASE_URL/api/v1/workflows/$workflow_id" \
    -H "X-N8N-API-KEY: $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"isArchived": true}')

  if echo "$archive_response" | jq -e '.id' >/dev/null 2>&1; then
    echo "✅ Successfully archived: $workflow_name"
  else
    echo "❌ Failed to archive $workflow_name:"
    echo "$archive_response" | jq -r '.message // .error // "Unknown error"'
  fi

  echo ""
}

# Duplicate workflows to remove (keeping the newer/better versions)
echo "📋 Processing duplicate workflows..."

# AI Automation Agency - Client Onboarding (keep H9xg6lUTU4D3nhTD - newer)
remove_workflow "0kk1K1LivL3FRdkH" "AI Automation Agency - Client Onboarding (old)"

# AI Automation Agency - Project Delivery Management (keep gz9l4hYftyHmrhBi - newer)
remove_workflow "amu2BmyzGe0hxo2X" "AI Automation Agency - Project Delivery Management (old)"

# AI Knowledge Chatbot Interaction & Monetization (keep h0v3Ykk3HF8y77is - newer)
remove_workflow "HFISDTVFY5vJ5G8G" "AI Knowledge Chatbot Interaction & Monetization (old)"

# AI Research Agent Demo (keep mJtgqWT3btjdoieW - newer, remove 2 old ones)
remove_workflow "2AWSk0HLhztjhWaI" "AI Research Agent Demo (old 1)"
remove_workflow "Hd1cXD34FwZtoEV5" "AI Research Agent Demo (old 2)"

# Content Creation Webhook (keep Szlh7uQHC6kObi6V - newer)
remove_workflow "jfpnneDQZ3Uc8aNs" "Content Creation Webhook (old)"

# GPT-5 Support Agent (keep 8WpHnlUO8nHHW4Yn - newer)
remove_workflow "WAer0Gc80U0BcYv5" "GPT-5 Support Agent (old)"

# Knowledge Base Content Ingestion (keep WZhrKkOVNmNNmKmC - newer)
remove_workflow "St63PALL3wzvjSWK" "Knowledge Base Content Ingestion (old)"

# Master Orchestration System (keep yHknsb5nU7iInqP0 - newer)
remove_workflow "PWvKbYbupvcC5VC8" "Master Orchestration System (old)"

# Simple Slack Notifier (keep CRv7Sj2JPIYdzgfU - newer)
remove_workflow "q1Trk7r0RnyJjUCk" "Simple Slack Notifier (old)"

# Support Agent Webhook (keep AnXNna6bkFbsTjEB - newer)
remove_workflow "BlAg76mudGDJbm1I" "Support Agent Webhook (old)"

# Ultimate Browser Agent (keep Y1lIIdT7MazqNSdy - newer)
remove_workflow "bOmTL39BCE9DHxvz" "Ultimate Browser Agent (old)"

# Vibe Coding - Idea Validation Pipeline (keep pstJWO8bY19WS2pL - newer)
remove_workflow "Mg7joawLlLk3ei7E" "Vibe Coding - Idea Validation Pipeline (old)"

# 🚀 AI Content Empire - Multi-Platform Automation (keep HENAzQEVlVEfWbOp - newer, remove 2 old ones)
remove_workflow "C2rgYw0sIjHbN0PB" "🚀 AI Content Empire - Multi-Platform Automation (old 1)"
remove_workflow "WyRPNieAKdUIVFDt" "🚀 AI Content Empire - Multi-Platform Automation (old 2)"

# 🚀 AI SaaS Master Scaffold (keep urQt3hGqOcEbmp9o - newer, remove 2 old ones)
remove_workflow "fZEwdG5MgGy4pVFD" "🚀 AI SaaS Master Scaffold (old 1)"
remove_workflow "oXmPTYUIAMWtHAq4" "🚀 AI SaaS Master Scaffold (old 2)"

echo "🎉 Duplicate removal process completed!"
echo "📊 Check n8n for the cleaned up workflows"
echo ""
echo "💡 Note: Workflows were archived rather than deleted for safety"
echo "   You can permanently delete them from the n8n interface if needed"
