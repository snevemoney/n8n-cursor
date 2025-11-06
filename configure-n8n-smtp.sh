#!/bin/bash
# n8n SMTP Configuration Script
# This script safely configures SMTP settings for n8n running in Docker

set -e  # Exit on any error

echo "========================================="
echo "n8n SMTP Configuration Script"
echo "========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  This script needs root privileges to modify Docker containers."
    echo "Please run with: sudo bash $0"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
N8N_HOST="69.62.66.78"
N8N_PORT="22222"
CONTAINER_ID="2ec27e36-e6be-4aec-9bc9-32c23839b66b"

echo -e "${YELLOW}Please provide your SMTP configuration:${NC}"
echo ""

# Prompt for SMTP details
read -p "SMTP Host (e.g., smtp.gmail.com): " SMTP_HOST
read -p "SMTP Port (e.g., 587): " SMTP_PORT
read -p "SMTP Username: " SMTP_USER
read -sp "SMTP Password: " SMTP_PASS
echo ""
read -p "SMTP Sender Email: " SMTP_SENDER

echo ""
echo -e "${YELLOW}Configuration Summary:${NC}"
echo "================================"
echo "Host: $SMTP_HOST"
echo "Port: $SMTP_PORT"
echo "User: $SMTP_USER"
echo "Sender: $SMTP_SENDER"
echo ""
read -p "Proceed with configuration? (y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "Configuration cancelled."
    exit 0
fi

echo ""
echo -e "${YELLOW}Step 1: Finding n8n container...${NC}"

# Check if container exists
if ! docker ps -a --format '{{.ID}}' | grep -q "^$CONTAINER_ID$"; then
    echo -e "${RED}Container $CONTAINER_ID not found.${NC}"
    echo "Available containers:"
    docker ps -a --format '{{.ID}}\t{{.Names}}\t{{.Image}}'
    exit 1
fi

echo -e "${GREEN}✓ Container found: $CONTAINER_ID${NC}"

echo ""
echo -e "${YELLOW}Step 2: Stopping n8n container...${NC}"
docker stop "$CONTAINER_ID" || echo -e "${YELLOW}Container already stopped${NC}"

echo ""
echo -e "${YELLOW}Step 3: Finding docker-compose file...${NC}"

# Try to find docker-compose file
COMPOSE_FILE=$(docker inspect "$CONTAINER_ID" | grep -o '"com.docker.compose.project.working_dir":"[^"]*"' | cut -d'"' -f4)
if [ -n "$COMPOSE_FILE" ]; then
    COMPOSE_DIR=$(dirname "$COMPOSE_FILE" 2>/dev/null || echo "")
    if [ -n "$COMPOSE_DIR" ] && [ -f "$COMPOSE_DIR/docker-compose.yml" ]; then
        echo -e "${GREEN}✓ Found docker-compose.yml at: $COMPOSE_DIR${NC}"
        
        # Create backup
        BACKUP_FILE="$COMPOSE_DIR/docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$COMPOSE_DIR/docker-compose.yml" "$BACKUP_FILE"
        echo -e "${GREEN}✓ Backup created: $BACKUP_FILE${NC}"
        
        # Update docker-compose.yml
        echo ""
        echo -e "${YELLOW}Step 4: Updating docker-compose.yml with SMTP settings...${NC}"
        
        # Check if environment section exists
        if grep -q "environment:" "$COMPOSE_DIR/docker-compose.yml"; then
            # Add SMTP variables to existing environment section
            cat >> "$COMPOSE_DIR/docker-compose.yml" << EOF

      # SMTP Configuration (Added by configure-n8n-smtp.sh)
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=$SMTP_HOST
      - N8N_SMTP_PORT=$SMTP_PORT
      - N8N_SMTP_USER=$SMTP_USER
      - N8N_SMTP_PASS=$SMTP_PASS
      - N8N_SMTP_SENDER=$SMTP_SENDER
EOF
            echo -e "${GREEN}✓ SMTP variables added to docker-compose.yml${NC}"
        else
            echo -e "${RED}✗ Could not find 'environment:' section in docker-compose.yml${NC}"
            echo "Please manually add the environment variables to your docker-compose.yml"
        fi
    else
        echo -e "${RED}✗ Could not locate docker-compose.yml${NC}"
    fi
else
    echo -e "${YELLOW}Could not find docker-compose file. Will attempt direct environment injection.${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Starting n8n container with new environment...${NC}"

# Start container with new environment variables
docker start "$CONTAINER_ID" || {
    # If start fails, create new container with environment variables
    echo -e "${YELLOW}Could not restart existing container. Creating new one...${NC}"
    
    # Get container details
    CONTAINER_NAME=$(docker inspect -f '{{.Name}}' "$CONTAINER_ID" | sed 's/^.//')
    CONTAINER_IMAGE=$(docker inspect -f '{{.Config.Image}}' "$CONTAINER_ID")
    
    # Get volumes and network
    VOLUMES=$(docker inspect -f '{{range .Mounts}}{{.Source}}:{{.Destination}} {{end}}' "$CONTAINER_ID")
    NETWORK=$(docker inspect -f '{{range $net,$v := .NetworkSettings.Networks}}{{$net}}{{end}}' "$CONTAINER_ID")
    
    # Stop and remove old container
    docker stop "$CONTAINER_ID" && docker rm "$CONTAINER_ID"
    
    # Create new container with environment variables
    docker run -d --name "$CONTAINER_NAME" \
        -e N8N_EMAIL_MODE=smtp \
        -e N8N_SMTP_HOST="$SMTP_HOST" \
        -e N8N_SMTP_PORT="$SMTP_PORT" \
        -e N8N_SMTP_USER="$SMTP_USER" \
        -e N8N_SMTP_PASS="$SMTP_PASS" \
        -e N8N_SMTP_SENDER="$SMTP_SENDER" \
        --network "$NETWORK" \
        $VOLUMES \
        "$CONTAINER_IMAGE"
    
    echo -e "${GREEN}✓ New container created with SMTP configuration${NC}"
}

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Verifying SMTP environment variables..."

# Check environment variables
SMTP_VARS=$(docker exec "$CONTAINER_ID" env 2>/dev/null | grep N8N_SMTP || echo "")
if [ -n "$SMTP_VARS" ]; then
    echo -e "${GREEN}✓ SMTP variables are set:${NC}"
    echo "$SMTP_VARS"
else
    echo -e "${RED}✗ Could not verify SMTP variables${NC}"
fi

echo ""
echo "n8n is now configured for SMTP email."
echo "Access your n8n instance to test the email functionality."

