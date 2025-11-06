#!/bin/bash

# Start n8n-cursor Backend (Workflow 0 Thin Slice)
# ================================================

echo "🚀 Starting n8n-cursor Backend (Workflow 0 Thin Slice)"
echo "======================================================"

# Check if we're in the right directory
if [ ! -d "apps/n8n-cursor/backend" ]; then
    echo "❌ Error: Please run this script from the project root"
    exit 1
fi

# Navigate to backend directory
cd apps/n8n-cursor/backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env from template..."
    cp env.example .env
    echo "📝 Please edit .env with your configuration before starting"
    echo "   Required: REDIS_HOST, N8N_URL, N8N_WEBHOOK_SECRET"
    exit 1
fi

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis is not running. Please start Redis first:"
    echo "   brew services start redis  # macOS"
    echo "   sudo systemctl start redis # Linux"
    echo "   redis-server               # Manual start"
    exit 1
fi

echo "✅ Redis is running"

# Check if n8n is accessible
N8N_URL=$(grep N8N_URL .env | cut -d '=' -f2)
if [ -n "$N8N_URL" ]; then
    echo "🔍 Checking n8n connection..."
    if curl -s "$N8N_URL/healthz" > /dev/null 2>&1; then
        echo "✅ n8n is accessible at $N8N_URL"
    else
        echo "⚠️  Warning: n8n may not be running at $N8N_URL"
        echo "   Backend will start but auxiliary workflows may fail"
    fi
fi

# Start the backend server
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for server to start
sleep 3

# Start the worker
echo "🔄 Starting workflow worker..."
npm run worker &
WORKER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down backend services..."
    kill $BACKEND_PID 2>/dev/null
    kill $WORKER_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "✅ Backend services started successfully!"
echo ""
echo "📊 API Server: http://localhost:3001"
echo "🔍 Health Check: http://localhost:3001/health"
echo "🔄 Workflow Endpoint: http://localhost:3001/api/workflows/0/run"
echo "📈 Status Endpoint: http://localhost:3001/api/workflows/0/status/{id}"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for processes
wait $BACKEND_PID $WORKER_PID
