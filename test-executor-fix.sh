#!/bin/bash
# Test script to verify executor validation fix

echo "🧪 Testing executor validation fix..."
echo ""

# Test the query
QUERY="Can you tell me about the macro and micro patterns in this system?"
CONV_ID="test-executor-$(date +%s)"

echo "📤 Sending query: $QUERY"
echo ""

# Send request and capture key events
curl -s -X POST "http://localhost:3003/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$QUERY\"}],
    \"provider\": \"ollama\",
    \"model\": \"llama3.2:3b\",
    \"clientMode\": \"owner\"
  }" \
  --no-buffer 2>&1 | while IFS= read -r line; do
    # Look for key indicators
    if echo "$line" | grep -qE "(code\.readFile|MACRO|ok.*true|error.*File not found|Executor.*validation|error.*Required)"; then
      echo "🔍 $line"
    fi
  done

echo ""
echo "✅ Test complete. Check server logs for detailed execution."

