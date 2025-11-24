#!/bin/bash
# Final verification test - check for all types of errors

echo "🧪 Final Verification Test"
echo "=========================="
echo ""

QUERY="Can you tell me about the macro and micro patterns in this system?"
CONV_ID="test-final-$(date +%s)"

echo "📤 Query: $QUERY"
echo ""

# Test 1: Check for validation errors
echo "Test 1: Checking for validation errors..."
ERRORS=$(curl -s -X POST "http://localhost:3003/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversationId\": \"$CONV_ID\",
    \"messages\": [{\"role\": \"user\", \"content\": \"$QUERY\"}],
    \"provider\": \"ollama\",
    \"model\": \"llama3.2:3b\",
    \"clientMode\": \"owner\"
  }" \
  --max-time 120 \
  --no-buffer 2>&1 | tee /tmp/scorpion-final-test.log | grep -cE "(error|Error|validation|Validation|Required|failed|Failed)" || echo "0")

if [ "$ERRORS" -gt 0 ]; then
  echo "❌ Found $ERRORS potential errors"
  curl -s -X POST "http://localhost:3003/api/chat/stream" \
    -H "Content-Type: application/json" \
    -d "{
      \"conversationId\": \"$CONV_ID\",
      \"messages\": [{\"role\": \"user\", \"content\": \"$QUERY\"}],
      \"provider\": \"ollama\",
      \"model\": \"llama3.2:3b\",
      \"clientMode\": \"owner\"
    }" \
    --max-time 120 \
    --no-buffer 2>&1 | grep -E "(error|Error|validation|Validation|Required|failed|Failed)" | head -10
else
  echo "✅ No validation errors found"
fi

echo ""

# Test 2: Check for successful completion
echo "Test 2: Checking for successful completion..."
SUCCESS=$(grep -c "type.*done\|type.*complete" /tmp/scorpion-final-test.log 2>/dev/null || echo "0")

if [ "$SUCCESS" -gt 0 ]; then
  echo "✅ Query completed successfully"
else
  echo "⚠️  Query may not have completed"
fi

echo ""

# Test 3: Check file read success
echo "Test 3: Checking file read success..."
FILE_READ=$(grep -c "code.readFile.*ok.*true\|MACRO_AND_MICRO_PATTERNS" /tmp/scorpion-final-test.log 2>/dev/null || echo "0")

if [ "$FILE_READ" -gt 0 ]; then
  echo "✅ File read succeeded"
else
  echo "❌ File read may have failed"
fi

echo ""
echo "📊 Summary:"
echo "  - Validation errors: $ERRORS"
echo "  - Completion: $SUCCESS"
echo "  - File read: $FILE_READ"
echo ""
echo "Full log: /tmp/scorpion-final-test.log"

