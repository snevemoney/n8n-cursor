#!/bin/bash

# Verification script for n8n workflow visualization setup
# This script tests all components to ensure everything works

set -e

echo "🔍 Verifying n8n workflow visualization setup..."
echo ""

# Check Node.js version
echo "📋 Checking Node.js..."
node_version=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$node_version" -ge 18 ]; then
  echo "✅ Node.js $(node -v) - OK"
else
  echo "❌ Node.js version too old. Need v18+ but found $(node -v)"
  exit 1
fi

# Check npm dependencies
echo ""
echo "📦 Checking npm dependencies..."
if npm list --depth=0 >/dev/null 2>&1; then
  echo "✅ npm dependencies - OK"
else
  echo "⚠️  Some npm dependencies missing. Running npm install..."
  npm install
fi

# Check global tools
echo ""
echo "🔧 Checking global tools..."

# Check mermaid-cli
if command -v mmdc &>/dev/null; then
  mmdc_version=$(mmdc --version 2>/dev/null || echo "unknown")
  echo "✅ mermaid-cli ($mmdc_version) - OK"
else
  echo "❌ mermaid-cli not found. Installing..."
  sudo npm install -g @mermaid-js/mermaid-cli
fi

# Check if we have workflows to test with
echo ""
echo "📁 Checking workflow files..."
workflow_count=$(ls workflows/*.json 2>/dev/null | wc -l)
if [ "$workflow_count" -gt 0 ]; then
  echo "✅ Found $workflow_count workflow files - OK"
else
  echo "⚠️  No workflow files found in workflows/ directory"
fi

# Test basic commands
echo ""
echo "🧪 Testing core functionality..."

# Test diagram generation
echo "📊 Testing diagram generation..."
if npm run gen >/dev/null 2>&1; then
  echo "✅ npm run gen - OK"
else
  echo "❌ npm run gen - FAILED"
  echo "   Check that workflows exist and Mermaid CLI is installed"
fi

# Check if SVG files were generated
svg_count=$(ls visualizations/*.svg 2>/dev/null | wc -l)
if [ "$svg_count" -gt 0 ]; then
  echo "✅ SVG export ($svg_count files) - OK"
else
  echo "⚠️  No SVG files generated"
fi

# Check environment variables for screenshot capture
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env" ]; then
  echo "✅ .env file exists - OK"
  if grep -q "N8N_BASE_URL" .env && grep -q "N8N_EMAIL" .env; then
    echo "✅ n8n credentials configured - OK"

    # Test screenshot capture (if credentials are not placeholders)
    if ! grep -q "your-email@example.com" .env; then
      echo "📸 Testing screenshot capture..."
      if timeout 30 npm run capture >/dev/null 2>&1; then
        echo "✅ Screenshot capture - OK"
      else
        echo "⚠️  Screenshot capture timed out or failed"
        echo "   This is normal if n8n is not accessible or credentials are invalid"
      fi
    else
      echo "⚠️  n8n credentials are still placeholder values"
      echo "   Edit .env file with real credentials to enable screenshot capture"
    fi
  else
    echo "⚠️  n8n credentials not configured in .env"
  fi
else
  echo "⚠️  .env file not found"
  echo "   Copy environment.template to .env and configure credentials"
fi

# Check file structure
echo ""
echo "📂 Checking file structure..."
required_dirs=("workflows" "visualizations" "tools" "scripts")
for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir/ directory - OK"
  else
    echo "❌ $dir/ directory missing"
  fi
done

# Summary
echo ""
echo "📊 Setup Summary:"
echo "=================="
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "Workflows: $workflow_count found"
echo "SVG exports: $svg_count generated"
echo "Environment: $([ -f '.env' ] && echo 'configured' || echo 'needs setup')"

echo ""
echo "🎯 Quick Start Commands:"
echo "npm run gen      # Generate all diagrams"
echo "npm run refresh  # Generate diagrams + screenshots"
echo "npm run watch    # Watch for changes"

echo ""
if [ "$workflow_count" -gt 0 ] && [ "$svg_count" -gt 0 ]; then
  echo "🎉 Setup verification PASSED! Your n8n visualization system is ready."
else
  echo "⚠️  Setup verification PARTIAL. Some features may not work correctly."
fi
