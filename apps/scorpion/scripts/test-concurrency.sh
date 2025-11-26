#!/bin/bash

# Scorpion Concurrent Test Runner
# Tests multiple chat requests in parallel to verify remote LLM setup
# 
# Usage:
#   ./test-concurrency.sh [concurrency] [base_url]
#   ./test-concurrency.sh 8
#   ./test-concurrency.sh 5 http://localhost:3003

set -e

CONCURRENCY=${1:-8}
BASE_URL=${2:-http://localhost:3003}
CHAT_API="${BASE_URL}/api/chat/stream"

echo "🚀 Scorpion Concurrent Test Runner"
echo "   Concurrency: $CONCURRENCY"
echo "   Base URL: $BASE_URL"
echo "   Chat API: $CHAT_API"
echo ""

# Test remote LLM connection first
echo "📡 Testing remote LLM connection..."
OLLAMA_URL=$(grep "^OLLAMA_URL=" apps/scorpion/.env.local 2>/dev/null | cut -d'=' -f2 || echo "http://localhost:11434")
echo "   OLLAMA_URL: $OLLAMA_URL"

if [[ "$OLLAMA_URL" == http* ]]; then
  echo "   Testing: $OLLAMA_URL/api/tags"
  if curl -s -m 5 "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
    echo "   ✅ Remote LLM is reachable"
  else
    echo "   ⚠️  Remote LLM test failed (may need auth or different endpoint)"
  fi
fi

echo ""
echo "🧪 Running $CONCURRENCY concurrent chat tests..."
echo ""

# Create temp directory for logs
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

# Test function
run_test() {
  local test_id=$1
  local test_prompt=$2
  local log_file="$TMP_DIR/test-$test_id.log"
  
  echo "[Test $test_id] Starting: $test_prompt"
  
  local start_time=$(date +%s%N)
  
  curl -s -X POST "$CHAT_API" \
    -H "Content-Type: application/json" \
    -d "{
      \"messages\": [
        {\"role\": \"user\", \"content\": \"$test_prompt\"}
      ]
    }" > "$log_file" 2>&1
  
  local end_time=$(date +%s%N)
  local duration=$(( (end_time - start_time) / 1000000 ))
  
  # Check if we got a response
  if [ -s "$log_file" ]; then
    # Count SSE events
    local event_count=$(grep -c "^data:" "$log_file" || echo "0")
    echo "[Test $test_id] ✅ Completed in ${duration}ms (${event_count} events)"
  else
    echo "[Test $test_id] ❌ Failed (empty response)"
  fi
}

# Run tests in parallel
for i in $(seq 1 $CONCURRENCY); do
  # Vary test prompts
  case $((i % 4)) in
    0) prompt="Say hi and return a simple plan" ;;
    1) prompt="What is Scorpion?" ;;
    2) prompt="Check system health" ;;
    3) prompt="Explain the architecture" ;;
  esac
  
  run_test $i "$prompt" &
done

# Wait for all tests to complete
wait

echo ""
echo "✅ All tests finished"
echo "   Logs saved in: $TMP_DIR"
echo ""
echo "📊 Summary:"
echo "   Check individual test logs: ls $TMP_DIR"
echo "   View combined results: cat $TMP_DIR/test-*.log | grep -E '(Test|Completed|Failed)'"
echo ""
echo "💡 Next steps:"
echo "   1. Check health endpoint: curl $BASE_URL/api/health | jq"
echo "   2. Monitor server load on KVM2 during tests"
echo "   3. Adjust concurrency based on server capacity"

