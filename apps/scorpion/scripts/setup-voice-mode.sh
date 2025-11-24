#!/bin/bash
# Voice Mode Setup Script
# This script helps set up the required services for voice mode

set -e

echo "🎤 Voice Mode Setup for Scorpion"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker is available"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠${NC} Docker not found (optional for Whisper)"
    DOCKER_AVAILABLE=false
fi

# Check if Ollama is running
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Ollama is running"
else
    echo -e "${YELLOW}⚠${NC} Ollama is not running"
    echo "   Start it with: ollama serve"
fi

# Check Whisper service
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Whisper service is running"
else
    echo -e "${RED}✗${NC} Whisper service is not running"
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo "   To start with Docker:"
        echo "   docker run -d -p 8000:8000 --name whisper-api onerahmet/openai-whisper-asr-webservice:latest-gpu"
    else
        echo "   Install Whisper and run a local server"
    fi
fi

# Check TTS service
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} TTS service is running"
else
    echo -e "${RED}✗${NC} TTS service is not running"
    echo "   Options:"
    echo "   1. Use OpenAI TTS (set OPENAI_API_KEY and TTS_PROVIDER=openai)"
    echo "   2. Run local Kokoro: python kokoro/server.py --port 5000"
    echo "   3. Run local Piper TTS"
fi

# Check environment variables
echo ""
echo "Environment Variables:"
if [ -f .env.local ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    if grep -q "WHISPER_URL" .env.local; then
        echo -e "${GREEN}✓${NC} WHISPER_URL is set"
    else
        echo -e "${YELLOW}⚠${NC} WHISPER_URL not set (using default: http://localhost:8000)"
    fi
    
    if grep -q "TTS_URL" .env.local; then
        echo -e "${GREEN}✓${NC} TTS_URL is set"
    else
        echo -e "${YELLOW}⚠${NC} TTS_URL not set (using default: http://localhost:5000)"
    fi
    
    if grep -q "OPENAI_API_KEY" .env.local && ! grep -q "^#.*OPENAI_API_KEY" .env.local; then
        echo -e "${GREEN}✓${NC} OPENAI_API_KEY is set (can use cloud/hybrid profile)"
    else
        echo -e "${YELLOW}⚠${NC} OPENAI_API_KEY not set (local profile only)"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.local not found"
    echo "   Create it from .env.example: cp .env.example .env.local"
fi

echo ""
echo "Next Steps:"
echo "1. Ensure required services are running (see above)"
echo "2. Configure .env.local with your settings"
echo "3. Navigate to http://localhost:3003/chat"
echo "4. Click the microphone button to start voice mode"
echo "5. Grant microphone permissions when prompted"
echo ""
echo "For detailed setup, see: docs/voice-mode-next-steps.md"

