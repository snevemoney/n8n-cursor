#!/bin/bash

# Lightning AI Platform - Development Utilities
# Quick commands for common development tasks

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DEFAULT_PORT=3000

# Function to check server status
check_status() {
    local port=${1:-$DEFAULT_PORT}
    
    echo -e "${BLUE}🔍 Checking server status on port $port...${NC}"
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running on port $port${NC}"
        
        # Get process info
        local pid=$(lsof -ti:$port)
        local process_info=$(ps -p $pid -o pid,ppid,cmd --no-headers 2>/dev/null)
        echo -e "${BLUE}📊 Process: $process_info${NC}"
        
        # Test if responding
        if curl -s http://localhost:$port >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is responding to HTTP requests${NC}"
        else
            echo -e "${YELLOW}⚠️  Server is running but not responding to HTTP${NC}"
        fi
    else
        echo -e "${RED}❌ No server running on port $port${NC}"
    fi
}

# Function to view logs
view_logs() {
    echo -e "${BLUE}📝 Recent development logs:${NC}"
    
    if [ -f ".next/trace" ]; then
        echo -e "${YELLOW}Next.js trace logs:${NC}"
        tail -n 20 .next/trace
    fi
    
    if [ -f "logs/combined.log" ]; then
        echo -e "${YELLOW}Application logs:${NC}"
        tail -n 20 logs/combined.log
    fi
    
    echo -e "${BLUE}💡 Use 'tail -f .next/trace' to follow logs in real-time${NC}"
}

# Function to test key endpoints
test_endpoints() {
    local port=${1:-$DEFAULT_PORT}
    
    echo -e "${BLUE}🧪 Testing key endpoints on port $port...${NC}"
    
    local endpoints=(
        "/"
        "/dashboard"
        "/lightning-test"
        "/api/system-check"
        "/receive"
        "/transactions"
    )
    
    for endpoint in "${endpoints[@]}"; do
        echo -n "Testing $endpoint... "
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port$endpoint | grep -q "200"; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
    done
}

# Function to show development info
show_info() {
    echo -e "${BLUE}📊 Lightning AI Platform - Development Info${NC}"
    echo -e "${BLUE}===========================================${NC}"
    
    # Node and npm versions
    echo -e "${YELLOW}Environment:${NC}"
    echo -e "  Node.js: $(node --version)"
    echo -e "  npm: $(npm --version)"
    echo -e "  Next.js: $(npm list next --depth=0 2>/dev/null | grep next || echo 'Not found')"
    
    # Project info
    echo -e "\n${YELLOW}Project:${NC}"
    echo -e "  Directory: $(pwd)"
    echo -e "  Git branch: $(git branch --show-current 2>/dev/null || echo 'Not a git repo')"
    echo -e "  Last commit: $(git log -1 --oneline 2>/dev/null || echo 'No commits')"
    
    # Server info
    echo -e "\n${YELLOW}Server:${NC}"
    if [ -f ".dev-port" ]; then
        local port=$(cat .dev-port)
        echo -e "  Port: $port"
        echo -e "  URL: http://localhost:$port"
    else
        echo -e "  Status: Not running"
    fi
    
    # Dependencies
    echo -e "\n${YELLOW}Key Dependencies:${NC}"
    local deps=("qrcode" "@radix-ui/react-slider" "lucide-react" "next")
    for dep in "${deps[@]}"; do
        if npm list $dep --depth=0 >/dev/null 2>&1; then
            echo -e "  ✅ $dep"
        else
            echo -e "  ❌ $dep (missing)"
        fi
    done
}

# Function to quick restart
quick_restart() {
    echo -e "${YELLOW}🔄 Quick restart...${NC}"
    
    # Kill existing processes
    pkill -f "next dev" 2>/dev/null || true
    sleep 2
    
    # Clear cache
    rm -rf .next
    
    # Start server in background
    npm run dev &
    local pid=$!
    echo -e "${GREEN}✅ Server restarted with PID: $pid${NC}"
    
    # Wait a moment and test
    sleep 5
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is responding${NC}"
    else
        echo -e "${YELLOW}⚠️  Server may still be starting...${NC}"
    fi
}

# Function to install missing dependencies
fix_deps() {
    echo -e "${YELLOW}🔧 Checking and fixing dependencies...${NC}"
    
    local missing_deps=()
    local deps=("qrcode" "@types/qrcode" "@radix-ui/react-slider")
    
    for dep in "${deps[@]}"; do
        if ! npm list $dep --depth=0 >/dev/null 2>&1; then
            missing_deps+=($dep)
        fi
    done
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${YELLOW}Installing missing dependencies: ${missing_deps[*]}${NC}"
        npm install "${missing_deps[@]}"
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${GREEN}✅ All dependencies are installed${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}Lightning AI Platform - Development Utilities${NC}"
    echo -e "${BLUE}=============================================${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  ${GREEN}status${NC}     Check server status"
    echo -e "  ${GREEN}logs${NC}       View recent logs"
    echo -e "  ${GREEN}test${NC}       Test key endpoints"
    echo -e "  ${GREEN}info${NC}       Show development info"
    echo -e "  ${GREEN}restart${NC}    Quick restart server"
    echo -e "  ${GREEN}fix-deps${NC}   Install missing dependencies"
    echo -e "  ${GREEN}help${NC}       Show this help"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 status"
    echo -e "  $0 test"
    echo -e "  $0 logs"
}

# Main execution
case "${1:-help}" in
    "status")
        check_status $2
        ;;
    "logs")
        view_logs
        ;;
    "test")
        test_endpoints $2
        ;;
    "info")
        show_info
        ;;
    "restart")
        quick_restart
        ;;
    "fix-deps")
        fix_deps
        ;;
    "help"|*)
        show_help
        ;;
esac 