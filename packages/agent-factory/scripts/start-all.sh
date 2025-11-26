#!/bin/bash

# start-all.sh
# This script starts all necessary services for the Agent Factory system

# Display banner
echo "================================================="
echo "             AGENT FACTORY STARTER               "
echo "================================================="
echo "Starting all services for Agent Factory..."
echo ""

# Set working directory to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating default .env file..."
    echo "N8N_URL=http://localhost:5678" > .env
    echo "API_KEY=default_key_please_change" >> .env
    echo "AGENT_OUTPUT_DIR=./generated_agents" >> .env
fi

# Source environment variables
set -a
source .env
set +a

# Create necessary directories if they don't exist
mkdir -p generated_agents
mkdir -p logs

# Check if Docker is being used
if [ -f docker-compose.yml ]; then
    echo "Starting services using Docker Compose..."
    docker-compose up -d
    
    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10
else
    # Start n8n if installed locally
    if command -v n8n &> /dev/null; then
        echo "Starting n8n..."
        # Start n8n in the background
        nohup n8n start > logs/n8n.log 2>&1 &
        
        # Store the process ID
        echo $! > .n8n.pid
        
        # Wait for n8n to start
        echo "Waiting for n8n to start..."
        sleep 10
    else
        echo "Error: n8n command not found. Please install n8n or use Docker."
        exit 1
    fi
fi

# Check if services are running
if [ -f docker-compose.yml ]; then
    # Check Docker containers
    if docker-compose ps | grep -q "Up"; then
        echo "Services started successfully!"
    else
        echo "Error: Services failed to start. Check logs for details."
        exit 1
    fi
else
    # Check n8n process
    if [ -f .n8n.pid ] && ps -p $(cat .n8n.pid) > /dev/null; then
        echo "Services started successfully!"
    else
        echo "Error: n8n failed to start. Check logs for details."
        exit 1
    fi
fi

echo ""
echo "n8n is available at: $N8N_URL"
echo "Agent output directory: $AGENT_OUTPUT_DIR"
echo ""
echo "To stop all services, run: ./scripts/stop-all.sh"
echo "=================================================" 