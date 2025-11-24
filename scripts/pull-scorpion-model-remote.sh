#!/usr/bin/env bash

# Pull Scorpion Model on Remote Server
# Generates command for browser terminal (no SSH needed)
# 
# Usage: Copy the generated command and paste into Hostinger browser terminal

set -euo pipefail

echo "📦 Pulling scorpion:latest model on remote server"
echo "=================================================="
echo ""
echo "Copy and paste this command into your Hostinger browser terminal:"
echo ""
echo "--- START COMMAND ---"
cat << 'PULL_COMMAND'
#!/bin/bash
set -euo pipefail

echo "📦 Pulling scorpion:latest model..."
echo ""

# Check if Ollama container is running
if ! docker ps --format '{{.Names}}' | grep -q '^ollama$'; then
    echo "❌ Ollama container is not running"
    echo "   Starting Ollama container..."
    docker start ollama || {
        echo "   Container doesn't exist, creating it..."
        docker run -d \
            --name ollama \
            -p 127.0.0.1:11434:11434 \
            -v ollama:/root/.ollama \
            ollama/ollama:latest
    }
    echo "   Waiting for Ollama to start..."
    sleep 5
fi

# Pull scorpion:latest model
echo "📥 Pulling scorpion:latest model (this may take a few minutes)..."
docker exec ollama ollama pull scorpion:latest

# Verify the model was pulled
echo ""
echo "✅ Verifying model..."
docker exec ollama ollama list | grep scorpion || {
    echo "⚠️  Model not found in list, but pull may have succeeded"
}

# Test the model
echo ""
echo "🧪 Testing model..."
docker exec ollama ollama run scorpion:latest "Say hi in one word" || {
    echo "⚠️  Test failed, but model may still be available"
}

echo ""
echo "✅ Done! scorpion:latest should now be available at https://llm.n8ncloud.tech"
PULL_COMMAND
echo "--- END COMMAND ---"
echo ""
echo "📋 Instructions:"
echo "1. Open Hostinger VPS control panel"
echo "2. Go to Browser Terminal"
echo "3. Copy the command above (between START and END)"
echo "4. Paste and run it"
echo ""












