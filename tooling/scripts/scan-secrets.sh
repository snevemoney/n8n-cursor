#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Scanning for potential secrets..."

# Check if gitleaks is available
if ! command -v gitleaks &> /dev/null; then
    echo "⚠️  gitleaks not found, skipping secrets scan for now"
    echo "💡 Install gitleaks manually: brew install gitleaks"
    exit 0
fi

# Run gitleaks scan
echo "🔒 Running gitleaks scan..."
if gitleaks detect --no-banner --redact --log-level warn; then
    echo "✅ No secrets detected"
    exit 0
else
    echo "❌ Potential secrets detected!"
    echo "🔍 Review the output above and remove any real secrets"
    echo "💡 Remember: only commit .env.*.example files"
    exit 1
fi
