#!/bin/bash

# stop-all.sh
# This script stops all services related to the Agent Factory system

# Display banner
echo "================================================="
echo "             AGENT FACTORY STOPPER               "
echo "================================================="
echo "Stopping all services for Agent Factory..."
echo ""

# Set working directory to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check if Docker is being used
if [ -f docker-compose.yml ]; then
    echo "Stopping services using Docker Compose..."
    docker-compose down
    
    # Verify services are stopped
    if docker-compose ps | grep -q "Up"; then
        echo "Warning: Some services are still running. Forcing stop..."
        docker-compose down --remove-orphans
    else
        echo "All services stopped successfully!"
    fi
else
    # Stop n8n if it was started locally
    if [ -f .n8n.pid ]; then
        echo "Stopping n8n..."
        PID=$(cat .n8n.pid)
        
        # Check if process is running
        if ps -p $PID > /dev/null; then
            kill $PID
            sleep 5
            
            # Check if process is still running
            if ps -p $PID > /dev/null; then
                echo "Process still running. Sending SIGKILL..."
                kill -9 $PID
            fi
        else
            echo "n8n process not found. It may have already been stopped."
        fi
        
        # Remove PID file
        rm .n8n.pid
        echo "n8n stopped successfully!"
    else
        echo "No .n8n.pid file found. n8n may not be running or was started by another process."
        
        # Try to find and kill n8n processes
        N8N_PIDS=$(pgrep -f "n8n start")
        if [ -n "$N8N_PIDS" ]; then
            echo "Found n8n processes. Attempting to stop them..."
            for pid in $N8N_PIDS; do
                kill $pid
            done
            sleep 2
            
            # Check if any processes are still running
            N8N_PIDS=$(pgrep -f "n8n start")
            if [ -n "$N8N_PIDS" ]; then
                echo "Some processes still running. Sending SIGKILL..."
                for pid in $N8N_PIDS; do
                    kill -9 $pid
                done
            fi
            
            echo "All n8n processes stopped!"
        else
            echo "No running n8n processes found."
        fi
    fi
fi

echo ""
echo "All Agent Factory services have been stopped."
echo "=================================================" 