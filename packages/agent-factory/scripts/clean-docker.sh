#!/bin/bash

# clean-docker.sh
# This script cleans up Docker containers, images, and volumes related to the Agent Factory

# Display banner
echo "================================================="
echo "           AGENT FACTORY DOCKER CLEANER          "
echo "================================================="
echo "Cleaning up Docker resources for Agent Factory..."
echo ""

# Set working directory to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed or not in PATH."
    exit 1
fi

# First stop any running containers
if [ -f docker-compose.yml ]; then
    echo "Stopping running containers..."
    docker-compose down --remove-orphans
else
    echo "No docker-compose.yml found. Skipping compose-based cleanup."
fi

# Get container IDs related to agent-factory
echo "Finding all agent-factory related containers..."
CONTAINER_IDS=$(docker ps -a | grep "agent-factory\|n8n" | awk '{print $1}')

# Stop and remove containers
if [ -n "$CONTAINER_IDS" ]; then
    echo "Removing the following containers:"
    docker ps -a | grep "agent-factory\|n8n"
    
    for id in $CONTAINER_IDS; do
        echo "Removing container $id..."
        docker rm -f $id
    done
    
    echo "All related containers removed."
else
    echo "No related containers found."
fi

# Remove unused images
echo "Removing unused Docker images..."
UNUSED_IMAGES=$(docker images | grep "agent-factory\|n8n" | awk '{print $3}')

if [ -n "$UNUSED_IMAGES" ]; then
    echo "Removing the following images:"
    docker images | grep "agent-factory\|n8n"
    
    for img in $UNUSED_IMAGES; do
        echo "Removing image $img..."
        docker rmi -f $img
    done
    
    echo "All related images removed."
else
    echo "No related images found."
fi

# Clean up volumes (optional, can be commented out to preserve data)
echo "Removing unused volumes..."
UNUSED_VOLUMES=$(docker volume ls | grep "agent-factory\|n8n" | awk '{print $2}')

if [ -n "$UNUSED_VOLUMES" ]; then
    echo "Removing the following volumes:"
    docker volume ls | grep "agent-factory\|n8n"
    
    for vol in $UNUSED_VOLUMES; do
        echo "Removing volume $vol..."
        docker volume rm $vol
    done
    
    echo "All related volumes removed."
else
    echo "No related volumes found."
fi

# Prune Docker system (optional, can be commented out if not needed)
echo "Pruning Docker system..."
docker system prune -f

echo ""
echo "Docker cleanup complete!"
echo "=================================================" 