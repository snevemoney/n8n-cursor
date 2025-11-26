#!/usr/bin/env bash
set -euo pipefail

PORTS=(80 443 3080 3081 5678 5679 5432 6380 8686)
echo "🔌 Checking ports..."

for p in "${PORTS[@]}"; do
  if lsof -Pi :$p -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port $p in use by PID(s): $(lsof -Pi :$p -sTCP:LISTEN -t | xargs)"
    exit 1
  else
    echo "✅ $p free"
  fi
done

echo "🎉 All ports are available!"
