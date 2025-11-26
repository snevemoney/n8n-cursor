#!/bin/bash

# Lightning AI Platform - Enhanced Development Start
# Validates redirect schema, types, and starts server

set -e

echo "🚀 Lightning AI Platform - Enhanced Development Start"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Pre-flight checks
echo -e "\n${BLUE}🔍 Pre-flight Checks${NC}"
echo "----------------------------------------"

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# 2. TypeScript Validation
echo -e "\n${BLUE}🔧 TypeScript Validation${NC}"
echo "----------------------------------------"

echo -n "Checking TypeScript compilation... "
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript OK${NC}"
else
    echo -e "${RED}❌ TypeScript errors found${NC}"
    echo -e "${YELLOW}💡 Run 'npx tsc --noEmit' to see errors${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 3. Redirect Schema Validation
echo -e "\n${BLUE}🗺️  Redirect Schema Validation${NC}"
echo "----------------------------------------"

echo -n "Validating redirect map... "
if [ -f "web/src/lib/redirect-map.ts" ]; then
    # Check if redirect map has proper structure
    if grep -q "export const redirectMap" "web/src/lib/redirect-map.ts" && \
       grep -q "RedirectAction" "web/src/lib/redirect-map.ts"; then
        echo -e "${GREEN}✅ Redirect schema OK${NC}"
    else
        echo -e "${RED}❌ Invalid redirect map structure${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Redirect map not found${NC}"
fi

# 4. Environment Setup
echo -e "\n${BLUE}🔐 Environment Setup${NC}"
echo "----------------------------------------"

# Check for .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo "Creating default .env.local..."
    cat > .env.local << EOF
# Lightning AI Platform - Development Environment
NODE_ENV=development
NEXT_PUBLIC_APP_MODE=development
NEXT_PUBLIC_MOCK_MODE=true

# Lightning Network (Development)
NEXT_PUBLIC_LIGHTNING_NETWORK=testnet

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_ASSISTANT=true
NEXT_PUBLIC_ENABLE_TRUST_TILES=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
EOF
    echo -e "${GREEN}✅ Created .env.local with defaults${NC}"
fi

# 5. Dependencies Check
echo -e "\n${BLUE}📦 Dependencies Check${NC}"
echo "----------------------------------------"

echo -n "Checking node_modules... "
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✅ Dependencies OK${NC}"
else
    echo -e "${YELLOW}⚠️  Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# 6. Port Check
echo -e "\n${BLUE}🔌 Port Check${NC}"
echo "----------------------------------------"

PORT=${PORT:-3000}
echo -n "Checking port $PORT... "

if lsof -ti:$PORT >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port $PORT is in use${NC}"
    echo "Killing existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Port $PORT cleared${NC}"
else
    echo -e "${GREEN}✅ Port $PORT available${NC}"
fi

# 7. Cache Cleanup (Optional)
echo -e "\n${BLUE}🧹 Cache Management${NC}"
echo "----------------------------------------"

if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    echo "Cleaning caches..."
    rm -rf .next
    rm -rf node_modules/.cache
    echo -e "${GREEN}✅ Caches cleaned${NC}"
else
    echo -e "${BLUE}💡 Use --clean flag to clear caches${NC}"
fi

# 8. Lint Check (Optional)
if [ "$1" = "--lint" ] || [ "$2" = "--lint" ]; then
    echo -e "\n${BLUE}📝 Code Quality Check${NC}"
    echo "----------------------------------------"
    
    echo -n "Running ESLint... "
    if npx eslint . --ext .ts,.tsx --max-warnings 0 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Lint OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Lint warnings found${NC}"
        echo -e "${YELLOW}💡 Run 'npm run lint' to see details${NC}"
    fi
fi

# 9. Start Development Server
echo -e "\n${GREEN}🚀 Starting Development Server${NC}"
echo "=================================================="

echo -e "${BLUE}📍 Server will be available at: http://localhost:$PORT${NC}"
echo -e "${BLUE}🔧 Mode: Development with Mock Data${NC}"
echo -e "${BLUE}⚡ Hot reload enabled${NC}"
echo -e "${BLUE}🛑 Press Ctrl+C to stop${NC}"
echo ""

# Start the server
npm run dev

# Cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    # Kill any remaining processes
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

trap cleanup EXIT 