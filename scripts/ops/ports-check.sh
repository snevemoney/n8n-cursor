#!/usr/bin/env bash
set -Eeuo pipefail

# Port check script for n8n-cursor
# Uses config/ports.yaml as single source of truth

file="config/ports.yaml"

# Check if yq is available
if ! command -v yq >/dev/null 2>&1; then
    echo "❌ yq not found. Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install yq"
    echo "  macOS: brew install yq"
    echo "  Or download from: https://github.com/mikefarah/yq/releases"
    exit 1
fi

# Check if ports.yaml exists
if [[ ! -f "$file" ]]; then
    echo "❌ Ports configuration not found: $file"
    exit 1
fi

echo "🔍 Port Configuration Check"
echo "=========================="

echo ""
echo "Expected ports (config/ports.yaml):"
yq '. | to_entries[] | "\(.key): \(.value)"' "$file" 2>/dev/null || {
    echo "❌ Failed to parse $file"
    exit 1
}

echo ""
echo "Listening sockets:"
if command -v lsof >/dev/null 2>&1; then
    lsof -i -P -n | awk 'NR==1 || /LISTEN/' | sed -n '1,20p' || true
else
    echo "⚠️  lsof not available, using netstat"
    netstat -tlnp 2>/dev/null | head -20 || echo "  netstat not available"
fi

echo ""
echo "Port conflicts:"
conflicts=0

while IFS= read -r line; do
    if [[ -z "$line" ]]; then
        continue
    fi
    
    # Parse key and value
    key=$(echo "$line" | cut -d: -f1 | tr -d ' ')
    value=$(echo "$line" | cut -d: -f2 | tr -d ' ')
    
    # Skip non-numeric values
    if [[ ! "$value" =~ ^[0-9]+$ ]]; then
        continue
    fi
    
    # Check if port is in use
    if lsof -i :"$value" >/dev/null 2>&1; then
        process=$(lsof -i :"$value" | awk 'NR==2 {print $1}' 2>/dev/null || echo "unknown")
        echo "  ✅ $key ($value): ACTIVE ($process)"
    else
        echo "  ⚠️  $key ($value): NOT listening"
        ((conflicts++))
    fi
done < <(yq -r '. | to_entries[] | "\(.key) \(.value)"' "$file" 2>/dev/null)

echo ""
echo "Summary:"
if [[ $conflicts -eq 0 ]]; then
    echo "✅ All expected ports are active"
else
    echo "⚠️  $conflicts ports are not listening"
    echo "   Check if services are running: make status"
fi

echo ""
echo "Cursor/VS Code auto-forwarded ports:"
if command -v lsof >/dev/null 2>&1; then
    lsof -i -P -n | grep -E ":(3000|4000|5000|8000|8080|9000)" | grep LISTEN | head -10 || echo "  None detected"
else
    echo "  lsof not available for detailed port analysis"
fi
