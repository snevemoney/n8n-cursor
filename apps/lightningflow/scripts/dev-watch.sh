#!/bin/bash

# Lightning AI Platform - Auto-restart Development Server
# Watches for file changes and automatically restarts the server

echo "🔄 Starting auto-restart development server..."
echo "📁 Watching: src/, components/, lib/, app/"
echo "🛑 Press Ctrl+C to stop"
echo "=================================================="

# Function to start the development server
start_server() {
    echo "🚀 Starting development server..."
    npm run dev &
    SERVER_PID=$!
    echo "📝 Server PID: $SERVER_PID"
}

# Function to stop the development server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo "🛑 Stopping server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
        echo "✅ Server stopped"
    fi
}

# Function to restart the server
restart_server() {
    echo "🔄 File changes detected, restarting server..."
    stop_server
    sleep 2
    start_server
    echo "✅ Server restarted"
}

# Cleanup function
cleanup() {
    echo -e "\n🧹 Cleaning up..."
    stop_server
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the initial server
start_server

# Watch for file changes using fswatch (install with: brew install fswatch)
if command -v fswatch >/dev/null 2>&1; then
    echo "👀 Using fswatch for file monitoring..."
    fswatch -o \
        --exclude='\.next' \
        --exclude='node_modules' \
        --exclude='\.git' \
        --exclude='\.DS_Store' \
        --exclude='\.log' \
        src/ components/ lib/ app/ | while read num; do
        restart_server
    done
else
    echo "⚠️  fswatch not found. Install with: brew install fswatch"
    echo "📝 Falling back to basic monitoring..."
    
    # Fallback: simple file monitoring with find
    LAST_MODIFIED=$(find src/ components/ lib/ app/ -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs stat -f "%m" 2>/dev/null | sort -n | tail -1)
    
    while true; do
        sleep 3
        CURRENT_MODIFIED=$(find src/ components/ lib/ app/ -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs stat -f "%m" 2>/dev/null | sort -n | tail -1)
        
        if [ "$CURRENT_MODIFIED" != "$LAST_MODIFIED" ]; then
            restart_server
            LAST_MODIFIED=$CURRENT_MODIFIED
        fi
    done
fi 