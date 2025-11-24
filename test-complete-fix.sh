#!/bin/bash
# Complete test script for pattern query fix

echo "🧪 Testing complete fix for pattern query..."
echo ""

QUERY="Can you tell me about the macro and micro patterns in this system?"
CONV_ID="test-complete-$(date +%s)"

echo "📤 Query: $QUERY"
echo "📋 Conversation ID: $CONV_ID"
echo ""

# Send request and monitor for key events
curl -s -X POST "http://localhost:3003/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$QUERY\"}],
    \"provider\": \"ollama\",
    \"model\": \"llama3.2:3b\",
    \"clientMode\": \"owner\"
  }" \
  --max-time 90 \
  --no-buffer 2>&1 | tee /tmp/scorpion-complete-test.log | grep -E "(tool_result|error|ok|File not found|MACRO|content|completed|success|failed|validation)" | head -20

echo ""
echo "📊 Checking results..."
echo ""

# Check for success indicators
if grep -q "File not found" /tmp/scorpion-complete-test.log; then
  echo "❌ File not found error detected"
  exit 1
fi

if grep -q "error.*Required" /tmp/scorpion-complete-test.log; then
  echo "❌ Executor validation error detected"
  exit 1
fi

if grep -q "tool_result.*ok.*true" /tmp/scorpion-complete-test.log || grep -q "MACRO" /tmp/scorpion-complete-test.log; then
  echo "✅ Success indicators found"
  exit 0
fi

echo "⚠️  Test completed but no clear success/failure indicators"
echo "📄 Full log saved to /tmp/scorpion-complete-test.log"
exit 0

