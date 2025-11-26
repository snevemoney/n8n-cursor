#!/bin/bash
# Test script for pattern query

SCORPION_URL="http://localhost:3003"
QUERY="Can you tell me about the macro and micro patterns in this system?"

echo "🧪 Testing pattern query..."
echo "Query: $QUERY"
echo ""

# Send request to chat/stream endpoint
response=$(curl -s -X POST "${SCORPION_URL}/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"test-pattern-query-$(date +%s)\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"${QUERY}\"
      }
    ],
    \"provider\": \"ollama\",
    \"model\": \"llama3.2:3b\",
    \"clientMode\": \"owner\"
  }" \
  --no-buffer 2>&1)

# Check if we got a response
if [ $? -ne 0 ]; then
  echo "❌ Failed to connect to SCORPION"
  exit 1
fi

# Extract key information from the stream
echo "📊 Response received:"
echo ""

# Look for enforcement messages
if echo "$response" | grep -q "Enforced code.readFile"; then
  echo "✅ Enforcement detected: code.readFile was enforced"
else
  echo "⚠️  No enforcement message found"
fi

# Look for MACRO_AND_MICRO_PATTERNS
if echo "$response" | grep -qi "MACRO_AND_MICRO_PATTERNS"; then
  echo "✅ MACRO_AND_MICRO_PATTERNS.md file detected in response"
else
  echo "⚠️  MACRO_AND_MICRO_PATTERNS.md not found in response"
fi

# Show first 50 lines of response
echo ""
echo "📝 First 50 lines of response:"
echo "$response" | head -50

