#!/usr/bin/env bash
set -euo pipefail

# Scope Check - Validates that all changed files are within declared AFFECTED_PATHS
# Usage: ./scripts/validate/scope-check.sh [AFFECTED_PATHS]

AFFECTED_PATHS="${1:-}"
if [ -z "$AFFECTED_PATHS" ]; then
    echo "❌ ERROR: AFFECTED_PATHS not provided"
    echo "Usage: $0 'path1/**,path2/**'"
    exit 1
fi

echo "🔍 Checking scope for paths: $AFFECTED_PATHS"

# Get list of changed files
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || git diff --name-only --cached 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
    echo "ℹ️  No changed files detected"
    exit 0
fi

echo "📁 Changed files:"
echo "$CHANGED_FILES"

# Convert comma-separated paths to array
IFS=',' read -ra PATHS <<< "$AFFECTED_PATHS"

# Check each changed file against allowed paths
VIOLATIONS=()
while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    ALLOWED=false
    for path in "${PATHS[@]}"; do
        # Remove trailing /** and ** from path for pattern matching
        clean_path=$(echo "$path" | sed 's|/\*\*$||' | sed 's|\*\*$||')
        
        # Check if file starts with the allowed path
        if [[ "$file" == "$clean_path"* ]]; then
            ALLOWED=true
            break
        fi
    done
    
    if [ "$ALLOWED" = false ]; then
        VIOLATIONS+=("$file")
    fi
done <<< "$CHANGED_FILES"

# Report violations
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ SCOPE VIOLATIONS DETECTED:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  - $violation"
    done
    echo ""
    echo "Allowed paths: $AFFECTED_PATHS"
    echo "Please update AFFECTED_PATHS or move files to allowed locations"
    exit 1
fi

echo "✅ All changed files are within allowed scope"
exit 0
