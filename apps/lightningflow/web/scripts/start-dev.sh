#!/bin/bash

# Lightning AI Business Node Platform - Development Startup Script
# Bulletproof dev server startup with cleanup, verification, and auto-recovery

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PORT=3000
FALLBACK_PORT=3001
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=30

echo -e "${BLUE}🚀 Lightning AI Platform - Development Server Startup${NC}"
echo -e "${BLUE}=================================================${NC}"

# Function to check if port is in use
check_port() {
    local port=$1
    lsof -i :$port >/dev/null 2>&1
}

# Function to find available port
find_available_port() {
    local port=$DEFAULT_PORT
    while check_port $port && [ $port -lt 3010 ]; do
        echo -e "${YELLOW}⚠️  Port $port is busy, trying $((port + 1))...${NC}"
        port=$((port + 1))
    done
    echo $port
}

# Function to kill existing Next.js processes
cleanup_processes() {
    echo -e "${YELLOW}🔄 Cleaning up existing Next.js processes...${NC}"
    
    # Kill by process name
    pkill -f "next dev" 2>/dev/null && echo -e "${GREEN}✅ Killed existing Next.js dev processes${NC}" || echo -e "${GREEN}✅ No existing processes found${NC}"
    
    # Kill by port if still occupied
    if check_port $DEFAULT_PORT; then
        echo -e "${YELLOW}🔧 Force killing process on port $DEFAULT_PORT...${NC}"
        lsof -ti:$DEFAULT_PORT | xargs kill -9 2>/dev/null || true
    fi
    
    # Wait a moment for cleanup
    sleep 2
}

# Function to clean build cache
clean_cache() {
    echo -e "${YELLOW}🧹 Cleaning build cache and temporary files...${NC}"
    
    # Remove Next.js cache
    rm -rf .next
    
    # Remove node_modules cache if it exists
    rm -rf node_modules/.cache 2>/dev/null || true
    
    # Remove any webpack cache
    rm -rf .next/cache 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cache cleaned successfully${NC}"
}

# Function to verify dependencies
check_dependencies() {
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${RED}❌ node_modules not found. Running npm install...${NC}"
        npm install
    fi
    
    # Check for missing critical dependencies
    if ! npm list qrcode >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Installing missing QR code dependency...${NC}"
        npm install qrcode @types/qrcode
    fi
    
    if ! npm list @radix-ui/react-slider >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Installing missing Radix slider dependency...${NC}"
        npm install @radix-ui/react-slider
    fi
    
    echo -e "${GREEN}✅ Dependencies verified${NC}"
}

# Function to start the development server
start_server() {
    local port=$(find_available_port)
    
    echo -e "${BLUE}🚀 Starting Next.js development server on port $port...${NC}"
    
    if [ $port -eq $DEFAULT_PORT ]; then
        npm run dev &
    else
        npm run dev -- -p $port &
    fi
    
    SERVER_PID=$!
    echo -e "${GREEN}✅ Server started with PID: $SERVER_PID on port $port${NC}"
    echo $port > .dev-port  # Save port for other scripts
    
    echo $port  # Return the port number
}

# Function to wait for server to be ready
wait_for_server() {
    local port=$1
    local retries=0
    
    echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
    
    while [ $retries -lt $HEALTH_CHECK_TIMEOUT ]; do
        if curl -s http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is responding on port $port${NC}"
            return 0
        fi
        
        sleep 1
        retries=$((retries + 1))
        echo -n "."
    done
    
    echo -e "\n${RED}❌ Server failed to respond within $HEALTH_CHECK_TIMEOUT seconds${NC}"
    return 1
}

# Function to perform health check
health_check() {
    local port=$1
    
    echo -e "${YELLOW}🔍 Performing health check...${NC}"
    
    # Check if homepage loads
    local response=$(curl -s http://localhost:$port)
    if echo "$response" | grep -q "<title>"; then
        local title=$(echo "$response" | grep -o "<title>.*</title>" | head -1)
        echo -e "${GREEN}✅ Homepage loaded successfully: $title${NC}"
    else
        echo -e "${YELLOW}⚠️  Homepage loaded but no title found${NC}"
    fi
    
    # Check if dashboard loads
    if curl -s http://localhost:$port/dashboard >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Dashboard endpoint accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Dashboard endpoint not ready yet${NC}"
    fi
    
    # Display server info
    echo -e "${BLUE}📊 Server Information:${NC}"
    echo -e "   🌐 Local URL: http://localhost:$port"
    echo -e "   🔧 Process ID: $SERVER_PID"
    echo -e "   📁 Working Directory: $(pwd)"
    echo -e "   ⏰ Started at: $(date)"
}

# Function to show useful commands
show_commands() {
    local port=$1
    
    echo -e "\n${BLUE}🛠️  Useful Development Commands:${NC}"
    echo -e "   📱 Open in browser:    open http://localhost:$port"
    echo -e "   🔍 View logs:          tail -f .next/trace"
    echo -e "   🛑 Stop server:        kill $SERVER_PID"
    echo -e "   🔄 Restart:            ./scripts/start-dev.sh"
    echo -e "   📊 Check processes:    ps aux | grep next"
    echo -e "   🌐 Test endpoints:"
    echo -e "      • Dashboard:        curl http://localhost:$port/dashboard"
    echo -e "      • Lightning Test:   curl http://localhost:$port/lightning-test"
    echo -e "      • API Health:       curl http://localhost:$port/api/system-check"
}

# Main execution
main() {
    # Trap to cleanup on exit
    trap 'echo -e "\n${YELLOW}🛑 Shutting down...${NC}"; kill $SERVER_PID 2>/dev/null || true; exit' INT TERM
    
    cleanup_processes
    clean_cache
    check_dependencies
    
    local port
    port=$(start_server)
    
    if wait_for_server $port; then
        health_check $port
        show_commands $port
        
        echo -e "\n${GREEN}🎉 Lightning AI Platform development server is ready!${NC}"
        echo -e "${GREEN}🌐 Visit: http://localhost:$port${NC}"
        
        # Keep script running to maintain server
        echo -e "\n${BLUE}💡 Press Ctrl+C to stop the server${NC}"
        wait $SERVER_PID
    else
        echo -e "${RED}❌ Failed to start development server${NC}"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
}

# Run main function
main "$@" 