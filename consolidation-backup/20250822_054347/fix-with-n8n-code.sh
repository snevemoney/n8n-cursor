#!/bin/bash

# Fix Workflows Using n8n Code Node Approach
# =========================================

echo "🔧 Fixing Workflows Using n8n Code Node Approach"
echo "================================================"

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjYxOWE3MC1jMzQ2LTQ0NDQtODlkZi0zZTUxODE1MjhhMzQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1Nzk3MDk3fQ.OaBAfzzTz6Y7AmAp5t_7_ZvBgujYXwDlJIV3F4WIjX8"
BASE_URL="https://n8ncloud.tech"

echo "📋 Current Status:"
echo "✅ Ultimate Browser Agent - FIXED and working"
echo "❌ AI Content Empire - Still broken (needs fixing)"
echo "❌ AI SaaS Master Scaffold - Still broken (needs fixing)"
echo ""

echo "🎯 Solution: Use n8n Code Node to fix expressions"
echo ""

echo "📝 Here's what you need to do in n8n:"
echo ""

echo "1. 🔧 Open 'AI Content Empire' workflow in n8n"
echo "2. 📝 Add a Code Node with this JavaScript:"
echo "   ----------------------------------------"
echo "   // Fix AI expressions in workflow"
echo "   const workflow = $input.first().json;"
echo "   "
echo "   // Replace $fromAI expressions with proper n8n expressions"
echo "   const fixedWorkflow = JSON.parse("
echo "     JSON.stringify(workflow)"
echo "       .replace(/\\$fromAI\\([^)]*\\)/g, '{{ \$json.default_value }}')"
echo "       .replace(/\\/\\*n8n-auto-generated-fromAI-override\\*\\/ /g, '')"
echo "   );"
echo "   "
echo "   return [{ json: fixedWorkflow }];"
echo "   ----------------------------------------"
echo ""

echo "3. 🔧 Open 'AI SaaS Master Scaffold' workflow in n8n"
echo "4. 📝 Add a Code Node with the same JavaScript code"
echo ""

echo "5. 🧪 Test the fixed workflows"
echo ""

echo "💡 Alternative: Use n8n's built-in Find & Replace:"
echo "   - Press Ctrl+F in the workflow editor"
echo "   - Search for: \$fromAI"
echo "   - Replace with: {{ \$json.default_value }}"
echo ""

echo "🎉 This approach uses n8n's native capabilities instead of external scripts!"
