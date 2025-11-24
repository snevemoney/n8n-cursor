#!/bin/bash

# Test script for enhanced planner prompt
# Sends test queries to the chat API and checks responses

BASE_URL="http://localhost:3003"
CHAT_API="${BASE_URL}/api/chat/stream"

echo "🧪 Testing Enhanced Planner Prompt"
echo "===================================="
echo ""

# Test queries that should trigger different tools
test_queries=(
    "What is Scorpion?"
    "Show me recent files"
    "Research Bitcoin news"
    "Check system health"
    "Explain the architecture"
)

for query in "${test_queries[@]}"; do
    echo "📝 Testing query: '$query'"
    echo "---"
    
    # Send query to chat API
    response=$(curl -s -X POST "$CHAT_API" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$query\"}" \
        --max-time 30)
    
    if [ $? -eq 0 ]; then
        echo "✅ Response received"
        # Check if response contains expected tool usage patterns
        if echo "$response" | grep -q "code.readFile\|files.recent\|research.run\|system.health"; then
            echo "✅ Tool usage detected in response"
        else
            echo "⚠️  No clear tool usage pattern detected"
        fi
    else
        echo "❌ Request failed"
    fi
    
    echo ""
    sleep 2
done

echo "✅ Testing complete"

